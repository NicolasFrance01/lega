"use server";

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

export async function getIngresos(period: 'day' | 'week' | 'month' = 'day', date?: string) {
  try {
    let dateCondition = "DATE(a.appointment_date) = CURRENT_DATE";
    const params: any[] = [];

    if (date) {
      params.push(date);
      dateCondition = `DATE(a.appointment_date) = $${params.length}`;
    } else if (period === 'week') {
      dateCondition = "a.appointment_date >= DATE_TRUNC('week', CURRENT_DATE) AND a.appointment_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'";
    } else if (period === 'month') {
      dateCondition = "a.appointment_date >= DATE_TRUNC('month', CURRENT_DATE) AND a.appointment_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'";
    }

    const res = await pool.query(`
      SELECT a.*, p.name, p.dni, p.phone, p.email, p.health_insurance, p.birth_date, p.address
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE ${dateCondition}
      ORDER BY a.appointment_date DESC
    `, params);

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

export async function createIngreso(formData: FormData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const name = formData.get("name") as string;
    const dni = formData.get("dni") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const birth_date = formData.get("birth_date") as string;
    const health_insurance = formData.get("health_insurance") as string;
    
    const appointment_date = formData.get("appointment_date") as string;
    const analysis_type = formData.get("analysis_type") as string;
    const report_id = formData.get("report_id") as string;
    const result_date = formData.get("result_date") as string;
    const professional_name = formData.get("professional_name") as string;
    const coseguro = formData.get("coseguro") as string;
    const particular_price = formData.get("particular_price") as string;
    const payment_method = formData.get("payment_method") as string;
    const observations = formData.get("observations") as string;

    // UPSERT patient
    const patientRes = await client.query(
      `INSERT INTO patients (name, dni, email, phone, health_insurance, birth_date, address) 
       VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::date, $7) 
       ON CONFLICT (dni) 
       DO UPDATE SET 
         name = EXCLUDED.name, 
         email = EXCLUDED.email, 
         phone = EXCLUDED.phone, 
         health_insurance = EXCLUDED.health_insurance,
         birth_date = COALESCE(NULLIF(EXCLUDED.birth_date, ''), patients.birth_date),
         address = EXCLUDED.address
       RETURNING id`,
      [name, dni, email, phone, health_insurance, birth_date, address]
    );
    const patientId = patientRes.rows[0].id;

    // Insert Appointment as Ingreso
    await client.query(
      `INSERT INTO appointments 
       (patient_id, appointment_date, analysis_type, observations, status, 
        report_id, result_date, coseguro, particular_price, payment_method, professional_name, is_ingreso) 
       VALUES ($1, $2, $3, $4, 'COMPLETADO', $5, NULLIF($6, '')::timestamp, NULLIF($7, '')::numeric, NULLIF($8, '')::numeric, $9, $10, TRUE)`,
      [patientId, appointment_date || new Date().toISOString(), analysis_type, observations, report_id, result_date, coseguro, particular_price, payment_method, professional_name]
    );

    await client.query('COMMIT');
    revalidatePath("/ingresos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Create ingreso error:", error);
    return { error: error.message };
  } finally {
    client.release();
  }
}

export async function updateIngresoField(id: string, field: string, value: any) {
  try {
    await pool.query(`UPDATE appointments SET ${field} = $1 WHERE id = $2`, [value, id]);
    revalidatePath("/ingresos");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
