import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { arabicCategoryNames, getCategoryIcon } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  channelCounts?: Record<string, number>;
}

const categories = ['all', 'sports', 'algerian', 'moroccan', 'tunisian', 'news', 'kids', 'entertainment', 'religious', 'documentary', 'music', 'french', 'turkish', 'other'];

export default function CategoryTabs({ activeCategory, onCategoryChange, channelCounts }: CategoryTabsProps) {
  return (
    <div className="bg-tv-surface/50 border-b border-white/5 px-4 py-3">
      <ScrollArea className="w-full">
        <div className="flex gap-2 w-max pb-1">
          {categories.map((category) => {
            const count = channelCounts?.[category] || 0;
            const isActive = activeCategory === category;
            return (
              <Button
                key={category}
                onClick={() => onCategoryChange(category)}
                variant="ghost"
                className={cn(
                  "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-xl arabic-text flex items-center gap-2",
                  isActive
                    ? "bg-tv-accent text-white hover:bg-tv-accent/90 shadow-lg shadow-tv-accent/20"
                    : "bg-tv-surface text-gray-400 hover:bg-tv-surface-hover hover:text-white"
                )}
              >
                <span className="text-base">{getCategoryIcon(category)}</span>
                <span>{arabicCategoryNames[category] || category}</span>
                {category !== 'all' && count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20" : "bg-white/10"
                  )}>
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
