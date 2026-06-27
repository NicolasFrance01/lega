"use server";

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logAction } from './audit';
import { getSession } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function searchPatients(query: string) {
  try {
    const res = await pool.query(`
      SELECT DISTINCT p.id, p.name, p.dni, p.phone, p.email, p.birth_date, p.health_insurance 
      FROM patients p
      LEFT JOIN appointments a ON p.id = a.patient_id
      WHERE translate(p.name, 'ÁÉÍÓÚáéíóúÄËÏÖÜäëïöü', 'AEIOUaeiouAEIOUaeiou') ILIKE translate($1, 'ÁÉÍÓÚáéíóúÄËÏÖÜäëïöü', 'AEIOUaeiouAEIOUaeiou') 
         OR p.dni ILIKE $1 
         OR a.report_id ILIKE $1
      LIMIT 10
    `, [`%${query}%`]);
    return { data: res.rows, error: null };
  } catch (error: any) {
    console.error("Error searching patients:", error);
    return { data: null, error: error.message };
  }
}

export async function getPatientAppointments(patientId: string) {
  try {
    const res = await pool.query(`
      SELECT a.id, a.appointment_date, a.status, a.analysis_type, a.report_id,
             (
               SELECT json_agg(json_build_object('id', aa.id, 'name', aa.analysis_name, 'subtype', aa.aire_test_subtype, 'status', aa.status))
               FROM appointment_analyses aa
               WHERE aa.appointment_id = a.id
             ) as analyses
      FROM appointments a
      WHERE a.patient_id = $1 
      ORDER BY a.appointment_date DESC
    `, [patientId]);
    return { data: res.rows, error: null };
  } catch (error: any) {
    console.error("Error fetching patient appointments:", error);
    return { data: null, error: error.message };
  }
}

export async function uploadMedicalResult(formData: FormData) {
  const session = await getSession() as any;
  if (!session) throw new Error("No autorizado");

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appointmentId = formData.get("appointment_id") as string;
    const patientId = formData.get("patient_id") as string;
    const analysisId = formData.get("analysis_id") as string || null;
    if (!patientId || patientId === 'undefined') throw new Error("ID de paciente no válido");
    const type = formData.get("type") as 'pdf' | 'image' | 'note';
    const noteContent = formData.get("note_content") as string;
    const files = formData.getAll("files") as File[];
    const report_id = formData.get("report_id") as string;

    // Update report_id in appointment if provided
    if (report_id) {
      await client.query('UPDATE appointments SET report_id = $1 WHERE id = $2', [report_id, appointmentId]);
    }

    if (type === 'note') {
      await client.query(`
        INSERT INTO medical_results (appointment_id, patient_id, analysis_id, result_type, content, notes, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $5, $6)
      `, [appointmentId, patientId, analysisId, type, noteContent, session.id]);
    } else {
      for (const file of files) {
        if (file && file.size > 0) {
          const ext = file.name.split('.').pop() || (type === 'pdf' ? 'pdf' : 'jpg');
          const path = `medical-results/${Date.now()}-${patientId}-${Math.random().toString(36).substring(7)}.${ext}`;
          const blob = await put(path, file, { access: 'private' });
          
          await client.query(`
            INSERT INTO medical_results (appointment_id, patient_id, analysis_id, result_type, content, filename, notes, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [appointmentId, patientId, analysisId, type, blob.url, file.name, noteContent, session.id]);
        }
      }
    }

    await client.query('COMMIT');
    
    // Get patient details for logging
    const pRes = await client.query('SELECT name, dni FROM patients WHERE id = $1', [patientId]);
    const pInfo = pRes.rows[0];

    await logAction("UPLOAD_MEDICAL_RESULT", { 
      patient_name: pInfo?.name || 'Paciente', 
      patient_dni: pInfo?.dni || '-',
      type 
    });
    
    revalidatePath("/resumen-medico");
    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Error uploading medical result:", error);
    return { error: error.message };
  } finally {
    client.release();
  }
}

export async function getPatientResults(dni: string) {
  try {
    const res = await pool.query(`
      SELECT mr.id, mr.result_type, mr.content, mr.filename, mr.notes, mr.created_at, mr.notified_at, mr.analysis_id,
             a.appointment_date, a.report_id,
             COALESCE(aa.analysis_name, a.analysis_type) as analysis_type,
             u.full_name as uploaded_by_name
      FROM medical_results mr
      JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN appointment_analyses aa ON mr.analysis_id = aa.id
      LEFT JOIN users u ON mr.uploaded_by = u.id
      WHERE p.dni = $1
      ORDER BY mr.created_at DESC
    `, [dni]);
    
    const grouped = new Map();
    for (const row of res.rows) {
      const key = `${row.appointment_id}-${row.analysis_id || 'none'}`;
      if (!grouped.has(key)) {
        grouped.set(key, { ...row, files: [] });
      }
      grouped.get(key).files.push({
        id: row.id,
        filename: row.filename,
        content: row.content,
        result_type: row.result_type,
        notes: row.notes,
        created_at: row.created_at,
        notified_at: row.notified_at
      });
    }
    
    return { data: Array.from(grouped.values()), error: null };
  } catch (error: any) {
    console.error("Error fetching patient results:", error);
    return { data: null, error: error.message };
  }
}

export async function getPatientPortalData(dni: string) {
  try {
    const patientRes = await pool.query(`SELECT id, name, dni, phone FROM patients WHERE dni = $1`, [dni]);
    if (patientRes.rows.length === 0) return { data: null, error: "Paciente no encontrado" };
    
    const patient = patientRes.rows[0];
    const results = await getPatientResults(dni);
    const appointments = await pool.query(`
      SELECT a.id, a.appointment_date, a.status, a.analysis_type, a.report_id,
             (
               SELECT json_agg(json_build_object('id', aa.id, 'name', aa.analysis_name, 'subtype', aa.aire_test_subtype, 'status', aa.status))
               FROM appointment_analyses aa
               WHERE aa.appointment_id = a.id
             ) as analyses
      FROM appointments a
      WHERE a.patient_id = $1 
      ORDER BY a.appointment_date DESC
    `, [patient.id]);

    return { 
      data: {
        patient,
        results: results.data,
        appointments: appointments.rows
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error fetching portal data:", error);
    return { data: null, error: error.message };
  }
}

export async function getAllMedicalResults() {
  try {
    const res = await pool.query(`
      SELECT mr.*, p.name as patient_name, p.dni as patient_dni, p.phone as patient_phone,
             u.full_name as uploaded_by_name,
             a.appointment_date, a.report_id,
             COALESCE(aa.analysis_name, a.analysis_type) as analysis_type
      FROM medical_results mr
      JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN appointment_analyses aa ON mr.analysis_id = aa.id
      LEFT JOIN users u ON mr.uploaded_by = u.id
      ORDER BY mr.created_at DESC
      LIMIT 100
    `);
    const grouped = new Map();
    for (const row of res.rows) {
      const key = `${row.appointment_id}-${row.analysis_id || 'none'}`;
      if (!grouped.has(key)) {
        grouped.set(key, { ...row, files: [] });
      }
      grouped.get(key).files.push({
        id: row.id,
        filename: row.filename,
        content: row.content,
        result_type: row.result_type,
        notes: row.notes,
        created_at: row.created_at,
        notified_at: row.notified_at
      });
    }

    return { data: Array.from(grouped.values()), error: null };
  } catch (error: any) {
    console.error("Error fetching all results:", error);
    return { data: null, error: error.message };
  }
}

export async function markAsNotified(id: string) {
  try {
    const res = await pool.query(`
      SELECT mr.*, p.name 
      FROM medical_results mr 
      JOIN patients p ON mr.patient_id = p.id 
      WHERE mr.id = $1
    `, [id]);
    const details = res.rows[0];

    // Mark all files from the same appointment/analysis as notified
    await pool.query(`
      UPDATE medical_results 
      SET notified_at = NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires'
      WHERE appointment_id = $1 AND (analysis_id = $2 OR (analysis_id IS NULL AND $2 IS NULL))
    `, [details.appointment_id, details.analysis_id]);
    
    await logAction("NOTIFIED_PATIENT", { 
      patient_name: details?.name, 
      appointment_id: details?.appointment_id 
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markAllPendingAsNotified() {
  const session = await getSession() as any;
  if (!session) throw new Error("No autorizado");
  try {
    const res = await pool.query(`
      UPDATE medical_results 
      SET notified_at = NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires'
      WHERE notified_at IS NULL
    `);
    await logAction("NOTIFIED_ALL_PENDING", {
      count: res.rowCount,
      by: session.full_name || session.username
    });
    return { success: true, count: res.rowCount };
  } catch (error: any) {
    console.error("Error marking all pending as notified:", error);
    return { error: error.message };
  }
}
export async function deleteMedicalResult(resultId: string) {
  const session = await getSession() as any;
  if (!session) throw new Error("No autorizado");

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get details for logging before deleting
    const resultRes = await client.query(`
      SELECT mr.*, p.name as patient_name 
      FROM medical_results mr 
      JOIN patients p ON mr.patient_id = p.id 
      WHERE mr.id = $1
    `, [resultId]);

    if (resultRes.rows.length === 0) throw new Error("Resultado no encontrado");
    const result = resultRes.rows[0];

    // Delete from DB
    await client.query('DELETE FROM medical_results WHERE id = $1', [resultId]);

    // Log the action
    await pool.query(
      "INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)",
      [session.id, "DELETE_MEDICAL_RESULT", JSON.stringify({ 
        result_id: resultId, 
        patient_name: result.patient_name,
        result_type: result.result_type,
        content: result.content
      })]
    );

    await client.query('COMMIT');
    revalidatePath("/resumen-medico");
    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Error deleting medical result:", error);
    return { error: error.message };
  } finally {
    client.release();
  }
}
