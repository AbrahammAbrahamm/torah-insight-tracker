import { useState } from 'react';
import { useCategories } from '@/lib/store';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubCategoryBrowser } from '@/components/SubCategoryBrowser';

export default function Categories() {
  const { categories } = useCategories();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="space-y-2">
        {categories.map(cat => {
          const hasSubs = !!(cat.subcategories && cat.subcategories.length > 0);
          const isOpen = expandedCat === cat.id;
          return (
            <div key={cat.id}>
              <motion.div
                layout
                role={hasSubs ? 'button' : undefined}
                tabIndex={hasSubs ? 0 : undefined}
                onClick={() => hasSubs && setExpandedCat(isOpen ? null : cat.id)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && hasSubs) {
                    e.preventDefault();
                    setExpandedCat(isOpen ? null : cat.id);
                  }
                }}
                className={`bg-card border rounded-xl p-4 flex items-center gap-3 transition-colors ${
                  hasSubs ? 'cursor-pointer hover:bg-secondary/40' : ''
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold">{cat.name}</p>
                </div>
                {hasSubs && (
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                )}
              </motion.div>

              <AnimatePresence>
                {isOpen && cat.subcategories && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-2"
                  >
                    <SubCategoryBrowser
                      subcategories={cat.subcategories}
                      categoryName={cat.name}
                      categoryId={cat.id}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
