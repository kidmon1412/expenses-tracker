// Keyword-rule category suggestion — v1 rule-based (see docs/INTELLIGENCE_LAYER.md).
// Replaced by an LLM-based suggestion later; storage schema (source/confidence/review_status)
// stays the same so the swap is transparent to callers.

const KEYWORD_RULES: { category: string; keywords: string[] }[] = [
  {
    category: "Food & Drink",
    keywords: [
      "lunch", "dinner", "breakfast", "grocery", "groceries", "restaurant",
      "coffee", "snack", "meal", "takeaway", "takeout", "cafe",
    ],
  },
  {
    category: "Transport",
    keywords: [
      "uber", "taxi", "bus", "train", "fuel", "petrol", "gas", "parking",
      "flight", "lyft", "commute", "tube", "underground",
    ],
  },
  {
    category: "Rent & Housing",
    keywords: ["rent", "mortgage", "housing", "landlord", "utility", "utilities"],
  },
  {
    category: "Salary",
    keywords: ["salary", "payroll", "wage", "wages", "paycheck", "income"],
  },
  {
    category: "Entertainment",
    keywords: [
      "movie", "netflix", "spotify", "concert", "streaming", "game",
      "cinema", "subscription",
    ],
  },
];

const ONLINE_PAYMENT_KEYWORDS = [
  "uber", "netflix", "spotify", "paypal", "amazon", "subscription", "app",
];

export interface CategorySuggestion {
  category: string;
  source: string;
  confidence: number;
}

export function suggestCategory(note: string | null | undefined): CategorySuggestion | null {
  if (!note) return null;
  const lower = note.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return {
        category: rule.category,
        source: "keyword-rules-v1",
        confidence: 0.75,
      };
    }
  }
  return null;
}

export function suggestChannel(note: string | null | undefined): "online" | null {
  if (!note) return null;
  const lower = note.toLowerCase();
  return ONLINE_PAYMENT_KEYWORDS.some((kw) => lower.includes(kw)) ? "online" : null;
}
