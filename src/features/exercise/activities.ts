/**
 * MET values from the 2024 Adult Compendium of Physical Activities (rounded).
 * kcal burned = MET × body weight (kg) × hours.
 */
export interface Activity {
  id: string;
  name: string;
  met: number;
  kind: 'cardio' | 'strength' | 'sport' | 'mobility' | 'daily';
}

export const ACTIVITIES: Activity[] = [
  { id: 'walk-slow', name: 'Walking (easy)', met: 3.0, kind: 'cardio' },
  { id: 'walk-brisk', name: 'Brisk walking', met: 4.3, kind: 'cardio' },
  { id: 'jog', name: 'Jogging', met: 7.0, kind: 'cardio' },
  { id: 'run', name: 'Running (10 km/h)', met: 9.8, kind: 'cardio' },
  { id: 'cycle-easy', name: 'Cycling (leisure)', met: 4.0, kind: 'cardio' },
  { id: 'cycle-moderate', name: 'Cycling (moderate)', met: 6.8, kind: 'cardio' },
  { id: 'swim', name: 'Swimming laps', met: 5.8, kind: 'cardio' },
  { id: 'skipping', name: 'Skipping rope', met: 11.8, kind: 'cardio' },
  { id: 'elliptical', name: 'Elliptical trainer', met: 5.0, kind: 'cardio' },
  { id: 'rowing', name: 'Rowing machine', met: 7.0, kind: 'cardio' },
  { id: 'stairs', name: 'Stair climbing', met: 8.8, kind: 'cardio' },
  { id: 'hiit', name: 'HIIT / circuit', met: 8.0, kind: 'cardio' },
  { id: 'dance', name: 'Dance / Zumba', met: 6.5, kind: 'cardio' },
  { id: 'hike', name: 'Hiking', met: 6.0, kind: 'cardio' },
  { id: 'weights-light', name: 'Strength training (light)', met: 3.5, kind: 'strength' },
  { id: 'weights-hard', name: 'Strength training (vigorous)', met: 6.0, kind: 'strength' },
  { id: 'bodyweight', name: 'Push-ups, squats (bodyweight)', met: 3.8, kind: 'strength' },
  { id: 'yoga', name: 'Yoga (hatha)', met: 2.5, kind: 'mobility' },
  { id: 'power-yoga', name: 'Power yoga / Surya namaskar', met: 4.0, kind: 'mobility' },
  { id: 'pilates', name: 'Pilates', met: 3.0, kind: 'mobility' },
  { id: 'badminton', name: 'Badminton', met: 5.5, kind: 'sport' },
  { id: 'cricket', name: 'Cricket', met: 4.8, kind: 'sport' },
  { id: 'football', name: 'Football', met: 7.0, kind: 'sport' },
  { id: 'basketball', name: 'Basketball', met: 6.5, kind: 'sport' },
  { id: 'tennis', name: 'Tennis', met: 7.3, kind: 'sport' },
  { id: 'chores', name: 'Household chores', met: 3.3, kind: 'daily' },
  { id: 'gardening', name: 'Gardening', met: 3.8, kind: 'daily' },
];

export const getActivity = (id: string) => ACTIVITIES.find((a) => a.id === id);
