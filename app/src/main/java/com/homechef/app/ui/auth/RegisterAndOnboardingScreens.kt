package com.homechef.app.ui.auth

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.homechef.app.R
import com.homechef.app.ui.theme.*
import kotlinx.coroutines.delay

// ─── Color constants (match your theme) ──────────────────────────────────────
// HomePrimaryDark  ≈ Color(0xFF3E1A00)  (deep brown)
// HomePrimary      ≈ Color(0xFF7B3A10)  (medium brown)
// HomeBackground   ≈ Color(0xFFFFF3E8)  (cream)
// HomeSurface      ≈ Color(0xFFFFF3E8)
// HomeWordmarkHome ≈ Color(0xFF7B3A10)  (brown-red)
// HomeWordmarkChef ≈ Color(0xFFD4920A)  (amber/gold)

// ─── Pro tips list ────────────────────────────────────────────────────────────
private val proTips = listOf(
    "Cameroonian pepper soup can warm you up on any day!",
    "Ndolé is best enjoyed with ripe plantains on the side.",
    "Achu soup pairs perfectly with yellow cocoyam fufu.",
    "Egusi pudding (okok) is a beloved dish in the South Region.",
    "Koki beans steamed in banana leaves taste even better the next day!",
    "Beignets (puff-puff) are Cameroon's favourite street snack."
)

// ─── Password strength helper ─────────────────────────────────────────────────
private data class PasswordStrength(
    val score: Int,          // 0–4
    val label: String,
    val color: Color
)

private fun evaluatePassword(password: String): PasswordStrength {
    var score = 0
    if (password.length >= 8) score++
    if (password.any { it.isUpperCase() }) score++
    if (password.any { it.isLowerCase() }) score++
    if (password.any { it.isDigit() }) score++
    if (password.any { !it.isLetterOrDigit() }) score++
    return when {
        score <= 1 -> PasswordStrength(score, "Weak",   Color(0xFFE53935))
        score == 2 -> PasswordStrength(score, "Fair",   Color(0xFFFB8C00))
        score == 3 -> PasswordStrength(score, "Good",   Color(0xFFFDD835))
        else       -> PasswordStrength(score, "Strong", Color(0xFF43A047))
    }
}

// ─── Register Screen ──────────────────────────────────────────────────────────
@OptIn(ExperimentalAnimationApi::class)
@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val focusManager = LocalFocusManager.current

    // Form state
    var fullName        by remember { mutableStateOf("") }
    var email           by remember { mutableStateOf("") }
    var password        by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showPassword    by remember { mutableStateOf(false) }
    var confirmPasswordError by remember { mutableStateOf<String?>(null) }

    // Sliding tips
    var tipIndex    by remember { mutableStateOf(0) }
    var tipVisible  by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(5_000)
            tipVisible = false
            delay(400)                          // wait for fade-out
            tipIndex = (tipIndex + 1) % proTips.size
            tipVisible = true
        }
    }

    // Password strength
    val strength = remember(password) { evaluatePassword(password) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {

        // ── Hero section ──────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF1A0500),   // very dark brown top
                            Color(0xFF3E1200),   // HomePrimaryDark
                            Color(0xFF5C2200)    // slightly lighter at bottom of hero
                        )
                    )
                )
                .padding(bottom = 32.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 48.dp, start = 24.dp, end = 24.dp)
            ) {
                // Chef avatar circle
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    // Replace with your actual drawable resource
                    // Image(
                    //     painter = painterResource(id = R.drawable.ic_chef_avatar),
                    //     contentDescription = "HomeChef Logo",
                    //     modifier = Modifier.size(88.dp).clip(CircleShape)
                    // )
                    // Placeholder emoji fallback:
                    Text("👨‍🍳", fontSize = 52.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    "Welcome To HomeChef",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    "Join our community of food lovers and share your culinary journey.",
                    color = Color.White.copy(alpha = 0.75f),
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Sliding "Did you know?" tip banner
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White.copy(alpha = 0.08f))
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    androidx.compose.animation.AnimatedVisibility(
                        visible = tipVisible,
                        enter = fadeIn(tween(400)) + slideInHorizontally(tween(400)) { it / 4 },
                        exit  = fadeOut(tween(300)) + slideOutHorizontally(tween(300)) { -it / 4 }
                    ) {
                        Text(
                            buildAnnotatedString {
                                withStyle(SpanStyle(fontWeight = FontWeight.Bold, fontStyle = FontStyle.Italic, color = Color.White)) {
                                    append("Did you know? ")
                                }
                                withStyle(SpanStyle(fontStyle = FontStyle.Italic, color = Color.White.copy(alpha = 0.85f))) {
                                    append(proTips[tipIndex])
                                }
                            },
                            textAlign = TextAlign.Center,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }

        // ── Form section (cream background) ──────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFFFF3E8))
                .padding(horizontal = 24.dp, vertical = 28.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // HomeChef wordmark
            Text(
                buildAnnotatedString {
                    withStyle(SpanStyle(color = Color(0xFF7B3A10), fontWeight = FontWeight.Black, fontSize = 28.sp)) { append("Home") }
                    withStyle(SpanStyle(color = Color(0xFFD4920A), fontWeight = FontWeight.Black, fontSize = 28.sp)) { append("Chef") }
                }
            )

            // Page title
            Text(
                "Create your HomeChef account",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 22.sp,
                color = Color(0xFF1A0A00),
                lineHeight = 28.sp
            )

            // Already have account
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Already have an account? ", color = Color.Gray, fontSize = 13.sp)
                TextButton(
                    onClick = onNavigateToLogin,
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text(
                        "Sign in",
                        color = Color(0xFF2E7DC5),
                        fontWeight = FontWeight.Medium,
                        fontSize = 13.sp
                    )
                }
            }

            // Full Name
            FormLabel("Full Name")
            OutlinedTextField(
                value = fullName,
                onValueChange = { fullName = it; viewModel.clearError() },
                placeholder = { Text("Aymerick Atsa", color = Color.LightGray) },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                shape = RoundedCornerShape(10.dp),
                colors = formFieldColors(),
                singleLine = true
            )

            // Email Address
            FormLabel("Email Address")
            OutlinedTextField(
                value = email,
                onValueChange = { email = it; viewModel.clearError() },
                placeholder = { Text("you@example.com", color = Color.LightGray) },
                isError = uiState.emailError != null,
                supportingText = { uiState.emailError?.let { Text(it, color = MaterialTheme.colorScheme.error) } },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                shape = RoundedCornerShape(10.dp),
                colors = formFieldColors(),
                singleLine = true
            )

            // Password
            FormLabel("Password")
            OutlinedTextField(
                value = password,
                onValueChange = { password = it; viewModel.clearError() },
                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
                keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                shape = RoundedCornerShape(10.dp),
                colors = formFieldColors(),
                singleLine = true
            )

            // Password strength bar + requirements
            if (password.isNotEmpty()) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("Password Strength:", fontSize = 12.sp, color = Color.DarkGray, fontWeight = FontWeight.Medium)
                        Text(strength.label, fontSize = 12.sp, color = strength.color, fontWeight = FontWeight.SemiBold)
                    }
                    // Segmented bar
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        (1..4).forEach { seg ->
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(4.dp)
                                    .clip(RoundedCornerShape(2.dp))
                                    .background(
                                        if (seg <= strength.score) strength.color
                                        else Color.LightGray.copy(alpha = 0.4f)
                                    )
                            )
                        }
                    }
                    // Requirements grid
                    val requirements = listOf(
                        "8+ characters" to (password.length >= 8),
                        "Uppercase letter" to password.any { it.isUpperCase() },
                        "Lowercase letter" to password.any { it.isLowerCase() },
                        "Number" to password.any { it.isDigit() },
                        "Special character" to password.any { !it.isLetterOrDigit() }
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        requirements.chunked(2).forEach { row ->
                            Row(modifier = Modifier.fillMaxWidth()) {
                                row.forEach { (label, met) ->
                                    Row(
                                        modifier = Modifier.weight(1f),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            "• $label",
                                            fontSize = 11.sp,
                                            color = if (met) Color(0xFF43A047) else Color.Gray
                                        )
                                    }
                                }
                                // fill empty slot if odd count
                                if (row.size == 1) Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            } else {
                // Static requirements list before typing
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text("Password Strength:", fontSize = 12.sp, color = Color.DarkGray, fontWeight = FontWeight.Medium)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(Color.LightGray.copy(alpha = 0.4f))
                    )
                    val reqs = listOf(
                        "8+ characters", "Uppercase letter",
                        "Lowercase letter", "Number",
                        "Special character"
                    )
                    reqs.chunked(2).forEach { row ->
                        Row(modifier = Modifier.fillMaxWidth()) {
                            row.forEach { label ->
                                Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                                    Text("• $label", fontSize = 11.sp, color = Color.Gray)
                                }
                            }
                            if (row.size == 1) Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }

            // Confirm Password
            FormLabel("Confirm Password")
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = {
                    confirmPassword = it
                    confirmPasswordError = if (it != password && it.isNotEmpty()) "Passwords do not match" else null
                },
                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                isError = confirmPasswordError != null,
                supportingText = { confirmPasswordError?.let { Text(it, color = MaterialTheme.colorScheme.error) } },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
                shape = RoundedCornerShape(10.dp),
                colors = formFieldColors(),
                singleLine = true
            )

            // Show password checkbox
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.offset(x = (-4).dp)
            ) {
                Checkbox(
                    checked = showPassword,
                    onCheckedChange = { showPassword = it },
                    colors = CheckboxDefaults.colors(
                        checkedColor = Color(0xFF3E1200),
                        uncheckedColor = Color.Gray
                    )
                )
                Text("Show Password", fontSize = 13.sp, color = Color.DarkGray)
            }

            // Error card
            uiState.error?.let {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(12.dp), fontSize = 13.sp)
                }
            }

            // Register button
            Button(
                onClick = {
                    if (password != confirmPassword) {
                        confirmPasswordError = "Passwords do not match"
                        return@Button
                    }
                    viewModel.signUpWithEmail(email, password, fullName, onRegisterSuccess)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A0500)),
                enabled = !uiState.isLoading
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text("Register Now", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

@Composable
private fun FormLabel(text: String) {
    Text(
        text,
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        color = Color(0xFF1A0A00)
    )
}

@Composable
private fun formFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Color(0xFF7B3A10),
    unfocusedBorderColor = Color(0xFFDDCCBB),
    focusedLabelColor = Color(0xFF7B3A10),
    focusedContainerColor = Color.White,
    unfocusedContainerColor = Color.White
)


// ─── Onboarding Screen (unchanged) ───────────────────────────────────────────

@Composable
fun OnboardingScreen(
    onComplete: () -> Unit,
    viewModel: AuthViewModel
) {
    var selectedLanguage by remember { mutableStateOf("EN") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF1A0500), Color(0xFF7B3A10), Color(0xFFFFF3E8)))),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E8)),
            elevation = CardDefaults.cardElevation(8.dp)
        ) {
            Column(
                modifier = Modifier.padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Text("🍲", fontSize = 48.sp)
                Text(
                    "Welcome to HomeChef!",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF3E1200),
                    textAlign = TextAlign.Center
                )
                Text(
                    "Your gateway to authentic Cameroonian cuisine. Choose your preferred language to get started.",
                    textAlign = TextAlign.Center,
                    color = Color.Gray,
                    fontSize = 14.sp
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    LanguageOption(
                        text = "English",
                        isSelected = selectedLanguage == "EN",
                        onClick = { selectedLanguage = "EN" },
                        modifier = Modifier.weight(1f)
                    )
                    LanguageOption(
                        text = "Français",
                        isSelected = selectedLanguage == "FR",
                        onClick = { selectedLanguage = "FR" },
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Button(
                    onClick = { viewModel.completeOnboarding(selectedLanguage, onComplete) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7B3A10))
                ) {
                    Text("Get Started", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun LanguageOption(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) Color(0xFF7B3A10).copy(alpha = 0.1f) else Color.Transparent,
        border = androidx.compose.foundation.BorderStroke(
            2.dp,
            if (isSelected) Color(0xFF7B3A10) else Color.LightGray.copy(alpha = 0.5f)
        )
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(vertical = 12.dp),
            textAlign = TextAlign.Center,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            color = if (isSelected) Color(0xFF7B3A10) else Color.Gray
        )
    }
}