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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.homechef.app.R
import com.homechef.app.ui.theme.*
import kotlinx.coroutines.delay

private val PRO_TIPS = listOf(
    "Ndolé tastes better the next day!",
    "Always toast your spices before grinding for deeper flavour.",
    "A pinch of country onion (njansang) elevates any sauce.",
    "Slow-cook your oxtail low and long for fall-off-the-bone results.",
    "Fresh eru leaves wilt fast — cook them last.",
    "Rinse bitter leaves multiple times to reduce bitterness.",
    "Use smoked fish to add depth to your yellow soup.",
)

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit,
    viewModel: AuthViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val focusManager = LocalFocusManager.current

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(false) }

    // --- Sliding pro tips ---
    var tipIndex by remember { mutableIntStateOf(0) }
    var tipVisible by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(5_000)
            // Fade out
            tipVisible = false
            delay(400)
            tipIndex = (tipIndex + 1) % PRO_TIPS.size
            // Fade in
            tipVisible = true
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // ================================================================
        // HERO SECTION — dark brown gradient background
        // ================================================================
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF3B0F0A),
                            Color(0xFF6B1E10),
                            Color(0xFF8B2E18)
                        )
                    )
                )
                .padding(horizontal = 24.dp, vertical = 36.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Chef avatar circle
                Box(
                    modifier = Modifier
                        .size(110.dp)
                        .clip(CircleShape)
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    // Replace with your actual drawable; fallback shows initials
                    Text(
                        text = "👨‍🍳",
                        fontSize = 56.sp,
                        textAlign = TextAlign.Center
                    )
                    // If you have the image asset, swap the Text above for:
                    // Image(
                    //     painter = painterResource(R.drawable.ic_chef_avatar),
                    //     contentDescription = "Chef avatar",
                    //     modifier = Modifier.fillMaxSize(),
                    //     contentScale = ContentScale.Crop
                    // )
                }

                // "Welcome Back Home" on one line, "My Chef" on next — both white/gold
                Text(
                    text = buildAnnotatedString {
                        withStyle(
                            SpanStyle(
                                color = Color.White,
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 26.sp
                            )
                        ) { append("Welcome Back Home") }
                    },
                    textAlign = TextAlign.Center
                )
                Text(
                    text = buildAnnotatedString {
                        withStyle(
                            SpanStyle(
                                color = HomeWordmarkChef,        // golden/amber
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 26.sp
                            )
                        ) { append("My Chef") }
                    },
                    textAlign = TextAlign.Center
                )

                // Subtitle
                Text(
                    text = "Glad to see you back. What are you going to learn today?\nFrom easy to complex, we have them all.",
                    color = Color.White.copy(alpha = 0.75f),
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Pro tip pill — animated fade slide
                Column(
                    modifier = Modifier
                        .fillMaxWidth(0.85f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White.copy(alpha = 0.12f))
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.20f),
                            shape = RoundedCornerShape(10.dp)
                        )
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    AnimatedVisibility(
                        visible = tipVisible,
                        enter = fadeIn(tween(400)) + slideInVertically(
                            initialOffsetY = { it / 3 },
                            animationSpec = tween(400)
                        ),
                        exit = fadeOut(tween(300)) + slideOutVertically(
                            targetOffsetY = { -it / 3 },
                            animationSpec = tween(300)
                        )
                    ) {
                        Text(
                            text = buildAnnotatedString {
                                withStyle(SpanStyle(fontWeight = FontWeight.Bold, color = Color.White)) {
                                    append("Pro Tip: ")
                                }
                                withStyle(
                                    SpanStyle(
                                        fontStyle = FontStyle.Italic,
                                        color = Color.White.copy(alpha = 0.9f)
                                    )
                                ) {
                                    append(PRO_TIPS[tipIndex])
                                }
                            },
                            fontSize = 13.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
            }
        }

        // ================================================================
        // FORM SECTION — light cream background
        // ================================================================
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFFDF6EE))         // warm cream
                .padding(horizontal = 24.dp, vertical = 28.dp),
            verticalArrangement = Arrangement.spacedBy(0.dp)
        ) {
            // "HomeChef" wordmark
            Text(
                text = buildAnnotatedString {
                    withStyle(
                        SpanStyle(
                            color = HomePrimaryDark,
                            fontWeight = FontWeight.Black,
                            fontSize = 32.sp
                        )
                    ) { append("Home") }
                    withStyle(
                        SpanStyle(
                            color = HomeWordmarkChef,
                            fontWeight = FontWeight.Black,
                            fontSize = 32.sp
                        )
                    ) { append("Chef") }
                }
            )

            Spacer(modifier = Modifier.height(4.dp))

            // "Sign in" heading
            Text(
                text = "Sign in",
                fontWeight = FontWeight.Bold,
                fontSize = 26.sp,
                color = Color(0xFF1A1A1A)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // "Don't have an account? Create now"
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Don't have an account? ",
                    color = Color(0xFF555555),
                    fontSize = 14.sp
                )
                TextButton(
                    onClick = onNavigateToRegister,
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text(
                        text = "Create now",
                        color = Color(0xFF2980B9),
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // --- E-mail ---
            Text(
                text = "E-mail",
                fontWeight = FontWeight.Medium,
                fontSize = 14.sp,
                color = Color(0xFF333333)
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = email,
                onValueChange = { email = it; viewModel.clearError() },
                placeholder = { Text("example@gmail.com", color = Color(0xFFBBBBBB)) },
                isError = uiState.emailError != null,
                supportingText = {
                    uiState.emailError?.let {
                        Text(it, color = MaterialTheme.colorScheme.error)
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                ),
                keyboardActions = KeyboardActions(
                    onNext = { focusManager.moveFocus(FocusDirection.Down) }
                ),
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = HomePrimary,
                    unfocusedBorderColor = Color(0xFFDDDDDD),
                    focusedLabelColor = HomePrimary,
                    unfocusedContainerColor = Color.White,
                    focusedContainerColor = Color.White
                ),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            // --- Password ---
            Text(
                text = "Password",
                fontWeight = FontWeight.Medium,
                fontSize = 14.sp,
                color = Color(0xFF333333)
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it; viewModel.clearError() },
                visualTransformation = if (passwordVisible) VisualTransformation.None
                else PasswordVisualTransformation(),
                isError = uiState.passwordError != null,
                supportingText = {
                    uiState.passwordError?.let {
                        Text(it, color = MaterialTheme.colorScheme.error)
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                keyboardActions = KeyboardActions(onDone = {
                    focusManager.clearFocus()
                    viewModel.signInWithEmail(email, password, onLoginSuccess)
                }),
                shape = RoundedCornerShape(10.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = HomePrimary,
                    unfocusedBorderColor = Color(0xFFDDDDDD),
                    unfocusedContainerColor = Color.White,
                    focusedContainerColor = Color.White
                ),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Remember me  |  Show password  +  Forgot password
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Remember me
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Checkbox(
                        checked = rememberMe,
                        onCheckedChange = { rememberMe = it },
                        colors = CheckboxDefaults.colors(checkedColor = HomePrimary)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Remember me", fontSize = 13.sp, color = Color(0xFF444444))
                }

                // Show password + forgot
                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(
                            checked = passwordVisible,
                            onCheckedChange = { passwordVisible = it },
                            colors = CheckboxDefaults.colors(checkedColor = HomePrimary)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Show Password", fontSize = 13.sp, color = Color(0xFF444444))
                    }
                    TextButton(
                        onClick = { /* TODO: forgot password */ },
                        contentPadding = PaddingValues(end = 12.dp)
                    ) {
                        Text(
                            text = "Forgot Password?",
                            color = Color(0xFF2980B9),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Global error banner
            uiState.error?.let { error ->
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = error,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(12.dp),
                        fontSize = 13.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // --- Sign In button ---
            Button(
                onClick = { viewModel.signInWithEmail(email, password, onLoginSuccess) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = HomePrimaryDark),
                enabled = !uiState.isLoading
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        "Sign in",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 16.sp,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // --- Divider "or continue with" ---
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFDDDDDD))
                Text("or continue with", color = Color(0xFF888888), fontSize = 13.sp)
                HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFFDDDDDD))
            }

            Spacer(modifier = Modifier.height(16.dp))

            // --- Google button ---
            OutlinedButton(
                onClick = { viewModel.signInWithGoogle(onLoginSuccess) },
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .height(50.dp)
                    .widthIn(min = 200.dp),
                shape = RoundedCornerShape(10.dp),
                border = ButtonDefaults.outlinedButtonBorder,
                enabled = !uiState.isLoading,
                colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White)
            ) {
                // Colourful "G" using annotated string as substitute for real Google icon
                Text(
                    text = buildAnnotatedString {
                        withStyle(SpanStyle(color = Color(0xFF4285F4), fontWeight = FontWeight.Bold)) { append("G") }
                        withStyle(SpanStyle(color = Color(0xFFEA4335), fontWeight = FontWeight.Bold)) { append("o") }
                        withStyle(SpanStyle(color = Color(0xFFFBBC05), fontWeight = FontWeight.Bold)) { append("o") }
                        withStyle(SpanStyle(color = Color(0xFF4285F4), fontWeight = FontWeight.Bold)) { append("g") }
                        withStyle(SpanStyle(color = Color(0xFF34A853), fontWeight = FontWeight.Bold)) { append("l") }
                        withStyle(SpanStyle(color = Color(0xFFEA4335), fontWeight = FontWeight.Bold)) { append("e") }
                    },
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text("Google", color = Color(0xFF333333), fontWeight = FontWeight.Medium)
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}