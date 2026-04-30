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
  'analytics.heatmap': { en: 'Activity Heatmap (12 weeks)', he: 'מפת פעילות (12 שבועות)' },
  'analytics.heatmapLess': { en: 'Less', he: 'פחות' },
  'analytics.heatmapMore': { en: 'More', he: 'יותר' },
  'analytics.highlights': { en: 'Highlights', he: 'תובנות' },
  'analytics.bestDay': { en: 'Best Day', he: 'יום שיא' },
  'analytics.avgPerDay': { en: 'Avg / Active Day', he: 'ממוצע ליום פעיל' },
  'analytics.totalEntries': { en: 'Total Entries', he: 'סה״כ רישומים' },
  'analytics.topCategory': { en: 'Top Category', he: 'קטגוריה מובילה' },
  'analytics.byWeekday': { en: 'By Day of Week', he: 'לפי ימי השבוע' },
  'analytics.recentActivity': { en: 'Recent Activity', he: 'פעילות אחרונה' },
  'analytics.noEntriesYet': { en: 'No entries yet', he: 'אין רישומים' },

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
  'Chumash': 'חומש',
  'Nach': 'נ"ך',
  'Trei Asar': 'תרי עשר',
  'Hoshea': 'הושע', 'Yoel': 'יואל', 'Amos': 'עמוס', 'Ovadiah': 'עובדיה',
  'Yonah': 'יונה', 'Michah': 'מיכה', 'Nachum': 'נחום', 'Chavakuk': 'חבקוק',
  'Tzefaniah': 'צפניה', 'Chaggai': 'חגי', 'Zechariah': 'זכריה', 'Malachi': 'מלאכי',
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
  // Zeraim masechtos (Mishna only)
  'Peah': 'פאה', 'Demai': 'דמאי', 'Kilayim': 'כלאים', 'Sheviis': 'שביעית',
  'Terumos': 'תרומות', 'Maasros': 'מעשרות', 'Maaser Sheni': 'מעשר שני',
  'Challah': 'חלה', 'Orlah': 'ערלה', 'Bikkurim': 'ביכורים',
  // Taharos masechtos
  'Keilim': 'כלים', 'Ohalos': 'אהלות', 'Negaim': 'נגעים', 'Parah': 'פרה',
  'Taharos': 'טהרות', 'Mikvaos': 'מקואות', 'Machshirin': 'מכשירין',
  'Zavim': 'זבים', 'Tevul Yom': 'טבול יום', 'Yadayim': 'ידים', 'Uktzin': 'עוקצין',
  // Nach
  'Yehoshua': 'יהושע', 'Shoftim': 'שופטים', 'Shmuel I': 'שמואל א', 'Shmuel II': 'שמואל ב',
  'Melachim I': 'מלכים א', 'Melachim II': 'מלכים ב', 'Yeshayahu': 'ישעיהו', 'Yirmiyahu': 'ירמיהו',
  'Yechezkel': 'יחזקאל', 'Tehillim': 'תהלים', 'Mishlei': 'משלי', 'Iyov': 'איוב',
  'Shir HaShirim': 'שיר השירים', 'Rus': 'רות', 'Eichah': 'איכה', 'Koheles': 'קהלת',
  'Esther': 'אסתר', 'Daniel': 'דניאל', 'Ezra': 'עזרא', 'Nechemiah': 'נחמיה',
  'Divrei HaYamim I': 'דברי הימים א', 'Divrei HaYamim II': 'דברי הימים ב',
};

// Convert a positive integer to its Hebrew gematria representation.
// Handles 1..9999. Inserts geresh/gershayim per convention.
export function numberToGematria(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return String(n);
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];

  function under1000(num: number): string {
    let s = '';
    let h = Math.floor(num / 100);
    while (h > 4) { s += 'ת'; h -= 4; }
    s += hundreds[h];
    let rem = num % 100;
    // Special cases for 15 and 16 (avoid spelling God's name)
    if (rem === 15) return s + 'טו';
    if (rem === 16) return s + 'טז';
    const t = Math.floor(rem / 10);
    const o = rem % 10;
    s += tens[t] + ones[o];
    return s;
  }

  let result = '';
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    result += under1000(thousands) + "'";
    n = n % 1000;
    if (n === 0) return result;
  }
  const body = under1000(n);
  // Add gershayim (״) before last letter if length > 1, else geresh (׳)
  if (body.length === 1) result += body + '׳';
  else result += body.slice(0, -1) + '״' + body.slice(-1);
  return result;
}

// Translate a category/subcategory display name. In 'en', returns as-is.
// In 'he' or 'mixed', tries the dictionary, then translates patterns.
export function translateName(name: string, lang: Language): string {
  if (lang === 'en') return name;
  if (HEBREW_NAMES[name]) return HEBREW_NAMES[name];
  // Generic patterns — convert numbers to gematria letters
  const m1 = name.match(/^Perek (\d+)$/);
  if (m1) return `פרק ${numberToGematria(parseInt(m1[1], 10))}`;
  const m2 = name.match(/^Mishna (\d+)$/);
  if (m2) return `משנה ${numberToGematria(parseInt(m2[1], 10))}`;
  const m3 = name.match(/^Siman (\d+)$/);
  if (m3) return `סימן ${numberToGematria(parseInt(m3[1], 10))}`;
  const m4 = name.match(/^Sif (\d+)$/);
  if (m4) return `סעיף ${numberToGematria(parseInt(m4[1], 10))}`;
  const m5 = name.match(/^Pasuk (\d+)$/);
  if (m5) return `פסוק ${numberToGematria(parseInt(m5[1], 10))}`;
  // "Daf 2a (Amud Aleph)" or "Daf 2"
  const m6 = name.match(/^Daf (\d+)([ab])?\s*(?:\(.*\))?$/);
  if (m6) {
    const numLetters = numberToGematria(parseInt(m6[1], 10));
    const amud = m6[2] === 'a' ? ' ע״א' : m6[2] === 'b' ? ' ע״ב' : '';
    return `דף ${numLetters}${amud}`;
  }
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
