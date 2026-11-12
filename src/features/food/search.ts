import type { Food } from './types';

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Relevance score (higher is better, 0 = no match).
 * exact name > name prefix > word prefix > substring; every query token must match.
 */
export function scoreFood(food: Food, query: string): number {
  const q = normalize(query);
  if (!q) return 1;
  const name = normalize(food.name);
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;

  const words = name.split(' ');
  const tokens = q.split(' ');
  let score = 0;
  for (const t of tokens) {
    if (words.some((w) => w.startsWith(t))) score += 20;
    else if (name.includes(t)) score += 8;
    else return 0;
  }
  return score + (food.isCustom ? 5 : 0);
}

export function searchFoods(foods: Food[], query: string, limit = 60): Food[] {
  if (!normalize(query)) return foods.slice(0, limit);
  return foods
    .map((food) => ({ food, score: scoreFood(food, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name))
    .slice(0, limit)
    .map((r) => r.food);
}
