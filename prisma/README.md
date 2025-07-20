# Database Seeding

This directory contains database seeding scripts for the Basketball Coach App.

## Available Scripts

### `seed.ts`
Seeds the database with 10 comprehensive Hebrew basketball exercises covering all major training categories.

**Usage:**
```bash
pnpm db:seed
```

**What it creates:**
- 10 Hebrew basketball exercises
- Default coach account ("מאמן מערכת")
- Exercise categories: warmup, ball_handling, shooting, defense, conditioning, skills
- Difficulty levels: beginner, intermediate, advanced
- All exercises are marked as public and include realistic usage counts

**Exercise Categories:**
1. **חימום (Warmup)** - 2 exercises
2. **טיפול בכדור (Ball Handling)** - 2 exercises
3. **זריקות (Shooting)** - 2 exercises
4. **הגנה (Defense)** - 2 exercises
5. **כושר/מיומנויות (Conditioning/Skills)** - 2 exercises

**Safety:**
- The script is idempotent (can be run multiple times safely)
- Existing exercises won't be duplicated
- Uses database transactions for data integrity

## Exercise Structure

Each exercise includes:
- **Name** (Hebrew)
- **Description** (detailed Hebrew description)
- **Duration** (in minutes)
- **Category** (warmup, ball_handling, shooting, defense, conditioning, skills)
- **Difficulty** (beginner, intermediate, advanced)
- **Equipment** (required equipment in Hebrew)
- **Instructions** (step-by-step instructions in Hebrew)
- **Usage Count** (realistic usage statistics)
- **Public flag** (all seeded exercises are public)

## Technical Details

- Uses Prisma ORM for database operations
- TypeScript for type safety
- Proper error handling and logging
- Creates necessary coach/user relationships
- Includes comprehensive Hebrew basketball terminology

## After Seeding

The exercises will be immediately available in:
- `/exercises` page (exercise library)
- Exercise creation form (as examples)
- Training set builder (can be added to training plans)

All exercises include authentic Hebrew basketball terminology and professional training methodologies.