import { createClient } from '@/utils/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = createClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  
  // Auth routes that should redirect to dashboard if user is logged in
  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname === route
  );

  // If user is not logged in and trying to access protected route
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    // Add a redirect parameter to show a message
    redirectUrl.searchParams.set('redirect', 'dashboard');
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and trying to access auth routes
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};