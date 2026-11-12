/** kcal burned = MET × weight (kg) × duration (hours). */
export function kcalBurned(met: number, weightKg: number, minutes: number) {
  if (!(met > 0) || !(weightKg > 0) || !(minutes > 0)) return 0;
  return Math.round(met * weightKg * (minutes / 60));
}
