import { Redirect, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { View } from 'react-native';

import {
  ActivityPicker,
  BasicsFields,
  BodyFields,
  convertDraftUnits,
  draftFromProfile,
  GoalPicker,
  validateDraft,
  type ProfileDraft,
} from '@/components/profile-form';
import { Button } from '@/components/ui/button';
import { Screen, SectionHeader } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { getProfile, saveProfile, updateSettings, useSettings } from '@/data/profile-store';
import { addWeight } from '@/data/repos/activity-logs';
import type { Profile } from '@/features/health/types';
import { toDateKey } from '@/lib/date';
import { success } from '@/lib/feedback';

export default function EditProfileRoute() {
  const profile = getProfile();
  if (!profile) return <Redirect href="/onboarding" />;
  return <EditProfile profile={profile} />;
}

function EditProfile({ profile }: { profile: Profile }) {
  const db = useSQLiteContext();
  const { units } = useSettings();
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromProfile(profile, units));
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<ProfileDraft>) => {
    setError(null);
    setDraft((d) => ({ ...d, ...patch }));
  };

  const save = async () => {
    const res = validateDraft(draft, units);
    if (!res.ok) return setError(res.error);
    const prev = getProfile();
    saveProfile(res.profile);
    // Record a weigh-in when the weight changed so history stays accurate.
    if (prev && Math.abs(prev.weightKg - res.profile.weightKg) >= 0.1) {
      await addWeight(db, toDateKey(), res.profile.weightKg, 'Profile update');
    }
    success();
    router.back();
  };

  return (
    <Screen tab={false}>
      <BasicsFields draft={draft} set={set} />
      <SectionHeader title="Body" />
      <BodyFields
        draft={draft}
        set={set}
        units={units}
        onUnitsChange={(u) => {
          setDraft((d) => convertDraftUnits(d, u));
          updateSettings({ units: u });
        }}
      />
      <SectionHeader title="Activity" />
      <ActivityPicker draft={draft} set={set} />
      <SectionHeader title="Goal" />
      <GoalPicker draft={draft} set={set} units={units} />
      {error ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
      <View style={{ marginTop: Spacing.two }}>
        <Button label="Save changes" icon="check" size="lg" onPress={save} />
      </View>
    </Screen>
  );
}
