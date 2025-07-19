import { Hono } from "hono";
import { handle } from "hono/vercel";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { 
  sanitizeInput, 
  sanitizeObject, 
  validateEmail, 
  validateTeamName, 
  validatePlayerName,
  createSecureError,
  validateEnvVars,
  trackAuthAttempt,
  clearAuthAttempts,
  getClientIP
} from "@/lib/security";

// Validate environment variables on startup
validateEnvVars();

export const runtime = "nodejs";

// Enhanced tRPC context with security info
const createContext = async (opts: { req: Request }) => {
  const clientIP = getClientIP(opts.req);
  return {
    req: opts.req,
    clientIP,
    userAgent: opts.req.headers.get('user-agent') || '',
    requestId: crypto.randomUUID(),
  };
};

// Enhanced tRPC with security middleware
const t = initTRPC.context<typeof createContext>().create({
  errorFormatter: ({ shape, error }) => {
    // Don't expose sensitive error details in production
    if (process.env.NODE_ENV === 'production') {
      return {
        ...shape,
        message: error.code === 'INTERNAL_SERVER_ERROR' 
          ? 'Internal server error' 
          : shape.message,
      };
    }
    return shape;
  },
});

// Security middleware
const securityMiddleware = t.middleware(async ({ ctx, next }) => {
  const start = Date.now();
  
  try {
    const result = await next();
    
    // Log successful requests
    console.log(`[${ctx.requestId}] Success: ${Date.now() - start}ms, IP: ${ctx.clientIP}`);
    
    return result;
  } catch (error) {
    // Log failed requests
    console.error(`[${ctx.requestId}] Error: ${Date.now() - start}ms, IP: ${ctx.clientIP}`, error);
    throw error;
  }
});

// Authentication middleware with security features
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  try {
    const supabase = await createClient();
    
    // Get authorization header
    const authHeader = ctx.req.headers.get('authorization');
    
    let user;
    let error;
    
    if (authHeader?.startsWith('Bearer ')) {
      // Use the provided token
      const token = authHeader.slice(7);
      const result = await supabase.auth.getUser(token);
      user = result.data.user;
      error = result.error;
    } else {
      // Fall back to session-based auth
      const result = await supabase.auth.getUser();
      user = result.data.user;
      error = result.error;
    }
    
    if (!user || error) {
      throw createSecureError('Authentication required', 401);
    }
    
    // Clear auth attempts on successful authentication
    clearAuthAttempts(ctx.clientIP);
    
    return next({
      ctx: {
        ...ctx,
        user,
        supabase,
      },
    });
  } catch (error) {
    // Track failed authentication attempts
    trackAuthAttempt(ctx.clientIP);
    throw error;
  }
});

// Protected procedure with security
const protectedProcedure = t.procedure.use(securityMiddleware).use(authMiddleware);
const publicProcedure = t.procedure.use(securityMiddleware);

// Input validation schemas with enhanced security
const teamInputSchema = z.object({
  name: z.string()
    .min(1, "Team name is required")
    .max(100, "Team name too long")
    .refine(validateTeamName, "Team name contains invalid characters"),
  description: z.string()
    .max(500, "Description too long")
    .optional()
});

const playerInputSchema = z.object({
  teamId: z.string().uuid("Invalid team ID"),
  name: z.string()
    .min(1, "Player name is required")
    .max(50, "Player name too long")
    .refine(validatePlayerName, "Player name contains invalid characters"),
  position: z.string().max(10).optional(),
  number: z.number().int().min(0).max(99).optional(),
});

const exerciseInputSchema = z.object({
  name: z.string()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name too long"),
  description: z.string()
    .max(1000, "Description too long")
    .optional(),
  duration: z.number().int().min(0).max(180).optional(),
  category: z.string().max(50).optional(),
  order: z.number().int().min(0).default(0),
});

const appRouter = t.router({
  hello: publicProcedure.query(() => ({ message: "Hello from tRPC!" })),
  
  echo: publicProcedure
    .input(z.object({ text: z.string().max(1000) }))
    .query(({ input }) => ({ 
      echo: sanitizeInput(input.text) 
    })),
  
  userUpsert: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx;
    
    if (!user.email || !validateEmail(user.email)) {
      throw createSecureError('Invalid email address', 400);
    }
    
    const sanitizedName = user.user_metadata?.name ? sanitizeInput(user.user_metadata.name) : null;
    const sanitizedEmail = sanitizeInput(user.email);
    
    const dbUser = await prisma.user.upsert({
      where: { supabaseId: user.id },
      update: {
        email: sanitizedEmail,
        name: sanitizedName,
        avatarUrl: user.user_metadata?.avatar_url || null,
        updatedAt: new Date(),
      },
      create: {
        supabaseId: user.id,
        email: sanitizedEmail,
        name: sanitizedName,
        avatarUrl: user.user_metadata?.avatar_url || null,
        provider: typeof user.app_metadata?.provider === "string" 
          ? user.app_metadata.provider 
          : "email",
      },
    });
    
    return { success: true, user: dbUser };
  }),
  
  createTeam: protectedProcedure
    .input(teamInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      
      const sanitizedInput = sanitizeObject(input) as typeof input;
      
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      let coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        const sanitizedName = sanitizeInput(user.user_metadata?.name || user.email || "Coach");
        const sanitizedEmail = sanitizeInput(user.email || "");
        
        coach = await prisma.coach.create({
          data: {
            name: sanitizedName,
            email: sanitizedEmail,
            userId: dbUser.id,
          }
        });
      }
      
      const team = await prisma.team.create({
        data: {
          name: sanitizedInput.name,
          description: sanitizedInput.description,
          coachId: coach.id,
        },
      });
      
      return { success: true, team };
    }),
  
  getTeams: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    });
    
    if (!dbUser) {
      throw createSecureError('User not found in database', 404);
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: dbUser.id },
      include: {
        teams: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
                position: true,
                number: true,
                createdAt: true,
                updatedAt: true,
              }
            },
            _count: {
              select: {
                players: true,
                recordings: true,
                trainingSets: true,
              }
            }
          }
        }
      }
    });
    
    return { teams: coach?.teams || [] };
  }),
  
  getTeam: protectedProcedure
    .input(z.object({ teamId: z.string().uuid("Invalid team ID") }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      const team = await prisma.team.findFirst({
        where: {
          id: input.teamId,
          coach: {
            userId: dbUser.id
          }
        },
        include: {
          players: {
            select: {
              id: true,
              name: true,
              position: true,
              number: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              players: true,
              recordings: true,
              trainingSets: true,
            }
          }
        }
      });
      
      if (!team) {
        throw createSecureError('Team not found or access denied', 404);
      }
      
      return { team };
    }),
  
  addPlayer: protectedProcedure
    .input(playerInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      
      const sanitizedInput = sanitizeObject(input) as typeof input;
      
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      // Verify team ownership
      const team = await prisma.team.findFirst({
        where: {
          id: sanitizedInput.teamId,
          coach: {
            userId: dbUser.id
          }
        }
      });
      
      if (!team) {
        throw createSecureError('Team not found or access denied', 404);
      }
      
      // Check for duplicate player number
      if (sanitizedInput.number) {
        const existingPlayer = await prisma.player.findFirst({
          where: {
            teamId: sanitizedInput.teamId,
            number: sanitizedInput.number,
          }
        });
        
        if (existingPlayer) {
          throw createSecureError('Player number already exists', 400);
        }
      }
      
      const player = await prisma.player.create({
        data: {
          name: sanitizedInput.name,
          position: sanitizedInput.position,
          number: sanitizedInput.number,
          teamId: sanitizedInput.teamId,
        },
      });
      
      return { success: true, player };
    }),
  testConnection: protectedProcedure.query(async () => {
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      const count = await prisma.playRecording.count();
      
      return { 
        success: true, 
        result, 
        count, 
        hasPlayRecording: !!prisma.playRecording 
      };
    } catch (error) {
      console.error("Database connection test failed:", error);
      throw createSecureError('Database connection failed', 500);
    }
  }),
  savePlayRecording: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid("Invalid team ID"),
      name: z.string().max(100, "Recording name too long"),
      data: z.object({
        movements: z.array(z.object({
          playerId: z.string().uuid("Invalid player ID"),
          x: z.number(),
          y: z.number(),
          timestamp: z.number(),
        })),
        actions: z.array(z.object({
          id: z.string().uuid("Invalid action ID"),
          type: z.enum(["pass", "shoot", "cut", "block", "screen", "dribble"]),
          playerId: z.string().uuid("Invalid player ID"),
          startX: z.number(),
          startY: z.number(),
          endX: z.number(),
          endY: z.number(),
          timestamp: z.number(),
          color: z.string(),
        })),
        players: z.array(z.object({
          id: z.string().uuid("Invalid player ID"),
          x: z.number(),
          y: z.number(),
          type: z.enum(["offense", "defense"]),
          number: z.number().int().min(0).max(99).optional(),
          name: z.string().max(50).optional(),
        })),
        duration: z.number().int().min(0).optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;

      const sanitizedInput = sanitizeObject(input) as typeof input;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      const team = await prisma.team.findFirst({
        where: {
          id: sanitizedInput.teamId,
          coach: {
            userId: dbUser.id
          }
        }
      });

      if (!team) {
        throw createSecureError('Team not found or access denied', 404);
      }

      console.log("About to create recording...");
      console.log("Input data:", JSON.stringify(sanitizedInput, null, 2));
      
      try {
        const recording = await prisma.playRecording.create({
          data: {
            name: sanitizedInput.name,
            teamId: sanitizedInput.teamId,
            data: sanitizedInput.data,
          },
        });
        console.log("Recording created successfully:", recording.id);
        return { success: true, recording };
      } catch (createError) {
        console.error("Failed to create recording:", createError);
        throw createSecureError(`Failed to create recording: ${createError instanceof Error ? createError.message : String(createError)}`, 500);
      }
    }),
  getPlayRecordings: protectedProcedure
    .input(z.object({ teamId: z.string().uuid("Invalid team ID") }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
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
  createTrainingSet: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid("Invalid team ID"),
      name: z.string().min(1, "Training set name is required").max(100, "Training set name too long"),
      description: z.string().max(500).optional(),
      exercises: z.array(exerciseInputSchema).default([]),
    }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;

      const sanitizedInput = sanitizeObject(input) as typeof input;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      const team = await prisma.team.findFirst({
        where: {
          id: sanitizedInput.teamId,
          coach: {
            userId: dbUser.id
          }
        }
      });

      if (!team) {
        throw createSecureError('Team not found or access denied', 404);
      }

      const trainingSet = await prisma.trainingSet.create({
        data: {
          name: sanitizedInput.name,
          description: sanitizedInput.description,
          teamId: sanitizedInput.teamId,
          exercises: {
            create: sanitizedInput.exercises.map((exercise, index) => ({
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
  getTrainingSets: protectedProcedure
    .input(z.object({ teamId: z.string().uuid("Invalid team ID") }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
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
  getAllTrainingSets: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    });
    if (!dbUser) {
      throw createSecureError('User not found in database', 404);
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
  createExerciseTemplate: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Exercise name is required").max(100, "Exercise name too long"),
      description: z.string().max(500).optional(),
      duration: z.number().int().min(0).max(180).optional(),
      category: z.enum(["warmup", "ball_handling", "shooting", "defense", "conditioning", "scrimmage", "skills", "numerical_advantage"]).optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      equipment: z.string().max(100).optional(),
      instructions: z.string().max(2000).optional(),
      diagramData: z.any().optional(), // Basketball court diagram data
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;

      const sanitizedInput = sanitizeObject(input) as typeof input;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      let coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        const sanitizedName = sanitizeInput(user.user_metadata?.name || user.email || "Coach");
        const sanitizedEmail = sanitizeInput(user.email || "");
        
        coach = await prisma.coach.create({
          data: {
            name: sanitizedName,
            email: sanitizedEmail,
            userId: dbUser.id,
          }
        });
      }

      const exerciseTemplate = await prisma.exerciseTemplate.create({
        data: {
          name: sanitizedInput.name,
          description: sanitizedInput.description,
          duration: sanitizedInput.duration,
          category: sanitizedInput.category,
          difficulty: sanitizedInput.difficulty,
          equipment: sanitizedInput.equipment,
          instructions: sanitizedInput.instructions,
          diagramData: sanitizedInput.diagramData,
          isPublic: sanitizedInput.isPublic,
          coachId: coach.id,
        },
      });

      return { success: true, exerciseTemplate };
    }),
  getExerciseTemplate: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid exercise template ID") }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      const coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        throw createSecureError('Coach not found', 404);
      }

      const exerciseTemplate = await prisma.exerciseTemplate.findFirst({
        where: {
          id: input.id,
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
        }
      });

      if (!exerciseTemplate) {
        throw createSecureError('Exercise template not found or access denied', 404);
      }

      return { exerciseTemplate };
    }),
  getExerciseTemplates: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    });
    if (!dbUser) {
      throw createSecureError('User not found in database', 404);
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
  getExerciseTemplatesWithFilters: protectedProcedure
    .input(z.object({
      category: z.enum(["warmup", "ball_handling", "shooting", "defense", "conditioning", "scrimmage", "skills", "numerical_advantage"]).optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      search: z.string().max(100).optional(),
      includePublic: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        return { exerciseTemplates: [] };
      }

      const coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        return { exerciseTemplates: [] };
      }

      const whereConditions: {
        OR: Array<{ coachId: string } | { isPublic: boolean }>;
        category?: string;
        difficulty?: string;
      } = {
        OR: [
          { coachId: coach.id }, // User's own exercises
          ...(input.includePublic ? [{ isPublic: true }] : []), // Public exercises if requested
        ]
      };

      if (input.category) {
        whereConditions.category = input.category;
      }

      if (input.difficulty) {
        whereConditions.difficulty = input.difficulty;
      }

      const exerciseTemplates = await prisma.exerciseTemplate.findMany({
        where: whereConditions,
        include: {
          coach: {
            select: {
              name: true,
            }
          }
        },
        orderBy: [
          { usageCount: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      // Filter by search term if provided (searching in both Hebrew and English)
      let filteredTemplates = exerciseTemplates;
      if (input.search) {
        const searchTerm = input.search.toLowerCase();
        filteredTemplates = exerciseTemplates.filter(template => {
          return (
            template.name?.toLowerCase().includes(searchTerm) ||
            template.description?.toLowerCase().includes(searchTerm) ||
            template.category?.toLowerCase().includes(searchTerm) ||
            template.difficulty?.toLowerCase().includes(searchTerm) ||
            template.instructions?.toLowerCase().includes(searchTerm)
          );
        });
      }

      return { exerciseTemplates: filteredTemplates };
    }),
  updateExerciseTemplate: protectedProcedure
    .input(z.object({
      id: z.string().uuid("Invalid exercise template ID"),
      name: z.string().min(1, "Exercise name is required").max(100, "Exercise name too long"),
      description: z.string().max(500).optional(),
      duration: z.number().int().min(0).max(180).optional(),
      category: z.enum(["warmup", "ball_handling", "shooting", "defense", "conditioning", "scrimmage", "skills", "numerical_advantage"]).optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      equipment: z.string().max(100).optional(),
      instructions: z.string().max(2000).optional(),
      diagramData: z.any().optional(), // Basketball court diagram data
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;

      const sanitizedInput = sanitizeObject(input) as typeof input;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      const coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        throw createSecureError('Coach not found', 404);
      }

      const exerciseTemplate = await prisma.exerciseTemplate.findFirst({
        where: {
          id: sanitizedInput.id,
          coachId: coach.id
        }
      });

      if (!exerciseTemplate) {
        throw createSecureError('Exercise template not found or not owned by this coach', 404);
      }

      const updatedExerciseTemplate = await prisma.exerciseTemplate.update({
        where: { id: sanitizedInput.id },
        data: {
          name: sanitizedInput.name,
          description: sanitizedInput.description,
          duration: sanitizedInput.duration,
          category: sanitizedInput.category,
          difficulty: sanitizedInput.difficulty,
          equipment: sanitizedInput.equipment,
          instructions: sanitizedInput.instructions,
          isPublic: sanitizedInput.isPublic,
        },
      });

      return { success: true, exerciseTemplate: updatedExerciseTemplate };
    }),
  deleteExerciseTemplate: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid exercise template ID") }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;

      const sanitizedInput = sanitizeObject(input) as typeof input;

      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id }
      });
      if (!dbUser) {
        throw createSecureError('User not found in database', 404);
      }

      const coach = await prisma.coach.findUnique({
        where: { userId: dbUser.id }
      });
      
      if (!coach) {
        throw createSecureError('Coach not found', 404);
      }

      const exerciseTemplate = await prisma.exerciseTemplate.findFirst({
        where: {
          id: sanitizedInput.id,
          coachId: coach.id
        }
      });

      if (!exerciseTemplate) {
        throw createSecureError('Exercise template not found or not owned by this coach', 404);
      }

      await prisma.exerciseTemplate.delete({
        where: { id: sanitizedInput.id }
      });

      return { success: true };
    }),
});
export type AppRouter = typeof appRouter;

// Create Hono app with security
const app = new Hono().basePath("/api");

// Add security middleware
app.use('*', async (c, next) => {
  // Add security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  
  await next();
});

app.get("/hello", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

app.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

export const GET = handle(app);
export const POST = handle(app);
