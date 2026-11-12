# FitChecker: Project Documentation

> A fitness and calorie companion app. Users log food by quantity, track a daily calorie budget, and get a BMI-based remedy plan for getting fit.
> Built with **Expo SDK 57**, **Expo Router** and **expo-sqlite**. Mobile-first (iOS and Android), with a web build as a secondary target.

_Last updated: 2026-11-12 · Status: **v1 implemented** (see [Progress checklist](#12-progress-checklist))_

---

## Table of contents
1. [Product overview](#1-product-overview)
2. [Product decisions](#2-product-decisions)
3. [Tech stack](#3-tech-stack)
4. [Getting started](#4-getting-started)
5. [Folder structure](#5-folder-structure)
6. [Routing map](#6-routing-map)
7. [Data model and persistence](#7-data-model--persistence)
8. [Health formulas](#8-health-formulas)
9. [Coach (remedy) engine](#9-coach-remedy-engine)
10. [Design system](#10-design-system)
11. [Testing and quality gates](#11-testing--quality-gates)
12. [Progress checklist](#12-progress-checklist)
13. [Roadmap (next phases)](#13-roadmap-next-phases)
14. [Known limitations and gotchas](#14-known-limitations--gotchas)
15. [How-to recipes](#15-how-to-recipes)

---

## 1. Product overview

| Feature | What it does |
|---|---|
| **Onboarding** | A 4-step wizard: basics (name, sex, age) → body (height and weight, metric or imperial) → activity level → goal (+ optional target weight). |
| **Today dashboard** | An animated calorie ring showing kcal left (net of exercise), eaten/burned/target stats, macro bars, a water tracker and the top coach insights for the day. |
| **Food log** | Search **209 bundled foods** (Indian staples plus global), pick a unit (piece/bowl/cup/g…) and a quantity, with a live kcal and macro preview. Food is grouped by meal, with a date switcher. |
| **Custom foods** | Create foods from a nutrition label **per serving**. They are stored per 100 g and appear first in search. |
| **Exercise** | 27 activities with MET values. kcal burned = MET × kg × hours. Net calories = eaten − burned. |
| **Water** | Tap to add 250 ml glasses. Goal = 35 ml/kg, +500 ml on days with 30+ minutes of exercise. |
| **Progress** | A 7-day bar chart of intake against a target line, the daily average, days on target, kcal burned, and the weight history list with deltas. |
| **Coach** | BMI gauge, category and healthy weight range, plan headline, calorie/protein/water/ETA metrics, a weekly training schedule, and diet remedies, exercise guidance and daily habits. |
| **Profile** | Edit details, units toggle, BMI scale (WHO or Asian), manage custom foods, reset all data. |

---

## 2. Product decisions

| Topic | Decision | Why |
|---|---|---|
| Food data | Bundled local DB + user custom foods | Offline, instant, no API keys. Covers common Indian meals. |
| Storage | On-device only: `expo-sqlite` (logs) + `expo-sqlite/kv-store` (profile/settings) | Private, no login, fast to ship. |
| Remedies | **Rule-based** engine behind a `CoachProvider` interface | Deterministic, explainable and free. An AI coach can be plugged in later. |
| Look | **Dark-first neon**: charcoal base, electric-lime accent, bold numerals | "Elegant, smart, bold." |
| Units | Metric default, Imperial toggle. **Always stored as metric** | One source of truth. Conversion happens only at the edges. |
| v1 extras | Weight history (list), water tracker, weekly calorie chart, exercise logging | Agreed scope. A weight trend *chart* is deferred. |
| Tests | Jest (`jest-expo`) on all pure domain logic | Calculation bugs are the costly ones. |

---

## 3. Tech stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Expo (CNG, so no `ios/` or `android/` folders are committed) | SDK 57 (`expo ~57.0.32`) |
| Runtime | React Native / React | 0.86.3 / 19.2.3, React Compiler enabled |
| Navigation | Expo Router: root `Stack` + `NativeTabs` (native), `expo-router/ui` Tabs (web) | `~57.0.30` |
| Persistence | `expo-sqlite` (SQL + `kv-store`) | `~57.0.4` |
| Graphics | `react-native-svg` + `react-native-reanimated` | 15.15.4 / 4.5.1 |
| Icons | `expo-symbols`: SF Symbols on iOS, Material Symbols on Android and web | `~57.0.3` |
| Fonts | `@expo-google-fonts/space-grotesk` (display) + system font (body) | `^0.4.1` |
| Haptics | `expo-haptics` | `~57.0.3` |
| Tests | `jest-expo` + Jest 29 | `~57.0.6` |
| Lint | ESLint 9 + `eslint-config-expo` | |

No extra state library is used. Global state is `useSyncExternalStore` over the kv-store plus a small invalidation bus.

---

## 4. Getting started

```bash
npm install
npx expo start            # press i / a / w for iOS / Android / web
npm test                  # Jest unit tests (domain logic)
npx tsc --noEmit          # typecheck   (also: npm run typecheck)
npx expo lint             # lint
npx expo-doctor           # dependency / config health
```

* Install packages **only** with `npx expo install <pkg>` so you get SDK-compatible versions.
* Every native module used (sqlite, svg, haptics, symbols, reanimated) ships in Expo Go for SDK 57. If you add a library with custom native code, you need a dev build: `npx expo run:android` or `eas build --profile development`.
* Build and ship: `npx eas-cli@latest build`, `… submit`, `… update` (OTA).

---

## 5. Folder structure

```
src/
  app/                          # ROUTES ONLY (every file is a screen)
    _layout.tsx                 # Root Stack, fonts, SQLiteProvider (+ migrations), nav theme
    onboarding.tsx              # 4-step wizard
    (tabs)/
      _layout.tsx               # Onboarding gate → <AppTabs/>
      index.tsx                 # Today
      log.tsx                   # Food + exercise log
      progress.tsx              # Weekly chart + weight history
      coach.tsx                 # BMI + remedy plan
      profile.tsx               # Settings, custom foods, reset
    add-food.tsx                # modal
    add-exercise.tsx            # modal
    custom-food.tsx             # modal
    log-weight.tsx              # modal
    edit-profile.tsx            # modal
  features/                     # PURE DOMAIN LOGIC: no React / RN imports, fully unit-tested
    health/   types.ts bmi.ts energy.ts macros.ts units.ts
    food/     types.ts food-db.ts nutrition.ts search.ts
    exercise/ activities.ts burn.ts
    coach/    types.ts rules.ts rule-coach.ts
    */__tests__/*.test.ts
  data/                         # Persistence
    db.ts                       # schema migrations (PRAGMA user_version), wipe
    events.ts                   # invalidate() + useDataVersion()
    profile-store.ts            # kv-store backed profile/settings + hooks
    repos/ food-log.ts activity-logs.ts custom-foods.ts
  hooks/
    use-query.ts                # useDbQuery: async read, re-runs on invalidate()
    use-fit-data.ts             # usePlan, useDay, useWeek, useWeights, useAllFoods, `coach`
    use-theme.ts                # palette (dark-first)
  components/
    ui/        text, icon, card, button, controls (Chip, Segmented, OptionCard, Field, Stepper, ProgressBar), screen
    charts/    calorie-ring, macro-bars, week-bars, bmi-gauge
    dashboard.tsx               # Stat, WaterCard, InsightCard, GoalBar
    profile-form.tsx            # shared by onboarding + edit-profile (draft ⇄ metric conversion, validation)
    app-tabs.tsx / .web.tsx     # native tabs / web floating tab bar
  constants/theme.ts            # design tokens
  lib/ date.ts feedback.ts routes.ts
metro.config.js                 # wasm + COOP/COEP headers for expo-sqlite on web
PROJECT_DOCS.md                 # ← this file
```

**Layering rule:** `app/` → `components/` + `hooks/` → `data/` + `features/`. `features/` imports nothing from the layers above it.

---

## 6. Routing map

| URL | File | Presentation |
|---|---|---|
| `/` | `(tabs)/index.tsx` | Tab: Today |
| `/log` | `(tabs)/log.tsx` | Tab: Log |
| `/progress` | `(tabs)/progress.tsx` | Tab: Progress |
| `/coach` | `(tabs)/coach.tsx` | Tab: Coach |
| `/profile` | `(tabs)/profile.tsx` | Tab: Profile |
| `/onboarding` | `onboarding.tsx` | Full screen, no back gesture |
| `/add-food?date=&meal=` | `add-food.tsx` | Modal |
| `/add-exercise?date=` | `add-exercise.tsx` | Modal |
| `/custom-food` | `custom-food.tsx` | Modal |
| `/log-weight` | `log-weight.tsx` | Modal |
| `/edit-profile` | `edit-profile.tsx` | Modal |

* **Onboarding gate:** `(tabs)/_layout.tsx` redirects to `/onboarding` when no profile exists.
* **Native tabs** import from `expo-router/unstable-native-tabs` (correct for SDK 57). This path **changes to `expo-router/native-tabs` in SDK 58**.
* Android allows at most **5 tabs**, and this app uses all 5.

---

## 7. Data model and persistence

### SQLite (`fitchecker.db`): schema v1
| Table | Columns | Notes |
|---|---|---|
| `food_log` | id, date `YYYY-MM-DD`, meal, food_id, food_name, unit, quantity, grams, kcal, protein, carbs, fat, created_at | Nutrition is **snapshotted** at log time, so editing or deleting a food never rewrites history. Indexed by date. |
| `exercise_log` | id, date, activity_id, name, minutes, kcal, created_at | kcal snapshotted using the weight at log time. |
| `water_log` | date (PK), ml | Upsert with `ON CONFLICT`, never below 0. |
| `weight_log` | id, date, kg, note, created_at | A starting weight is inserted at onboarding. |
| `custom_food` | id, name, kcal, protein, carbs, fat (per 100 g), units_json, default_unit, created_at | |

**Migrations:** `src/data/db.ts`, using `PRAGMA user_version`. To change the schema, **append** a new SQL string to `MIGRATIONS` and never edit an applied one.

### Key-value store (`expo-sqlite/kv-store`)
* `fitchecker.profile.v1`: `Profile { name, sex, birthYear, heightCm, weightKg, activity, goal, targetWeightKg? }`
* `fitchecker.settings.v1`: `Settings { units: 'metric'|'imperial', bmiScale: 'who'|'asian' }`

### Reactivity
* Repos call `invalidate()` after every write. `useDbQuery` subscribes to `useDataVersion()` and re-queries.
* Profile and settings use `useSyncExternalStore`, so every screen updates instantly.
* **Weight logging updates `profile.weightKg`**, so BMI, the calorie target, macros and the plan all recompute everywhere.

---

## 8. Health formulas

All formulas are in `src/features/health/*` and covered by unit tests.

| Metric | Formula | Source |
|---|---|---|
| BMI | kg / m², rounded to 0.1 | WHO |
| BMI categories (WHO) | <18.5 under · 18.5–24.9 healthy · 25–29.9 over · 30 / 35 / 40 obese I / II / III | WHO |
| BMI categories (Asian) | <18.5 · 18.5–22.9 · 23–27.4 · 27.5 / 32.5 / 37.5 | WHO expert consultation, Lancet 2004 |
| Healthy weight range | BMI 18.5 → (overweight cut-off − 0.1) × h² | |
| BMR | Mifflin-St Jeor: 10·kg + 6.25·cm − 5·age + 5 (male) / −161 (female) | Mifflin et al., 1990 |
| TDEE | BMR × {1.2, 1.375, 1.55, 1.725, 1.9} | Standard activity factors |
| Calorie target | lose: TDEE − 500 (−750 for obese II/III) · maintain: TDEE · gain: TDEE + 300. Rounded to 10. | |
| Safety floor | target ≥ max(BMR, 1200 ♀ / 1500 ♂). Sets `clamped=true` | |
| Weekly rate | (target − TDEE) × 7 / 7700 kg | ~7700 kcal per kg of fat |
| ETA | ⌈(target weight − weight) / weekly rate⌉ weeks. `null` if the goal heads the wrong way | |
| Protein | 1.6 g/kg (2.0 when losing), capped at 35 % of kcal | ISSN position stand |
| Fat / carbs | 25 % of kcal / remainder | |
| Water | 35 ml × kg (+500 ml with ≥30 min exercise), rounded to 250 ml | |
| Food | grams = qty × gramsPerUnit; value = grams / 100 × per-100 g value | |
| Exercise | kcal = MET × kg × hours | 2024 Adult Compendium of Physical Activities |

Food values (per 100 g) are approximations of typical home-style preparations, compiled from **USDA FoodData Central** and **IFCT 2017**.

---

## 9. Coach (remedy) engine

**Contract** (`src/features/coach/types.ts`):
```ts
interface CoachProvider {
  buildPlan(ctx: CoachContext): Plan;                         // profile + settings → full plan
  dailyInsights(plan: Plan, day: DaySummary, hour?): Insight[]; // today's log → nudges
}
```
The active coach is exported once from `src/hooks/use-fit-data.ts` (`export const coach = RuleCoach`). To replace it, change that line.

### Plan rules (`rules.ts`, `rule-coach.ts`)
BMI category maps to one of 4 buckets: **under / healthy / over / obese**. Each bucket has its own:
* **Headline**, **diet remedies** (with Indian food examples), **7-day workout schedule**, **exercise notes**, **habits** and a **steps target** (sedentary obese users start at 5k steps).
* **Recommended goal**: under → gain, healthy → maintain, over/obese → lose.
* **Safety override:** an underweight user who picks "lose" gets a **gain** plan (`goalAdjusted=true`, explained in the UI).
* **Target weight** (when the user doesn't set one): over/obese → BMI (overweight cut-off − 0.6); under → BMI 20; healthy+lose → max(healthy min + 1, weight − 3); healthy+gain → min(healthy max, weight + 3).
* A sedentary user also gets a "break up sitting" tip.
* If the chosen goal can't reach the target (e.g. overweight + gain), the summary suggests the recommended goal, and the Coach screen offers a one-tap switch.

### Daily insights (evaluated against the current hour)
| id | Trigger | Tone |
|---|---|---|
| `first-log` | no food logged | info |
| `over-budget` | net kcal > target + 100 | warn |
| `under-gain` | gain plan, after 19:00, > 400 kcal left | warn |
| `on-target` | after 18:00, within ±10 % of target | good |
| `protein-low` | after 16:00, < 50 % of protein target | warn |
| `water-behind` | after 15:00, < 50 % of water goal | info |
| `move` | after 18:00, no exercise | info |
| `active-day` | ≥ 30 active minutes | good |
| `steady` | fallback | good |

A health disclaimer is shown on the Coach screen and in the Profile footer.

---

## 10. Design system

**Direction:** dark-first neon. Elegant, smart, bold. Tokens are in `src/constants/theme.ts`.

| Token | Dark | Use |
|---|---|---|
| `background` | `#0B0C0F` | page |
| `backgroundElement` | `#15171C` | cards |
| `backgroundSelected` | `#22252C` | inputs, chips, secondary buttons |
| `text` / `textSecondary` / `textMuted` | `#F5F7FA` / `#9AA0AA` / `#5C626C` | |
| `accent` | **`#C6FF3D`** (electric lime) | primary actions, ring, highlights |
| `protein` / `carbs` / `fat` | `#3DDCFF` / `#FFB547` / `#FF5FA2` | macros |
| `water` / `burn` | `#4D9CFF` / `#FF7A45` | water, exercise |
| `good` / `warn` / `danger` | `#4ADE80` / `#FBBF24` / `#F87171` | status |
| `hairline` | `rgba(255,255,255,0.10)` | card borders |

A light palette also exists and is used when the OS is in light mode. Dark is the hero theme.

* **Type:** Space Grotesk 700/600/500 for display, headings and numerals (`AppText` variants `hero` 56, `display` 36, `h1` 28, `h2` 20, `number` 22). System font for body text. Numerals use tabular figures.
* **Spacing:** 4-pt scale (`Spacing.one…six`). **Radius:** `sm 12 · md 16 · lg 24 · pill`.
* **Motion:** a Reanimated ring fill (900 ms ease-out cubic), a press-scale on buttons and cards (0.92–0.98), and haptics (selection on tap, success on save) on native only.
* **Accessibility:** buttons carry `accessibilityRole` and labels, charts expose text summaries, controls expose selected/checked/expanded state, and touch targets are ≥ 40 px.
* **Layout:** content max width is 640 px and centered, so it looks good on web and tablets too.

---

## 11. Testing and quality gates

`npm test` runs **40 unit tests** across 4 suites:

| Suite | Covers |
|---|---|
| `health.test.ts` | BMI and category boundaries (WHO + Asian), healthy range, Mifflin-St Jeor values, TDEE, lose/maintain/gain targets, calorie floor clamp, ETA, macros and protein cap, water, unit round-trips and formatting |
| `food.test.ts` | DB integrity (unique ids, sane values), unit→grams, **2 roti + 1 bowl dal = 458 kcal**, fractional qty, label→per-100 g, pluralisation, search ranking |
| `burn.test.ts` | MET formula, invalid input, activity ids |
| `coach.test.ts` | Plan per bucket, obese II deficit, underweight safety override, Asian scale, wrong-direction goal, every daily insight trigger |

**Definition of done for any change:** `npm test` · `npx tsc --noEmit` · `npx expo lint` all green, and `npx expo-doctor` clean after any dependency change.

Last verified (2026-11-12): tests 40/40 pass, tsc clean, lint clean, expo-doctor 21/21, and `expo export` bundles for both Android and web.

---

## 12. Progress checklist

- [x] Phase 1: Foundation (deps, design tokens, fonts, UI kit, root Stack + tabs + modals, SQLite migrations, kv-store profile)
- [x] Phase 2: Domain logic + unit tests (health, food, exercise, coach)
- [x] Phase 3: Onboarding + Profile (edit, units, BMI scale, reset)
- [x] Phase 4: Food logging (209-food DB, Add Food modal, Log screen, custom foods)
- [x] Phase 5: Today dashboard (calorie ring, macros, water, insights)
- [x] Phase 6: Exercise + Progress (activity logging, weekly chart, weight history)
- [x] Phase 7: Coach screen (BMI gauge, plan metrics, weekly training, remedies, habits)
- [x] Phase 8: Docs + polish (this file, empty states, haptics, a11y labels, web tab bar)
- [ ] Manual QA pass on physical iOS and Android devices (see [§15 QA script](#manual-qa-script))
- [ ] Custom app icon and splash artwork (the template images are still in `assets/images`)

---

## 13. Roadmap (next phases)

| Phase | Item | Notes |
|---|---|---|
| 2 | **AI coach (Claude)** | Implement `CoachProvider` with an LLM for personalised meal ideas and conversational coaching. **Needs a small backend proxy** (never ship an API key in the app). Keep `RuleCoach` as the offline fallback and for safety rails (calorie floor, underweight override). |
| 2 | Weight trend chart | Line chart over `weight_log` with a 7-day moving average and goal line. |
| 2 | Edit logged items | Tap a log row to change quantity or unit. |
| 2 | Reminders | `expo-notifications` for meal, water and weigh-in nudges. |
| 3 | Barcode scan | `expo-camera` + Open Food Facts lookup into custom foods. |
| 3 | Online food search | Fall back to an API when the local DB misses. |
| 3 | Cloud sync + accounts | Supabase/Firebase. Migrate local data on first sign-in. |
| 3 | Health platform sync | Apple Health / Health Connect for steps and workouts. |
| 3 | Meal templates / favourites | One-tap "my usual breakfast". |

---

## 14. Known limitations and gotchas

* **expo-sqlite on web is alpha.** It needs `metro.config.js` (wasm asset + COOP/COEP headers, already configured) and a host that sends those headers in production. Web is a secondary target.
* `app.json → web.output` is **`single`** (SPA). Static rendering was turned off because the kv-store is read synchronously at module load.
* **Typed routes:** the generator lists the Today tab as `/index`. We navigate with `HOME_HREF` (`src/lib/routes.ts`), which is the canonical `/`.
* **Native tabs import path** changes at SDK 58 (`expo-router/native-tabs`). Update `src/components/app-tabs.tsx` when upgrading.
* TypeScript 6 doesn't auto-include `@types/*`, so `tsconfig.json` sets `"types": ["jest"]`.
* Food values are **typical estimates**. Home recipes vary, so users should create custom foods for precision.
* Age is stored as `birthYear` (computed from the age entered), so it can be off by up to 1 year around birthdays.
* Day boundaries use the **device's local time zone**.

---

## 15. How-to recipes

**Add a food to the bundled DB:** append an `f(id, name, category, kcal, protein, carbs, fat, 'unit:grams,…')` line to `src/features/food/food-db.ts`, with values per 100 g and the first unit as the default. Ids must be unique (a test enforces it).

**Add an activity:** append to `ACTIVITIES` in `src/features/exercise/activities.ts` with a Compendium MET value.

**Change a schema:** append a migration string in `src/data/db.ts → MIGRATIONS`.

**Tune the coach:** edit the copy and tables in `src/features/coach/rules.ts`, and thresholds and logic in `rule-coach.ts`. Update `coach.test.ts`.

**Add an icon:** add `{ ios: <SF Symbol>, md: <Material Symbol> }` to `ICONS` in `src/components/ui/icon.tsx`. Both names are type-checked.

**Swap in an AI coach:** create `src/features/coach/ai-coach.ts` implementing `CoachProvider`, then change `export const coach = …` in `src/hooks/use-fit-data.ts`. Because `buildPlan` is synchronous, an AI provider should precompute or cache its plan, or the contract should be made async with a loading state.

### Manual QA script
1. Fresh install → onboarding: try an invalid age or height (an error shows), toggle imperial mid-way (values convert), finish → the Today screen loads.
2. Log **2 Roti** (Breakfast) + **1 bowl Dal Tadka** (Lunch). Eaten = **458 kcal** and the ring updates.
3. Add **Brisk walking 30 min**. Burned ≈ 4.3 × kg × 0.5. Kcal left goes up and the water goal goes up by 500 ml.
4. Tap water + three times → 750 ml.
5. Log a new weight → the BMI, plan and Coach metrics update. The Progress list shows the delta.
6. Profile → Imperial → every weight and height display switches. BMI scale → Asian → the category may change.
7. Create a custom food → it shows up first in search and logs correctly.
8. Kill and relaunch the app → all data persists. Reset all data → you land back on onboarding.
