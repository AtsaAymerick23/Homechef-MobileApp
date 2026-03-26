# HomeChef — Android User Panel (Kotlin)

A fully functional Android user panel for **HomeChef**, a gamified Cameroonian culinary discovery app. Built with Kotlin + Jetpack Compose + Supabase.

---

## 📁 Project Structure

```
HomeChef/
├── app/
│   ├── build.gradle.kts                    # App-level Gradle config
│   ├── proguard-rules.pro                  # Release ProGuard rules
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/homechef/app/
│       │   ├── HomeChefApp.kt              # Application class (Hilt)
│       │   ├── MainActivity.kt             # Single-activity entry point
│       │   ├── data/
│       │   │   ├── model/
│       │   │   │   └── Models.kt           # All @Serializable data classes
│       │   │   └── repository/
│       │   │       ├── AuthRepository.kt
│       │   │       ├── MealRepository.kt
│       │   │       ├── UserRepository.kt
│       │   │       ├── QuizRepository.kt
│       │   │       └── OtherRepositories.kt (Events, Leaderboard, RecipeOfTheDay)
│       │   ├── di/
│       │   │   ├── SupabaseModule.kt       # Hilt: Supabase client + plugins
│       │   │   └── RepositoryModule.kt     # Hilt: Repository bindings
│       │   ├── service/
│       │   │   └── HomeChefFirebaseMessagingService.kt
│       │   └── ui/
│       │       ├── theme/
│       │       │   └── Theme.kt            # Brand colors, typography, spacing
│       │       ├── navigation/
│       │       │   └── NavGraph.kt         # Full nav graph with all routes
│       │       ├── components/
│       │       │   └── Components.kt       # MealCard, DifficultyBadge, etc.
│       │       ├── shell/
│       │       │   ├── AppShell.kt         # Fixed sidebar + header layout
│       │       │   └── ShellViewModel.kt
│       │       ├── auth/
│       │       │   ├── AuthViewModel.kt
│       │       │   ├── LoginScreen.kt
│       │       │   └── RegisterAndOnboardingScreens.kt
│       │       ├── home/
│       │       │   └── HomeScreen.kt       # Hero carousel + infinite feed
│       │       ├── meal/
│       │       │   └── MealDetailScreen.kt # Full detail + MyAssistant sheet
│       │       ├── quiz/
│       │       │   └── QuizScreen.kt       # 10-question daily quiz
│       │       ├── leaderboard/
│       │       │   └── LeaderboardScreen.kt # Podium + rankings
│       │       ├── events/
│       │       │   └── EventsScreen.kt
│       │       ├── experience/
│       │       │   └── ExperienceScreen.kt # History + Badges grid
│       │       ├── settings/
│       │       │   └── SettingsScreen.kt   # Profile, language, logout
│       │       └── other/
│       │           └── OtherScreens.kt     # MyRecipes, RecipeOfDay, About
│       └── res/
│           └── values/
│               ├── colors.xml
│               ├── strings.xml
│               └── themes.xml
├── gradle/
│   └── libs.versions.toml                  # Version catalog (all deps)
├── build.gradle.kts                        # Root Gradle
└── settings.gradle.kts
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Architecture | MVVM + Clean Architecture |
| DI | Hilt |
| Backend | Supabase (Auth, Postgrest, Storage, Functions, Realtime) |
| HTTP | Ktor |
| Images | Coil 3 |
| Navigation | Compose Navigation |
| Serialization | Kotlinx Serialization |
| Video | ExoPlayer (Media3) |
| Notifications | Firebase Cloud Messaging |
| State | StateFlow + Coroutines |

---

## ⚙️ Setup Instructions

### 1. Clone & Open in Android Studio

```bash
git clone <your-repo>
cd HomeChef
```

Open in **Android Studio Hedgehog** or later.

### 2. Configure Supabase (already set via BuildConfig)

The Supabase credentials are embedded in `app/build.gradle.kts`:

```kotlin
buildConfigField("String", "SUPABASE_URL", "\"https://lsjdphoifnpuywfwytho.supabase.co\"")
buildConfigField("String", "SUPABASE_ANON_KEY", "\"eyJ...\"")
```

> ⚠️ For production, move secrets to `local.properties` or a CI secrets manager.

### 3. Add Google Services (Firebase)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project → Add Android app with package `com.homechef.app`
3. Download `google-services.json` → place in `app/`
4. Add Firebase Messaging to `build.gradle.kts`:

```kotlin
implementation(platform("com.google.firebase:firebase-bom:33.0.0"))
implementation("com.google.firebase:firebase-messaging-ktx")
```

Add to root `build.gradle.kts`:
```kotlin
alias(libs.plugins.google.services) apply false
```

### 4. Add Google OAuth Redirect URI

In Supabase Dashboard → Authentication → URL Configuration:
```
io.supabase.homechef://login-callback
```

### 5. Supabase Database

Run the full schema from the PRD (Section 3) in your Supabase SQL editor. Ensure Row-Level Security (RLS) policies are in place per Section 12.

### 6. Supabase Edge Functions

Deploy the 5 edge functions from Section 10:
```bash
supabase functions deploy calculateCookingPlan
supabase functions deploy generateSimilarRecipes
supabase functions deploy generateAIQuizQuestions
supabase functions deploy awardChefPoints
supabase functions deploy sendPushNotification
```

### 7. Supabase Storage Buckets

Create these public/private buckets in your Supabase dashboard:
- `profile-pictures` — user avatars
- `meal-images` — meal hero images
- `event-submissions` — competition videos

### 8. Build & Run

```bash
./gradlew assembleDebug
```

---

## 🗺 Screen Map

| Route | Screen | Description |
|---|---|---|
| `login` | LoginScreen | Email + Google OAuth sign-in |
| `register` | RegisterScreen | Account creation |
| `onboarding` | OnboardingScreen | Language selection (EN/FR) |
| `home` | HomeScreen | Hero carousel + infinite meal feed |
| `meal/{id}` | MealDetailScreen | Full recipe, video, MyAssistant |
| `my_recipes` | MyRecipesScreen | User-created recipes |
| `create_recipe` | CreateRecipeScreen | Recipe creation form |
| `recipe_of_the_day` | RecipeOfTheDayScreen | Daily featured recipe |
| `about_us` | AboutScreen | Developer profiles + mission |
| `events` | EventsScreen | Cooking competitions |
| `quiz` | QuizScreen | 10-question daily quiz |
| `experience` | ExperienceScreen | History + Badges |
| `leaderboard` | LeaderboardScreen | Global ChefPoints ranking |
| `settings` | SettingsScreen | Profile, language, logout |

---

## 🎮 Gamification Logic

| Action | Points |
|---|---|
| Cook a new recipe (first time) | +3 ChefPoints |
| Each correct quiz answer | +1 ChefPoint |
| All 10 quiz answers correct | +5 bonus ChefPoints |
| Win community event | +50 ChefPoints |
| Submit event entry | +2 ChefPoints |

Badge thresholds: Sous Chef (25 pts), Chef de Partie (100 pts), Head Chef (500 pts).

---

## 🌐 Bilingual Support

All user-facing content uses `EN`/`FR` variants stored in Supabase. The language preference is:
1. Set during onboarding
2. Persisted to `users.language` via Supabase
3. Toggled at any time from the header globe icon or Settings

---

## 💰 Currency

All costs are displayed in **XAF (CFA Francs)**. All cost calculations are performed server-side via the `calculateCookingPlan` Supabase Edge Function — never on the client.

---

## 🔒 Security Notes

- JWT tokens managed automatically by Supabase Auth SDK
- Row-Level Security enforced on all sensitive tables
- Admin routes are completely absent from the mobile build
- User-generated content stored in Supabase Storage with signed URLs
- Secrets should be moved to `local.properties` before production release

---

## 📱 Minimum Requirements

- **minSdk**: 26 (Android 8.0)
- **targetSdk**: 35 (Android 15)
- **Kotlin**: 2.1.0
- **Android Studio**: Hedgehog (2023.1.1) or newer
