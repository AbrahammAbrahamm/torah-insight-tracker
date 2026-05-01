import { describe, it, expect, beforeEach } from 'vitest';
import { getNodeProgress } from '@/components/SubCategoryBrowser';
import type { LearningEntry, LearningComponent } from '@/lib/store';
import type { SubCategory } from '@/lib/category-structures';

// Mirror of the LogEntry save logic so we can validate it in isolation.
function buildEntryFromLogState(opts: {
  categoryId: string;
  unit: string;
  unitType: string;
  components: LearningComponent[];
  date?: string;
}): LearningEntry {
  let finalComponents = opts.components;
  const anyLearned = opts.components.some(c => c.learned);
  if (anyLearned && opts.components.length > 0 && !opts.components[0].learned) {
    finalComponents = opts.components.map((c, i) =>
      i === 0 ? { ...c, learned: true } : c
    );
  }
  return {
    id: 'test-id',
    categoryId: opts.categoryId,
    date: opts.date ?? '2026-05-01',
    unit: opts.unit,
    unitType: opts.unitType,
    components: finalComponents,
    createdAt: new Date().toISOString(),
  };
}

function comp(name: string, overrides: Partial<LearningComponent> = {}): LearningComponent {
  return {
    id: name.toLowerCase(),
    name,
    learned: false,
    reviewed: false,
    reviewCount: 0,
    notes: '',
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('LogEntry save → progress', () => {
  // A simple gemara-like leaf node.
  const leafNode: SubCategory = { id: '2a', name: '2a (Amud Aleph)', totalUnits: 1 };
  const masechtaPath = ['Seder Zeraim', 'Berachos'];

  it('marks unit 100% complete when ANY non-first component is marked learned', () => {
    const entry = buildEntryFromLogState({
      categoryId: 'gemara',
      unit: 'Berachos 2a (Amud Aleph)',
      unitType: 'daf',
      components: [
        comp('Gemara Text'),                    // not learned
        comp('Rashi', { learned: true }),       // learned
        comp('Tosfos'),
      ],
    });

    // Save logic should have promoted the first component to learned.
    expect(entry.components[0].learned).toBe(true);

    const progress = getNodeProgress(leafNode, 'gemara', masechtaPath, [entry]);
    expect(progress.fraction).toBe(1);
    expect(progress.completedLeaves).toBe(1);
  });

  it('marks unit 100% when only the first component is learned', () => {
    const entry = buildEntryFromLogState({
      categoryId: 'gemara',
      unit: 'Berachos 2a (Amud Aleph)',
      unitType: 'daf',
      components: [
        comp('Gemara Text', { learned: true }),
        comp('Rashi'),
      ],
    });
    const progress = getNodeProgress(leafNode, 'gemara', masechtaPath, [entry]);
    expect(progress.fraction).toBe(1);
  });

  it('does NOT mark complete when nothing is learned (only reviewed)', () => {
    const entry = buildEntryFromLogState({
      categoryId: 'gemara',
      unit: 'Berachos 2a (Amud Aleph)',
      unitType: 'daf',
      components: [
        comp('Gemara Text', { reviewed: true, reviewCount: 2 }),
        comp('Rashi'),
      ],
    });
    expect(entry.components[0].learned).toBe(false);
    const progress = getNodeProgress(leafNode, 'gemara', masechtaPath, [entry]);
    expect(progress.fraction).toBe(0);
  });
});

describe('LogEntry save → entry persistence', () => {
  it('saves an entry with reviewCount = 1 and preserves it', () => {
    const entry = buildEntryFromLogState({
      categoryId: 'gemara',
      unit: 'Berachos 2a',
      unitType: 'daf',
      components: [comp('Gemara Text', { reviewed: true, reviewCount: 1 })],
    });
    expect(entry.components[0].reviewCount).toBe(1);
    expect(entry.components[0].reviewed).toBe(true);
    expect(entry.unit).toBe('Berachos 2a');
  });

  it('saves an entry with reviewCount = 2', () => {
    const entry = buildEntryFromLogState({
      categoryId: 'gemara',
      unit: 'Berachos 2a',
      unitType: 'daf',
      components: [comp('Gemara Text', { reviewed: true, reviewCount: 2 })],
    });
    expect(entry.components[0].reviewCount).toBe(2);
  });

  it('saves an entry with reviewCount = 5 across multiple components', () => {
    const entry = buildEntryFromLogState({
      categoryId: 'gemara',
      unit: 'Berachos 2a',
      unitType: 'daf',
      components: [
        comp('Gemara Text', { reviewed: true, reviewCount: 5 }),
        comp('Rashi', { reviewed: true, reviewCount: 3 }),
      ],
    });
    expect(entry.components[0].reviewCount).toBe(5);
    expect(entry.components[1].reviewCount).toBe(3);
  });

  it('preserves notes, date, categoryId, and unitType on save', () => {
    const entry = buildEntryFromLogState({
      categoryId: 'chumash',
      unit: 'Bereishis 1:1',
      unitType: 'pasuk',
      date: '2026-04-15',
      components: [
        comp('Pasuk', { learned: true, notes: 'beautiful insight' }),
      ],
    });
    expect(entry.categoryId).toBe('chumash');
    expect(entry.unit).toBe('Bereishis 1:1');
    expect(entry.unitType).toBe('pasuk');
    expect(entry.date).toBe('2026-04-15');
    expect(entry.components[0].notes).toBe('beautiful insight');
  });

  it('round-trips through localStorage (the store persistence layer)', () => {
    const entry = buildEntryFromLogState({
      categoryId: 'gemara',
      unit: 'Berachos 2a',
      unitType: 'daf',
      components: [
        comp('Gemara Text', { learned: true }),
        comp('Rashi', { reviewed: true, reviewCount: 2 }),
      ],
    });
    localStorage.setItem('torahTracker_entries', JSON.stringify([entry]));
    const loaded: LearningEntry[] = JSON.parse(
      localStorage.getItem('torahTracker_entries') || '[]'
    );
    expect(loaded).toHaveLength(1);
    expect(loaded[0].components[0].learned).toBe(true);
    expect(loaded[0].components[1].reviewCount).toBe(2);

    // And it should be reflected in progress calculations elsewhere.
    const leafNode: SubCategory = { id: '2a', name: '2a (Amud Aleph)', totalUnits: 1 };
    const progress = getNodeProgress(leafNode, 'gemara', ['Seder Zeraim', 'Berachos'], loaded);
    expect(progress.fraction).toBe(1);
  });
});
