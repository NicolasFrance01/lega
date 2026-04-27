import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest, context: { params: Promise<{ resultId: string }> }) {
  try {
    const { resultId } = await context.params;
    
    // Fetch result metadata from DB
    const res = await pool.query('SELECT content, filename, result_type FROM medical_results WHERE id = $1', [resultId]);
    const row = res.rows[0];
    
    if (!row) {
      return new NextResponse('Not found', { status: 404 });
    }

    if (row.result_type === 'note') {
      return new NextResponse(row.content, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Proxy the private blob
    const blobRes = await fetch(row.content, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!blobRes.ok) {
      return new NextResponse('Failed to fetch document', { status: 502 });
    }

    const contentType = blobRes.headers.get('content-type') || 'application/octet-stream';
    const buffer = await blobRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${row.filename || 'archivo'}"`,
      },
    });
  } catch (err) {
    console.error("Medical Result Proxy error:", err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
