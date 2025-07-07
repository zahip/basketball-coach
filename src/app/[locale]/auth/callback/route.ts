import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Upsert user in the database here
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { prisma } = await import("@/lib/prisma");
        await prisma.user.upsert({
          where: { supabaseId: user.id },
          update: {
            email: user.email ?? "",
            name: user.user_metadata?.name || null,
            avatarUrl: user.user_metadata?.avatar_url || null,
          },
          create: {
            supabaseId: user.id,
            email: user.email ?? "",
            name: user.user_metadata?.name || null,
            avatarUrl: user.user_metadata?.avatar_url || null,
            provider:
              typeof user.app_metadata?.provider === "string"
                ? user.app_metadata.provider
                : "email",
          },
        });
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
