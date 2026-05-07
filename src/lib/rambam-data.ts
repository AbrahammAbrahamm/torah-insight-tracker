// Rambam (Mishneh Torah) structure: 14 Books → Halachot → Perakim.
// Perek counts are based on standard Mishneh Torah editions.

export interface RambamHalacha {
  id: string;
  name: string;
  perakim: number;
}
export interface RambamBook {
  id: string;
  name: string;
  halachot: RambamHalacha[];
}

export const RAMBAM_BOOKS: RambamBook[] = [
  {
    id: 'madda', name: 'Sefer HaMadda',
    halachot: [
      { id: 'yesodei-hatorah', name: 'Yesodei HaTorah', perakim: 10 },
      { id: 'deot', name: "De'ot", perakim: 7 },
      { id: 'talmud-torah', name: 'Talmud Torah', perakim: 7 },
      { id: 'avodah-zarah', name: 'Avodah Zarah', perakim: 12 },
      { id: 'teshuvah', name: 'Teshuvah', perakim: 10 },
    ],
  },
  {
    id: 'ahavah', name: 'Sefer Ahavah',
    halachot: [
      { id: 'kriat-shema', name: "Kri'at Shema", perakim: 4 },
      { id: 'tefillah', name: 'Tefillah', perakim: 15 },
      { id: 'tefillin', name: 'Tefillin Mezuzah veSefer Torah', perakim: 10 },
      { id: 'tzitzit', name: 'Tzitzit', perakim: 3 },
      { id: 'berachot', name: 'Berachot', perakim: 11 },
      { id: 'milah', name: 'Milah', perakim: 3 },
      { id: 'nusach', name: 'Seder Tefillot', perakim: 1 },
    ],
  },
  {
    id: 'zmanim', name: 'Sefer Zmanim',
    halachot: [
      { id: 'shabbat', name: 'Shabbat', perakim: 30 },
      { id: 'eruvin', name: 'Eruvin', perakim: 8 },
      { id: 'shevitat-asor', name: 'Shevitat Asor', perakim: 3 },
      { id: 'shevitat-yom-tov', name: 'Shevitat Yom Tov', perakim: 8 },
      { id: 'chametz-matzah', name: 'Chametz uMatzah', perakim: 8 },
      { id: 'shofar-sukkah-lulav', name: 'Shofar veSukkah veLulav', perakim: 8 },
      { id: 'shekalim', name: 'Shekalim', perakim: 4 },
      { id: 'kiddush-hachodesh', name: 'Kiddush HaChodesh', perakim: 19 },
      { id: 'taaniyot', name: 'Taaniyot', perakim: 5 },
      { id: 'megillah-chanukah', name: 'Megillah veChanukah', perakim: 4 },
    ],
  },
  {
    id: 'nashim', name: 'Sefer Nashim',
    halachot: [
      { id: 'ishut', name: 'Ishut', perakim: 25 },
      { id: 'gerushin', name: 'Gerushin', perakim: 13 },
      { id: 'yibbum-chalitzah', name: 'Yibbum vaChalitzah', perakim: 8 },
      { id: 'naarah-betulah', name: "Na'arah Betulah", perakim: 3 },
      { id: 'sotah', name: 'Sotah', perakim: 4 },
    ],
  },
  {
    id: 'kedushah', name: 'Sefer Kedushah',
    halachot: [
      { id: 'issurei-biah', name: 'Issurei Biah', perakim: 22 },
      { id: 'maachalot-asurot', name: 'Maachalot Asurot', perakim: 17 },
      { id: 'shechitah', name: 'Shechitah', perakim: 14 },
    ],
  },
  {
    id: 'haflaah', name: "Sefer Hafla'ah",
    halachot: [
      { id: 'shevuot', name: 'Shevuot', perakim: 12 },
      { id: 'nedarim', name: 'Nedarim', perakim: 13 },
      { id: 'nezirut', name: 'Nezirut', perakim: 10 },
      { id: 'erechin-charamin', name: 'Erechin vaCharamin', perakim: 8 },
    ],
  },
  {
    id: 'zeraim', name: 'Sefer Zeraim',
    halachot: [
      { id: 'kilayim', name: 'Kilayim', perakim: 10 },
      { id: 'matnot-aniyim', name: 'Matnot Aniyim', perakim: 10 },
      { id: 'terumot', name: 'Terumot', perakim: 15 },
      { id: 'maaser', name: "Ma'aser", perakim: 14 },
      { id: 'maaser-sheni', name: "Ma'aser Sheni", perakim: 11 },
      { id: 'bikkurim', name: 'Bikkurim', perakim: 12 },
      { id: 'shemittah-yovel', name: 'Shemittah veYovel', perakim: 13 },
    ],
  },
  {
    id: 'avodah', name: 'Sefer Avodah',
    halachot: [
      { id: 'beit-habechirah', name: 'Beit HaBechirah', perakim: 8 },
      { id: 'kli-hamikdash', name: 'Kli HaMikdash', perakim: 10 },
      { id: 'biat-hamikdash', name: 'Biat HaMikdash', perakim: 9 },
      { id: 'issurei-mizbeach', name: 'Issurei Mizbeach', perakim: 7 },
      { id: 'maaseh-hakorbanot', name: 'Maaseh HaKorbanot', perakim: 19 },
      { id: 'temidin-musafin', name: 'Temidin uMusafin', perakim: 10 },
      { id: 'pesulei-mukdashin', name: 'Pesulei HaMukdashin', perakim: 19 },
      { id: 'avodat-yom-hakippurim', name: 'Avodat Yom HaKippurim', perakim: 5 },
      { id: 'meilah', name: "Me'ilah", perakim: 8 },
    ],
  },
  {
    id: 'korbanot', name: 'Sefer Korbanot',
    halachot: [
      { id: 'korban-pesach', name: 'Korban Pesach', perakim: 10 },
      { id: 'chagigah', name: 'Chagigah', perakim: 3 },
      { id: 'bechorot', name: 'Bechorot', perakim: 8 },
      { id: 'shegagot', name: 'Shegagot', perakim: 15 },
      { id: 'mechusrei-kapparah', name: 'Mechusrei Kapparah', perakim: 5 },
      { id: 'temurah', name: 'Temurah', perakim: 4 },
    ],
  },
  {
    id: 'taharah', name: 'Sefer Taharah',
    halachot: [
      { id: 'tumat-met', name: 'Tumat Met', perakim: 25 },
      { id: 'parah-adumah', name: 'Parah Adumah', perakim: 15 },
      { id: 'tumat-tzaraat', name: "Tumat Tzara'at", perakim: 16 },
      { id: 'metamei-mishkav-moshav', name: 'Metamei Mishkav uMoshav', perakim: 13 },
      { id: 'shaar-avot-hatumot', name: "She'ar Avot HaTumot", perakim: 20 },
      { id: 'tumat-ochalin', name: 'Tumat Ochalin', perakim: 16 },
      { id: 'kelim', name: 'Kelim', perakim: 28 },
      { id: 'mikvaot', name: 'Mikvaot', perakim: 11 },
    ],
  },
  {
    id: 'nezikin', name: 'Sefer Nezikin',
    halachot: [
      { id: 'nizkei-mamon', name: 'Nizkei Mamon', perakim: 14 },
      { id: 'genevah', name: 'Genevah', perakim: 9 },
      { id: 'gezelah-veavedah', name: "Gezelah va'Avedah", perakim: 18 },
      { id: 'chovel-umazik', name: "Chovel uMazik", perakim: 8 },
      { id: 'rotzeach', name: "Rotzeach uShmirat Nefesh", perakim: 13 },
    ],
  },
  {
    id: 'kinyan', name: 'Sefer Kinyan',
    halachot: [
      { id: 'mechirah', name: 'Mechirah', perakim: 30 },
      { id: 'zechiyah-umatanah', name: 'Zechiyah uMatanah', perakim: 12 },
      { id: 'shecheinim', name: 'Shecheinim', perakim: 14 },
      { id: 'shluchin-shutfin', name: 'Shluchin veShutfin', perakim: 10 },
      { id: 'avadim', name: 'Avadim', perakim: 9 },
    ],
  },
  {
    id: 'mishpatim', name: 'Sefer Mishpatim',
    halachot: [
      { id: 'sechirut', name: 'Sechirut', perakim: 13 },
      { id: 'sheelah-pikadon', name: "She'elah uPikadon", perakim: 8 },
      { id: 'malveh-veloveh', name: 'Malveh veLoveh', perakim: 27 },
      { id: 'toen-venitan', name: "Toen veNit'an", perakim: 16 },
      { id: 'nachalot', name: 'Nachalot', perakim: 11 },
    ],
  },
  {
    id: 'shoftim', name: 'Sefer Shoftim',
    halachot: [
      { id: 'sanhedrin', name: 'Sanhedrin', perakim: 26 },
      { id: 'edut', name: 'Edut', perakim: 22 },
      { id: 'mamrim', name: 'Mamrim', perakim: 7 },
      { id: 'evel', name: 'Evel', perakim: 14 },
      { id: 'melachim-umilchamot', name: 'Melachim uMilchamot', perakim: 12 },
    ],
  },
];

import type { SubCategory } from './category-structures';

function perakimChildren(prefix: string, count: number): SubCategory[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-perek-${i + 1}`,
    name: `Perek ${i + 1}`,
    totalUnits: 1,
  }));
}

export const RAMBAM_BY_BOOKS_STRUCTURE: SubCategory[] = RAMBAM_BOOKS.map(book => ({
  id: book.id,
  name: book.name,
  children: book.halachot.map(h => ({
    id: `${book.id}-${h.id}`,
    name: h.name,
    totalUnits: h.perakim,
    children: perakimChildren(`${book.id}-${h.id}`, h.perakim),
  })),
}));

// Rambam Yomi: 3 perakim per day. Generate sequential list across all books.
function buildSequentialPerakim(): { book: string; halacha: string; perek: number; bookId: string; halachaId: string }[] {
  const out: { book: string; halacha: string; perek: number; bookId: string; halachaId: string }[] = [];
  for (const b of RAMBAM_BOOKS) {
    for (const h of b.halachot) {
      for (let p = 1; p <= h.perakim; p++) {
        out.push({ book: b.name, halacha: h.name, perek: p, bookId: b.id, halachaId: h.id });
      }
    }
  }
  return out;
}

export const RAMBAM_BY_YOMI_STRUCTURE: SubCategory[] = (() => {
  const seq = buildSequentialPerakim();
  const days: SubCategory[] = [];
  for (let i = 0; i < seq.length; i += 3) {
    const slice = seq.slice(i, i + 3);
    const dayNum = days.length + 1;
    days.push({
      id: `rambam-yomi-day-${dayNum}`,
      name: `Day ${dayNum}`,
      children: slice.map((s, j) => ({
        id: `rambam-yomi-day-${dayNum}-${j}`,
        name: `${s.halacha} ${s.perek}`,
        totalUnits: 1,
      })),
    });
  }
  return days;
})();
