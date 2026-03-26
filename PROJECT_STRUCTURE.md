# HomeChef Android App - Kotlin Project Structure

## Package: com.homechef.app

### Architecture: MVVM + Clean Architecture
- UI Layer: Jetpack Compose
- ViewModel: Android ViewModel + StateFlow
- Repository Pattern
- Supabase as backend

### Module Structure:
```
app/
├── src/main/
│   ├── AndroidManifest.xml
│   ├── java/com/homechef/app/
│   │   ├── MainActivity.kt
│   │   ├── HomeChefApp.kt
│   │   ├── data/
│   │   │   ├── model/          # Data classes
│   │   │   ├── repository/     # Repository implementations
│   │   │   └── remote/         # Supabase API clients
│   │   ├── domain/
│   │   │   ├── model/          # Domain models
│   │   │   └── usecase/        # Business logic
│   │   ├── ui/
│   │   │   ├── theme/          # Design system
│   │   │   ├── navigation/     # Nav graph
│   │   │   ├── components/     # Reusable composables
│   │   │   ├── auth/           # Login/Register screens
│   │   │   ├── home/           # Home feed
│   │   │   ├── meal/           # Meal detail
│   │   │   ├── myrecipes/      # User recipes
│   │   │   ├── experience/     # History + Badges
│   │   │   ├── leaderboard/    # Rankings
│   │   │   ├── quiz/           # Daily quiz
│   │   │   ├── events/         # Competitions
│   │   │   ├── settings/       # Profile/Settings
│   │   │   └── sidebar/        # Sidebar navigation
│   │   └── util/               # Extensions, helpers
│   └── res/
│       ├── values/
│       └── drawable/
├── build.gradle.kts
└── proguard-rules.pro
```
