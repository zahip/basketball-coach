import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hebrew basketball exercises data
const hebrewExercises = [
  {
    name: 'חימום דינמי מקיף',
    description: 'תרגיל חימום מקיף המכין את הגוף לאימון כדורסל. כולל מתיחות דינמיות, ריצות, ותנועות מסובבות כדי להעלות את חום הגוף ולהכין את השרירים והמפרקים לפעילות.',
    duration: 10,
    category: 'warmup',
    difficulty: 'beginner',
    equipment: 'אין צורך בציוד מיוחד',
    instructions: `1. התחל בהליכה מהירה סביב המגרש (2 דקות)
2. ריצה קלה עם הרמת ברכיים (1 דקה)
3. ריצה עם בעיטות לאחור (1 דקה)
4. צעדי צד עם שני הכיוונים (1 דקה)
5. מתיחות דינמיות של הזרועות והרגליים (2 דקות)
6. קפיצות קטנות במקום (1 דקה)
7. ריצת הכנה קצרה (2 דקות)`,
    isPublic: true,
    usageCount: 45,
  },
  {
    name: 'חימום עם כדור',
    description: 'תרגיל חימום המשלב מגע ראשוני עם הכדור. מתמקד בהרגשת הכדור, תיאום עין-יד, והכנה לתרגילי דריבלינג ומסירות מתקדמים יותר.',
    duration: 8,
    category: 'warmup',
    difficulty: 'beginner',
    equipment: 'כדורי כדורסל',
    instructions: `1. העברת כדור סביב הגוף - מותניים, רגליים, ראש (2 דקות)
2. ניפוח כדור בין הרגליים בצורת 8 (1 דקה)
3. דחיפות כדור בשתי ידיים מגובה החזה (1 דקה)
4. זריקת כדור למעלה ותפיסה (1 דקה)
5. דריבל במקום בשתי ידיים לסירוגין (2 דקות)
6. מסירות קצרות לקיר או לשותף (1 דקה)`,
    isPublic: true,
    usageCount: 38,
  },
  {
    name: 'דריבל מסביב לחרוטים',
    description: 'תרגיל מתקדם לשיפור כישורי הדריבל, זריזות ושליטה בכדור. השחקנים עוברים במסלול חרוטים תוך שמירה על שליטה מלאה בכדור ושינוי כיוונים.',
    duration: 15,
    category: 'ball_handling',
    difficulty: 'intermediate',
    equipment: 'כדורי כדורסל, 6-8 חרוטים',
    instructions: `1. סידור חרוטים בקו ישר במרחק 2 מטר אחד מהשני
2. דריבל ביד ימין סביב החרוטים (פנייה שמאלה) - 2 סיבובים
3. דריבל ביד שמאל סביב החרוטים (פנייה ימינה) - 2 סיבובים
4. דריבל עם החלפת ידיים בכל חרוט - 2 סיבובים
5. דריבל נמוך ומהיר עם ידיים לסירוגין - 2 סיבובים
6. דריבל עם פנייה 360 מעלות בחרוט האמצעי - 1 סיבוב
7. דריבל כפול (שתי ידיים) בין החרוטים - 1 סיבוב`,
    isPublic: true,
    usageCount: 67,
  },
  {
    name: 'שתי ידיים דריבל - יסודות',
    description: 'תרגיל בסיסי ללימוד דריבל בשתי ידיים. מתמקד בפיתוח תחושת הכדור, תיאום בין הידיים, ויצירת בסיס חזק לטכניקות דריבל מתקדמות יותר.',
    duration: 12,
    category: 'ball_handling',
    difficulty: 'beginner',
    equipment: 'כדורי כדורסל',
    instructions: `1. דריבל במקום בשתי ידיים בו זמנית - 2 דקות
2. דריבל לסירוגין - יד ימין ואז יד שמאל - 2 דקות
3. דריבל גבוה בשתי ידיים (מעל המותניים) - 1 דקה
4. דריבל נמוך בשתי ידיים (מתחת לברכיים) - 1 דקה
5. דריבל קדימה ואחורה עם שתי ידיים - 2 דקות
6. דריבל צידה עם שתי ידיים - ימינה ושמאלה - 2 דקות
7. שילוב - דריבל במקום, קדימה, צידה - 2 דקות`,
    isPublic: true,
    usageCount: 52,
  },
  {
    name: 'זריקות חופשיות - טכניקה ודיוק',
    description: 'תרגיל מקיף לשיפור זריקות חופשיות. מתמקד בטכניקה נכונה, עמידה יציבה, תנועת זריקה עקבית ושיפור אחוזי הדיוק מקו הזריקות החופשיות.',
    duration: 20,
    category: 'shooting',
    difficulty: 'intermediate',
    equipment: 'כדורי כדורסל',
    instructions: `1. חימום זריקה - 20 זריקות מקרוב לסל (5 דקות)
2. עמידה נכונה על קו הזריקות החופשיות - תרגול יציבות (2 דקות)
3. תרגול תנועת זריקה בלי כדור - 20 פעמים (2 דקות)
4. זריקות חופשיות - 5 סטים של 10 זריקות (8 דקות)
5. זריקות תחת לחץ - זריקה אחת כל 30 שניות (3 דקות)
יעד: השגת 70% דיוק או יותר
טיפ: התמקד בתנועה זהה בכל זריקה`,
    isPublic: true,
    usageCount: 89,
  },
  {
    name: 'זריקות משלושיה - מיומנות מתקדמת',
    description: 'תרגיל מתקדם לפיתוח יכולת זריקה מהקשת. דורש כוח רב יותר, דיוק גבוה ושליטה מלאה בטכניקת הזריקה. מתאים לשחקנים מנוסים.',
    duration: 25,
    category: 'shooting',
    difficulty: 'advanced',
    equipment: 'כדורי כדורסל',
    instructions: `1. חימום זריקה מהאזור הקרוב (5 דקות)
2. זריקות מקו שלוש הנקודות - מהפינות (5 דקות)
   - 3 זריקות מכל פינה, סה"כ 15 זריקות
3. זריקות מהצדדים של הקשת (5 דקות)
   - 5 זריקות מכל צד
4. זריקות מרכז הקשת (5 דקות)
   - 15 זריקות ברציפות
5. מעגל זריקות - 5 עמדות סביב הקשת (5 דקות)
   - 2 זריקות מכל עמדה, 3 סיבובים
יעד: השגת 40% דיוק או יותר מהקשת`,
    isPublic: true,
    usageCount: 73,
  },
  {
    name: 'הגנה אישית - יסודות ההגנה',
    description: 'תרגיל בסיסי ללימוד עקרונות ההגנה האישית. מתמקד בעמידה נכונה, תנועות רגליים, מיקום ביחס לתוקף, ושמירה על מרחק אופטימלי.',
    duration: 18,
    category: 'defense',
    difficulty: 'intermediate',
    equipment: 'אין צורך בציוד מיוחד',
    instructions: `1. עמידת הגנה בסיסית - תרגול יציבות (3 דקות)
   - רגליים פתוחות ברוחב כתפיים, ברכיים כפופות
2. תנועות רגליים הגנתיות ללא יריב (5 דקות)
   - צעדי צד, תנועה קדימה ואחורה
3. עבודה בזוגות - מגן נגד תוקף בלי כדור (5 דקות)
   - התוקף מתנועע, המגן נשאר מולו
4. הגנה נגד דריבל איטי (3 דקות)
   - המגן מחזיק מרחק ומכביד על התוקף
5. הגנה מול זריקה (2 דקות)
   - קפיצה עם יד מורמת בזמן זריקה`,
    isPublic: true,
    usageCount: 61,
  },
  {
    name: 'הגנת אזור 2-3',
    description: 'תרגיל מתקדם ללימוד הגנת אזור 2-3. דורש תיאום קבוצתי גבוה, הבנת אחריות אזורית, ומעברים חלקים בין השחקנים בהתאם לתנועת הכדור.',
    duration: 22,
    category: 'defense',
    difficulty: 'advanced',
    equipment: 'חרוטים לסימון אזורים',
    instructions: `1. הסבר והדגמה של מיקומי הגנת אזור 2-3 (3 דקות)
   - 2 שחקנים בחזית, 3 שחקנים בבסיס
2. תרגול מיקומים סטטיים (4 דקות)
   - כל שחקן עומד באזור שלו
3. תנועת הכדור - הגנה מתכווננת (6 דקות)
   - כדור עובר בין התוקפים, המגנים מתכווננים
4. הגנה מול חדירה לצבע (4 דקות)
   - שחקן חיצוני חודר, ההגנה נסגרת
5. הגנה מול זריקות חיצוניות (3 דקות)
   - יציאה מהאזור לכיסוי זריקה
6. משחק 5 נגד 5 עם הגנת אזור (2 דקות)`,
    isPublic: true,
    usageCount: 34,
  },
  {
    name: 'ריצות ספרינט - פיתוח מהירות',
    description: 'תרגיל כושר המתמקד בפיתוח מהירות והתפרצות. חיוני עבור שחקני כדורסל לשיפור יכולת ההאצה, מהירות ריצה, וכושר אנאירובי.',
    duration: 15,
    category: 'conditioning',
    difficulty: 'intermediate',
    equipment: 'חרוטים לסימון מרחקים',
    instructions: `1. חימום קל - ריצה איטית (3 דקות)
2. ספרינטים קצרים - 10 מטר (4 דקות)
   - 8 ספרינטים, מנוחה של 30 שניות בין כל ספרינט
3. ספרינטים בינוניים - 20 מטר (4 דקות)
   - 6 ספרינטים, מנוחה של 45 שניות בין כל ספרינט
4. ספרינטים ארוכים - רוחב המגרש (3 דקות)
   - 4 ספרינטים, מנוחה של 60 שניות בין כל ספרינט
5. התאוששות - הליכה איטית (1 דקה)
חשוב: לשמור על טכניקת ריצה נכונה לאורך כל התרגיל`,
    isPublic: true,
    usageCount: 47,
  },
  {
    name: 'פיטנס כדורסל משולב',
    description: 'תרגיל כושר מקיף המשלב מיומנויות כדורסל עם אלמנטים של כושר גופני. מפתח סיבולת, כוח, זריזות ותיאום תוך שמירה על רלוונטיות למשחק.',
    duration: 20,
    category: 'skills',
    difficulty: 'advanced',
    equipment: 'כדורי כדורסל, חרוטים',
    instructions: `1. עמדה 1 - דריבל עם סקוואטים (4 דקות)
   - דריבל במקום תוך ביצוע 10 סקוואטים, חזרה 4 פעמים
2. עמדה 2 - זריקות עם ריצה (4 דקות)
   - זריקה מקרוב, ריצה לקו האמצע וחזרה, 15 חזרות
3. עמדה 3 - דריבל זריזות בין חרוטים (4 דקות)
   - מסלול זיגזג מהיר, 3 דקות עבודה ודקה מנוחה
4. עמדה 4 - מסירות עם קפיצות (4 דקות)
   - מסירת חזה לקיר + 5 קפיצות, 20 חזרות
5. עמדה 5 - שילוב מיומנויות (4 דקות)
   - דריבל + זריקה + ריצה + הגנה, מעגל שלם
מנוחה: 30 שניות בין עמדות`,
    isPublic: true,
    usageCount: 56,
  },
];

async function main() {
  console.log('🏀 Starting basketball exercises seeding...');

  try {
    // Create or find a coach to associate with the exercises
    let coach = await prisma.coach.findFirst({
      where: {
        email: 'coach@basketballapp.com'
      }
    });

    // If no coach exists, create a default one
    if (!coach) {
      console.log('Creating default coach...');
      
      // First create a user
      const user = await prisma.user.create({
        data: {
          supabaseId: 'seed-user-id',
          email: 'coach@basketballapp.com',
          name: 'מאמן מערכת',
          provider: 'seed',
        }
      });

      // Then create the coach
      coach = await prisma.coach.create({
        data: {
          name: 'מאמן מערכת',
          email: 'coach@basketballapp.com',
          userId: user.id,
        }
      });
    }

    console.log(`✅ Using coach: ${coach.name} (${coach.id})`);

    // Create all exercises in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdExercises = [];
      
      for (let i = 0; i < hebrewExercises.length; i++) {
        const exerciseData = hebrewExercises[i];
        
        // Check if exercise already exists
        const existingExercise = await tx.exerciseTemplate.findFirst({
          where: {
            name: exerciseData.name,
            coachId: coach.id
          }
        });

        if (existingExercise) {
          console.log(`⚠️  Exercise "${exerciseData.name}" already exists, skipping...`);
          continue;
        }

        const exercise = await tx.exerciseTemplate.create({
          data: {
            ...exerciseData,
            coachId: coach.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });

        createdExercises.push(exercise);
        console.log(`✅ Created exercise: ${exercise.name}`);
      }

      return createdExercises;
    });

    console.log(`🎉 Successfully created ${result.length} new Hebrew basketball exercises!`);
    console.log('\n📝 Created exercises:');
    result.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name} (${exercise.category}, ${exercise.difficulty})`);
    });

    // Summary statistics
    const totalExercises = await prisma.exerciseTemplate.count();
    const publicExercises = await prisma.exerciseTemplate.count({
      where: { isPublic: true }
    });

    console.log(`\n📊 Database Summary:`);
    console.log(`- Total exercises: ${totalExercises}`);
    console.log(`- Public exercises: ${publicExercises}`);
    console.log(`- Categories covered: ${new Set(hebrewExercises.map(e => e.category)).size}`);
    console.log(`- Difficulty levels: ${new Set(hebrewExercises.map(e => e.difficulty)).size}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });