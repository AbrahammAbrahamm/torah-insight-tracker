// Mussar / Chasidus seforim — selectable list. Each sefer has perakim/sections.
import type { SubCategory } from './category-structures';

export interface MussarSefer {
  id: string;
  name: string;
  type: 'mussar' | 'chasidus';
  sections: number;
  sectionLabel?: string; // e.g. "Perek", "Shaar", "Sicha"
}

export const MUSSAR_SEFARIM: MussarSefer[] = [
  // Mussar
  { id: 'mesilas-yesharim', name: 'Mesilas Yesharim', type: 'mussar', sections: 26 },
  { id: 'shaarei-teshuvah', name: 'Shaarei Teshuvah', type: 'mussar', sections: 4, sectionLabel: 'Shaar' },
  { id: 'chovos-halevavos', name: 'Chovos HaLevavos', type: 'mussar', sections: 10, sectionLabel: 'Shaar' },
  { id: 'orchos-tzaddikim', name: 'Orchos Tzaddikim', type: 'mussar', sections: 28, sectionLabel: 'Shaar' },
  { id: 'pirkei-avos', name: 'Pirkei Avos', type: 'mussar', sections: 6 },
  { id: 'michtav-meeliyahu', name: 'Michtav MeEliyahu', type: 'mussar', sections: 5, sectionLabel: 'Volume' },
  { id: 'sefer-hayashar', name: 'Sefer HaYashar', type: 'mussar', sections: 18, sectionLabel: 'Shaar' },
  { id: 'tomer-devorah', name: 'Tomer Devorah', type: 'mussar', sections: 10 },
  { id: 'shemiras-halashon', name: 'Shemiras HaLashon', type: 'mussar', sections: 30 },
  { id: 'chofetz-chaim', name: 'Sefer Chofetz Chaim', type: 'mussar', sections: 30 },
  // Chasidus
  { id: 'tanya', name: 'Tanya', type: 'chasidus', sections: 53 },
  { id: 'likutei-moharan', name: 'Likutei Moharan', type: 'chasidus', sections: 286, sectionLabel: 'Torah' },
  { id: 'noam-elimelech', name: 'Noam Elimelech', type: 'chasidus', sections: 54, sectionLabel: 'Parsha' },
  { id: 'kedushas-levi', name: 'Kedushas Levi', type: 'chasidus', sections: 54, sectionLabel: 'Parsha' },
  { id: 'sfas-emes', name: 'Sfas Emes', type: 'chasidus', sections: 54, sectionLabel: 'Parsha' },
  { id: 'meor-einayim', name: "Me'or Einayim", type: 'chasidus', sections: 54, sectionLabel: 'Parsha' },
  { id: 'derech-hashem', name: 'Derech Hashem', type: 'chasidus', sections: 4, sectionLabel: 'Section' },
  { id: 'bnei-yissaschar', name: 'Bnei Yissaschar', type: 'chasidus', sections: 12, sectionLabel: 'Month' },
];

export function buildMussarStructure(enabledIds: string[]): SubCategory[] {
  const enabledSet = new Set(enabledIds);
  return MUSSAR_SEFARIM.filter(s => enabledSet.has(s.id)).map(s => ({
    id: s.id,
    name: s.name,
    children: Array.from({ length: s.sections }, (_, i) => ({
      id: `${s.id}-${i + 1}`,
      name: `${s.sectionLabel || 'Perek'} ${i + 1}`,
      totalUnits: 1,
    })),
  }));
}
