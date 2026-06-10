"use server";

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPatients() {
  try {
    const res = await pool.query('SELECT * FROM patients ORDER BY name ASC');
    return {
      data: res.rows.map(row => ({
        ...row,
        name: row.name ? row.name.toUpperCase() : row.name,
        birth_date: row.birth_date ? new Date(row.birth_date).toISOString() : null,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
        created_by: row.created_by || null
      })),
      error: null 
    };
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    return { data: null, error: error.message };
  }
}

export async function updatePatient(formData: FormData) {
  try {
    const id = formData.get("id");
    const name = (formData.get("name") as string)?.toUpperCase().trim();
    const dni = formData.get("dni") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const health_insurance = formData.get("health_insurance") as string;
    const birth_date = formData.get("birth_date") as string;

    await pool.query(
      `UPDATE patients SET 
        name = $1, 
        dni = $2, 
        phone = $3, 
        email = $4, 
        health_insurance = $5,
        birth_date = NULLIF($6, '')::date
      WHERE id = $7`,
      [name, dni, phone, email, health_insurance, birth_date, id]
    );

    revalidatePath("/pacientes");
    revalidatePath("/pacientes/[id]", "page");
    revalidatePath("/");
    revalidatePath("/calendario");
    
    return { success: true };
  } catch (error: any) {
    console.error("Update patient error:", error);
    return { error: error.message };
  }
}
export async function deletePatient(id: string) {
  try {
    await pool.query('DELETE FROM patients WHERE id = $1', [id]);
    revalidatePath("/pacientes");
    return { success: true };
  } catch (error: any) {
    console.error("Delete patient error:", error);
    return { error: error.message };
  }
}

export async function searchPatients(query: string) {
  try {
    if (!query || query.length < 2) return { data: [], error: null };
    const res = await pool.query(
      "SELECT * FROM patients WHERE name ILIKE $1 OR dni ILIKE $1 LIMIT 10",
      [`%${query}%`]
    );
    return { data: res.rows, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function mergePatients(keepId: string, mergeId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Mover ingresos y resultados médicos
    await client.query('UPDATE appointments SET patient_id = $1 WHERE patient_id = $2', [keepId, mergeId]);
    await client.query('UPDATE medical_results SET patient_id = $1 WHERE patient_id = $2', [keepId, mergeId]);

    // Eliminar el paciente duplicado
    await client.query('DELETE FROM patients WHERE id = $1', [mergeId]);

    await client.query('COMMIT');
    
    revalidatePath("/pacientes");
    revalidatePath("/pacientes/[id]", "page");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Error merging patients:", error);
    return { error: error.message };
  } finally {
    client.release();
  }
}
