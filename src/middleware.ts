import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Handle internationalization first
  const response = intlMiddleware(request);

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
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  // Protected routes - require authentication
  const protectedPaths = ["/dashboard", "/team", "/training-set-builder"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.includes(path)
  );

  if (isProtectedPath) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Extract locale from current path to preserve it in redirect
      const locale = request.nextUrl.pathname.split("/")[1];
      const validLocales = ["en", "he"];
      const currentLocale = validLocales.includes(locale) ? locale : "en";

      const redirectUrl = new URL(`/${currentLocale}/auth`, request.url);
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);

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
