import { Hono } from "hono";
import { handle } from "hono/vercel";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

export const runtime = "nodejs";

// 1. Define tRPC router
const t = initTRPC.create();
const appRouter = t.router({
  hello: t.procedure.query(() => ({ message: "Hello from tRPC!" })),
  echo: t.procedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => ({ echo: input.text })),
  userUpsert: t.procedure.mutation(async () => {
    console.log("userUpsert");
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    console.log("supabase", supabase);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("user", user);
    if (!user) {
      throw new Error("Not authenticated");
    }
    const { prisma } = await import("@/lib/prisma");
    const dbUser = await prisma.user.upsert({
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
    return { success: true, user: dbUser };
  }),
});
export type AppRouter = typeof appRouter;

// 2. Create Hono app and mount tRPC at /api/trpc
const app = new Hono().basePath("/api");

app.get("/hello", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

app.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({}),
  });
});

export const GET = handle(app);
export const POST = handle(app);
