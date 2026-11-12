import type { BmiCategory } from '../health/bmi';
import type { ActivityLevel, Goal } from '../health/types';
import type { Tip, WorkoutDay } from './types';

type Bucket = 'under' | 'healthy' | 'over' | 'obese';

export function bucketOf(c: BmiCategory): Bucket {
  if (c === 'underweight') return 'under';
  if (c === 'normal') return 'healthy';
  if (c === 'overweight') return 'over';
  return 'obese';
}

export function recommendedGoalFor(c: BmiCategory): Goal {
  const b = bucketOf(c);
  return b === 'under' ? 'gain' : b === 'healthy' ? 'maintain' : 'lose';
}

/** Daily deficit used when losing: a bit larger for higher BMI classes. */
export function deficitFor(c: BmiCategory) {
  return c === 'obese2' || c === 'obese3' ? 750 : 500;
}

export function stepsTargetFor(c: BmiCategory, activity: ActivityLevel) {
  const base = { under: 7000, healthy: 9000, over: 10000, obese: 7000 }[bucketOf(c)];
  // start sedentary obese users lower and build up
  return activity === 'sedentary' && bucketOf(c) === 'obese' ? 5000 : base;
}

export const HEADLINES: Record<Bucket, string> = {
  under: 'Fuel up and build strength',
  healthy: "You're in the healthy zone — keep it locked in",
  over: 'A steady deficit will get you to your healthy range',
  obese: 'Small daily wins add up — start gentle, stay consistent',
};

export const DIET_TIPS: Record<Bucket, Tip[]> = {
  under: [
    { title: 'Eat every 3 hours', body: '3 meals + 2–3 snacks. Smaller, frequent meals are easier than huge plates.' },
    { title: 'Calorie-dense add-ons', body: 'Add ghee to dal, peanut butter on toast, a handful of nuts or a banana shake with milk.' },
    { title: 'Protein at every meal', body: 'Paneer, eggs, dal, chicken, curd or soya — aim for a palm-sized portion each time.' },
    { title: "Don't fill up on water before meals", body: 'Drink most of your water between meals so there is room for food.' },
  ],
  healthy: [
    { title: 'Build a balanced plate', body: '½ vegetables, ¼ protein (dal/paneer/eggs/chicken), ¼ grains (rice/roti).' },
    { title: 'Protein first', body: 'Hit your protein target daily to maintain muscle and stay full.' },
    { title: 'Limit liquid sugar', body: 'Swap colas and packaged juices for chaas, nimbu pani without sugar or coconut water.' },
    { title: '80 / 20 rule', body: 'Eat whole foods 80 % of the time; enjoy treats mindfully the rest.' },
  ],
  over: [
    { title: 'Volume eating', body: 'Fill half your plate with salad, sabzi or soup — lots of food, few calories.' },
    { title: 'Protein-first meals', body: 'Start with dal, paneer, eggs, sprouts or chicken. It keeps hunger down all day.' },
    { title: 'Watch the hidden calories', body: '1 tbsp ghee/oil ≈ 125 kcal. Measure cooking oil and go easy on fried snacks.' },
    { title: 'Smart swaps', body: '2 rotis instead of 4, brown rice over white, roasted makhana over namkeen, chai with less sugar.' },
    { title: 'No liquid calories', body: 'Cut sugary drinks, juices and alcohol — the easiest 200–400 kcal to drop.' },
  ],
  obese: [
    { title: 'Portion control first', body: 'Use a smaller plate; 1 bowl rice or 2 rotis per meal; dal and sabzi can be generous.' },
    { title: 'High-fibre, high-protein', body: 'Sprouts, dal, salad, curd and eggs keep you full on fewer calories.' },
    { title: 'Remove liquid sugar entirely', body: 'Colas, sweet lassi and packaged juice are fast wins — switch to water, chaas or lemon water.' },
    { title: 'Plan your snacks', body: 'Keep fruit, roasted chana or makhana handy so you never reach for fried food when hungry.' },
    { title: 'Eat slowly', body: 'Take 20 minutes per meal. Fullness signals lag behind your fork.' },
  ],
};

export const HABITS: Record<Bucket, Tip[]> = {
  under: [
    { title: 'Sleep 8 hours', body: 'Muscle is built during recovery — protect your sleep.' },
    { title: 'Weigh in weekly', body: 'Same day, same time, after waking. Aim for +0.25–0.5 kg / week.' },
  ],
  healthy: [
    { title: 'Sleep 7–9 hours', body: 'Poor sleep raises hunger hormones and cravings.' },
    { title: 'Check in weekly', body: 'A quick weekly weigh-in catches drift early.' },
  ],
  over: [
    { title: 'Sleep 7–9 hours', body: 'Short sleep makes a deficit much harder to stick to.' },
    { title: 'Log everything for 2 weeks', body: 'Awareness alone typically cuts 10–15 % of intake.' },
    { title: 'Weigh in weekly', body: 'Look at the trend, not single days — water weight fluctuates.' },
  ],
  obese: [
    { title: 'Talk to a doctor', body: 'Get BP, sugar and thyroid checked before starting — and to track your progress safely.' },
    { title: 'Sleep 7–9 hours', body: 'Good sleep improves appetite control and energy for activity.' },
    { title: 'Celebrate non-scale wins', body: 'Better energy, looser clothes and more steps all count.' },
  ],
};

export const EXERCISE_NOTES: Record<Bucket, Tip[]> = {
  under: [
    { title: 'Progressive overload', body: 'Add a rep or a little weight each week on compound moves: squats, push-ups, rows.' },
    { title: 'Keep cardio light', body: 'Short walks are great; avoid long, intense cardio that burns your surplus.' },
  ],
  healthy: [
    { title: '150 minutes a week', body: 'WHO guideline: 150 min moderate cardio + 2 strength days.' },
    { title: 'Mix it up', body: 'Sports, cycling or dance count too — consistency beats intensity.' },
  ],
  over: [
    { title: 'Aim for 200–250 min / week', body: 'Brisk walking 40–45 min most days is enough to accelerate fat loss.' },
    { title: 'Keep strength training', body: '2 days of strength work preserves muscle while you lose fat.' },
  ],
  obese: [
    { title: 'Start low-impact', body: 'Walking, cycling and swimming protect your knees. Build from 20 to 45 minutes over weeks.' },
    { title: 'Move after meals', body: 'A 10-minute walk after each meal helps blood sugar and adds up to 30 minutes daily.' },
  ],
};

const W = (day: WorkoutDay['day'], kind: WorkoutDay['kind'], title: string, minutes: number): WorkoutDay => ({
  day,
  kind,
  title,
  minutes,
});

export const WORKOUTS: Record<Bucket, WorkoutDay[]> = {
  under: [
    W('Mon', 'strength', 'Full-body strength', 40),
    W('Tue', 'cardio', 'Easy walk', 20),
    W('Wed', 'strength', 'Full-body strength', 40),
    W('Thu', 'mobility', 'Yoga & stretching', 20),
    W('Fri', 'strength', 'Full-body strength', 40),
    W('Sat', 'cardio', 'Sport or walk', 30),
    W('Sun', 'rest', 'Rest & recover', 0),
  ],
  healthy: [
    W('Mon', 'cardio', 'Brisk walk / jog', 30),
    W('Tue', 'strength', 'Upper body + core', 40),
    W('Wed', 'cardio', 'Cycling or sport', 30),
    W('Thu', 'strength', 'Lower body + core', 40),
    W('Fri', 'cardio', 'HIIT or dance', 25),
    W('Sat', 'mobility', 'Yoga / long walk', 40),
    W('Sun', 'rest', 'Rest', 0),
  ],
  over: [
    W('Mon', 'cardio', 'Brisk walk', 45),
    W('Tue', 'strength', 'Full-body strength', 35),
    W('Wed', 'cardio', 'Cycling / elliptical', 40),
    W('Thu', 'cardio', 'Brisk walk', 45),
    W('Fri', 'strength', 'Full-body strength', 35),
    W('Sat', 'cardio', 'Sport, swim or hike', 45),
    W('Sun', 'mobility', 'Yoga & easy walk', 30),
  ],
  obese: [
    W('Mon', 'cardio', 'Walk (comfortable pace)', 25),
    W('Tue', 'strength', 'Chair squats, wall push-ups', 20),
    W('Wed', 'cardio', 'Walk or swim', 25),
    W('Thu', 'mobility', 'Gentle yoga / stretching', 20),
    W('Fri', 'cardio', 'Walk or cycle', 30),
    W('Sat', 'strength', 'Bands / bodyweight', 20),
    W('Sun', 'rest', 'Rest + post-meal walks', 0),
  ],
};
