export const arabicCategoryNames: Record<string, string> = {
  all: "جميع القنوات",
  sports: "رياضية",
  algerian: "جزائرية",
  moroccan: "مغربية",
  tunisian: "تونسية",
  news: "إخبارية",
  kids: "أطفال",
  entertainment: "ترفيه",
  religious: "دينية",
  documentary: "وثائقية",
  music: "موسيقى",
  french: "فرنسية",
  turkish: "تركية",
  other: "أخرى"
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    all: "📺",
    sports: "⚽",
    algerian: "🇩🇿",
    moroccan: "🇲🇦",
    tunisian: "🇹🇳",
    news: "📰",
    kids: "🧸",
    entertainment: "🎬",
    religious: "🕌",
    documentary: "🎥",
    music: "🎵",
    french: "🇫🇷",
    turkish: "🇹🇷",
    other: "📡"
  };
  return icons[category] || "📡";
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    sports: "from-red-500 to-red-600",
    algerian: "from-green-600 to-green-700",
    moroccan: "from-red-600 to-red-700",
    tunisian: "from-red-500 to-red-600",
    news: "from-purple-500 to-purple-600",
    kids: "from-pink-400 to-pink-500",
    entertainment: "from-yellow-500 to-yellow-600",
    religious: "from-emerald-500 to-emerald-600",
    documentary: "from-cyan-500 to-cyan-600",
    music: "from-violet-500 to-violet-600",
    french: "from-blue-500 to-blue-600",
    turkish: "from-rose-500 to-rose-600",
    other: "from-gray-500 to-gray-600"
  };
  return colors[category] || "from-blue-500 to-blue-600";
};

export const formatArabicNumber = (number: number): string => {
  return number.toLocaleString('ar-EG');
};

export const getCategoryEmoji = (category: string): string => {
  return getCategoryIcon(category);
};
