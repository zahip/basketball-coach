import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { apiRateLimit, authRateLimit, getClientIP, isAuthBlocked } from "./lib/security";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const clientIP = getClientIP(request.clone());
  
  // Apply rate limiting based on route
  const pathname = request.nextUrl.pathname;
  
  // Apply stricter rate limiting for auth endpoints
  if (pathname.includes('/auth') || pathname.includes('/api/trpc')) {
    if (pathname.includes('/auth')) {
      // Check if IP is blocked due to failed auth attempts
      if (isAuthBlocked(clientIP)) {
        return NextResponse.json(
          { error: 'Too many failed authentication attempts. Please try again later.' },
          { status: 429 }
        );
      }
      
      const authLimit = await authRateLimit.limit(clientIP);
      if (!authLimit.success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    } else {
      // Regular API rate limiting
      const apiLimit = await apiRateLimit.limit(clientIP);
      if (!apiLimit.success) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }
  }

  // Add security headers to response
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
              sameSite: 'strict',
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
  const protectedPaths = ["/dashboard", "/team", "/training-set-builder"];
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
        redirectUrl.searchParams.set("error", "authentication_required");

        return NextResponse.redirect(redirectUrl);
      }
      
      // Add user context to response headers for logging
      response.headers.set('X-User-ID', user.id);
      
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Extract locale from current path to preserve it in redirect
      const locale = request.nextUrl.pathname.split("/")[1];
      const validLocales = ["en", "he"];
      const currentLocale = validLocales.includes(locale) ? locale : "en";

      const redirectUrl = new URL(`/${currentLocale}/auth`, request.url);
      redirectUrl.searchParams.set("error", "authentication_error");

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Add security logging headers
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Timestamp', new Date().toISOString());

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
