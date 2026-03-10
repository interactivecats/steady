interface TermsProps {
  lang: 'en' | 'he';
  onBack: () => void;
}

const content = {
  en: {
    title: 'Terms of Service & Disclaimer',
    lastUpdated: 'Last updated: March 2026',
    backLabel: '← Back to Dashboard',
    sections: [
      {
        heading: 'What Steady Is',
        body: 'Steady is a free, open-source speech pace training tool. It helps you practice speaking at a steady, comfortable pace by reading passages aloud. That\'s it — a simple practice tool, nothing more.',
      },
      {
        heading: 'Not Medical Advice',
        body: 'Steady is not a medical device, and nothing in this app should be taken as medical advice, diagnosis, or treatment. It is not a substitute for professional speech-language therapy. If you have a speech, language, or communication concern, please consult a qualified speech-language pathologist or other healthcare professional.',
      },
      {
        heading: 'Provided As-Is',
        body: 'This software is provided "as-is," without warranty of any kind, express or implied. We make no guarantees that the app will be error-free, uninterrupted, or that it will produce any particular result. Use it at your own risk.',
      },
      {
        heading: 'No Liability',
        body: 'To the fullest extent permitted by law, the creators and contributors of Steady shall not be held liable for any damages, losses, or negative outcomes arising from the use of this app — including but not limited to speech outcomes, missed professional treatment, or reliance on the app as a therapeutic tool.',
      },
      {
        heading: 'Your Privacy',
        body: 'All your progress, settings, and session data are stored locally in your browser using localStorage. We have no analytics, no tracking, and no accounts. Your data stays on your device.',
      },
      {
        heading: 'Speech Recognition',
        body: 'Steady uses your browser\'s built-in Web Speech API to measure your speaking pace. On Chrome and Edge, your voice audio is sent to Google\'s servers for processing — this is handled by the browser itself, not by Steady. On Safari, speech recognition is processed on-device by Apple. Steady does not store or transmit any audio recordings. If you are not comfortable with this, you can still use the read-along and breathing exercises, which do not use the microphone.',
      },
      {
        heading: 'Open Source',
        body: 'Steady is open-source software. You are free to inspect, modify, and distribute the code in accordance with its license. Contributions are welcome.',
      },
    ],
  },
  he: {
    title: 'תנאי שימוש והצהרת אחריות',
    lastUpdated: 'עדכון אחרון: מרץ 2026',
    backLabel: 'חזרה ללוח הבקרה ←',
    sections: [
      {
        heading: 'מהו Steady',
        body: 'Steady הוא כלי חינמי וקוד פתוח לאימון קצב דיבור. הוא עוזר לכם לתרגל דיבור בקצב יציב ונוח על ידי קריאה בקול של קטעי טקסט. זה הכל — כלי תרגול פשוט, לא יותר.',
      },
      {
        heading: 'אין זו ייעוץ רפואי',
        body: 'Steady אינו מכשיר רפואי, ואין לראות בשום דבר באפליקציה זו ייעוץ רפואי, אבחון או טיפול. האפליקציה אינה תחליף לטיפול מקצועי בקלינאות תקשורת. אם יש לכם חשש בנוגע לדיבור, שפה או תקשורת, אנא פנו לקלינאי/ת תקשורת מוסמך/ת או לאיש מקצוע רפואי אחר.',
      },
      {
        heading: 'מסופק כמות שהוא',
        body: 'תוכנה זו מסופקת "כמות שהיא" (as-is), ללא אחריות מכל סוג, מפורשת או משתמעת. אנחנו לא מבטיחים שהאפליקציה תהיה נטולת שגיאות, רציפה, או שתניב תוצאה מסוימת. השימוש הוא על אחריותכם בלבד.',
      },
      {
        heading: 'הגבלת אחריות',
        body: 'במידה המרבית המותרת על פי חוק, יוצרי Steady ותורמיו לא יישאו באחריות לכל נזק, הפסד או תוצאה שלילית הנובעים מהשימוש באפליקציה — כולל אך לא רק תוצאות דיבור, החמצת טיפול מקצועי, או הסתמכות על האפליקציה ככלי טיפולי.',
      },
      {
        heading: 'הפרטיות שלכם',
        body: 'כל ההתקדמות, ההגדרות ונתוני האימונים שלכם מאוחסנים באופן מקומי בדפדפן באמצעות localStorage. אין לנו אנליטיקה, אין מעקב, ואין חשבונות משתמש. הנתונים שלכם נשארים במכשיר שלכם.',
      },
      {
        heading: 'זיהוי דיבור',
        body: 'Steady משתמש בממשק זיהוי הדיבור המובנה בדפדפן (Web Speech API) כדי למדוד את קצב הדיבור שלכם. בדפדפני Chrome ו-Edge, הקול שלכם נשלח לשרתי Google לעיבוד — זה מתבצע על ידי הדפדפן עצמו, לא על ידי Steady. בדפדפן Safari, זיהוי הדיבור מעובד מקומית על ידי Apple. Steady לא מאחסן או משדר הקלטות שמע. אם אתם לא מרגישים בנוח עם זה, אתם עדיין יכולים להשתמש בתרגילי הקריאה והנשימה שלא דורשים שימוש במיקרופון.',
      },
      {
        heading: 'קוד פתוח',
        body: 'Steady הוא תוכנת קוד פתוח. אתם חופשיים לבדוק, לשנות ולהפיץ את הקוד בהתאם לרישיון. תרומות מתקבלות בברכה.',
      },
    ],
  },
};

export function Terms({ lang, onBack }: TermsProps) {
  const c = content[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-dvh px-4 py-8 max-w-lg mx-auto" dir={dir}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm mb-6 transition-all hover:opacity-70 cursor-pointer"
        style={{ color: 'var(--color-sage-500)' }}
      >
        {c.backLabel}
      </button>

      {/* Title */}
      <h1
        className="text-2xl md:text-3xl mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {c.title}
      </h1>
      <p className="text-xs opacity-40 mb-8">{c.lastUpdated}</p>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {c.sections.map((section, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--bg-card, white)',
              border: '1px solid var(--border-color, #E8E0D8)',
            }}
          >
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--color-sage-600)' }}
            >
              {section.heading}
            </h2>
            <p
              className="text-sm leading-relaxed opacity-70"
              style={{
                fontFamily:
                  lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)',
              }}
            >
              {section.body}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom back link */}
      <div className="text-center mt-8 mb-4">
        <button
          onClick={onBack}
          className="text-sm transition-all hover:opacity-70 cursor-pointer"
          style={{ color: 'var(--color-sage-500)' }}
        >
          {c.backLabel}
        </button>
      </div>
    </div>
  );
}
