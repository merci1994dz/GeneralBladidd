export const arabicCategoryNames = {
  all: "جميع القنوات",
  sports: "رياضية",
  algerian: "جزائرية", 
  news: "إخبارية",
  kids: "أطفال",
  entertainment: "ترفيه",
  religious: "دينية",
  documentary: "وثائقية"
} as const;

export const getCategoryIcon = (category: string): string => {
  const icons = {
    all: "fas fa-th-large",
    sports: "fas fa-futbol",
    algerian: "fas fa-flag",
    news: "fas fa-newspaper",
    kids: "fas fa-child",
    entertainment: "fas fa-music",
    religious: "fas fa-mosque",
    documentary: "fas fa-film"
  };
  return icons[category as keyof typeof icons] || "fas fa-tv";
};

export const getCategoryColor = (category: string): string => {
  const colors = {
    sports: "from-red-500 to-red-600",
    algerian: "from-green-500 to-green-600",
    news: "from-purple-500 to-purple-600",
    kids: "from-pink-500 to-pink-600",
    entertainment: "from-yellow-500 to-yellow-600",
    religious: "from-blue-500 to-blue-600",
    documentary: "from-gray-500 to-gray-600"
  };
  return colors[category as keyof typeof colors] || "from-blue-500 to-blue-600";
};

export const formatArabicNumber = (number: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number.toString().replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
};
