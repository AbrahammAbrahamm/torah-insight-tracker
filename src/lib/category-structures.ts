// Hierarchical subcategory structures for study categories

export interface SubCategory {
  id: string;
  name: string;
  children?: SubCategory[];
  totalUnits?: number; // e.g., number of daf in a masechta
}

// Generate daf entries for a masechta
function generateDafList(count: number): SubCategory[] {
  const dafim: SubCategory[] = [];
  for (let i = 2; i <= count + 1; i++) {
    dafim.push(
      { id: `${i}a`, name: `${numberToHebrew(i)}a (Amud Aleph)`, totalUnits: 1 },
      { id: `${i}b`, name: `${numberToHebrew(i)}b (Amud Beis)`, totalUnits: 1 },
    );
  }
  return dafim;
}

function numberToHebrew(n: number): string {
  // Simple display — just show the number for now
  return `Daf ${n}`;
}

// Generate perek list (1..count), each with pasuk children
function generatePerakim(count: number, pasukimPerPerek?: number[]): SubCategory[] {
  const perakim: SubCategory[] = [];
  for (let i = 1; i <= count; i++) {
    const pasukCount = pasukimPerPerek?.[i - 1];
    const node: SubCategory = { id: `perek-${i}`, name: `Perek ${i}`, totalUnits: pasukCount };
    if (pasukCount && pasukCount > 0) {
      const pesukim: SubCategory[] = [];
      for (let p = 1; p <= pasukCount; p++) {
        pesukim.push({ id: `pasuk-${i}-${p}`, name: `Pasuk ${p}`, totalUnits: 1 });
      }
      node.children = pesukim;
    }
    perakim.push(node);
  }
  return perakim;
}

// Generate simple perek list without pasuk breakdown
function generatePerakimSimple(count: number): SubCategory[] {
  return generatePerakim(count);
}

// Complete Bavli Gemara structure: Seder → Masechta → Daf
export const GEMARA_STRUCTURE: SubCategory[] = [
  {
    id: 'zeraim',
    name: 'Seder Zeraim',
    children: [
      { id: 'berachos', name: 'Berachos', totalUnits: 64, children: generateDafList(64) },
    ],
  },
  {
    id: 'moed',
    name: 'Seder Moed',
    children: [
      { id: 'shabbos', name: 'Shabbos', totalUnits: 157, children: generateDafList(157) },
      { id: 'eruvin', name: 'Eruvin', totalUnits: 105, children: generateDafList(105) },
      { id: 'pesachim', name: 'Pesachim', totalUnits: 121, children: generateDafList(121) },
      { id: 'shekalim', name: 'Shekalim', totalUnits: 22, children: generateDafList(22) },
      { id: 'yoma', name: 'Yoma', totalUnits: 88, children: generateDafList(88) },
      { id: 'sukkah', name: 'Sukkah', totalUnits: 56, children: generateDafList(56) },
      { id: 'beitzah', name: 'Beitzah', totalUnits: 40, children: generateDafList(40) },
      { id: 'rosh-hashanah', name: 'Rosh Hashanah', totalUnits: 35, children: generateDafList(35) },
      { id: 'taanis', name: 'Taanis', totalUnits: 31, children: generateDafList(31) },
      { id: 'megillah', name: 'Megillah', totalUnits: 32, children: generateDafList(32) },
      { id: 'moed-katan', name: 'Moed Katan', totalUnits: 29, children: generateDafList(29) },
      { id: 'chagigah', name: 'Chagigah', totalUnits: 27, children: generateDafList(27) },
    ],
  },
  {
    id: 'nashim',
    name: 'Seder Nashim',
    children: [
      { id: 'yevamos', name: 'Yevamos', totalUnits: 122, children: generateDafList(122) },
      { id: 'kesubos', name: 'Kesubos', totalUnits: 112, children: generateDafList(112) },
      { id: 'nedarim', name: 'Nedarim', totalUnits: 91, children: generateDafList(91) },
      { id: 'nazir', name: 'Nazir', totalUnits: 66, children: generateDafList(66) },
      { id: 'sotah', name: 'Sotah', totalUnits: 49, children: generateDafList(49) },
      { id: 'gittin', name: 'Gittin', totalUnits: 90, children: generateDafList(90) },
      { id: 'kiddushin', name: 'Kiddushin', totalUnits: 82, children: generateDafList(82) },
    ],
  },
  {
    id: 'nezikin',
    name: 'Seder Nezikin',
    children: [
      { id: 'bava-kamma', name: 'Bava Kamma', totalUnits: 119, children: generateDafList(119) },
      { id: 'bava-metzia', name: 'Bava Metzia', totalUnits: 119, children: generateDafList(119) },
      { id: 'bava-basra', name: 'Bava Basra', totalUnits: 176, children: generateDafList(176) },
      { id: 'sanhedrin', name: 'Sanhedrin', totalUnits: 113, children: generateDafList(113) },
      { id: 'makkos', name: 'Makkos', totalUnits: 24, children: generateDafList(24) },
      { id: 'shevuos', name: 'Shevuos', totalUnits: 49, children: generateDafList(49) },
      { id: 'avodah-zarah', name: 'Avodah Zarah', totalUnits: 76, children: generateDafList(76) },
      { id: 'horayos', name: 'Horayos', totalUnits: 14, children: generateDafList(14) },
    ],
  },
  {
    id: 'kodashim',
    name: 'Seder Kodashim',
    children: [
      { id: 'zevachim', name: 'Zevachim', totalUnits: 120, children: generateDafList(120) },
      { id: 'menachos', name: 'Menachos', totalUnits: 110, children: generateDafList(110) },
      { id: 'chullin', name: 'Chullin', totalUnits: 142, children: generateDafList(142) },
      { id: 'bechoros', name: 'Bechoros', totalUnits: 61, children: generateDafList(61) },
      { id: 'arachin', name: 'Arachin', totalUnits: 34, children: generateDafList(34) },
      { id: 'temurah', name: 'Temurah', totalUnits: 34, children: generateDafList(34) },
      { id: 'kerisus', name: 'Kerisus', totalUnits: 28, children: generateDafList(28) },
      { id: 'meilah', name: 'Meilah', totalUnits: 22, children: generateDafList(22) },
      { id: 'tamid', name: 'Tamid', totalUnits: 10, children: generateDafList(10) },
    ],
  },
  {
    id: 'taharos',
    name: 'Seder Taharos',
    children: [
      { id: 'niddah', name: 'Niddah', totalUnits: 73, children: generateDafList(73) },
    ],
  },
];

// Chumash (Torah) — Sefer → Perek → Pasuk
export const CHUMASH_STRUCTURE: SubCategory[] = [
  {
    id: 'bereishis', name: 'Bereishis',
    children: generatePerakim(50, [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,32,31,29,44,26,22,49,50,26]),
  },
  {
    id: 'shemos', name: 'Shemos',
    children: generatePerakim(40, [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38]),
  },
  {
    id: 'vayikra', name: 'Vayikra',
    children: generatePerakim(27, [17,16,17,35,26,23,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34]),
  },
  {
    id: 'bamidbar', name: 'Bamidbar',
    children: generatePerakim(36, [54,34,51,49,49,31,47,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34]),
  },
  {
    id: 'devarim', name: 'Devarim',
    children: generatePerakim(34, [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12]),
  },
];

// Tanach Nach (selected, Sefer → Perek)
export const TANACH_NACH_STRUCTURE: SubCategory[] = [
  { id: 'yehoshua', name: 'Yehoshua', children: generatePerakimSimple(24) },
  { id: 'shoftim', name: 'Shoftim', children: generatePerakimSimple(21) },
  { id: 'shmuel-1', name: 'Shmuel I', children: generatePerakimSimple(31) },
  { id: 'shmuel-2', name: 'Shmuel II', children: generatePerakimSimple(24) },
  { id: 'melachim-1', name: 'Melachim I', children: generatePerakimSimple(22) },
  { id: 'melachim-2', name: 'Melachim II', children: generatePerakimSimple(25) },
  { id: 'yeshayahu', name: 'Yeshayahu', children: generatePerakimSimple(66) },
  { id: 'yirmiyahu', name: 'Yirmiyahu', children: generatePerakimSimple(52) },
  { id: 'yechezkel', name: 'Yechezkel', children: generatePerakimSimple(48) },
  { id: 'tehillim', name: 'Tehillim', children: generatePerakimSimple(150) },
  { id: 'mishlei', name: 'Mishlei', children: generatePerakimSimple(31) },
  { id: 'iyov', name: 'Iyov', children: generatePerakimSimple(42) },
  { id: 'shir-hashirim', name: 'Shir HaShirim', children: generatePerakimSimple(8) },
  { id: 'rus', name: 'Rus', children: generatePerakimSimple(4) },
  { id: 'eichah', name: 'Eichah', children: generatePerakimSimple(5) },
  { id: 'koheles', name: 'Koheles', children: generatePerakimSimple(12) },
  { id: 'esther', name: 'Esther', children: generatePerakimSimple(10) },
  { id: 'daniel', name: 'Daniel', children: generatePerakimSimple(12) },
  { id: 'ezra', name: 'Ezra', children: generatePerakimSimple(10) },
  { id: 'nechemiah', name: 'Nechemiah', children: generatePerakimSimple(13) },
  { id: 'divrei-hayamim-1', name: 'Divrei HaYamim I', children: generatePerakimSimple(29) },
  { id: 'divrei-hayamim-2', name: 'Divrei HaYamim II', children: generatePerakimSimple(36) },
];

export const TANACH_STRUCTURE: SubCategory[] = [
  { id: 'torah', name: 'Torah (Chumash)', children: CHUMASH_STRUCTURE },
  { id: 'neviim-kesuvim', name: "Nevi'im & Kesuvim", children: TANACH_NACH_STRUCTURE },
];

// Mishnayos — Seder → Masechta → Perek
export const MISHNAYOS_STRUCTURE: SubCategory[] = [
  {
    id: 'zeraim', name: 'Seder Zeraim',
    children: [
      { id: 'berachos', name: 'Berachos', children: generatePerakimSimple(9) },
      { id: 'peah', name: 'Peah', children: generatePerakimSimple(8) },
      { id: 'demai', name: 'Demai', children: generatePerakimSimple(7) },
      { id: 'kilayim', name: 'Kilayim', children: generatePerakimSimple(9) },
      { id: 'sheviis', name: 'Sheviis', children: generatePerakimSimple(10) },
      { id: 'terumos', name: 'Terumos', children: generatePerakimSimple(11) },
      { id: 'maasros', name: 'Maasros', children: generatePerakimSimple(5) },
      { id: 'maaser-sheni', name: 'Maaser Sheni', children: generatePerakimSimple(5) },
      { id: 'challah', name: 'Challah', children: generatePerakimSimple(4) },
      { id: 'orlah', name: 'Orlah', children: generatePerakimSimple(3) },
      { id: 'bikkurim', name: 'Bikkurim', children: generatePerakimSimple(4) },
    ],
  },
  {
    id: 'moed', name: 'Seder Moed',
    children: [
      { id: 'shabbos', name: 'Shabbos', children: generatePerakimSimple(24) },
      { id: 'eruvin', name: 'Eruvin', children: generatePerakimSimple(10) },
      { id: 'pesachim', name: 'Pesachim', children: generatePerakimSimple(10) },
      { id: 'shekalim', name: 'Shekalim', children: generatePerakimSimple(8) },
      { id: 'yoma', name: 'Yoma', children: generatePerakimSimple(8) },
      { id: 'sukkah', name: 'Sukkah', children: generatePerakimSimple(5) },
      { id: 'beitzah', name: 'Beitzah', children: generatePerakimSimple(5) },
      { id: 'rosh-hashanah', name: 'Rosh Hashanah', children: generatePerakimSimple(4) },
      { id: 'taanis', name: 'Taanis', children: generatePerakimSimple(4) },
      { id: 'megillah', name: 'Megillah', children: generatePerakimSimple(4) },
      { id: 'moed-katan', name: 'Moed Katan', children: generatePerakimSimple(3) },
      { id: 'chagigah', name: 'Chagigah', children: generatePerakimSimple(3) },
    ],
  },
  {
    id: 'nashim', name: 'Seder Nashim',
    children: [
      { id: 'yevamos', name: 'Yevamos', children: generatePerakimSimple(16) },
      { id: 'kesubos', name: 'Kesubos', children: generatePerakimSimple(13) },
      { id: 'nedarim', name: 'Nedarim', children: generatePerakimSimple(11) },
      { id: 'nazir', name: 'Nazir', children: generatePerakimSimple(9) },
      { id: 'sotah', name: 'Sotah', children: generatePerakimSimple(9) },
      { id: 'gittin', name: 'Gittin', children: generatePerakimSimple(9) },
      { id: 'kiddushin', name: 'Kiddushin', children: generatePerakimSimple(4) },
    ],
  },
  {
    id: 'nezikin', name: 'Seder Nezikin',
    children: [
      { id: 'bava-kamma', name: 'Bava Kamma', children: generatePerakimSimple(10) },
      { id: 'bava-metzia', name: 'Bava Metzia', children: generatePerakimSimple(10) },
      { id: 'bava-basra', name: 'Bava Basra', children: generatePerakimSimple(10) },
      { id: 'sanhedrin', name: 'Sanhedrin', children: generatePerakimSimple(11) },
      { id: 'makkos', name: 'Makkos', children: generatePerakimSimple(3) },
      { id: 'shevuos', name: 'Shevuos', children: generatePerakimSimple(8) },
      { id: 'eduyos', name: 'Eduyos', children: generatePerakimSimple(8) },
      { id: 'avodah-zarah', name: 'Avodah Zarah', children: generatePerakimSimple(5) },
      { id: 'avos', name: 'Avos', children: generatePerakimSimple(6) },
      { id: 'horayos', name: 'Horayos', children: generatePerakimSimple(3) },
    ],
  },
  {
    id: 'kodashim', name: 'Seder Kodashim',
    children: [
      { id: 'zevachim', name: 'Zevachim', children: generatePerakimSimple(14) },
      { id: 'menachos', name: 'Menachos', children: generatePerakimSimple(13) },
      { id: 'chullin', name: 'Chullin', children: generatePerakimSimple(12) },
      { id: 'bechoros', name: 'Bechoros', children: generatePerakimSimple(9) },
      { id: 'arachin', name: 'Arachin', children: generatePerakimSimple(9) },
      { id: 'temurah', name: 'Temurah', children: generatePerakimSimple(7) },
      { id: 'kerisus', name: 'Kerisus', children: generatePerakimSimple(6) },
      { id: 'meilah', name: 'Meilah', children: generatePerakimSimple(6) },
      { id: 'tamid', name: 'Tamid', children: generatePerakimSimple(7) },
      { id: 'middos', name: 'Middos', children: generatePerakimSimple(5) },
      { id: 'kinnim', name: 'Kinnim', children: generatePerakimSimple(3) },
    ],
  },
  {
    id: 'taharos', name: 'Seder Taharos',
    children: [
      { id: 'keilim', name: 'Keilim', children: generatePerakimSimple(30) },
      { id: 'ohalos', name: 'Ohalos', children: generatePerakimSimple(18) },
      { id: 'negaim', name: 'Negaim', children: generatePerakimSimple(14) },
      { id: 'parah', name: 'Parah', children: generatePerakimSimple(12) },
      { id: 'taharos', name: 'Taharos', children: generatePerakimSimple(10) },
      { id: 'mikvaos', name: 'Mikvaos', children: generatePerakimSimple(10) },
      { id: 'niddah', name: 'Niddah', children: generatePerakimSimple(10) },
      { id: 'machshirin', name: 'Machshirin', children: generatePerakimSimple(6) },
      { id: 'zavim', name: 'Zavim', children: generatePerakimSimple(5) },
      { id: 'tevul-yom', name: 'Tevul Yom', children: generatePerakimSimple(4) },
      { id: 'yadayim', name: 'Yadayim', children: generatePerakimSimple(4) },
      { id: 'uktzin', name: 'Uktzin', children: generatePerakimSimple(3) },
    ],
  },
];

// Halacha — Shulchan Aruch sections
export const HALACHA_STRUCTURE: SubCategory[] = [
  {
    id: 'orach-chaim', name: 'Orach Chaim',
    children: Array.from({ length: 697 }, (_, i) => ({
      id: `oc-siman-${i + 1}`, name: `Siman ${i + 1}`, totalUnits: 1,
    })),
  },
  {
    id: 'yoreh-deah', name: 'Yoreh Deah',
    children: Array.from({ length: 403 }, (_, i) => ({
      id: `yd-siman-${i + 1}`, name: `Siman ${i + 1}`, totalUnits: 1,
    })),
  },
  {
    id: 'even-haezer', name: 'Even HaEzer',
    children: Array.from({ length: 178 }, (_, i) => ({
      id: `eh-siman-${i + 1}`, name: `Siman ${i + 1}`, totalUnits: 1,
    })),
  },
  {
    id: 'choshen-mishpat', name: 'Choshen Mishpat',
    children: Array.from({ length: 427 }, (_, i) => ({
      id: `cm-siman-${i + 1}`, name: `Siman ${i + 1}`, totalUnits: 1,
    })),
  },
];
