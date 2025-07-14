import { Hono } from "hono";
import { handle } from "hono/vercel";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

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
    const supabase = await createClient();
    console.log("supabase", supabase);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("user", user);
    if (!user) {
      throw new Error("Not authenticated");
    }
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
  createTeam: t.procedure
    .input(z.object({ 
      name: z.string().min(1, "Team name is required"),
      description: z.string().optional() 
    }))
    .mutation(async ({ input }) => {
        const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }
        
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw new Error("User not found in database");
      }

      let coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        coach = await prisma.coach.create({
          data: {
            name: user.user_metadata?.name || user.email || "Coach",
            email: user.email || "",
            userId: dbUser.id,
          }
        });
      }
      
      const team = await prisma.team.create({
        data: {
          name: input.name,
          description: input.description,
          coachId: coach.id,
        },
      });
      return { success: true, team };
    }),
  getTeams: t.procedure.query(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    });
    if (!dbUser) {
      throw new Error("User not found in database");
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: dbUser.id },
      include: {
        teams: {
          include: {
            players: true,
          }
        }
      }
    });
    
    return { teams: coach?.teams || [] };
  }),
  getTeam: t.procedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ input }) => {
        const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }
        
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw new Error("User not found in database");
      }

      const team = await prisma.team.findFirst({
        where: {
          id: input.teamId,
          coach: {
            userId: dbUser.id
          }
        },
        include: {
          players: true,
          coach: true,
        }
      });
      
      if (!team) {
        throw new Error("Team not found");
      }
      
      return { team };
    }),
  addPlayer: t.procedure
    .input(z.object({
      teamId: z.string(),
      name: z.string().min(1, "Player name is required"),
      position: z.string().optional(),
      number: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
        const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }
        
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw new Error("User not found in database");
      }

      const team = await prisma.team.findFirst({
        where: {
          id: input.teamId,
          coach: {
            userId: dbUser.id
          }
        }
      });
      
      if (!team) {
        throw new Error("Team not found");
      }
      
      const player = await prisma.player.create({
        data: {
          name: input.name,
          position: input.position,
          number: input.number,
          teamId: input.teamId,
        },
      });
      
      return { success: true, player };
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
