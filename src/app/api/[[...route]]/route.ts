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
  testConnection: t.procedure.query(async () => {
    try {
      console.log("Testing Prisma client...");
      console.log("Prisma object keys:", Object.keys(prisma));
      console.log("playRecording exists:", !!prisma.playRecording);
      
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      
      // Try to count existing records
      const count = await prisma.playRecording.count();
      console.log("PlayRecording count:", count);
      
      return { success: true, result, count, hasPlayRecording: !!prisma.playRecording };
    } catch (error) {
      console.error("Database connection test failed:", error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }),
  savePlayRecording: t.procedure
    .input(z.object({
      teamId: z.string(),
      name: z.string(),
      data: z.object({
        movements: z.array(z.object({
          playerId: z.string(),
          x: z.number(),
          y: z.number(),
          timestamp: z.number(),
        })),
        actions: z.array(z.object({
          id: z.string(),
          type: z.enum(["pass", "shoot", "cut", "block", "screen", "dribble"]),
          playerId: z.string(),
          startX: z.number(),
          startY: z.number(),
          endX: z.number(),
          endY: z.number(),
          timestamp: z.number(),
          color: z.string(),
        })),
        players: z.array(z.object({
          id: z.string(),
          x: z.number(),
          y: z.number(),
          type: z.enum(["offense", "defense"]),
          number: z.number().optional(),
          name: z.string().optional(),
        })),
        duration: z.number(),
      }),
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

      console.log("About to create recording...");
      console.log("Input data:", JSON.stringify(input, null, 2));
      
      try {
        const recording = await prisma.playRecording.create({
          data: {
            name: input.name,
            teamId: input.teamId,
            data: input.data,
          },
        });
        console.log("Recording created successfully:", recording.id);
        return { success: true, recording };
      } catch (createError) {
        console.error("Failed to create recording:", createError);
        throw new Error(`Failed to create recording: ${createError instanceof Error ? createError.message : String(createError)}`);
      }
    }),
  getPlayRecordings: t.procedure
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

      const recordings = await prisma.playRecording.findMany({
        where: {
          team: {
            id: input.teamId,
            coach: {
              userId: dbUser.id
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return { recordings };
    }),
  createTrainingSet: t.procedure
    .input(z.object({
      teamId: z.string(),
      name: z.string().min(1, "Training set name is required"),
      description: z.string().optional(),
      exercises: z.array(z.object({
        name: z.string().min(1, "Exercise name is required"),
        description: z.string().optional(),
        duration: z.number().optional(),
        category: z.string().optional(),
        order: z.number().default(0),
      })).default([]),
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

      const trainingSet = await prisma.trainingSet.create({
        data: {
          name: input.name,
          description: input.description,
          teamId: input.teamId,
          exercises: {
            create: input.exercises.map((exercise, index) => ({
              name: exercise.name,
              description: exercise.description,
              duration: exercise.duration,
              category: exercise.category,
              order: exercise.order || index,
            }))
          }
        },
        include: {
          exercises: {
            orderBy: { order: 'asc' }
          }
        }
      });

      return { success: true, trainingSet };
    }),
  getTrainingSets: t.procedure
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

      const trainingSets = await prisma.trainingSet.findMany({
        where: {
          team: {
            id: input.teamId,
            coach: {
              userId: dbUser.id
            }
          }
        },
        include: {
          exercises: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return { trainingSets };
    }),
  getAllTrainingSets: t.procedure.query(async () => {
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
            trainingSets: {
              include: {
                exercises: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    });
    
    const allTrainingSets = coach?.teams.flatMap(team => 
      team.trainingSets.map(trainingSet => ({
        ...trainingSet,
        teamName: team.name
      }))
    ) || [];

    return { trainingSets: allTrainingSets };
  }),
  createExerciseTemplate: t.procedure
    .input(z.object({
      name: z.string().min(1, "Exercise name is required"),
      description: z.string().optional(),
      duration: z.number().optional(),
      category: z.string().optional(),
      difficulty: z.string().optional(),
      equipment: z.string().optional(),
      instructions: z.string().optional(),
      isPublic: z.boolean().default(false),
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

      const exerciseTemplate = await prisma.exerciseTemplate.create({
        data: {
          name: input.name,
          description: input.description,
          duration: input.duration,
          category: input.category,
          difficulty: input.difficulty,
          equipment: input.equipment,
          instructions: input.instructions,
          isPublic: input.isPublic,
          coachId: coach.id,
        },
      });

      return { success: true, exerciseTemplate };
    }),
  getExerciseTemplates: t.procedure.query(async () => {
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
      where: { userId: dbUser.id }
    });
    
    if (!coach) {
      return { exerciseTemplates: [] };
    }

    const exerciseTemplates = await prisma.exerciseTemplate.findMany({
      where: {
        OR: [
          { coachId: coach.id },
          { isPublic: true }
        ]
      },
      include: {
        coach: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return { exerciseTemplates };
  }),
  updateExerciseTemplate: t.procedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, "Exercise name is required"),
      description: z.string().optional(),
      duration: z.number().optional(),
      category: z.string().optional(),
      difficulty: z.string().optional(),
      equipment: z.string().optional(),
      instructions: z.string().optional(),
      isPublic: z.boolean().default(false),
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

      const coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        throw new Error("Coach not found");
      }

      const exerciseTemplate = await prisma.exerciseTemplate.findFirst({
        where: {
          id: input.id,
          coachId: coach.id
        }
      });

      if (!exerciseTemplate) {
        throw new Error("Exercise template not found or not owned by this coach");
      }

      const updatedExerciseTemplate = await prisma.exerciseTemplate.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          duration: input.duration,
          category: input.category,
          difficulty: input.difficulty,
          equipment: input.equipment,
          instructions: input.instructions,
          isPublic: input.isPublic,
        },
      });

      return { success: true, exerciseTemplate: updatedExerciseTemplate };
    }),
  deleteExerciseTemplate: t.procedure
    .input(z.object({ id: z.string() }))
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

      const coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        throw new Error("Coach not found");
      }

      const exerciseTemplate = await prisma.exerciseTemplate.findFirst({
        where: {
          id: input.id,
          coachId: coach.id
        }
      });

      if (!exerciseTemplate) {
        throw new Error("Exercise template not found or not owned by this coach");
      }

      await prisma.exerciseTemplate.delete({
        where: { id: input.id }
      });

      return { success: true };
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
