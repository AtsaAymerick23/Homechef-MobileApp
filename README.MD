# ICTU Student Grade Calculator

**Information & Communication Technology University**  
*Imparting ICTs in All Academic Disciplines · MMX*

---

##  App Overview

A fully functional Android application that calculates and exports student grades from Excel files or Google Sheets, designed with ICTU's official brand identity.

---

##  Features

### Input Methods
| Method | Description |
|--------|-------------|
|  Excel Upload | Browse and upload `.xlsx` or `.xls` files |
|  Google Sheets | Paste any publicly shared Google Sheets URL |

### Core Functionality
- **Automatic grade assignment** based on configurable score thresholds
- **9-tier grading scale**: A+, A, B+, B, C+, C, D+, D, F
- **Configurable thresholds** — saved persistently per device
- **Excel export** — Download results as formatted `.xlsx` file
- **Summary statistics** — Total students, average score, pass rate

### Required Spreadsheet Format
Your input file must contain these columns (in order):

| Column | Description |
|--------|-------------|
| `Student Name` | Full student name |
| `CA Score` | Continuous Assessment score |
| `Test Score` | Test/Exam score |
| `Total Score` | Combined total |

---

##  Design System

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary Navy | Deep Academic Blue | `#0B1F4B` |
| Gold Accent | University Gold | `#C9A227` |
| Secondary Orange | Crest Orange | `#E67E22` |
| Cream Background | Soft Academic | `#F5F1E6` |
| Success Green | Pass States | `#2E8B57` |
| Error Red | Validation | `#D64545` |

### Grade Badge Colors
| Grade | Color |
|-------|-------|
| A / A+ | Gold (#C9A227) |
| B / B+ | Navy (#0B1F4B) |
| C / C+ | Orange (#E67E22) |
| D / D+ | Brown (#A0785A) |
| F | Red (#D64545) |

---

## 🏗 Architecture

```
app/
├── ui/
│   ├── SplashActivity.kt         # Branded splash screen
│   ├── MainActivity.kt           # Input screen (Upload + Sheets)
│   ├── GradeConfigActivity.kt    # Configure grading thresholds
│   ├── ResultsActivity.kt        # Results table + export
│   └── adapter/
│       ├── GradeConfigAdapter.kt # Grade config RecyclerView
│       └── ResultsAdapter.kt     # Results table RecyclerView
├── viewmodel/
│   └── MainViewModel.kt          # ViewModel with LiveData
├── model/
│   ├── StudentRecord.kt          # Student data model
│   └── GradeThreshold.kt        # Grade threshold model
└── util/
    ├── GradeCalculator.kt        # Core grading logic
    ├── ExcelManager.kt           # Apache POI read/write
    ├── GoogleSheetsParser.kt     # CSV fetch + parse
    ├── PreferencesManager.kt     # SharedPreferences storage
    └── GradeBadgeHelper.kt       # Badge color utilities
```

---

##  Setup & Build

### Prerequisites
- Android Studio Hedgehog or newer
- Android SDK 34
- Kotlin 1.9.0
- Java 8+

### Build Steps

1. **Open Project**
   ```
   File → Open → Select ICTUGradeCalculator/ folder
   ```

2. **Sync Dependencies**
   - Android Studio will auto-sync Gradle
   - All dependencies download from Maven Central

3. **Run the App**
   ```
   Run → Run 'app' (Shift+F10)
   ```
   Or build an APK:
   ```
   Build → Build Bundle(s) / APK(s) → Build APK(s)
   ```

### Key Dependencies
```gradle
// Excel Processing
implementation 'org.apache.poi:poi:5.2.3'
implementation 'org.apache.poi:poi-ooxml:5.2.3'

// HTTP Client (Google Sheets)
implementation 'com.squareup.okhttp3:okhttp:4.12.0'

// Coroutines
implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'

// Material Design
implementation 'com.google.android.material:material:1.11.0'
```

---

##  Default Grading Scale

| Grade | Label | Minimum Score |
|-------|-------|---------------|
| A+ | Distinction | 90 |
| A | Excellent | 80 |
| B+ | Very Good | 75 |
| B | Good | 70 |
| C+ | Credit | 65 |
| C | Pass | 60 |
| D+ | Near Pass | 55 |
| D | Bare Pass | 50 |
| F | Fail | 0 |

> Thresholds are fully configurable via the ⚙ Configure button.

---

##  Google Sheets Setup

1. Open your Google Sheet
2. Click **Share** → **Anyone with the link** → **Viewer**
3. Copy the link (format: `https://docs.google.com/spreadsheets/d/{ID}/edit...`)
4. Paste into the app's Google Sheets URL field
5. Tap **Load Sheet**, then **Calculate Grades**

---

##  Output File

The exported `.xlsx` file contains:
- All original columns: Student Name, CA Score, Test Score, Total Score
- New **Grade** column with calculated grade
- Color-coded formatting
- Summary statistics row

File is saved to the app's Downloads folder and can be shared via any app (Gmail, WhatsApp, Google Drive, etc.)

---

##  Permissions

| Permission | Purpose |
|-----------|---------|
| `INTERNET` | Fetch Google Sheets |
| `READ_EXTERNAL_STORAGE` | Open Excel files |
| `WRITE_EXTERNAL_STORAGE` | Save output (Android ≤ 9) |

---

*ICTU Grade Calculator v1.0 · © 2024 Information & Communication Technology University*
