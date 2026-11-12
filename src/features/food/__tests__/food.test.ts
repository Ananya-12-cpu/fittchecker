import { getBuiltInFood, FOODS } from '../food-db';
import { gramsFor, nutritionFor, per100gFromServing, sumNutrition, unitLabel } from '../nutrition';
import { searchFoods } from '../search';

const roti = getBuiltInFood('roti')!;
const dal = getBuiltInFood('dal-tadka')!;

describe('food database', () => {
  it('has unique ids and sane values', () => {
    const ids = new Set(FOODS.map((f) => f.id));
    expect(ids.size).toBe(FOODS.length);
    expect(FOODS.length).toBeGreaterThanOrEqual(180);
    for (const f of FOODS) {
      expect(f.kcal).toBeGreaterThanOrEqual(0);
      expect(f.kcal).toBeLessThanOrEqual(900);
      // macros can't exceed 100 g per 100 g (allow rounding slack)
      expect(f.protein + f.carbs + f.fat).toBeLessThanOrEqual(102);
      for (const g of Object.values(f.units)) expect(g).toBeGreaterThan(0);
    }
  });
});

describe('quantity → calories', () => {
  it('converts units to grams', () => {
    expect(gramsFor(roti, 'piece', 2)).toBe(80);
    expect(gramsFor(roti, 'g', 150)).toBe(150);
    expect(gramsFor(roti, 'unknown', 3)).toBe(3);
    expect(gramsFor(roti, 'piece', 0)).toBe(0);
  });

  it('computes nutrition for 2 rotis + 1 bowl dal', () => {
    const r = nutritionFor(roti, 'piece', 2); // 80 g × 2.97
    expect(r.kcal).toBe(238);
    expect(r.protein).toBe(7.8);
    const d = nutritionFor(dal, 'bowl', 1); // 200 g × 1.10
    expect(d.kcal).toBe(220);
    const total = sumNutrition([r, d]);
    expect(total.kcal).toBe(458);
    expect(total.grams).toBe(280);
  });

  it('supports fractional quantities', () => {
    expect(nutritionFor(dal, 'bowl', 0.5).kcal).toBe(110);
  });

  it('converts a label serving to per-100 g', () => {
    expect(per100gFromServing(40, { kcal: 200, protein: 8, carbs: 20, fat: 10 })).toEqual({
      kcal: 500,
      protein: 20,
      carbs: 50,
      fat: 25,
    });
  });

  it('pluralises unit labels', () => {
    expect(unitLabel('piece', 2)).toBe('pieces');
    expect(unitLabel('glass', 2)).toBe('glasses');
    expect(unitLabel('g', 200)).toBe('g');
    expect(unitLabel('tbsp', 2)).toBe('tbsp');
  });
});

describe('search', () => {
  it('ranks prefix matches first', () => {
    expect(searchFoods(FOODS, 'roti')[0].id).toBe('roti');
    expect(searchFoods(FOODS, 'chapati').map((f) => f.id)).toContain('roti');
  });

  it('requires all tokens to match', () => {
    const res = searchFoods(FOODS, 'paneer masala');
    expect(res[0].id).toBe('paneer-butter-masala');
    expect(res.every((f) => /paneer/i.test(f.name))).toBe(true);
  });

  it('is case and punctuation insensitive', () => {
    expect(searchFoods(FOODS, 'DAL-TADKA')[0].id).toBe('dal-tadka');
  });

  it('returns nothing for gibberish', () => {
    expect(searchFoods(FOODS, 'zzzqqq')).toHaveLength(0);
  });
});
