import { ACTIVITIES, getActivity } from '../activities';
import { kcalBurned } from '../burn';

describe('exercise burn', () => {
  it('uses MET × kg × hours', () => {
    // brisk walk 4.3 MET, 70 kg, 30 min → 150.5
    expect(kcalBurned(4.3, 70, 30)).toBe(151);
    expect(kcalBurned(9.8, 80, 60)).toBe(784);
  });

  it('returns 0 for invalid input', () => {
    expect(kcalBurned(4, 70, 0)).toBe(0);
    expect(kcalBurned(4, 0, 30)).toBe(0);
  });

  it('has unique activity ids', () => {
    expect(new Set(ACTIVITIES.map((a) => a.id)).size).toBe(ACTIVITIES.length);
    expect(getActivity('run')?.met).toBe(9.8);
  });
});
