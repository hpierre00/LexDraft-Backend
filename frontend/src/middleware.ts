import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public paths that don't require authentication
const publicPaths = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // For all other paths, let the client-side handle the auth check
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/documents/:path*',
    '/templates/:path*',
    '/evaluate/:path*',
    '/settings/:path*',
    '/login',
    '/register'
  ]
} 