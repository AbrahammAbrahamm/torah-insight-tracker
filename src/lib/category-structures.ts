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
