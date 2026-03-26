package com.homechef.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ─── Brand Colors ─────────────────────────────────────────────────────────────

val HomePrimary = Color(0xFF7A3B22)       // Rich brown
val HomePrimaryDark = Color(0xFF5A2A1A)   // Dark brown
val HomeAccent = Color(0xFFE78A2F)        // Orange accent
val HomeBackground = Color(0xFFF5EDE3)    // Warm cream
val HomeSurface = Color(0xFFFFFFFF)       // White surface
val HomeOnPrimary = Color(0xFFFFFFFF)
val HomeOnBackground = Color(0xFF1C1B1F)
val HomeOnSurface = Color(0xFF1C1B1F)
val HomeError = Color(0xFFBA1A1A)

// Brand wordmark colors
val HomeWordmarkHome = Color(0xFF9B3615)  // 'Home' part
val HomeWordmarkChef = Color(0xFFEAB40D) // 'Chef' part

// Difficulty badge colors
val DifficultyEasy = Color(0xFF4CAF50)
val DifficultyMedium = Color(0xFFFF9800)
val DifficultyHard = Color(0xFFF44336)

// Leaderboard medal colors
val GoldColor = Color(0xFFFFD700)
val SilverColor = Color(0xFFC0C0C0)
val BronzeColor = Color(0xFFCD7F32)

// ─── Color Scheme ─────────────────────────────────────────────────────────────

private val LightColorScheme = lightColorScheme(
    primary = HomePrimary,
    onPrimary = HomeOnPrimary,
    primaryContainer = Color(0xFFFFDBCA),
    onPrimaryContainer = Color(0xFF370E00),
    secondary = HomeAccent,
    onSecondary = HomeOnPrimary,
    secondaryContainer = Color(0xFFFFDDB8),
    onSecondaryContainer = Color(0xFF2D1600),
    background = HomeBackground,
    onBackground = HomeOnBackground,
    surface = HomeSurface,
    onSurface = HomeOnSurface,
    error = HomeError,
    onError = HomeOnPrimary,
    surfaceVariant = Color(0xFFF4DDD4),
    onSurfaceVariant = Color(0xFF52443D)
)

// ─── Typography ───────────────────────────────────────────────────────────────

// Note: In actual project, add font files to res/font/
// using Google Fonts or Poppins/Inter
val PoppinsFamily = FontFamily.Default  // Replace with actual Poppins font

data class HomeChefTypography(
    val displayLarge: TextStyle = TextStyle(
        fontFamily = PoppinsFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        lineHeight = 40.sp
    ),
    val displayMedium: TextStyle = TextStyle(
        fontFamily = PoppinsFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp
    ),
    val titleLarge: TextStyle = TextStyle(
        fontFamily = PoppinsFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp
    ),
    val titleMedium: TextStyle = TextStyle(
        fontFamily = PoppinsFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 24.sp
    ),
    val bodyLarge: TextStyle = TextStyle(
        fontFamily = PoppinsFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp
    ),
    val bodyMedium: TextStyle = TextStyle(
        fontFamily = PoppinsFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp
    ),
    val bodySmall: TextStyle = TextStyle(
        fontFamily = PoppinsFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp
    ),
    val labelLarge: TextStyle = TextStyle(
        fontFamily = PoppinsFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp
    )
)

// ─── Spacing ──────────────────────────────────────────────────────────────────

data class HomeChefSpacing(
    val xs: Dp = 4.dp,
    val sm: Dp = 8.dp,
    val md: Dp = 16.dp,
    val lg: Dp = 24.dp,
    val xl: Dp = 32.dp,
    val xxl: Dp = 48.dp
)

// ─── Shape ────────────────────────────────────────────────────────────────────

object HomeChefShape {
    val cardRadius = 16.dp
    val chipRadius = 8.dp
    val buttonRadius = 12.dp
    val fullRadius = 100.dp
}

// ─── CompositionLocals ────────────────────────────────────────────────────────

val LocalHomeChefTypography = staticCompositionLocalOf { HomeChefTypography() }
val LocalHomeChefSpacing = staticCompositionLocalOf { HomeChefSpacing() }

// ─── Theme Accessor ───────────────────────────────────────────────────────────

object HomeChefThemeExt {
    val typography: HomeChefTypography
        @Composable get() = LocalHomeChefTypography.current

    val spacing: HomeChefSpacing
        @Composable get() = LocalHomeChefSpacing.current
}

// ─── Theme ────────────────────────────────────────────────────────────────────

@Composable
fun HomeChefTheme(content: @Composable () -> Unit) {
    CompositionLocalProvider(
        LocalHomeChefTypography provides HomeChefTypography(),
        LocalHomeChefSpacing provides HomeChefSpacing()
    ) {
        MaterialTheme(
            colorScheme = LightColorScheme,
            content = content
        )
    }
}
