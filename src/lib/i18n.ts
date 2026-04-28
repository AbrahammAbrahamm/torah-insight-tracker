// Lightweight i18n: English, Hebrew, and a "Mixed" mode (English UI strings
// + Hebrew names for categories and subcategories).
import { createContext, useContext } from 'react';

export type Language = 'en' | 'he' | 'mixed';

export const LANGUAGES: { value: Language; label: string; description: string }[] = [
  { value: 'en', label: 'English', description: 'Full English' },
  { value: 'he', label: 'עברית', description: 'Full Hebrew' },
  { value: 'mixed', label: 'English + Hebrew names', description: 'English UI, Hebrew category names' },
];

// UI string dictionary. Keep keys flat and short.
const STRINGS = {
  // Nav
  'nav.learn': { en: 'Learn', he: 'למידה' },
  'nav.log': { en: 'Log', he: 'יומן' },
  'nav.stats': { en: 'Stats', he: 'נתונים' },
  'nav.settings': { en: 'Settings', he: 'הגדרות' },

  // Common
  'common.save': { en: 'Save', he: 'שמור' },
  'common.cancel': { en: 'Cancel', he: 'ביטול' },
  'common.delete': { en: 'Delete', he: 'מחק' },
  'common.edit': { en: 'Edit', he: 'ערוך' },
  'common.add': { en: 'Add', he: 'הוסף' },
  'common.update': { en: 'Update', he: 'עדכן' },
  'common.create': { en: 'Create', he: 'צור' },
  'common.remove': { en: 'Remove', he: 'הסר' },
  'common.optional': { en: 'optional', he: 'אופציונלי' },
  'common.notes': { en: 'Notes (optional)', he: 'הערות (אופציונלי)' },

  // Categories page
  'categories.tapToLog': { en: 'Tap any unit to log it', he: 'הקש על יחידה כדי לרשום' },
  'categories.structure': { en: 'Structure', he: 'מבנה' },

  // Log entry
  'log.title': { en: 'Log Learning', he: 'רישום למידה' },
  'log.subtitle': { en: 'Record your progress', he: 'רשום את ההתקדמות שלך' },
  'log.category': { en: 'Category', he: 'קטגוריה' },
  'log.unitName': { en: 'Unit Name', he: 'שם היחידה' },
  'log.dafAmud': { en: 'Daf / Amud', he: 'דף / עמוד' },
  'log.seferPerekPasuk': { en: 'Sefer, Perek:Pasuk', he: 'ספר, פרק:פסוק' },
  'log.date': { en: 'Date', he: 'תאריך' },
  'log.components': { en: 'Components', he: 'רכיבים' },
  'log.learnedRatio': { en: 'learned', he: 'נלמדו' },
  'log.learned': { en: 'Learned', he: 'נלמד' },
  'log.reviewed': { en: 'Reviewed', he: 'נחזר' },
  'log.linesLearned': { en: 'Lines learned', he: 'שורות שנלמדו' },
  'log.linesReviewed': { en: 'Lines reviewed', he: 'שורות שנחזרו' },
  'log.addComponent': { en: 'Add component (e.g., Maharsha)', he: 'הוסף רכיב (לדוגמא, מהרש"א)' },
  'log.save': { en: 'Save Entry', he: 'שמור רישום' },
  'log.fillUnit': { en: 'Please fill in the unit name', he: 'נא למלא את שם היחידה' },
  'log.entryLogged': { en: 'Entry logged!', he: 'הרישום נשמר!' },

  // Analytics
  'analytics.title': { en: 'Analytics', he: 'נתונים' },
  'analytics.subtitle': { en: 'Your learning insights', he: 'התובנות שלך' },
  'analytics.allTime': { en: 'All Time', he: 'כל הזמן' },
  'analytics.dayStreak': { en: 'Day Streak', he: 'רצף ימים' },
  'analytics.activeDays': { en: 'Active Days', he: 'ימי פעילות' },
  'analytics.learned': { en: 'Learned', he: 'נלמדו' },
  'analytics.reviews': { en: 'Reviews', he: 'חזרות' },
  'analytics.dailyActivity': { en: 'Daily Activity', he: 'פעילות יומית' },
  'analytics.byCategory': { en: 'By Category', he: 'לפי קטגוריה' },
  'analytics.categoryDetails': { en: 'Category Details', he: 'פירוט קטגוריות' },
  'analytics.closestCompletion': { en: 'Closest to Completion', he: 'הכי קרוב להשלמה' },
  'analytics.empty': { en: 'Start logging to see your analytics', he: 'התחל לרשום כדי לראות נתונים' },
  'analytics.units': { en: 'units', he: 'יחידות' },
  'analytics.learnedLabel': { en: 'learned', he: 'נלמדו' },
  'analytics.reviewedLabel': { en: 'reviewed', he: 'נחזרו' },

  // Settings
  'settings.title': { en: 'Settings', he: 'הגדרות' },
  'settings.subtitle': { en: 'Customize your experience', he: 'התאם את החוויה שלך' },
  'settings.theme': { en: 'Theme', he: 'ערכת נושא' },
  'settings.themeLight': { en: 'Light', he: 'בהיר' },
  'settings.themeDark': { en: 'Dark', he: 'כהה' },
  'settings.themeSystem': { en: 'System', he: 'מערכת' },
  'settings.density': { en: 'Layout Density', he: 'צפיפות תצוגה' },
  'settings.compact': { en: 'Compact', he: 'דחוס' },
  'settings.comfortable': { en: 'Comfortable', he: 'נוח' },
  'settings.spacious': { en: 'Spacious', he: 'מרווח' },
  'settings.reminders': { en: 'Reminders', he: 'תזכורות' },
  'settings.enableReminders': { en: 'Enable reminders', he: 'הפעל תזכורות' },
  'settings.reminderTime': { en: 'Reminder time', he: 'שעת תזכורת' },
  'settings.account': { en: 'Account', he: 'חשבון' },
  'settings.login': { en: 'Log in', he: 'התחבר' },
  'settings.loginDesc': { en: 'Sign in to sync across devices', he: 'התחבר כדי לסנכרן בין מכשירים' },
  'settings.language': { en: 'Language', he: 'שפה' },
  'settings.exportShare': { en: 'Export & Share', he: 'ייצוא ושיתוף' },
  'settings.exportCsv': { en: 'Export as CSV', he: 'ייצא כ-CSV' },
  'settings.exportCsvDesc': { en: 'Download all learning data', he: 'הורד את כל נתוני הלמידה' },
  'settings.shareProgress': { en: 'Share Progress', he: 'שתף התקדמות' },
  'settings.shareProgressDesc': { en: 'Share a summary of your learning', he: 'שתף סיכום של הלמידה שלך' },
  'settings.dataLocal': { en: 'Data is stored locally on this device.', he: 'הנתונים נשמרים מקומית במכשיר זה.' },
  'settings.entries': { en: 'entries', he: 'רישומים' },
  'settings.categoriesCount': { en: 'categories', he: 'קטגוריות' },
  'settings.goalsCount': { en: 'goals', he: 'יעדים' },
  'settings.categories': { en: 'Categories', he: 'קטגוריות' },
} as const;

export type StringKey = keyof typeof STRINGS;

// Hebrew names for built-in categories and (top-level) subcategory nodes.
// Used in 'he' and 'mixed' modes.
export const HEBREW_NAMES: Record<string, string> = {
  // Categories
  'Gemara': 'גמרא',
  'Mishnayos': 'משניות',
  'Halacha': 'הלכה',
  'Tanach': 'תנ"ך',
  // Sedarim
  'Seder Zeraim': 'סדר זרעים',
  'Seder Moed': 'סדר מועד',
  'Seder Nashim': 'סדר נשים',
  'Seder Nezikin': 'סדר נזיקין',
  'Seder Kodashim': 'סדר קדשים',
  'Seder Taharos': 'סדר טהרות',
  // Tanach top
  'Torah (Chumash)': 'תורה (חומש)',
  "Nevi'im & Kesuvim": 'נביאים וכתובים',
  // Chumash
  'Bereishis': 'בראשית', 'Shemos': 'שמות', 'Vayikra': 'ויקרא', 'Bamidbar': 'במדבר', 'Devarim': 'דברים',
  // Halacha sections
  'Orach Chaim': 'אורח חיים',
  'Yoreh Deah': 'יורה דעה',
  'Even HaEzer': 'אבן העזר',
  'Choshen Mishpat': 'חושן משפט',
  // Common masechtos
  'Berachos': 'ברכות', 'Shabbos': 'שבת', 'Eruvin': 'עירובין', 'Pesachim': 'פסחים',
  'Shekalim': 'שקלים', 'Yoma': 'יומא', 'Sukkah': 'סוכה', 'Beitzah': 'ביצה',
  'Rosh Hashanah': 'ראש השנה', 'Taanis': 'תענית', 'Megillah': 'מגילה', 'Moed Katan': 'מועד קטן',
  'Chagigah': 'חגיגה', 'Yevamos': 'יבמות', 'Kesubos': 'כתובות', 'Nedarim': 'נדרים',
  'Nazir': 'נזיר', 'Sotah': 'סוטה', 'Gittin': 'גיטין', 'Kiddushin': 'קידושין',
  'Bava Kamma': 'בבא קמא', 'Bava Metzia': 'בבא מציעא', 'Bava Basra': 'בבא בתרא',
  'Sanhedrin': 'סנהדרין', 'Makkos': 'מכות', 'Shevuos': 'שבועות', 'Eduyos': 'עדויות',
  'Avodah Zarah': 'עבודה זרה', 'Avos': 'אבות', 'Horayos': 'הוריות',
  'Zevachim': 'זבחים', 'Menachos': 'מנחות', 'Chullin': 'חולין', 'Bechoros': 'בכורות',
  'Arachin': 'ערכין', 'Temurah': 'תמורה', 'Kerisus': 'כריתות', 'Meilah': 'מעילה',
  'Tamid': 'תמיד', 'Middos': 'מידות', 'Kinnim': 'קינים', 'Niddah': 'נדה',
  // Nach
  'Yehoshua': 'יהושע', 'Shoftim': 'שופטים', 'Shmuel I': 'שמואל א', 'Shmuel II': 'שמואל ב',
  'Melachim I': 'מלכים א', 'Melachim II': 'מלכים ב', 'Yeshayahu': 'ישעיהו', 'Yirmiyahu': 'ירמיהו',
  'Yechezkel': 'יחזקאל', 'Tehillim': 'תהלים', 'Mishlei': 'משלי', 'Iyov': 'איוב',
  'Shir HaShirim': 'שיר השירים', 'Rus': 'רות', 'Eichah': 'איכה', 'Koheles': 'קהלת',
  'Esther': 'אסתר', 'Daniel': 'דניאל', 'Ezra': 'עזרא', 'Nechemiah': 'נחמיה',
  'Divrei HaYamim I': 'דברי הימים א', 'Divrei HaYamim II': 'דברי הימים ב',
};

// Translate a category/subcategory display name. In 'en', returns as-is.
// In 'he' or 'mixed', tries the dictionary, then translates "Perek N" / "Mishna N"
// / "Siman N" / "Sif N" / "Daf N" patterns to Hebrew.
export function translateName(name: string, lang: Language): string {
  if (lang === 'en') return name;
  if (HEBREW_NAMES[name]) return HEBREW_NAMES[name];
  // Generic patterns
  const m1 = name.match(/^Perek (\d+)$/);
  if (m1) return `פרק ${m1[1]}`;
  const m2 = name.match(/^Mishna (\d+)$/);
  if (m2) return `משנה ${m2[1]}`;
  const m3 = name.match(/^Siman (\d+)$/);
  if (m3) return `סימן ${m3[1]}`;
  const m4 = name.match(/^Sif (\d+)$/);
  if (m4) return `סעיף ${m4[1]}`;
  const m5 = name.match(/^Pasuk (\d+)$/);
  if (m5) return `פסוק ${m5[1]}`;
  const m6 = name.match(/^Daf (\d+)([ab])?\s*(?:\(.*\))?$/);
  if (m6) return `דף ${m6[1]}${m6[2] ? (m6[2] === 'a' ? ' ע"א' : ' ע"ב') : ''}`;
  return name;
}

// Context
interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: StringKey) => string;
  tn: (name: string) => string; // translate a category/sub name
  isRtl: boolean;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => STRINGS[k]?.en ?? k,
  tn: (n) => n,
  isRtl: false,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function buildTranslator(lang: Language) {
  return (key: StringKey) => {
    const entry = STRINGS[key];
    if (!entry) return key;
    if (lang === 'he') return entry.he;
    return entry.en; // 'en' and 'mixed' both use English UI
  };
}

export function buildNameTranslator(lang: Language) {
  return (name: string) => translateName(name, lang);
}
