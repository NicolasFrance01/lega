"use server";

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logAction } from './audit';
import { getSession } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function searchPatients(query: string) {
  try {
    const res = await pool.query(`
      SELECT id, name, dni, phone, email, birth_date, health_insurance 
      FROM patients 
      WHERE name ILIKE $1 OR dni ILIKE $1 
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
      SELECT id, appointment_date, status, analysis_type 
      FROM appointments 
      WHERE patient_id = $1 
      ORDER BY appointment_date DESC
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
    const type = formData.get("type") as 'pdf' | 'image' | 'note';
    const noteContent = formData.get("note_content") as string;
    const files = formData.getAll("files") as File[];

    if (type === 'note') {
      await client.query(`
        INSERT INTO medical_results (appointment_id, patient_id, result_type, content, uploaded_by)
        VALUES ($1, $2, $3, $4, $5)
      `, [appointmentId, patientId, type, noteContent, session.id]);
    } else {
      for (const file of files) {
        if (file && file.size > 0) {
          const ext = file.name.split('.').pop() || (type === 'pdf' ? 'pdf' : 'jpg');
          const path = `medical-results/${Date.now()}-${patientId}-${Math.random().toString(36).substring(7)}.${ext}`;
          const blob = await put(path, file, { access: 'private' });
          
          await client.query(`
            INSERT INTO medical_results (appointment_id, patient_id, result_type, content, filename, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [appointmentId, patientId, type, blob.url, file.name, session.id]);
        }
      }
    }

    await client.query('COMMIT');
    await logAction("UPLOAD_MEDICAL_RESULT", { patient_id: patientId, type });
    
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
      SELECT mr.id, mr.result_type, mr.content, mr.filename, mr.created_at, mr.notified_at,
             a.appointment_date, a.analysis_type,
             u.full_name as uploaded_by_name
      FROM medical_results mr
      JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN users u ON mr.uploaded_by = u.id
      WHERE p.dni = $1
      ORDER BY mr.created_at DESC
    `, [dni]);
    
    return { data: res.rows, error: null };
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
      SELECT id, appointment_date, status, analysis_type 
      FROM appointments 
      WHERE patient_id = $1 
      ORDER BY appointment_date DESC
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
             a.appointment_date, a.analysis_type
      FROM medical_results mr
      JOIN patients p ON mr.patient_id = p.id
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN users u ON mr.uploaded_by = u.id
      ORDER BY mr.created_at DESC
      LIMIT 100
    `);
    return { data: res.rows, error: null };
  } catch (error: any) {
    console.error("Error fetching all results:", error);
    return { data: null, error: error.message };
  }
}

export async function markAsNotified(id: string) {
  try {
    await pool.query('UPDATE medical_results SET notified_at = NOW() WHERE id = $1', [id]);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
