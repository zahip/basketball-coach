import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { getClientIP, isAuthBlocked } from "./lib/security";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const clientIP = getClientIP(request.clone());
  const pathname = request.nextUrl.pathname;
  
  // Simple rate limiting for auth endpoints using in-memory tracking
  if (pathname.includes('/auth')) {
    if (isAuthBlocked(clientIP)) {
      return NextResponse.json(
        { error: 'Too many failed authentication attempts. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Add essential security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
              httpOnly: true,
            });
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  try {
    const { error } = await supabase.auth.getUser();
    
    if (error && error.message.includes('JWT expired')) {
      // Handle expired JWT by redirecting to auth
      const locale = request.nextUrl.pathname.split("/")[1];
      const validLocales = ["en", "he"];
      const currentLocale = validLocales.includes(locale) ? locale : "en";
      
      const redirectUrl = new URL(`/${currentLocale}/auth`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Auth error in middleware:', error);
  }

  // Protected routes - require authentication
  const protectedPaths = ["/dashboard", "/team", "/training-set-builder", "/exercise"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.includes(path)
  );

  if (isProtectedPath) {
    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!user || error) {
        // Extract locale from current path to preserve it in redirect
        const locale = request.nextUrl.pathname.split("/")[1];
        const validLocales = ["en", "he"];
        const currentLocale = validLocales.includes(locale) ? locale : "en";

        const redirectUrl = new URL(`/${currentLocale}/auth`, request.url);
        redirectUrl.searchParams.set("next", request.nextUrl.pathname);

        return NextResponse.redirect(redirectUrl);
      }
      
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Extract locale from current path to preserve it in redirect
      const locale = request.nextUrl.pathname.split("/")[1];
      const validLocales = ["en", "he"];
      const currentLocale = validLocales.includes(locale) ? locale : "en";

      const redirectUrl = new URL(`/${currentLocale}/auth`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(he|en)/:path*",

    // Skip Next.js internals and all static files
    "/((?!api|trpc|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};