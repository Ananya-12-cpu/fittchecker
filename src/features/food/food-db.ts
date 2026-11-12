import type { Food, FoodCategory } from './types';

/**
 * Bundled food database. Values are approximate per 100 g (or 100 ml for drinks),
 * compiled from USDA FoodData Central and IFCT (Indian Food Composition Tables 2017)
 * typical home-style preparations. Units map a serving name to grams per 1 unit.
 *
 * Format: f(id, name, category, kcal, protein, carbs, fat, "unit:grams,unit:grams")
 * The first unit listed is the default.
 */
function f(
  id: string,
  name: string,
  category: FoodCategory,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  units = '',
): Food {
  const parsed: Record<string, number> = {};
  for (const part of units.split(',').filter(Boolean)) {
    const [u, g] = part.split(':');
    parsed[u.trim()] = Number(g);
  }
  const first = Object.keys(parsed)[0];
  return { id, name, category, kcal, protein, carbs, fat, units: parsed, defaultUnit: first ?? 'g' };
}

export const FOODS: Food[] = [
  // ── Breads ────────────────────────────────────────────────
  f('roti', 'Roti / Chapati', 'breads', 297, 9.8, 50, 7, 'piece:40'),
  f('phulka', 'Phulka (no oil)', 'breads', 264, 9.5, 52, 2, 'piece:35'),
  f('paratha', 'Plain Paratha', 'breads', 326, 6.4, 45, 13, 'piece:80'),
  f('aloo-paratha', 'Aloo Paratha', 'breads', 242, 5, 35, 9, 'piece:120'),
  f('paneer-paratha', 'Paneer Paratha', 'breads', 270, 9, 32, 12, 'piece:120'),
  f('naan', 'Naan', 'breads', 290, 9, 50, 5.7, 'piece:90'),
  f('butter-naan', 'Butter Naan', 'breads', 330, 8.5, 48, 11, 'piece:100'),
  f('puri', 'Puri', 'breads', 380, 6, 45, 19, 'piece:25'),
  f('bhatura', 'Bhatura', 'breads', 360, 7, 45, 16, 'piece:70'),
  f('bajra-roti', 'Bajra Roti', 'breads', 270, 8, 50, 5, 'piece:60'),
  f('ragi-roti', 'Ragi Roti', 'breads', 255, 6, 50, 4, 'piece:50'),
  f('makki-roti', 'Makki di Roti', 'breads', 280, 6.5, 48, 7, 'piece:70'),
  f('white-bread', 'White Bread', 'breads', 265, 9, 49, 3.2, 'slice:25'),
  f('brown-bread', 'Whole Wheat Bread', 'breads', 247, 13, 41, 3.4, 'slice:28'),
  f('pav', 'Pav (bun)', 'breads', 280, 8.5, 52, 4, 'piece:40'),

  // ── Rice & grains ─────────────────────────────────────────
  f('white-rice', 'Steamed Rice', 'rice', 130, 2.7, 28, 0.3, 'bowl:150,cup:160'),
  f('brown-rice', 'Brown Rice', 'rice', 112, 2.6, 23.5, 0.9, 'bowl:150,cup:160'),
  f('jeera-rice', 'Jeera Rice', 'rice', 150, 3, 28, 3, 'bowl:150'),
  f('veg-pulao', 'Veg Pulao', 'rice', 160, 3.5, 26, 5, 'plate:250,bowl:150'),
  f('chicken-biryani', 'Chicken Biryani', 'rice', 190, 9, 24, 6.5, 'plate:300,bowl:200'),
  f('mutton-biryani', 'Mutton Biryani', 'rice', 210, 9.5, 23, 9, 'plate:300,bowl:200'),
  f('veg-biryani', 'Veg Biryani', 'rice', 165, 3.8, 26, 5.5, 'plate:300,bowl:200'),
  f('khichdi', 'Khichdi', 'rice', 120, 4.5, 20, 2.5, 'bowl:200'),
  f('curd-rice', 'Curd Rice', 'rice', 125, 3.4, 20, 3.5, 'bowl:200'),
  f('lemon-rice', 'Lemon Rice', 'rice', 170, 3, 28, 5, 'bowl:200'),
  f('fried-rice', 'Fried Rice', 'rice', 165, 4, 26, 5, 'plate:250'),
  f('quinoa', 'Quinoa (cooked)', 'rice', 120, 4.4, 21, 1.9, 'cup:185,bowl:150'),
  f('daliya', 'Daliya / Broken Wheat', 'rice', 100, 3.5, 20, 0.6, 'bowl:200'),
  f('oats-cooked', 'Oats Porridge (water)', 'rice', 71, 2.5, 12, 1.5, 'bowl:200'),
  f('oats-milk', 'Oats with Milk', 'rice', 110, 4.5, 15, 3.5, 'bowl:220'),

  // ── Dal & curries ─────────────────────────────────────────
  f('dal-tadka', 'Dal Tadka', 'dal-curry', 110, 6, 15, 3, 'bowl:200'),
  f('moong-dal', 'Moong Dal', 'dal-curry', 100, 6.5, 14, 2, 'bowl:200'),
  f('masoor-dal', 'Masoor Dal', 'dal-curry', 105, 7, 15, 2, 'bowl:200'),
  f('dal-makhani', 'Dal Makhani', 'dal-curry', 160, 6, 14, 9, 'bowl:200'),
  f('rajma', 'Rajma Curry', 'dal-curry', 140, 6, 18, 4.5, 'bowl:200'),
  f('chole', 'Chole / Chana Masala', 'dal-curry', 160, 7, 20, 6, 'bowl:200'),
  f('kadhi', 'Kadhi', 'dal-curry', 90, 3.5, 8, 5, 'bowl:200'),
  f('sambar', 'Sambar', 'dal-curry', 65, 3, 9, 2, 'bowl:200'),
  f('rasam', 'Rasam', 'dal-curry', 30, 1, 4, 1, 'bowl:200'),
  f('paneer-butter-masala', 'Paneer Butter Masala', 'dal-curry', 230, 9, 8, 18, 'bowl:200'),
  f('palak-paneer', 'Palak Paneer', 'dal-curry', 160, 8, 6, 12, 'bowl:200'),
  f('matar-paneer', 'Matar Paneer', 'dal-curry', 180, 8, 10, 12, 'bowl:200'),
  f('kadai-paneer', 'Kadai Paneer', 'dal-curry', 200, 9, 8, 15, 'bowl:200'),
  f('aloo-gobi', 'Aloo Gobi', 'dal-curry', 100, 2.5, 13, 4.5, 'bowl:150'),
  f('aloo-sabzi', 'Aloo Sabzi', 'dal-curry', 110, 2, 15, 5, 'bowl:150'),
  f('mixed-veg', 'Mixed Veg Curry', 'dal-curry', 90, 2.5, 10, 4.5, 'bowl:150'),
  f('bhindi', 'Bhindi Fry', 'dal-curry', 110, 2.5, 9, 7, 'bowl:120'),
  f('baingan-bharta', 'Baingan Bharta', 'dal-curry', 100, 2, 9, 6.5, 'bowl:150'),
  f('lauki', 'Lauki Sabzi', 'dal-curry', 60, 1.2, 6, 3.5, 'bowl:150'),
  f('cabbage-sabzi', 'Cabbage Sabzi', 'dal-curry', 70, 1.8, 7, 4, 'bowl:150'),
  f('chicken-curry', 'Chicken Curry', 'dal-curry', 175, 16, 4, 10, 'bowl:200'),
  f('butter-chicken', 'Butter Chicken', 'dal-curry', 220, 14, 6, 15, 'bowl:200'),
  f('egg-curry', 'Egg Curry', 'dal-curry', 150, 9, 5, 10, 'bowl:200'),
  f('fish-curry', 'Fish Curry', 'dal-curry', 140, 14, 4, 7, 'bowl:200'),
  f('mutton-curry', 'Mutton Curry', 'dal-curry', 200, 15, 4, 14, 'bowl:200'),
  f('keema', 'Chicken Keema', 'dal-curry', 230, 17, 4, 16, 'bowl:150'),

  // ── South Indian ──────────────────────────────────────────
  f('idli', 'Idli', 'south-indian', 146, 4.5, 30, 0.4, 'piece:40'),
  f('dosa', 'Plain Dosa', 'south-indian', 168, 3.9, 29, 3.7, 'piece:100'),
  f('masala-dosa', 'Masala Dosa', 'south-indian', 180, 4, 26, 7, 'piece:180'),
  f('uttapam', 'Uttapam', 'south-indian', 175, 4.5, 28, 5, 'piece:120'),
  f('medu-vada', 'Medu Vada', 'south-indian', 300, 10, 30, 15, 'piece:50'),
  f('upma', 'Upma', 'south-indian', 125, 3.5, 20, 4, 'bowl:200'),
  f('pongal', 'Pongal', 'south-indian', 150, 4, 22, 5, 'bowl:200'),
  f('appam', 'Appam', 'south-indian', 120, 2, 23, 2, 'piece:50'),
  f('coconut-chutney', 'Coconut Chutney', 'south-indian', 200, 2.5, 8, 18, 'tbsp:20'),
  f('avial', 'Avial', 'south-indian', 110, 2, 8, 8, 'bowl:150'),

  // ── Breakfast ─────────────────────────────────────────────
  f('poha', 'Poha', 'breakfast', 140, 2.6, 24, 4, 'bowl:180'),
  f('besan-chilla', 'Besan Chilla', 'breakfast', 190, 9, 22, 7, 'piece:70'),
  f('moong-chilla', 'Moong Dal Chilla', 'breakfast', 160, 10, 20, 4.5, 'piece:70'),
  f('cornflakes', 'Cornflakes', 'breakfast', 357, 7.5, 84, 0.4, 'bowl:30'),
  f('muesli', 'Muesli', 'breakfast', 370, 10, 66, 7, 'bowl:50'),
  f('oats-dry', 'Rolled Oats (dry)', 'breakfast', 389, 16.9, 66, 6.9, 'cup:80,tbsp:10'),
  f('pancake', 'Pancake', 'breakfast', 227, 6, 28, 10, 'piece:40'),
  f('sandwich-veg', 'Veg Sandwich (grilled)', 'breakfast', 220, 7, 30, 8, 'piece:150'),

  // ── Protein ───────────────────────────────────────────────
  f('egg-boiled', 'Boiled Egg', 'protein', 155, 13, 1.1, 11, 'piece:50'),
  f('egg-white', 'Egg White', 'protein', 52, 11, 0.7, 0.2, 'piece:33'),
  f('omelette', 'Omelette (1 egg)', 'protein', 154, 11, 0.6, 12, 'piece:60'),
  f('egg-fried', 'Fried Egg', 'protein', 196, 14, 0.8, 15, 'piece:46'),
  f('egg-bhurji', 'Egg Bhurji', 'protein', 180, 12, 3, 13, 'plate:120'),
  f('chicken-breast', 'Chicken Breast (cooked)', 'protein', 165, 31, 0, 3.6, 'piece:120'),
  f('chicken-thigh', 'Chicken Thigh (cooked)', 'protein', 209, 26, 0, 11, 'piece:100'),
  f('tandoori-chicken', 'Tandoori Chicken', 'protein', 150, 25, 3, 4.5, 'piece:120'),
  f('chicken-tikka', 'Chicken Tikka', 'protein', 150, 24, 4, 4.5, 'piece:30'),
  f('fish-grilled', 'Fish (grilled)', 'protein', 128, 22, 0, 4, 'piece:100'),
  f('fish-fry', 'Fish Fry', 'protein', 230, 18, 8, 14, 'piece:100'),
  f('salmon', 'Salmon (cooked)', 'protein', 208, 20, 0, 13, 'piece:120'),
  f('tuna', 'Tuna (canned, water)', 'protein', 116, 26, 0, 0.8, 'can:120'),
  f('prawns', 'Prawns (cooked)', 'protein', 99, 24, 0.2, 0.3, 'bowl:100'),
  f('mutton', 'Mutton (cooked)', 'protein', 294, 25, 0, 21, 'bowl:100'),
  f('paneer', 'Paneer', 'protein', 265, 18, 3, 20, 'cube:20,bowl:100'),
  f('tofu', 'Tofu (firm)', 'protein', 144, 17, 3, 9, 'piece:85'),
  f('soya-chunks', 'Soya Chunks (dry)', 'protein', 345, 52, 33, 0.5, 'cup:50,handful:25'),
  f('chana-boiled', 'Boiled Chickpeas', 'protein', 164, 8.9, 27, 2.6, 'bowl:150'),
  f('sprouts', 'Moong Sprouts', 'protein', 30, 3, 6, 0.2, 'bowl:100'),
  f('whey', 'Whey Protein', 'protein', 400, 80, 8, 6, 'scoop:30'),

  // ── Dairy ─────────────────────────────────────────────────
  f('milk-whole', 'Milk (full cream)', 'dairy', 61, 3.2, 4.8, 3.3, 'glass:250,cup:150'),
  f('milk-toned', 'Milk (toned)', 'dairy', 58, 3.1, 4.7, 3, 'glass:250,cup:150'),
  f('milk-skim', 'Milk (skimmed)', 'dairy', 34, 3.4, 5, 0.1, 'glass:250,cup:150'),
  f('curd', 'Curd / Dahi', 'dairy', 61, 3.5, 4.7, 3.3, 'bowl:150,tbsp:15'),
  f('greek-yogurt', 'Greek Yogurt (plain)', 'dairy', 59, 10, 3.6, 0.4, 'cup:170'),
  f('raita', 'Raita', 'dairy', 70, 3, 5, 4, 'bowl:150'),
  f('cheese-slice', 'Cheese Slice', 'dairy', 300, 18, 4, 24, 'slice:20'),
  f('cheddar', 'Cheddar Cheese', 'dairy', 403, 25, 1.3, 33, 'g:1'),
  f('mozzarella', 'Mozzarella', 'dairy', 280, 28, 3, 17, 'g:1'),

  // ── Fruit ─────────────────────────────────────────────────
  f('apple', 'Apple', 'fruit', 52, 0.3, 14, 0.2, 'piece:180'),
  f('banana', 'Banana', 'fruit', 89, 1.1, 23, 0.3, 'piece:120'),
  f('orange', 'Orange', 'fruit', 47, 0.9, 12, 0.1, 'piece:130'),
  f('mango', 'Mango', 'fruit', 60, 0.8, 15, 0.4, 'piece:200,cup:165'),
  f('papaya', 'Papaya', 'fruit', 43, 0.5, 11, 0.3, 'cup:145'),
  f('watermelon', 'Watermelon', 'fruit', 30, 0.6, 7.6, 0.2, 'cup:150'),
  f('grapes', 'Grapes', 'fruit', 69, 0.7, 18, 0.2, 'cup:150'),
  f('pomegranate', 'Pomegranate', 'fruit', 83, 1.7, 19, 1.2, 'cup:175'),
  f('guava', 'Guava', 'fruit', 68, 2.6, 14, 1, 'piece:100'),
  f('pineapple', 'Pineapple', 'fruit', 50, 0.5, 13, 0.1, 'cup:165'),
  f('pear', 'Pear', 'fruit', 57, 0.4, 15, 0.1, 'piece:180'),
  f('strawberries', 'Strawberries', 'fruit', 32, 0.7, 7.7, 0.3, 'cup:150'),
  f('kiwi', 'Kiwi', 'fruit', 61, 1.1, 15, 0.5, 'piece:75'),
  f('chikoo', 'Chikoo / Sapota', 'fruit', 83, 0.4, 20, 1.1, 'piece:100'),
  f('dates', 'Dates', 'fruit', 282, 2.5, 75, 0.4, 'piece:8'),
  f('raisins', 'Raisins', 'fruit', 299, 3.1, 79, 0.5, 'tbsp:10'),

  // ── Vegetables ────────────────────────────────────────────
  f('salad', 'Green Salad', 'veg', 20, 1.2, 3.5, 0.2, 'bowl:100'),
  f('cucumber', 'Cucumber', 'veg', 15, 0.7, 3.6, 0.1, 'piece:200'),
  f('tomato', 'Tomato', 'veg', 18, 0.9, 3.9, 0.2, 'piece:120'),
  f('carrot', 'Carrot', 'veg', 41, 0.9, 10, 0.2, 'piece:60'),
  f('onion', 'Onion', 'veg', 40, 1.1, 9, 0.1, 'piece:110'),
  f('potato-boiled', 'Boiled Potato', 'veg', 87, 1.9, 20, 0.1, 'piece:150'),
  f('sweet-potato', 'Sweet Potato (boiled)', 'veg', 76, 1.4, 18, 0.1, 'piece:150'),
  f('spinach', 'Spinach', 'veg', 23, 2.9, 3.6, 0.4, 'cup:30'),
  f('broccoli', 'Broccoli', 'veg', 34, 2.8, 7, 0.4, 'cup:90'),
  f('sweet-corn', 'Sweet Corn (boiled)', 'veg', 96, 3.4, 21, 1.5, 'cup:150'),
  f('mushrooms', 'Mushrooms', 'veg', 22, 3.1, 3.3, 0.3, 'cup:70'),
  f('green-peas', 'Green Peas', 'veg', 81, 5.4, 14, 0.4, 'cup:145'),
  f('beetroot', 'Beetroot', 'veg', 43, 1.6, 10, 0.2, 'piece:80'),
  f('capsicum', 'Capsicum', 'veg', 20, 0.9, 4.6, 0.2, 'piece:120'),
  f('tomato-soup', 'Tomato Soup', 'veg', 40, 1, 7, 1, 'bowl:250'),
  f('chicken-soup', 'Clear Chicken Soup', 'veg', 40, 4, 2, 1.5, 'bowl:250'),

  // ── Nuts & seeds ──────────────────────────────────────────
  f('almonds', 'Almonds', 'nuts', 579, 21, 22, 50, 'piece:1.2,handful:28'),
  f('cashews', 'Cashews', 'nuts', 553, 18, 30, 44, 'piece:1.5,handful:28'),
  f('walnuts', 'Walnuts', 'nuts', 654, 15, 14, 65, 'handful:28'),
  f('peanuts', 'Roasted Peanuts', 'nuts', 585, 24, 21, 50, 'handful:30'),
  f('pistachios', 'Pistachios', 'nuts', 560, 20, 28, 45, 'handful:28'),
  f('flax', 'Flax Seeds', 'nuts', 534, 18, 29, 42, 'tbsp:10'),
  f('chia', 'Chia Seeds', 'nuts', 486, 17, 42, 31, 'tbsp:12'),
  f('makhana', 'Roasted Makhana', 'nuts', 350, 9.7, 77, 0.1, 'cup:15'),
  f('peanut-butter', 'Peanut Butter', 'nuts', 588, 25, 20, 50, 'tbsp:16'),

  // ── Snacks ────────────────────────────────────────────────
  f('samosa', 'Samosa', 'snacks', 308, 5, 32, 17, 'piece:60'),
  f('pakora', 'Pakora', 'snacks', 315, 7, 27, 20, 'piece:20'),
  f('vada-pav', 'Vada Pav', 'snacks', 230, 6, 32, 9, 'piece:130'),
  f('pav-bhaji', 'Pav Bhaji', 'snacks', 180, 4.5, 24, 7.5, 'plate:300'),
  f('dhokla', 'Dhokla', 'snacks', 160, 6, 26, 4, 'piece:30'),
  f('pani-puri', 'Pani Puri', 'snacks', 200, 3, 30, 7, 'piece:18'),
  f('bhel', 'Bhel Puri', 'snacks', 210, 5, 35, 6, 'plate:150'),
  f('namkeen', 'Namkeen / Bhujia', 'snacks', 550, 15, 40, 37, 'handful:30'),
  f('chips', 'Potato Chips', 'snacks', 536, 7, 53, 35, 'pack:52,handful:20'),
  f('popcorn', 'Popcorn (plain)', 'snacks', 387, 13, 78, 4.5, 'cup:8'),
  f('biscuit-digestive', 'Digestive Biscuit', 'snacks', 480, 7, 63, 21, 'piece:15'),
  f('biscuit-marie', 'Marie Biscuit', 'snacks', 440, 7.5, 76, 11, 'piece:7'),
  f('papad', 'Roasted Papad', 'snacks', 370, 25, 60, 3, 'piece:12'),
  f('veg-momos', 'Veg Momos (steamed)', 'snacks', 170, 5, 28, 4, 'piece:30'),
  f('chicken-momos', 'Chicken Momos (steamed)', 'snacks', 190, 9, 22, 7, 'piece:30'),

  // ── Sweets ────────────────────────────────────────────────
  f('gulab-jamun', 'Gulab Jamun', 'sweets', 375, 5, 50, 18, 'piece:40'),
  f('jalebi', 'Jalebi', 'sweets', 400, 2, 60, 17, 'piece:30'),
  f('rasgulla', 'Rasgulla', 'sweets', 186, 4, 40, 1.7, 'piece:50'),
  f('besan-ladoo', 'Besan Ladoo', 'sweets', 470, 8, 55, 25, 'piece:35'),
  f('barfi', 'Kaju / Milk Barfi', 'sweets', 430, 9, 55, 20, 'piece:30'),
  f('kheer', 'Kheer', 'sweets', 140, 4, 20, 5, 'bowl:150'),
  f('suji-halwa', 'Suji Halwa', 'sweets', 310, 4, 40, 15, 'bowl:100'),
  f('gajar-halwa', 'Gajar Halwa', 'sweets', 220, 4, 28, 10, 'bowl:100'),
  f('kulfi', 'Kulfi', 'sweets', 230, 5, 25, 12, 'piece:70'),
  f('ice-cream', 'Ice Cream', 'sweets', 207, 3.5, 24, 11, 'scoop:65,cup:100'),
  f('cake', 'Cake', 'sweets', 370, 5, 50, 17, 'slice:80'),
  f('dark-chocolate', 'Dark Chocolate', 'sweets', 546, 5, 61, 31, 'square:10'),
  f('milk-chocolate', 'Milk Chocolate', 'sweets', 535, 7.7, 59, 30, 'bar:40'),
  f('sugar', 'Sugar', 'sweets', 387, 0, 100, 0, 'tsp:4'),
  f('honey', 'Honey', 'sweets', 304, 0.3, 82, 0, 'tsp:7,tbsp:21'),
  f('jam', 'Jam', 'sweets', 278, 0.4, 69, 0.1, 'tbsp:20'),

  // ── Fast food ─────────────────────────────────────────────
  f('pizza', 'Pizza', 'fast-food', 266, 11, 33, 10, 'slice:107'),
  f('veg-burger', 'Veg Burger', 'fast-food', 240, 6, 32, 10, 'piece:150'),
  f('chicken-burger', 'Chicken Burger', 'fast-food', 250, 13, 24, 11, 'piece:180'),
  f('fries', 'French Fries', 'fast-food', 312, 3.4, 41, 15, 'serving:115'),
  f('wrap', 'Chicken Wrap / Kathi Roll', 'fast-food', 220, 11, 24, 9, 'piece:250'),
  f('hakka-noodles', 'Hakka Noodles', 'fast-food', 170, 4, 26, 6, 'plate:250'),
  f('instant-noodles', 'Instant Noodles (cooked)', 'fast-food', 157, 3.5, 20, 7, 'bowl:200'),
  f('pasta-red', 'Pasta (red sauce)', 'fast-food', 150, 5, 25, 4, 'plate:250'),
  f('pasta-white', 'Pasta (white sauce)', 'fast-food', 190, 6, 22, 9, 'plate:250'),

  // ── Drinks (per 100 ml) ───────────────────────────────────
  f('chai', 'Masala Chai (milk + sugar)', 'drinks', 50, 1.6, 7.5, 1.6, 'cup:150'),
  f('coffee-milk', 'Coffee (milk + sugar)', 'drinks', 50, 1.6, 7.5, 1.6, 'cup:150'),
  f('black-coffee', 'Black Coffee', 'drinks', 2, 0.3, 0, 0, 'cup:240'),
  f('green-tea', 'Green Tea', 'drinks', 1, 0, 0.2, 0, 'cup:200'),
  f('cold-coffee', 'Cold Coffee', 'drinks', 90, 3, 13, 3, 'glass:250'),
  f('lassi', 'Sweet Lassi', 'drinks', 90, 3, 14, 2.5, 'glass:250'),
  f('chaas', 'Buttermilk / Chaas', 'drinks', 25, 1.5, 2.5, 0.9, 'glass:250'),
  f('nimbu-pani', 'Nimbu Pani (sweet)', 'drinks', 30, 0.1, 8, 0, 'glass:250'),
  f('coconut-water', 'Coconut Water', 'drinks', 19, 0.7, 3.7, 0.2, 'glass:250'),
  f('orange-juice', 'Orange Juice', 'drinks', 45, 0.7, 10, 0.2, 'glass:250'),
  f('sugarcane-juice', 'Sugarcane Juice', 'drinks', 73, 0.2, 18, 0, 'glass:250'),
  f('banana-smoothie', 'Banana Smoothie', 'drinks', 90, 2.5, 17, 1.5, 'glass:300'),
  f('cola', 'Cola / Soft Drink', 'drinks', 42, 0, 10.6, 0, 'can:330,glass:250'),
  f('energy-drink', 'Energy Drink', 'drinks', 45, 0, 11, 0, 'can:250'),
  f('beer', 'Beer', 'drinks', 43, 0.5, 3.6, 0, 'can:330,pint:500'),
  f('wine', 'Wine', 'drinks', 83, 0.1, 2.7, 0, 'glass:150'),

  // ── Oils & spreads ────────────────────────────────────────
  f('ghee', 'Ghee', 'fats', 900, 0, 0, 100, 'tsp:5,tbsp:14'),
  f('butter', 'Butter', 'fats', 717, 0.9, 0.1, 81, 'tsp:5,tbsp:14'),
  f('oil', 'Cooking Oil', 'fats', 884, 0, 0, 100, 'tsp:5,tbsp:14'),
  f('olive-oil', 'Olive Oil', 'fats', 884, 0, 0, 100, 'tsp:5,tbsp:14'),
  f('mayonnaise', 'Mayonnaise', 'fats', 680, 1, 0.6, 75, 'tbsp:14'),
  f('ketchup', 'Ketchup', 'fats', 100, 1.2, 25, 0.1, 'tbsp:15'),
  f('pickle', 'Pickle (in oil)', 'fats', 200, 1, 8, 18, 'tbsp:15'),
  f('green-chutney', 'Green Chutney', 'fats', 50, 2, 8, 1, 'tbsp:15'),
];

const BY_ID = new Map(FOODS.map((food) => [food.id, food]));

export function getBuiltInFood(id: string): Food | undefined {
  return BY_ID.get(id);
}
