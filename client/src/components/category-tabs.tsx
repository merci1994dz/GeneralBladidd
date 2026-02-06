import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { arabicCategoryNames, getCategoryIcon } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ['all', 'sports', 'algerian', 'news', 'kids', 'entertainment', 'religious', 'documentary'];

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="bg-tv-gradient border-b border-tv-accent/30 px-6 py-4 shadow-lg">
      <ScrollArea className="w-full">
        <div className="flex gap-3 w-max">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => onCategoryChange(category)}
              variant="ghost"
              className={cn(
                "px-6 py-3 text-sm font-bold whitespace-nowrap transition-all duration-300 rounded-xl arabic-text border-2",
                activeCategory === category
                  ? "bg-tv-accent text-white hover:bg-tv-accent/90 border-tv-accent shadow-lg scale-105"
                  : "bg-tv-surface/80 text-gray-300 hover:bg-tv-secondary hover:text-white border-transparent hover:border-tv-secondary/50"
              )}
            >
              <i className={`${getCategoryIcon(category)} ml-2 text-lg`} />
              {arabicCategoryNames[category as keyof typeof arabicCategoryNames]}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
