'use client';

import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 pb-2">
          {/* All category pill */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(null)}
            className={`px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted/50 text-foreground hover:bg-muted border'
            }`}
          >
            All Apps
          </motion.button>

          {/* Category pills */}
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(category)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted/50 text-foreground hover:bg-muted border'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
