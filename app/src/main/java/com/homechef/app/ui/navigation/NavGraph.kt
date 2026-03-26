package com.homechef.app.ui.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.homechef.app.ui.auth.AuthState
import com.homechef.app.ui.auth.AuthViewModel
import com.homechef.app.ui.auth.LoginScreen
import com.homechef.app.ui.auth.RegisterScreen
import com.homechef.app.ui.auth.OnboardingScreen
import com.homechef.app.ui.events.EventsScreen
import com.homechef.app.ui.experience.ExperienceScreen
import com.homechef.app.ui.home.HomeScreen
import com.homechef.app.ui.leaderboard.LeaderboardScreen
import com.homechef.app.ui.meal.MealDetailScreen
import com.homechef.app.ui.other.MyRecipesScreen
import com.homechef.app.ui.other.CreateRecipeScreen
import com.homechef.app.ui.quiz.QuizScreen
import com.homechef.app.ui.other.RecipeOfTheDayScreen
import com.homechef.app.ui.settings.SettingsScreen
import com.homechef.app.ui.other.AboutScreen
import com.homechef.app.ui.shell.AppShell

// ─── Route Definitions ───────────────────────────────────────────────────────

sealed class Screen(val route: String) {
    // Auth
    object Login : Screen("login")
    object Register : Screen("register")
    object Onboarding : Screen("onboarding")

    // Main Shell
    object Home : Screen("home")
    object MealDetail : Screen("meal/{mealId}") {
        fun createRoute(mealId: String) = "meal/$mealId"
    }

    // Sidebar
    object MyRecipes : Screen("my_recipes")
    object CreateRecipe : Screen("create_recipe")
    object RecipeOfTheDay : Screen("recipe_of_the_day")
    object AboutUs : Screen("about_us")
    object Events : Screen("events")
    object Quiz : Screen("quiz")
    object Experience : Screen("experience")
    object Leaderboard : Screen("leaderboard")
    object Settings : Screen("settings")
}

// ─── Nav Graph ───────────────────────────────────────────────────────────────

@Composable
fun HomeChefNavGraph(
    authState: AuthState,
    authViewModel: AuthViewModel
) {
    val navController = rememberNavController()

    val startDestination = when (authState) {
        is AuthState.Authenticated -> Screen.Home.route
        is AuthState.NeedsOnboarding -> Screen.Onboarding.route
        else -> Screen.Login.route
    }

    NavHost(
        navController = navController,
        startDestination = startDestination,
        enterTransition = {
            slideIntoContainer(
                AnimatedContentTransitionScope.SlideDirection.Left,
                animationSpec = tween(300)
            )
        },
        exitTransition = {
            slideOutOfContainer(
                AnimatedContentTransitionScope.SlideDirection.Left,
                animationSpec = tween(300)
            )
        },
        popEnterTransition = {
            slideIntoContainer(
                AnimatedContentTransitionScope.SlideDirection.Right,
                animationSpec = tween(300)
            )
        },
        popExitTransition = {
            slideOutOfContainer(
                AnimatedContentTransitionScope.SlideDirection.Right,
                animationSpec = tween(300)
            )
        }
    ) {
        // ── Auth Screens ──────────────────────────────────────────────────────
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(Screen.Register.route)
                },
                viewModel = hiltViewModel()
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate(Screen.Onboarding.route) {
                        popUpTo(Screen.Register.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = { navController.popBackStack() },
                viewModel = hiltViewModel()
            )
        }

        composable(Screen.Onboarding.route) {
            OnboardingScreen(
                onComplete = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                },
                viewModel = hiltViewModel()
            )
        }

        // ── Main App Shell (with sidebar) ─────────────────────────────────────
        composable(Screen.Home.route) {
            AppShell(
                navController = navController,
                content = {
                    HomeScreen(
                        onMealClick = { mealId ->
                            navController.navigate(Screen.MealDetail.createRoute(mealId))
                        },
                        viewModel = hiltViewModel()
                    )
                }
            )
        }

        composable(
            route = Screen.MealDetail.route,
            arguments = listOf(navArgument("mealId") { type = NavType.StringType })
        ) { backStackEntry ->
            val mealId = backStackEntry.arguments?.getString("mealId") ?: return@composable
            MealDetailScreen(
                mealId = mealId,
                onBack = { navController.popBackStack() },
                onSimilarMealClick = { similarMealId ->
                    navController.navigate(Screen.MealDetail.createRoute(similarMealId))
                },
                viewModel = hiltViewModel()
            )
        }

        // ── Sidebar Screens ───────────────────────────────────────────────────
        composable(Screen.MyRecipes.route) {
            AppShell(navController = navController) {
                MyRecipesScreen(
                    onCreateRecipe = { navController.navigate(Screen.CreateRecipe.route) },
                    viewModel = hiltViewModel()
                )
            }
        }

        composable(Screen.CreateRecipe.route) {
            CreateRecipeScreen(
                onBack = { navController.popBackStack() },
                onSaved = { navController.popBackStack() },
                viewModel = hiltViewModel()
            )
        }

        composable(Screen.RecipeOfTheDay.route) {
            AppShell(navController = navController) {
                RecipeOfTheDayScreen(
                    onViewFullRecipe = { mealId ->
                        navController.navigate(Screen.MealDetail.createRoute(mealId))
                    },
                    viewModel = hiltViewModel()
                )
            }
        }

        composable(Screen.AboutUs.route) {
            AppShell(navController = navController) {
                AboutScreen()
            }
        }

        composable(Screen.Events.route) {
            AppShell(navController = navController) {
                EventsScreen(viewModel = hiltViewModel())
            }
        }

        composable(Screen.Quiz.route) {
            AppShell(navController = navController) {
                QuizScreen(viewModel = hiltViewModel())
            }
        }

        composable(Screen.Experience.route) {
            AppShell(navController = navController) {
                ExperienceScreen(
                    onMealClick = { mealId ->
                        navController.navigate(Screen.MealDetail.createRoute(mealId))
                    },
                    viewModel = hiltViewModel()
                )
            }
        }

        composable(Screen.Leaderboard.route) {
            AppShell(navController = navController) {
                LeaderboardScreen(viewModel = hiltViewModel())
            }
        }

        composable(Screen.Settings.route) {
            AppShell(navController = navController) {
                SettingsScreen(
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    viewModel = hiltViewModel()
                )
            }
        }
    }
}
