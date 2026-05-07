"use server";

import pool from '@/lib/db';

export async function getCustomObrasSociales() {
  try {
    const res = await pool.query('SELECT name FROM custom_health_insurances ORDER BY name ASC');
    return { data: res.rows.map((r: any) => r.name as string) };
  } catch {
    return { data: [] as string[] };
  }
}

export async function addCustomObraSocial(name: string) {
  try {
    await pool.query(
      'INSERT INTO custom_health_insurances (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [name.toUpperCase().trim()]
    );
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
