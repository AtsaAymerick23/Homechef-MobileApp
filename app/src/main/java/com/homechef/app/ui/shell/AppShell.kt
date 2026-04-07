package com.homechef.app.ui.shell

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import coil3.compose.AsyncImage
import com.homechef.app.ui.navigation.Screen
import com.homechef.app.ui.theme.*

data class SidebarItem(
    val label: String,
    val icon: ImageVector,
    val route: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppShell(
    navController: NavHostController,
    viewModel: ShellViewModel = hiltViewModel(),
    content: @Composable () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val currentRoute by remember { derivedStateOf { navController.currentBackStackEntry?.destination?.route } }

    var isSidebarVisible by remember { mutableStateOf(true) }

    val sidebarItems = listOf(
        SidebarItem("Home", Icons.Outlined.Timeline, Screen.Home.route),
        SidebarItem("My Recipes", Icons.Outlined.MenuBook, Screen.MyRecipes.route),
        SidebarItem("Recipe of the Day", Icons.Outlined.Today, Screen.RecipeOfTheDay.route),
        SidebarItem("About Us", Icons.Outlined.Info, Screen.AboutUs.route),
        SidebarItem("Events", Icons.Outlined.EmojiEvents, Screen.Events.route),
        SidebarItem("Quiz", Icons.Outlined.Quiz, Screen.Quiz.route),
        SidebarItem("My Experience", Icons.Outlined.Timeline, Screen.Experience.route),
        SidebarItem("Leaderboard", Icons.Outlined.Leaderboard, Screen.Leaderboard.route),
        SidebarItem("Settings", Icons.Outlined.Settings, Screen.Settings.route)
    )

    Row(modifier = Modifier.fillMaxSize()) {
        // ── Collapsible Left Sidebar with Animation ────────────────────────────────
        AnimatedVisibility(
            visible = isSidebarVisible,
            enter = slideInHorizontally(
                initialOffsetX = { -it },
                animationSpec = tween(durationMillis = 300)
            ),
            exit = slideOutHorizontally(
                targetOffsetX = { -it },
                animationSpec = tween(durationMillis = 300)
            )
        ) {
            Surface(
                modifier = Modifier
                    .width(220.dp)
                    .fillMaxHeight(),
                color = HomePrimaryDark,
                shadowElevation = 8.dp
            ) {
                Column(modifier = Modifier.fillMaxSize()) {
                    // App Logo with Toggle Button
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(HomePrimary)
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = buildAnnotatedString {
                                withStyle(SpanStyle(color = HomeWordmarkHome, fontWeight = FontWeight.Black, fontSize = 20.sp)) {
                                    append("Home")
                                }
                                withStyle(SpanStyle(color = HomeWordmarkChef, fontWeight = FontWeight.Black, fontSize = 20.sp)) {
                                    append("Chef")
                                }
                            }
                        )

                        IconButton(
                            onClick = { isSidebarVisible = false },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                Icons.Default.ChevronLeft,
                                contentDescription = "Collapse Sidebar",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    // User info
                    if (uiState.user != null) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (uiState.user?.profilePicUrl != null) {
                                AsyncImage(
                                    model = uiState.user?.profilePicUrl,
                                    contentDescription = "Avatar",
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(HomeAccent),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = uiState.user?.username?.take(1)?.uppercase() ?: "U",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Column {
                                Text(
                                    text = uiState.user?.username ?: "",
                                    color = Color.White,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp,
                                    maxLines = 1
                                )
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Filled.Star,
                                        contentDescription = null,
                                        tint = HomeWordmarkChef,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(2.dp))
                                    Text(
                                        text = "${uiState.user?.chefPoints ?: 0} pts",
                                        color = HomeWordmarkChef,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }

                    Divider(color = Color.White.copy(alpha = 0.15f), modifier = Modifier.padding(horizontal = 8.dp))

                    // Navigation Items
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .verticalScroll(rememberScrollState())
                            .padding(vertical = 8.dp)
                    ) {
                        sidebarItems.forEach { item ->
                            val isSelected = currentRoute == item.route
                            SidebarNavItem(
                                item = item,
                                isSelected = isSelected,
                                onClick = {
                                    if (currentRoute != item.route) {
                                        navController.navigate(item.route) {
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }

        // ── Main Content Area ─────────────────────────────────────────────────
        Column(modifier = Modifier.weight(1f).fillMaxHeight()) {
            // Header Bar with Expand Button
            AppHeader(
                uiState = uiState,
                onSearchQueryChange = { viewModel.onSearch(it) },
                onLanguageToggle = { viewModel.toggleLanguage() },
                onAvatarClick = { navController.navigate(Screen.Settings.route) },
                isSidebarVisible = isSidebarVisible,
                onToggleSidebar = { isSidebarVisible = !isSidebarVisible }
            )

            // Page content
            Box(
                modifier = Modifier
                    .weight(1f)
                    .background(HomeBackground)
            ) {
                content()
            }
        }
    }
}

@Composable
private fun SidebarNavItem(
    item: SidebarItem,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val bgColor = if (isSelected) HomeAccent.copy(alpha = 0.2f) else Color.Transparent
    val contentColor = if (isSelected) HomeWordmarkChef else Color.White.copy(alpha = 0.85f)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 2.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(bgColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Icon(
            imageVector = item.icon,
            contentDescription = item.label,
            tint = contentColor,
            modifier = Modifier.size(20.dp)
        )
        Text(
            text = item.label,
            color = contentColor,
            fontSize = 14.sp,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
        )
        if (isSelected) {
            Spacer(modifier = Modifier.weight(1f))
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(HomeWordmarkChef)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AppHeader(
    uiState: ShellUiState,
    onSearchQueryChange: (String) -> Unit,
    onLanguageToggle: () -> Unit,
    onAvatarClick: () -> Unit,
    isSidebarVisible: Boolean,
    onToggleSidebar: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = HomePrimary,
        shadowElevation = 4.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .height(56.dp)
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Menu Button to Toggle Sidebar
            IconButton(onClick = onToggleSidebar) {
                Icon(
                    if (isSidebarVisible) Icons.Default.MenuOpen else Icons.Default.Menu,
                    contentDescription = if (isSidebarVisible) "Hide Menu" else "Show Menu",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }

            // Search Bar
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = onSearchQueryChange,
                placeholder = {
                    Text(
                        "Search recipes, regions...",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 13.sp
                    )
                },
                leadingIcon = {
                    Icon(
                        Icons.Default.Search,
                        contentDescription = "Search",
                        tint = Color.White.copy(alpha = 0.8f),
                        modifier = Modifier.size(18.dp)
                    )
                },
                modifier = Modifier
                    .weight(1f)
                    .height(44.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedContainerColor = Color.White.copy(alpha = 0.15f),
                    unfocusedContainerColor = Color.White.copy(alpha = 0.1f),
                    focusedBorderColor = HomeAccent,
                    unfocusedBorderColor = Color.White.copy(alpha = 0.3f)
                ),
                shape = RoundedCornerShape(24.dp),
                singleLine = true,
                textStyle = LocalTextStyle.current.copy(fontSize = 13.sp)
            )

            // Language Toggle
            IconButton(onClick = onLanguageToggle) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Icon(
                        Icons.Default.Language,
                        contentDescription = "Language",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = uiState.language,
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Avatar
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(HomeAccent)
                    .clickable(onClick = onAvatarClick),
                contentAlignment = Alignment.Center
            ) {
                if (uiState.user?.profilePicUrl != null) {
                    AsyncImage(
                        model = uiState.user.profilePicUrl,
                        contentDescription = "Avatar",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Text(
                        text = uiState.user?.username?.take(1)?.uppercase() ?: "U",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}