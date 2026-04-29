"use server";

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

export async function getIngresos(search?: string) {
  try {
    // We fetch everything that is an ingreso OR is a completed/confirmed appointment
    // This includes historical data from internal calendar and domicilio if they have these statuses.
    const res = await pool.query(`
      SELECT a.*, p.name, p.dni, p.phone, p.email, p.health_insurance, p.birth_date, p.address, a.biochemical_notice,
             (
               SELECT json_agg(json_build_object('id', aa.id, 'name', aa.analysis_name, 'subtype', aa.aire_test_subtype, 'status', aa.status))
               FROM appointment_analyses aa
               WHERE aa.appointment_id = a.id
             ) as analyses
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.is_ingreso = TRUE 
         OR a.status = 'COMPLETADO' 
         OR a.status = 'CONFIRMAR ASISTENCIA'
      ORDER BY CAST(NULLIF(a.report_id, '') AS INTEGER) ASC NULLS LAST, a.appointment_date ASC
    `);

    return { 
      data: res.rows.map(row => ({
        ...row,
        appointment_date: row.appointment_date ? new Date(row.appointment_date).toISOString() : null,
        result_date: row.result_date ? new Date(row.result_date).toISOString() : null,
      })), 
      error: null 
    };
  } catch (error: any) {
    console.error("Error fetching ingresos:", error);
    return { data: null, error: error.message };
  }
}

import { logAction } from './audit';
import { put } from '@vercel/blob';

export async function createIngreso(formData: FormData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const existingId = formData.get("id") as string;
    const name = formData.get("name") as string;
    const dni = formData.get("dni") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const birth_date = formData.get("birth_date") as string;
    const health_insurance = formData.get("health_insurance") as string;
    
    const appointment_date = formData.get("appointment_date") as string;
    const analysisNames = formData.getAll("analysis_name") as string[];
    const analysisSubtypes = formData.getAll("aire_test_subtype") as string[];
    const analysis_type = analysisNames[0] || ""; // Legacy fallback
    
    // Determine if it should go to the Air Test calendar
    const airTestNames = ['Test de aire', 'SIBO', 'LACTOSA', 'FRUCTUOSA', 'Aires'];
    const airTestIndex = analysisNames.findIndex(name => airTestNames.includes(name));
    let aire_test_type = null;
    if (airTestIndex !== -1) {
      aire_test_type = analysisSubtypes[airTestIndex] || analysisNames[airTestIndex];
    }

    const report_id = formData.get("report_id") as string;
    const result_date = formData.get("result_date") as string;
    const professional_name = formData.get("professional_name") as string;
    const coseguro = formData.get("coseguro") as string;
    const particular_price = formData.get("particular_price") as string;
    const payment_method = formData.get("payment_method") as string;
    const observations = formData.get("observations") as string;
    const files = formData.getAll("document") as File[];

    // Find or Create patient. 
    // We search by DNI AND Name to allow multiple people to share a DNI (like a placeholder '.')
    let patientRes = await client.query(
      "SELECT id FROM patients WHERE dni = $1 AND name = $2",
      [dni, name]
    );

    let patientId;
    if (patientRes.rows.length > 0) {
      patientId = patientRes.rows[0].id;
      // Update other details if changed
      await client.query(
        `UPDATE patients SET 
          email = $1, phone = $2, health_insurance = $3, 
          birth_date = NULLIF($4, '')::date, address = $5 
         WHERE id = $6`,
        [email, phone, health_insurance, birth_date, address, patientId]
      );
    } else {
      const newPatientRes = await client.query(
        `INSERT INTO patients (name, dni, email, phone, health_insurance, birth_date, address) 
         VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, $7) 
         RETURNING id`,
        [name, dni, email, phone, health_insurance, birth_date, address]
      );
      patientId = newPatientRes.rows[0].id;
    }

    let aptId;
      if (existingId) {
        // Update existing appointment
        await client.query(
          `UPDATE appointments SET 
            analysis_type = $1, aire_test_type = $2, observations = $3, status = 'CONFIRMAR ASISTENCIA',
            report_id = $4, result_date = NULLIF($5, '')::timestamp, 
            coseguro = NULLIF($6, '')::numeric, particular_price = NULLIF($7, '')::numeric, 
            payment_method = $8, professional_name = $9, is_ingreso = TRUE
           WHERE id = $10`,
          [analysis_type, aire_test_type, observations, report_id, result_date, coseguro, particular_price, payment_method, professional_name, existingId]
        );
        aptId = existingId;
        // Clean old analyses and insert new ones
        await client.query("DELETE FROM appointment_analyses WHERE appointment_id = $1", [aptId]);
      } else {
        // Insert Appointment as Ingreso
        const aptRes = await client.query(
          `INSERT INTO appointments 
           (patient_id, appointment_date, analysis_type, aire_test_type, observations, status, 
            report_id, result_date, coseguro, particular_price, payment_method, professional_name, is_ingreso) 
           VALUES ($1, $2, $3, $4, $5, 'CONFIRMAR ASISTENCIA', $6, NULLIF($7, '')::timestamp, NULLIF($8, '')::numeric, NULLIF($9, '')::numeric, $10, $11, TRUE)
           RETURNING id`,
          [patientId, appointment_date || new Date().toISOString(), analysis_type, aire_test_type, observations, report_id, result_date, coseguro, particular_price, payment_method, professional_name]
        );
        aptId = aptRes.rows[0].id;
      }

    // Insert Analyses (Multiple)
    console.log("Saving analyses:", analysisNames, analysisSubtypes);

    if (analysisNames.length > 0) {
      for (let i = 0; i < analysisNames.length; i++) {
        if (analysisNames[i]) {
          await client.query(
            "INSERT INTO appointment_analyses (appointment_id, analysis_name, aire_test_subtype) VALUES ($1, $2, $3)",
            [aptId, analysisNames[i], analysisSubtypes[i] || null]
          );
        }
      }
    } else if (analysis_type) {
      await client.query(
        "INSERT INTO appointment_analyses (appointment_id, analysis_name, aire_test_subtype) VALUES ($1, $2, $3)",
        [aptId, analysis_type, null]
      );
    }

    // Handle File Uploads
    for (const file of files) {
      if (file && file.size > 0) {
        const path = `ingresos/${Date.now()}-${file.name}`;
        const blob = await put(path, file, { access: 'private' });
        await client.query(
          'INSERT INTO appointment_documents (appointment_id, document_url, filename) VALUES ($1, $2, $3)',
          [aptId, blob.url, file.name]
        );
      }
    }

    await client.query('COMMIT');

    // Log action
    await logAction(existingId ? "UPDATE_INGRESO" : "CREATE_INGRESO", {
      patient_name: name,
      dni: dni,
      analysis: analysis_type,
      report_id: report_id,
      payment: payment_method,
      amount: (parseFloat(coseguro || "0") + parseFloat(particular_price || "0")).toFixed(2)
    });

    revalidatePath("/ingresos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Create/Update ingreso error:", error);
    return { error: error.message };
  } finally {
    client.release();
  }
}

export async function deleteIngreso(id: string) {
  try {
    const res = await pool.query('SELECT a.*, p.name FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = $1', [id]);
    const details = res.rows[0];

    await pool.query('DELETE FROM appointments WHERE id = $1', [id]);

    await logAction("DELETE_INGRESO", {
      patient_name: details?.name,
      analysis: details?.analysis_type,
      report_id: details?.report_id
    });

    revalidatePath("/ingresos");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateIngresoField(id: string, field: string, value: any) {
  try {
    const res = await pool.query('SELECT a.*, p.name FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = $1', [id]);
    const details = res.rows[0];

    await pool.query(`UPDATE appointments SET ${field} = $1 WHERE id = $2`, [value, id]);

    await logAction("UPDATE_INGRESO_FIELD", {
      patient_name: details?.name,
      field: field,
      old_value: details?.[field],
      new_value: value,
      report_id: details?.report_id
    });

    revalidatePath("/ingresos");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
export async function getNextReportId() {
  const client = await pool.connect();
  try {
    const res = await pool.query(`
      SELECT MAX(CAST(report_id AS INTEGER)) as max_id 
      FROM appointments 
      WHERE report_id ~ '^[0-9]+$'
    `);
    const nextId = (res.rows[0].max_id || 94000) + 1;
    return { success: true, nextId: nextId.toString() };
  } catch (error) {
    console.error("Error getting next report id:", error);
    return { success: false, error: "Error al obtener correlativo" };
  } finally {
    client.release();
  }
}

export async function updateInternalNote(id: string, note: string) {
  try {
    const res = await pool.query('SELECT a.*, p.name FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = $1', [id]);
    const details = res.rows[0];

    if (!details) {
      console.error("No appointment found for id:", id);
      return { error: "No se encontró el registro" };
    }

    await pool.query(
      `UPDATE appointments SET internal_note = $1, internal_note_status = 'unread' WHERE id = $2`,
      [note, id]
    );

    await logAction("CREATE_INTERNAL_NOTE", {
      patient_name: details?.name,
      report_id: details?.report_id,
      note: note
    });

    revalidatePath("/ingresos");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateInternalNote:", error);
    return { error: error.message };
  }
}

export async function markInternalNoteAsRead(id: string) {
  try {
    const res = await pool.query('SELECT a.*, p.name FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = $1', [id]);
    const details = res.rows[0];

    if (!details) return { error: "No se encontró el registro" };

    await pool.query(
      `UPDATE appointments SET internal_note_status = 'read' WHERE id = $1`,
      [id]
    );

    await logAction("READ_INTERNAL_NOTE", {
      patient_name: details?.name,
      report_id: details?.report_id
    });

    revalidatePath("/ingresos");
    return { success: true };
  } catch (error: any) {
    console.error("Error in markInternalNoteAsRead:", error);
    return { error: error.message };
  }
}

export async function updateBiochemicalNotice(appointmentId: string, value: string) {
  try {
    await pool.query(
      "UPDATE appointments SET biochemical_notice = $1 WHERE id = $2",
      [value, appointmentId]
    );

    const aptRes = await pool.query(`
      SELECT p.name 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      WHERE a.id = $1
    `, [appointmentId]);
    
    const patientName = aptRes.rows[0]?.name || "Desconocido";

    await logAction("UPDATE_BIOCHEMICAL_NOTICE", {
      patient_name: patientName,
      field: "Aviso Bioq.",
      new_value: value || "Vacío"
    });

    revalidatePath("/ingresos");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating biochemical notice:", error);
    return { error: error.message };
  }
}
