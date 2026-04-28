import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'lega-super-secret-key-2026-fallback');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Allow public access to these paths
  if (
    pathname.startsWith('/resultado') ||
    pathname.startsWith('/api/medical-result/file') ||
    pathname.startsWith('/login')
  ) {
    // If logged in and trying to go to login, redirect to home
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, SECRET_KEY);
    return NextResponse.next();
  } catch (e) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('auth_token');
    return res;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png|logoB.png|logofavicon.png).*)'],
}
