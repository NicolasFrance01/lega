"use server";

import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";
import { put, del } from "@vercel/blob";
import { getPatients } from "./patients";
import { format } from "date-fns";
import { redirect } from "next/navigation";

// --- PENDIENTES ---

export async function getPendientes() {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const res = await pool.query("SELECT * FROM pendientes ORDER BY month_group DESC, fecha DESC");
    return { data: res.rows, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createPendiente(formData: FormData) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const fecha = formData.get("fecha") as string;
    const paciente = formData.get("paciente") as string;
    const pendiente = formData.get("pendiente") as string;
    const detalle = formData.get("detalle") as string;
    const seguimiento = formData.get("seguimiento") as string;
    const observaciones = formData.get("observaciones") as string;

    const month_group = fecha.substring(0, 7); // 'YYYY-MM'

    await pool.query(
      "INSERT INTO pendientes (fecha, paciente, pendiente, detalle, seguimiento, observaciones, month_group) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [fecha, paciente, pendiente, detalle, seguimiento, observaciones, month_group]
    );

    await logAction("CREATE_PENDIENTE", { paciente, month_group });
    revalidatePath("/listados/pendientes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePendiente(id: number, data: any) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const fields = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = Object.values(data);

    await pool.query(`UPDATE pendientes SET ${fields} WHERE id = $${values.length + 1}`, [...values, id]);

    revalidatePath("/listados/pendientes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deletePendiente(id: number) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    await pool.query("DELETE FROM pendientes WHERE id = $1", [id]);
    revalidatePath("/listados/pendientes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- SYSTEM CODES ---

export async function getSystemCodes() {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const res = await pool.query("SELECT * FROM system_codes ORDER BY analisis ASC");
    return { data: res.rows, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateSystemCode(id: number, data: any) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const fields = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = Object.values(data);

    await pool.query(`UPDATE system_codes SET ${fields} WHERE id = $${values.length + 1}`, [...values, id]);

    revalidatePath("/listados/codigos");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createSystemCode(formData: FormData) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const analisis = formData.get("analisis") as string;
    const codigo_sistema = formData.get("codigo_sistema") as string;
    const codigo_nbu = formData.get("codigo_nbu") as string;

    const ub = formData.get("ub") as string || "-";

    await pool.query(
      "INSERT INTO system_codes (analisis, codigo_sistema, codigo_nbu, ub) VALUES ($1, $2, $3, $4)",
      [analisis, codigo_sistema, codigo_nbu, ub]
    );

    revalidatePath("/listados/codigos");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteSystemCode(id: number) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    await pool.query("DELETE FROM system_codes WHERE id = $1", [id]);
    revalidatePath("/listados/codigos");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- BILLING PRICES ---

export async function getBillingPrices() {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const res = await pool.query("SELECT * FROM billing_prices ORDER BY analisis ASC");
    return { data: res.rows, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateBillingPrice(id: number, data: any) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const fields = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = Object.values(data);

    await pool.query(`UPDATE billing_prices SET ${fields} WHERE id = $${values.length + 1}`, [...values, id]);

    revalidatePath("/listados/precios");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createBillingPrice(formData: FormData) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const analisis = formData.get("analisis") as string;
    const cibic = formData.get("cibic") as string;
    const gornitz = formData.get("gornitz") as string;
    const fpm = formData.get("fpm") as string;
    const manlab = formData.get("manlab") as string;
    const lerda = formData.get("lerda") as string;

    await pool.query(
      "INSERT INTO billing_prices (analisis, cibic, gornitz, fpm, manlab, lerda) VALUES ($1, $2, $3, $4, $5, $6)",
      [analisis, cibic, gornitz, fpm, manlab, lerda]
    );

    revalidatePath("/listados/precios");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteBillingPrice(id: number) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    await pool.query("DELETE FROM billing_prices WHERE id = $1", [id]);
    revalidatePath("/listados/precios");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- COBRANZAS ---

export async function getCobranzas() {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const res = await pool.query("SELECT * FROM cobranzas ORDER BY month_group DESC, fecha DESC");
    return { data: res.rows, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createCobranza(formData: FormData) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const fecha = formData.get("fecha") as string;
    const paciente = formData.get("paciente") as string;
    const dni = formData.get("dni") as string;
    const factura = formData.get("factura") as string;
    const observacion = formData.get("observacion") as string;
    const seguimiento = formData.get("seguimiento") as string;

    const month_group = fecha.substring(0, 7); // 'YYYY-MM'

    await pool.query(
      "INSERT INTO cobranzas (fecha, paciente, dni, factura, observacion, seguimiento, month_group) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [fecha, paciente, dni, factura, observacion, seguimiento, month_group]
    );

    await logAction("CREATE_COBRANZA", { paciente, factura });
    revalidatePath("/listados/cobranzas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateCobranza(id: number, data: any) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const fields = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = Object.values(data);

    await pool.query(`UPDATE cobranzas SET ${fields} WHERE id = $${values.length + 1}`, [...values, id]);

    revalidatePath("/listados/cobranzas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCobranza(id: number) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    await pool.query("DELETE FROM cobranzas WHERE id = $1", [id]);
    revalidatePath("/listados/cobranzas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function ensureCobranzasTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cobranzas (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL,
        paciente TEXT NOT NULL,
        dni TEXT,
        factura TEXT,
        observacion TEXT,
        seguimiento TEXT NOT NULL DEFAULT 'Pendiente',
        month_group TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    return { success: true };
  } catch (error: any) {
    console.error("Migration auto-run failed:", error);
    return { error: error.message };
  }
}
// --- APROSS ---

export async function getApross() {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    const res = await pool.query(`
      SELECT a.*, 
             COALESCE((SELECT json_agg(json_build_object('id', d.id, 'url', d.document_url, 'filename', d.filename))
              FROM apross_documents d WHERE d.apross_id = a.id), '[]'::json) as documents
      FROM apross a 
      ORDER BY month_group DESC, fecha DESC
    `);
    return { 
      data: JSON.parse(JSON.stringify(res.rows)), 
      error: null 
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createApross(formData: FormData) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const fecha = formData.get("fecha") as string;
    const paciente = formData.get("paciente") as string;
    const dni = formData.get("dni") as string || "-";
    const telefono = formData.get("telefono") as string || "-";
    const analisisList = formData.getAll("analisis") as string[];
    const analisis = analisisList.filter(a => a && a.trim() !== "").join(", ");
    
    // Handle numeric fields that might contain "-"
    const coseguroRaw = formData.get("coseguro") as string;
    const particularRaw = formData.get("particular") as string;
    
    const parseNumeric = (val: string) => {
      if (!val || val === "-") return null;
      const cleaned = val.replace(/[^0.9.-]/g, "");
      return isNaN(parseFloat(cleaned)) ? null : cleaned;
    };

    const coseguro = parseNumeric(coseguroRaw);
    const particular = parseNumeric(particularRaw);
    
    const observaciones = formData.get("observaciones") as string;
    const files = formData.getAll("documents") as File[];

    const month_group = fecha ? fecha.substring(0, 7) : format(new Date(), "yyyy-MM");

    // --- Patient Persistence Logic ---
    const dni_clean = dni ? String(dni).trim() : "-";
    if (dni_clean !== "-") {
      await client.query(
        `INSERT INTO patients (id, name, dni, phone, health_insurance)
         VALUES (gen_random_uuid(), $1, $2, $3, 'APROSS')
         ON CONFLICT (dni) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            health_insurance = EXCLUDED.health_insurance`,
        [paciente, dni_clean, telefono]
      );
    }
    // ---------------------------------

    const res = await client.query(
      `INSERT INTO apross (fecha, paciente, dni, telefono, analisis, coseguro, particular, observaciones, month_group) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id`,
      [fecha, paciente, dni, telefono, analisis, coseguro, particular, observaciones, month_group]
    );

    const aprossId = res.rows[0].id;

    // Handle File Uploads
    for (const file of files) {
      if (file && file.size > 0) {
        const path = `apross/${Date.now()}-${file.name}`;
        const blob = await put(path, file, { access: 'private' });
        await client.query(
          'INSERT INTO apross_documents (apross_id, document_url, filename) VALUES ($1, $2, $3)',
          [aprossId, blob.url, file.name]
        );
      }
    }

    await client.query('COMMIT');
    await logAction("CREATE_APROSS", { paciente, month_group });
    revalidatePath("/listados/apross");
    return { success: true };
  } catch (error: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (e) {}
    }
    console.error("CREATE_APROSS_ERROR:", error);
    return { error: String(error.message || error) };
  } finally {
    if (client) client.release();
  }
}

export async function updateApross(id: number, data: any) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    // data could be an object (from Object.fromEntries) or FormData
    const formData = data instanceof FormData ? data : null;
    const fields = formData ? Object.fromEntries(formData) : data;

    const { fecha, paciente, dni, telefono, analisis, coseguro, particular, observaciones } = fields;
    const month_group = fecha ? String(fecha).substring(0, 7) : null;
    
    const parseNumeric = (val: any) => {
      if (val === undefined || val === null || val === "" || val === "-") return null;
      const cleaned = String(val).replace(/[^0.9.-]/g, "");
      return isNaN(parseFloat(cleaned)) ? null : cleaned;
    };

    // --- Patient Persistence Logic ---
    const dni_clean = dni ? String(dni).trim() : "-";
    if (dni_clean !== "-") {
      await pool.query(
        `INSERT INTO patients (id, name, dni, phone, health_insurance)
         VALUES (gen_random_uuid(), $1, $2, $3, 'APROSS')
         ON CONFLICT (dni) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            health_insurance = EXCLUDED.health_insurance`,
        [paciente, dni_clean, telefono]
      );
    }
    // ---------------------------------

    await pool.query(
      `UPDATE apross SET 
        fecha = $1, paciente = $2, dni = $3, telefono = $4, 
        analisis = $5, coseguro = $6, particular = $7, 
        observaciones = $8, month_group = COALESCE($9, month_group)
       WHERE id = $10`,
      [fecha, paciente, dni, telefono, analisis, parseNumeric(coseguro), parseNumeric(particular), observaciones, month_group, id]
    );

    // Handle NEW File Uploads if FormData was provided
    if (formData) {
      const files = formData.getAll("documents") as File[];
      for (const file of files) {
        if (file && file.size > 0) {
          const path = `apross/${Date.now()}-${file.name}`;
          const blob = await put(path, file, { access: 'private' });
          await pool.query(
            'INSERT INTO apross_documents (apross_id, document_url, filename) VALUES ($1, $2, $3)',
            [id, blob.url, file.name]
          );
        }
      }
    }
    
    revalidatePath("/listados/apross");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_APROSS_ERROR:", error);
    return { error: error.message };
  }
}

export async function deleteAprossDocument(id: number) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    // Get URL to delete from Blob
    const res = await pool.query('SELECT document_url FROM apross_documents WHERE id = $1', [id]);
    if (res.rows[0]) {
       try { await del(res.rows[0].document_url); } catch (e) {}
    }

    await pool.query('DELETE FROM apross_documents WHERE id = $1', [id]);
    revalidatePath("/listados/apross");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteApross(id: number) {
  try {
    const session = await getSession() as any;
    if (!session) throw new Error("No autenticado");

    await pool.query("DELETE FROM apross WHERE id = $1", [id]);
    revalidatePath("/listados/apross");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
