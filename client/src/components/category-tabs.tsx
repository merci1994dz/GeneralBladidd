import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { arabicCategoryNames, getCategoryIcon } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ['all', 'sports', 'algerian', 'news', 'kids'];

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="bg-tv-surface border-b border-gray-700 px-4 py-3">
      <ScrollArea className="w-full">
        <div className="flex gap-2 w-max">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => onCategoryChange(category)}
              variant="ghost"
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === category
                  ? "bg-tv-accent text-white hover:bg-tv-accent/90"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              )}
            >
              <i className={`${getCategoryIcon(category)} ml-2`} />
              {arabicCategoryNames[category as keyof typeof arabicCategoryNames]}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
