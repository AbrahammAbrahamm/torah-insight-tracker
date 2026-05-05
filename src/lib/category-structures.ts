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
  {
    id: 'trei-asar', name: 'Trei Asar',
    children: [
      { id: 'hoshea', name: 'Hoshea', children: generatePerakimSimple(14) },
      { id: 'yoel', name: 'Yoel', children: generatePerakimSimple(4) },
      { id: 'amos', name: 'Amos', children: generatePerakimSimple(9) },
      { id: 'ovadiah', name: 'Ovadiah', children: generatePerakimSimple(1) },
      { id: 'yonah', name: 'Yonah', children: generatePerakimSimple(4) },
      { id: 'michah', name: 'Michah', children: generatePerakimSimple(7) },
      { id: 'nachum', name: 'Nachum', children: generatePerakimSimple(3) },
      { id: 'chavakuk', name: 'Chavakuk', children: generatePerakimSimple(3) },
      { id: 'tzefaniah', name: 'Tzefaniah', children: generatePerakimSimple(3) },
      { id: 'chaggai', name: 'Chaggai', children: generatePerakimSimple(2) },
      { id: 'zechariah', name: 'Zechariah', children: generatePerakimSimple(14) },
      { id: 'malachi', name: 'Malachi', children: generatePerakimSimple(3) },
    ],
  },
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

// Kept for backward compatibility with older saved data.
export const TANACH_STRUCTURE: SubCategory[] = [
  { id: 'torah', name: 'Torah (Chumash)', children: CHUMASH_STRUCTURE },
  { id: 'neviim-kesuvim', name: "Nevi'im & Kesuvim", children: TANACH_NACH_STRUCTURE },
];

// Generate perakim with mishna children. Each entry in mishnayosPerPerek
// is the number of mishnayos in that perek.
function generatePerakimWithMishnayos(mishnayosPerPerek: number[]): SubCategory[] {
  return mishnayosPerPerek.map((mishnaCount, idx) => {
    const perekNum = idx + 1;
    const mishnayos: SubCategory[] = [];
    for (let m = 1; m <= mishnaCount; m++) {
      mishnayos.push({ id: `perek-${perekNum}-mishna-${m}`, name: `Mishna ${m}`, totalUnits: 1 });
    }
    return {
      id: `perek-${perekNum}`,
      name: `Perek ${perekNum}`,
      totalUnits: mishnaCount,
      children: mishnayos,
    };
  });
}

// Mishnayos — Seder → Masechta → Perek → Mishna
// Mishnayos-per-perek counts based on standard Mishnah editions (Kehati/Albeck).
export const MISHNAYOS_STRUCTURE: SubCategory[] = [
  {
    id: 'zeraim', name: 'Seder Zeraim',
    children: [
      { id: 'berachos', name: 'Berachos', children: generatePerakimWithMishnayos([5,8,6,7,5,8,5,8,5]) },
      { id: 'peah', name: 'Peah', children: generatePerakimWithMishnayos([6,8,8,11,8,11,8,9]) },
      { id: 'demai', name: 'Demai', children: generatePerakimWithMishnayos([4,5,6,7,11,12,8]) },
      { id: 'kilayim', name: 'Kilayim', children: generatePerakimWithMishnayos([9,11,7,9,8,9,8,6,10]) },
      { id: 'sheviis', name: 'Sheviis', children: generatePerakimWithMishnayos([8,10,10,10,9,6,7,11,9,9]) },
      { id: 'terumos', name: 'Terumos', children: generatePerakimWithMishnayos([10,6,9,13,9,6,7,12,7,12,10]) },
      { id: 'maasros', name: 'Maasros', children: generatePerakimWithMishnayos([8,8,10,6,8]) },
      { id: 'maaser-sheni', name: 'Maaser Sheni', children: generatePerakimWithMishnayos([7,10,13,12,15]) },
      { id: 'challah', name: 'Challah', children: generatePerakimWithMishnayos([9,8,10,11]) },
      { id: 'orlah', name: 'Orlah', children: generatePerakimWithMishnayos([9,17,9]) },
      { id: 'bikkurim', name: 'Bikkurim', children: generatePerakimWithMishnayos([11,11,12,5]) },
    ],
  },
  {
    id: 'moed', name: 'Seder Moed',
    children: [
      { id: 'shabbos', name: 'Shabbos', children: generatePerakimWithMishnayos([11,7,6,2,4,10,4,7,7,6,6,6,7,4,3,8,8,3,6,5,3,6,5,5]) },
      { id: 'eruvin', name: 'Eruvin', children: generatePerakimWithMishnayos([10,6,9,11,9,10,11,11,4,15]) },
      { id: 'pesachim', name: 'Pesachim', children: generatePerakimWithMishnayos([7,8,8,9,10,6,13,8,11,9]) },
      { id: 'shekalim', name: 'Shekalim', children: generatePerakimWithMishnayos([7,5,4,9,6,6,7,8]) },
      { id: 'yoma', name: 'Yoma', children: generatePerakimWithMishnayos([8,7,11,6,7,8,5,9]) },
      { id: 'sukkah', name: 'Sukkah', children: generatePerakimWithMishnayos([11,9,15,10,8]) },
      { id: 'beitzah', name: 'Beitzah', children: generatePerakimWithMishnayos([10,10,8,7,7]) },
      { id: 'rosh-hashanah', name: 'Rosh Hashanah', children: generatePerakimWithMishnayos([9,8,9,9]) },
      { id: 'taanis', name: 'Taanis', children: generatePerakimWithMishnayos([7,10,9,8]) },
      { id: 'megillah', name: 'Megillah', children: generatePerakimWithMishnayos([11,6,6,10]) },
      { id: 'moed-katan', name: 'Moed Katan', children: generatePerakimWithMishnayos([10,5,9]) },
      { id: 'chagigah', name: 'Chagigah', children: generatePerakimWithMishnayos([8,7,8]) },
    ],
  },
  {
    id: 'nashim', name: 'Seder Nashim',
    children: [
      { id: 'yevamos', name: 'Yevamos', children: generatePerakimWithMishnayos([4,10,10,13,6,6,6,6,6,9,7,6,13,9,10,7]) },
      { id: 'kesubos', name: 'Kesubos', children: generatePerakimWithMishnayos([10,10,9,12,9,7,10,8,9,6,6,4,11]) },
      { id: 'nedarim', name: 'Nedarim', children: generatePerakimWithMishnayos([4,5,11,8,6,10,9,7,10,8,12]) },
      { id: 'nazir', name: 'Nazir', children: generatePerakimWithMishnayos([7,10,7,7,7,11,4,2,5]) },
      { id: 'sotah', name: 'Sotah', children: generatePerakimWithMishnayos([9,6,8,5,5,4,8,7,15]) },
      { id: 'gittin', name: 'Gittin', children: generatePerakimWithMishnayos([6,7,8,9,9,7,9,10,10]) },
      { id: 'kiddushin', name: 'Kiddushin', children: generatePerakimWithMishnayos([10,10,13,14]) },
    ],
  },
  {
    id: 'nezikin', name: 'Seder Nezikin',
    children: [
      { id: 'bava-kamma', name: 'Bava Kamma', children: generatePerakimWithMishnayos([4,6,11,9,7,6,7,7,12,10]) },
      { id: 'bava-metzia', name: 'Bava Metzia', children: generatePerakimWithMishnayos([8,11,12,12,11,8,11,9,13,6]) },
      { id: 'bava-basra', name: 'Bava Basra', children: generatePerakimWithMishnayos([6,14,8,9,11,8,4,8,10,8]) },
      { id: 'sanhedrin', name: 'Sanhedrin', children: generatePerakimWithMishnayos([6,5,8,5,5,6,11,7,6,6,6]) },
      { id: 'makkos', name: 'Makkos', children: generatePerakimWithMishnayos([10,8,16]) },
      { id: 'shevuos', name: 'Shevuos', children: generatePerakimWithMishnayos([7,5,11,13,5,7,8,6]) },
      { id: 'eduyos', name: 'Eduyos', children: generatePerakimWithMishnayos([14,10,12,12,7,3,9,7]) },
      { id: 'avodah-zarah', name: 'Avodah Zarah', children: generatePerakimWithMishnayos([9,7,10,12,12]) },
      { id: 'avos', name: 'Avos', children: generatePerakimWithMishnayos([18,16,18,22,23,11]) },
      { id: 'horayos', name: 'Horayos', children: generatePerakimWithMishnayos([5,7,8]) },
    ],
  },
  {
    id: 'kodashim', name: 'Seder Kodashim',
    children: [
      { id: 'zevachim', name: 'Zevachim', children: generatePerakimWithMishnayos([4,5,6,6,8,7,6,12,7,8,8,6,8,10]) },
      { id: 'menachos', name: 'Menachos', children: generatePerakimWithMishnayos([4,5,7,5,9,7,6,7,9,9,9,5,11]) },
      { id: 'chullin', name: 'Chullin', children: generatePerakimWithMishnayos([7,10,7,7,5,7,6,6,8,4,2,5]) },
      { id: 'bechoros', name: 'Bechoros', children: generatePerakimWithMishnayos([7,9,4,10,6,12,7,10,8]) },
      { id: 'arachin', name: 'Arachin', children: generatePerakimWithMishnayos([4,6,5,4,6,5,5,7,8]) },
      { id: 'temurah', name: 'Temurah', children: generatePerakimWithMishnayos([6,3,5,4,6,5,6]) },
      { id: 'kerisus', name: 'Kerisus', children: generatePerakimWithMishnayos([7,6,10,3,8,9]) },
      { id: 'meilah', name: 'Meilah', children: generatePerakimWithMishnayos([4,9,8,6,5,6]) },
      { id: 'tamid', name: 'Tamid', children: generatePerakimWithMishnayos([4,5,9,3,6,3,3]) },
      { id: 'middos', name: 'Middos', children: generatePerakimWithMishnayos([9,6,8,7,4]) },
      { id: 'kinnim', name: 'Kinnim', children: generatePerakimWithMishnayos([4,5,6]) },
    ],
  },
  {
    id: 'taharos', name: 'Seder Taharos',
    children: [
      { id: 'keilim', name: 'Keilim', children: generatePerakimWithMishnayos([9,8,8,4,11,4,6,11,8,8,9,8,8,8,6,8,17,9,10,7,3,10,5,17,9,9,12,10,8,4]) },
      { id: 'ohalos', name: 'Ohalos', children: generatePerakimWithMishnayos([8,7,7,3,7,7,6,6,16,7,9,8,6,7,10,5,5,10]) },
      { id: 'negaim', name: 'Negaim', children: generatePerakimWithMishnayos([6,5,8,11,5,8,5,10,3,10,12,7,12,13]) },
      { id: 'parah', name: 'Parah', children: generatePerakimWithMishnayos([4,5,11,4,9,5,12,11,9,6,9,11]) },
      { id: 'taharos', name: 'Taharos', children: generatePerakimWithMishnayos([9,8,8,13,9,10,9,9,9,8]) },
      { id: 'mikvaos', name: 'Mikvaos', children: generatePerakimWithMishnayos([8,10,4,5,6,11,7,5,7,8]) },
      { id: 'niddah', name: 'Niddah', children: generatePerakimWithMishnayos([7,7,7,7,9,14,5,4,11,8]) },
      { id: 'machshirin', name: 'Machshirin', children: generatePerakimWithMishnayos([6,11,8,10,11,8]) },
      { id: 'zavim', name: 'Zavim', children: generatePerakimWithMishnayos([6,4,3,7,12]) },
      { id: 'tevul-yom', name: 'Tevul Yom', children: generatePerakimWithMishnayos([5,8,6,7]) },
      { id: 'yadayim', name: 'Yadayim', children: generatePerakimWithMishnayos([5,4,5,8]) },
      { id: 'uktzin', name: 'Uktzin', children: generatePerakimWithMishnayos([6,10,12]) },
    ],
  },
];

import { OC_SIFIM, YD_SIFIM, EH_SIFIM, CM_SIFIM } from './sifim-data';

// Generate Siman entries each containing the accurate number of sifim from
// the Sefaria Shulchan Arukh data. sifimCounts[i] is the number of sifim in
// Siman (i+1).
function generateSimanim(prefix: string, sifimCounts: number[]): SubCategory[] {
  return sifimCounts.map((sifimCount, i) => {
    const simanNum = i + 1;
    const count = Math.max(1, sifimCount);
    const sifim: SubCategory[] = Array.from({ length: count }, (_, j) => ({
      id: `${prefix}-siman-${simanNum}-sif-${j + 1}`,
      name: `Sif ${j + 1}`,
      totalUnits: 1,
    }));
    return {
      id: `${prefix}-siman-${simanNum}`,
      name: `Siman ${simanNum}`,
      totalUnits: count,
      children: sifim,
    };
  });
}

// Halacha — Shulchan Aruch sections: Section → Siman → Sif
export const HALACHA_STRUCTURE: SubCategory[] = [
  { id: 'orach-chaim', name: 'Orach Chaim', children: generateSimanim('oc', OC_SIFIM) },
  { id: 'yoreh-deah', name: 'Yoreh Deah', children: generateSimanim('yd', YD_SIFIM) },
  { id: 'even-haezer', name: 'Even HaEzer', children: generateSimanim('eh', EH_SIFIM) },
  { id: 'choshen-mishpat', name: 'Choshen Mishpat', children: generateSimanim('cm', CM_SIFIM) },
];

// Mishnah Berurah — mirrors Orach Chaim: Siman → Sif → Sif Katan.
// Sif Katan numbers come from the actual MB→OC link mapping (Sefaria).
import MB_DATA from './mb-data.json';

function generateMishnahBerurahSimanim(): SubCategory[] {
  return (MB_DATA as number[][][]).map((sifim, simanIdx) => {
    const simanNum = simanIdx + 1;
    const sifChildren: SubCategory[] = sifim.map((sks, sifIdx) => {
      const sifNum = sifIdx + 1;
      const skChildren: SubCategory[] = sks.map(sk => ({
        id: `mb-siman-${simanNum}-sif-${sifNum}-sk-${sk}`,
        name: `Sif Katan ${sk}`,
        totalUnits: 1,
      }));
      return {
        id: `mb-siman-${simanNum}-sif-${sifNum}`,
        name: `Sif ${sifNum}`,
        totalUnits: Math.max(1, skChildren.length),
        children: skChildren.length > 0 ? skChildren : undefined,
      };
    });
    return {
      id: `mb-siman-${simanNum}`,
      name: `Siman ${simanNum}`,
      totalUnits: sifChildren.length,
      children: sifChildren,
    };
  });
}

// Standard 6-volume Mishnah Berurah split by Siman ranges.
const MB_VOLUMES: { name: string; start: number; end: number }[] = [
  { name: 'Volume 1', start: 1, end: 127 },
  { name: 'Volume 2', start: 128, end: 241 },
  { name: 'Volume 3', start: 242, end: 365 },
  { name: 'Volume 4', start: 366, end: 428 },
  { name: 'Volume 5', start: 429, end: 531 },
  { name: 'Volume 6', start: 532, end: 697 },
];

export const MISHNAH_BERURAH_STRUCTURE: SubCategory[] = (() => {
  const allSimanim = generateMishnahBerurahSimanim();
  return MB_VOLUMES.map((v, i) => ({
    id: `mb-volume-${i + 1}`,
    name: v.name,
    children: allSimanim.slice(v.start - 1, v.end),
  }));
})();

// Chumash split by Parsha → Aliya → Pasuk
import PARSHA_DATA from './parsha-data.json';

const PASUK_COUNTS = {
  Genesis: [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,32,31,29,44,26,22,49,50,26],
  Exodus: [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38],
  Leviticus: [17,16,17,35,26,23,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34],
  Numbers: [54,34,51,49,49,31,47,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34],
  Deuteronomy: [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12],
};

interface ParshaInfo { name: string; he: string; aliyot: number[][] }
interface BookParshiot { he: string; parshiot: ParshaInfo[] }

const SEFER_ID_BY_BOOK: Record<string, string> = {
  Genesis: 'bereishis', Exodus: 'shemos', Leviticus: 'vayikra',
  Numbers: 'bamidbar', Deuteronomy: 'devarim',
};
const SEFER_NAME_BY_BOOK: Record<string, string> = {
  Genesis: 'Bereishis', Exodus: 'Shemos', Leviticus: 'Vayikra',
  Numbers: 'Bamidbar', Deuteronomy: 'Devarim',
};

export const CHUMASH_BY_PARSHA_STRUCTURE: SubCategory[] = (Object.entries(PARSHA_DATA) as [string, BookParshiot][]).map(([book, info]) => ({
  id: SEFER_ID_BY_BOOK[book],
  name: SEFER_NAME_BY_BOOK[book],
  children: info.parshiot.map((p, pIdx) => {
    const aliyaNames = ['Rishon','Sheni','Shlishi','Revi\'i','Chamishi','Shishi','Shvi\'i'];
    return {
      id: `parsha-${SEFER_ID_BY_BOOK[book]}-${pIdx + 1}`,
      name: p.name,
      children: p.aliyot.map((a, aIdx) => {
        const [sc, sp, ec, ep] = a;
        const pesukim: SubCategory[] = [];
        const bookCounts = PASUK_COUNTS[book as keyof typeof PASUK_COUNTS];
        for (let c = sc; c <= ec; c++) {
          const startP = c === sc ? sp : 1;
          const endP = c === ec ? ep : (bookCounts[c - 1] ?? ep);
          for (let pp = startP; pp <= endP; pp++) {
            pesukim.push({ id: `${SEFER_ID_BY_BOOK[book]}-p${pIdx+1}-a${aIdx+1}-${c}-${pp}`, name: `Perek ${c}:${pp}`, totalUnits: 1 });
          }
        }
        return {
          id: `aliya-${SEFER_ID_BY_BOOK[book]}-${pIdx+1}-${aIdx+1}`,
          name: aliyaNames[aIdx] || `Aliya ${aIdx+1}`,
          totalUnits: pesukim.length,
          children: pesukim,
        };
      }),
    };
  }),
}));
