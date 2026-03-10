export interface Passage {
  id: string;
  title: { en: string; he: string };
  text: { en: string; he: string };
  difficulty: 'easy' | 'medium' | 'hard';
  targetWPM: number;
  wordCount: number;
}

export interface Prompt {
  id: string;
  prompt: { en: string; he: string };
  hint: { en: string; he: string };
}

export const passages: Passage[] = [
  {
    id: 'p1',
    title: { en: 'The Morning Walk', he: 'הליכת הבוקר' },
    text: {
      en: 'The sun rises slowly over the quiet hills. Birds begin to sing their morning songs. A gentle breeze moves through the tall green trees. The air is fresh and cool against my face.',
      he: 'השמש עולה לאט מעל הגבעות השקטות. ציפורים מתחילות לשיר את שירי הבוקר שלהן. רוח עדינה נושבת בין העצים הירוקים הגבוהים. האוויר רענן וקריר על פניי.',
    },
    difficulty: 'easy',
    targetWPM: 90,
    wordCount: 33,
  },
  {
    id: 'p2',
    title: { en: 'The Kitchen', he: 'המטבח' },
    text: {
      en: 'I walk into the kitchen and open the fridge. There is milk, some eggs, and fresh bread on the counter. I decide to make a simple breakfast. The coffee machine hums quietly as I wait for my cup to fill.',
      he: 'אני נכנס למטבח ופותח את המקרר. יש חלב, כמה ביצים, ולחם טרי על השיש. אני מחליט להכין ארוחת בוקר פשוטה. מכונת הקפה מזמזמת בשקט בזמן שאני מחכה שהכוס תתמלא.',
    },
    difficulty: 'easy',
    targetWPM: 90,
    wordCount: 40,
  },
  {
    id: 'p3',
    title: { en: 'City Sounds', he: 'צלילי העיר' },
    text: {
      en: 'The city wakes up with a rhythm of its own. Car horns blend with the chatter of people walking to work. Street vendors call out their prices while buses rumble past. There is a music to this chaos, a pattern beneath the noise that only those who listen carefully can hear.',
      he: 'העיר מתעוררת עם קצב משלה. צפירות מכוניות מתמזגות עם הפטפוט של אנשים שהולכים לעבודה. רוכלי רחוב קוראים את המחירים שלהם בזמן שאוטובוסים רועמים חולפים. יש מוזיקה בכאוס הזה, תבנית מתחת לרעש שרק מי שמקשיב בקפידה יכול לשמוע.',
    },
    difficulty: 'medium',
    targetWPM: 100,
    wordCount: 51,
  },
  {
    id: 'p4',
    title: { en: 'The Old Library', he: 'הספרייה הישנה' },
    text: {
      en: 'Behind the heavy wooden doors lies a world of silence and stories. Shelves stretch from floor to ceiling, filled with books whose spines have faded with time. The smell of old paper fills the room. Each book holds a universe waiting to be explored, a door to another time and place that opens the moment you turn the first page.',
      he: 'מאחורי הדלתות הכבדות מעץ מסתתר עולם של שקט וסיפורים. מדפים נמתחים מהרצפה עד התקרה, מלאים בספרים ששדרותיהם דהו עם הזמן. ריח הנייר הישן ממלא את החדר. כל ספר מחזיק יקום שמחכה לחקירה, דלת לזמן ומקום אחר שנפתחת ברגע שהופכים את העמוד הראשון.',
    },
    difficulty: 'medium',
    targetWPM: 100,
    wordCount: 60,
  },
  {
    id: 'p5',
    title: { en: 'Ocean Reflections', he: 'השתקפויות האוקיינוס' },
    text: {
      en: 'Standing at the edge of the ocean, I realize how small we really are. The waves have been crashing against these rocks for thousands of years, long before any of us were born, and they will continue long after we are gone. There is something deeply humbling about watching the water meet the shore. It teaches patience. It shows us that even the hardest stone can be shaped by something as soft as water, given enough time.',
      he: 'עומד בקצה האוקיינוס, אני מבין כמה קטנים אנחנו באמת. הגלים מתנפצים על הסלעים האלה כבר אלפי שנים, הרבה לפני שמישהו מאיתנו נולד, והם ימשיכו הרבה אחרי שנלך. יש משהו מענה עמוק בלצפות במים פוגשים את החוף. זה מלמד סבלנות. זה מראה לנו שגם האבן הקשה ביותר יכולה להיות מעוצבת על ידי משהו רך כמו מים, אם נותנים מספיק זמן.',
    },
    difficulty: 'hard',
    targetWPM: 110,
    wordCount: 77,
  },
  {
    id: 'p6',
    title: { en: 'The Art of Cooking', he: 'אומנות הבישול' },
    text: {
      en: 'Cooking is more than following a recipe. It is about understanding how flavors come together, how heat transforms raw ingredients into something entirely new. A pinch of salt can elevate a dish from ordinary to extraordinary. The best cooks trust their senses. They taste, they adjust, they experiment. Every meal is an opportunity to create something that brings people together around a table, sharing not just food but conversation and connection.',
      he: 'בישול הוא יותר מאשר מעקב אחרי מתכון. זה על להבין איך טעמים מתחברים יחד, איך חום הופך מרכיבים גולמיים למשהו חדש לגמרי. קמצוץ מלח יכול להעלות מנה מרגילה למיוחדת. הטבחים הטובים ביותר סומכים על החושים שלהם. הם טועמים, מתאימים, מנסים. כל ארוחה היא הזדמנות ליצור משהו שמפגיש אנשים סביב שולחן, חולקים לא רק אוכל אלא שיחה וחיבור.',
    },
    difficulty: 'hard',
    targetWPM: 110,
    wordCount: 71,
  },
];

export const tongueTwisters = {
  en: [
    'She sells seashells by the seashore.',
    'Peter Piper picked a peck of pickled peppers.',
    'How much wood would a woodchuck chuck if a woodchuck could chuck wood.',
    'Red lorry, yellow lorry, red lorry, yellow lorry.',
    'Unique New York, you know you need unique New York.',
  ],
  he: [
    'שרה שרה שיר שמח, שיר שמח שרה שרה.',
    'גנן גידל דגן בגן, דגן גדול גדל בגן.',
    'נחש נשך נחש, כי נחש נחש שנחש נשך נחש.',
    'קרקר קרקר קרקר, קרקר קרקר בקרקס.',
    'פרפר פרפר פרח, פרח פרח פרפר.',
  ],
};

export const freePrompts: Prompt[] = [
  {
    id: 'f1',
    prompt: {
      en: 'Describe what you had for breakfast today.',
      he: 'תאר מה אכלת לארוחת בוקר היום.',
    },
    hint: {
      en: 'Take your time. Describe each item slowly and clearly.',
      he: 'קח את הזמן. תאר כל פריט לאט ובבירור.',
    },
  },
  {
    id: 'f2',
    prompt: {
      en: 'Tell me about your favorite place to relax.',
      he: 'ספר לי על המקום האהוב עליך להירגע.',
    },
    hint: {
      en: 'Paint a picture with words. What do you see, hear, smell?',
      he: 'צייר תמונה במילים. מה אתה רואה, שומע, מריח?',
    },
  },
  {
    id: 'f3',
    prompt: {
      en: 'Explain the rules of a game you enjoy.',
      he: 'הסבר את הכללים של משחק שאתה נהנה ממנו.',
    },
    hint: {
      en: 'Break it into steps. One rule at a time.',
      he: 'חלק את זה לשלבים. כלל אחד בכל פעם.',
    },
  },
  {
    id: 'f4',
    prompt: {
      en: 'Describe your morning routine step by step.',
      he: 'תאר את שגרת הבוקר שלך צעד אחר צעד.',
    },
    hint: {
      en: 'Focus on each action. No need to rush through.',
      he: 'התמקד בכל פעולה. אין צורך למהר.',
    },
  },
  {
    id: 'f5',
    prompt: {
      en: 'What is something you learned recently?',
      he: 'מה משהו שלמדת לאחרונה?',
    },
    hint: {
      en: 'Explain it as if teaching someone else. Clear and slow.',
      he: 'הסבר את זה כאילו אתה מלמד מישהו אחר. ברור ולאט.',
    },
  },
  {
    id: 'f6',
    prompt: {
      en: 'Describe your ideal weekend.',
      he: 'תאר את סוף השבוע האידיאלי שלך.',
    },
    hint: {
      en: 'Walk through the day hour by hour.',
      he: 'עבור על היום שעה אחרי שעה.',
    },
  },
];

import { allPassages } from './allPassages';

// Combine original short passages with the large collection
const allAvailablePassages = [...passages, ...allPassages];

export function getTodayExercises(lang: 'en' | 'he', targetWordCount?: number) {
  // Use a hash of the full date to get better distribution across passages
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const hash = dateStr.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0);
  const twisterIndex = today.getDate() % tongueTwisters[lang].length;
  const promptIndex = Math.abs(hash + 7) % freePrompts.length;

  let selectedPassage: Passage;

  if (targetWordCount != null) {
    // Filter to passages that have a wordCount field
    const withWordCount = allAvailablePassages.filter(
      (p): p is Passage & { wordCount: number } => p.wordCount != null
    );

    if (withWordCount.length > 0) {
      // Sort by distance from target word count
      const sorted = [...withWordCount].sort(
        (a, b) => Math.abs(a.wordCount - targetWordCount) - Math.abs(b.wordCount - targetWordCount)
      );

      // Take the top 5 closest matches (or fewer if not enough)
      const candidates = sorted.slice(0, Math.min(5, sorted.length));

      // Pick from candidates using date-based rotation
      const candidateIndex = Math.abs(hash) % candidates.length;
      selectedPassage = candidates[candidateIndex];
    } else {
      // No passages have wordCount yet, fall back to default behavior
      const dayIndex = Math.abs(hash) % allAvailablePassages.length;
      selectedPassage = allAvailablePassages[dayIndex];
    }
  } else {
    // Original behavior: pick by date-based index
    const dayIndex = Math.abs(hash) % allAvailablePassages.length;
    selectedPassage = allAvailablePassages[dayIndex];
  }

  return {
    passage: selectedPassage,
    tonguetwister: tongueTwisters[lang][twisterIndex],
    freePrompt: freePrompts[promptIndex],
  };
}
