import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Stepper } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { getProfile, updateProfile, useSettings } from '@/data/profile-store';
import { addWeight } from '@/data/repos/activity-logs';
import { computeBmi } from '@/features/health/bmi';
import { lbToKg, round1, weightIn, weightUnit } from '@/features/health/units';
import { toDateKey } from '@/lib/date';
import { success } from '@/lib/feedback';

export default function LogWeight() {
  const db = useSQLiteContext();
  const { units } = useSettings();
  const profile = getProfile();
  const [value, setValue] = useState(() => weightIn(profile?.weightKg ?? 70, units));

  const kg = round1(units === 'imperial' ? lbToKg(value) : value);
  const valid = kg >= 25 && kg <= 350;

  const save = async () => {
    await addWeight(db, toDateKey(), kg);
    // Today's weigh-in becomes the current weight → BMI, calorie target and plan update everywhere.
    updateProfile({ weightKg: kg });
    success();
    router.back();
  };

  return (
    <Screen tab={false}>
      <AppText variant="body" color="textSecondary">
        Weigh in at the same time each week — ideally in the morning, before breakfast.
      </AppText>
      <Card>
        <Stepper value={value} onChange={setValue} step={units === 'imperial' ? 0.5 : 0.1} min={0} max={800} suffix={weightUnit(units)} />
      </Card>
      {profile && valid ? (
        <AppText variant="caption" center>
          New BMI: {computeBmi(kg, profile.heightCm)}
        </AppText>
      ) : null}
      <Button label="Save weigh-in" icon="check" size="lg" disabled={!valid} onPress={save} />
    </Screen>
  );
}
