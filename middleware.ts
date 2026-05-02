import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'lega-super-secret-key-2026-fallback');

const BIOQUIMICO_ALLOWED = ['/ingresos', '/pacientes', '/perfil'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.next();

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const role = (payload as any).role;

    if (role === 'bioquimico') {
      const isAllowed = BIOQUIMICO_ALLOWED.some(
        (allowed) => pathname === allowed || pathname.startsWith(allowed + '/')
      );
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/ingresos', request.url));
      }
    }
  } catch {
    // Invalid token — let the app handle it
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\..*).*)','/api/avatar/:path*'],
};
