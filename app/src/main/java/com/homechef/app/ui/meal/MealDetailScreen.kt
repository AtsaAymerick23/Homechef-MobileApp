package com.homechef.app.ui.meal

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil3.compose.AsyncImage
import com.homechef.app.data.model.*
import com.homechef.app.data.repository.AuthRepository
import com.homechef.app.data.repository.MealRepository
import com.homechef.app.ui.components.DifficultyBadge
import com.homechef.app.ui.components.MealCard
import com.homechef.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

data class MealDetailUiState(
    val meal: Meal? = null,
    val steps: List<RecipeStep> = emptyList(),
    val ingredients: List<MealIngredient> = emptyList(),
    val similarMeals: List<Meal> = emptyList(),
    val cookingPlan: CookingPlanResponse? = null,
    val isLoading: Boolean = true,
    val isCalculating: Boolean = false,
    val showCookThisSheet: Boolean = false,
    val peopleCount: Int = 2,
    val timesCount: Int = 1,
    val currentStepIndex: Int = 0,
    val selectedTab: Int = 0, // 0=Written, 1=Video
    val error: String? = null,
    val successMessage: String? = null
)

@HiltViewModel
class MealDetailViewModel @Inject constructor(
    private val mealRepository: MealRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MealDetailUiState())
    val uiState: StateFlow<MealDetailUiState> = _uiState.asStateFlow()

    fun loadMeal(mealId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            // Load in parallel
            launch {
                mealRepository.getMealById(mealId)
                    .onSuccess { meal -> _uiState.update { it.copy(meal = meal) } }
            }
            launch {
                mealRepository.getRecipeSteps(mealId)
                    .onSuccess { steps -> _uiState.update { it.copy(steps = steps) } }
            }
            launch {
                mealRepository.getMealIngredients(mealId)
                    .onSuccess { ingredients -> _uiState.update { it.copy(ingredients = ingredients) } }
            }
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun onCookThis() {
        _uiState.update { it.copy(showCookThisSheet = true) }
    }

    fun dismissCookThis() {
        _uiState.update { it.copy(showCookThisSheet = false, cookingPlan = null) }
    }

    fun updatePeopleCount(count: Int) {
        _uiState.update { it.copy(peopleCount = count.coerceIn(1, 50)) }
    }

    fun updateTimesCount(count: Int) {
        _uiState.update { it.copy(timesCount = count.coerceIn(1, 30)) }
    }

    fun calculatePlan() {
        val meal = _uiState.value.meal ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isCalculating = true) }
            mealRepository.calculateCookingPlan(
                mealId = meal.id,
                peopleCount = _uiState.value.peopleCount,
                timesCount = _uiState.value.timesCount
            ).onSuccess { plan ->
                _uiState.update { it.copy(cookingPlan = plan, isCalculating = false) }
                // Load similar recipes
                loadSimilarMeals(meal.id)
                // Record in history
                authRepository.currentUserId?.let { userId ->
                    mealRepository.recordCookedMeal(
                        userId = userId,
                        mealId = meal.id,
                        peopleCount = _uiState.value.peopleCount,
                        timesCount = _uiState.value.timesCount,
                        totalCostXaf = plan.totalCostXaf,
                        totalDurationMinutes = plan.totalPrepTimeMinutes
                    )
                }
                _uiState.update { it.copy(successMessage = "+3 ChefPoints earned!") }
            }.onFailure { e ->
                _uiState.update { it.copy(isCalculating = false, error = e.message) }
            }
        }
    }

    private fun loadSimilarMeals(mealId: String) {
        viewModelScope.launch {
            mealRepository.getSimilarRecipes(mealId)
                .onSuccess { meals -> _uiState.update { it.copy(similarMeals = meals) } }
        }
    }

    fun nextStep() {
        val max = _uiState.value.steps.size - 1
        _uiState.update { it.copy(currentStepIndex = (it.currentStepIndex + 1).coerceAtMost(max)) }
    }

    fun prevStep() {
        _uiState.update { it.copy(currentStepIndex = (it.currentStepIndex - 1).coerceAtLeast(0)) }
    }

    fun selectTab(tab: Int) {
        _uiState.update { it.copy(selectedTab = tab) }
    }

    fun clearMessages() {
        _uiState.update { it.copy(error = null, successMessage = null) }
    }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MealDetailScreen(
    mealId: String,
    onBack: () -> Unit,
    onSimilarMealClick: (String) -> Unit,
    viewModel: MealDetailViewModel
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(mealId) { viewModel.loadMeal(mealId) }

    // Success snackbar
    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            kotlinx.coroutines.delay(2500)
            viewModel.clearMessages()
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(HomeBackground)) {
        if (uiState.isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.Center), color = HomePrimary)
            return@Box
        }

        val meal = uiState.meal ?: return@Box

        LazyColumn(modifier = Modifier.fillMaxSize()) {
            // Hero Image
            item {
                Box(modifier = Modifier.fillMaxWidth().height(280.dp)) {
                    AsyncImage(
                        model = meal.imageUrl,
                        contentDescription = meal.nameEn,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                    Box(modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Black.copy(0.2f), Color.Transparent, Color.Black.copy(0.5f)))))

                    // Back button
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier.align(Alignment.TopStart).padding(8.dp).background(Color.Black.copy(0.4f), CircleShape)
                    ) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
                    }

                    // Meal title overlay
                    Column(modifier = Modifier.align(Alignment.BottomStart).padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            AssistChip(onClick = {}, label = { Text(meal.regionOfOrigin, fontSize = 11.sp, color = Color.White) }, colors = AssistChipDefaults.assistChipColors(containerColor = HomePrimary.copy(0.9f)), border = null, modifier = Modifier.height(24.dp))
                            DifficultyBadge(meal.difficulty)
                        }
                        Text(meal.nameEn, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(Icons.Default.Timer, null, tint = Color.White.copy(0.8f), modifier = Modifier.size(14.dp))
                            Text("${meal.prepTimeMinutes} min", color = Color.White.copy(0.8f), fontSize = 13.sp)
                        }
                    }
                }
            }

            // Description
            item {
                Card(modifier = Modifier.padding(16.dp).fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface)) {
                    Text(meal.descriptionEn, modifier = Modifier.padding(16.dp), color = Color.DarkGray, style = MaterialTheme.typography.bodyMedium, lineHeight = 22.sp)
                }
            }

            // Ingredients
            item {
                SectionWithCard("🥘 Ingredients") {
                    if (uiState.ingredients.isEmpty()) {
                        Text("Ingredients list not available.", color = Color.Gray, modifier = Modifier.padding(8.dp))
                    } else {
                        uiState.ingredients.forEach { mi ->
                            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("• ${mi.ingredient?.nameEn ?: "Ingredient"}", color = HomePrimaryDark)
                                Text("${mi.quantity} ${mi.unit}", color = Color.Gray, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }

            // Recipe Tabs
            item {
                Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                    Text("📖 Recipe", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = HomePrimaryDark, modifier = Modifier.padding(bottom = 8.dp))

                    TabRow(
                        selectedTabIndex = uiState.selectedTab,
                        containerColor = HomeSurface,
                        contentColor = HomePrimary,
                        modifier = Modifier.clip(RoundedCornerShape(12.dp))
                    ) {
                        Tab(selected = uiState.selectedTab == 0, onClick = { viewModel.selectTab(0) }, text = { Text("Written") })
                        Tab(selected = uiState.selectedTab == 1, onClick = { viewModel.selectTab(1) }, text = { Text("Video") })
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (uiState.selectedTab == 0) {
                        WrittenRecipeTab(
                            steps = uiState.steps,
                            currentStep = uiState.currentStepIndex,
                            prepTime = meal.prepTimeMinutes,
                            onPrev = { viewModel.prevStep() },
                            onNext = { viewModel.nextStep() }
                        )
                    } else {
                        VideoRecipeTab(meal = meal, steps = uiState.steps)
                    }
                }
            }

            // Cook This Button
            item {
                Button(
                    onClick = { viewModel.onCookThis() },
                    modifier = Modifier.fillMaxWidth().padding(16.dp).height(54.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = HomePrimary)
                ) {
                    Icon(Icons.Default.Restaurant, null, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Cook This", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Similar Recipes
            if (uiState.similarMeals.isNotEmpty()) {
                item {
                    Text("Similar Recipes", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = HomePrimaryDark, modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.similarMeals) { similarMeal ->
                            Card(
                                onClick = { onSimilarMealClick(similarMeal.id) },
                                modifier = Modifier.width(150.dp),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Column {
                                    AsyncImage(model = similarMeal.imageUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxWidth().height(100.dp))
                                    Column(modifier = Modifier.padding(8.dp)) {
                                        Text(similarMeal.nameEn, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, maxLines = 2, color = HomePrimaryDark)
                                        Text(similarMeal.regionOfOrigin, fontSize = 11.sp, color = Color.Gray)
                                    }
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(32.dp))
                }
            }
        }

        // Success badge
        if (uiState.successMessage != null) {
            Card(
                modifier = Modifier.align(Alignment.TopCenter).padding(top = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF4CAF50)),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text(uiState.successMessage ?: "", color = Color.White, modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp), fontWeight = FontWeight.SemiBold)
            }
        }

        // Cook This Bottom Sheet
        if (uiState.showCookThisSheet) {
            MyAssistantSheet(
                uiState = uiState,
                onDismiss = { viewModel.dismissCookThis() },
                onPeopleChange = { viewModel.updatePeopleCount(it) },
                onTimesChange = { viewModel.updateTimesCount(it) },
                onCalculate = { viewModel.calculatePlan() }
            )
        }
    }
}

// ─── Written Recipe Tab ───────────────────────────────────────────────────────

@Composable
private fun WrittenRecipeTab(
    steps: List<RecipeStep>,
    currentStep: Int,
    prepTime: Int,
    onPrev: () -> Unit,
    onNext: () -> Unit
) {
    if (steps.isEmpty()) {
        Text("Recipe steps not available.", color = Color.Gray, modifier = Modifier.padding(8.dp))
        return
    }

    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            // Progress
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Step ${currentStep + 1} / ${steps.size}", fontWeight = FontWeight.SemiBold, color = HomePrimary)
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Icon(Icons.Default.Timer, null, tint = HomePrimary, modifier = Modifier.size(14.dp))
                    Text("~$prepTime min", fontSize = 12.sp, color = HomePrimary)
                }
            }
            LinearProgressIndicator(
                progress = { (currentStep + 1).toFloat() / steps.size },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                color = HomePrimary,
                trackColor = HomePrimary.copy(0.2f)
            )

            // Step box
            Box(
                modifier = Modifier.fillMaxWidth().background(HomeBackground, RoundedCornerShape(12.dp)).padding(16.dp),
                contentAlignment = Alignment.TopStart
            ) {
                Text(steps[currentStep].instructionEn, style = MaterialTheme.typography.bodyLarge, color = HomePrimaryDark, lineHeight = 24.sp)
            }

            // Navigation
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                OutlinedButton(onClick = onPrev, enabled = currentStep > 0, shape = RoundedCornerShape(10.dp)) {
                    Icon(Icons.Default.ChevronLeft, null)
                    Text("Previous")
                }
                Button(onClick = onNext, enabled = currentStep < steps.size - 1, shape = RoundedCornerShape(10.dp), colors = ButtonDefaults.buttonColors(containerColor = HomePrimary)) {
                    Text("Next")
                    Icon(Icons.Default.ChevronRight, null)
                }
            }
        }
    }
}

// ─── Video Recipe Tab ─────────────────────────────────────────────────────────

@Composable
private fun VideoRecipeTab(meal: Meal, steps: List<RecipeStep>) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (meal.presentationVideoUrl != null) {
                Box(
                    modifier = Modifier.fillMaxWidth().height(200.dp).clip(RoundedCornerShape(12.dp)).background(Color.Black),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.PlayCircle, "Play video", tint = Color.White, modifier = Modifier.size(56.dp))
                    // In real implementation: AndroidView with ExoPlayer
                }
            } else {
                EmptyVideoState()
            }

            Text("Steps", fontWeight = FontWeight.SemiBold, color = HomePrimaryDark)
            steps.forEachIndexed { index, step ->
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(modifier = Modifier.size(24.dp).background(HomePrimary, CircleShape), contentAlignment = Alignment.Center) {
                        Text("${index + 1}", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Text(step.instructionEn, style = MaterialTheme.typography.bodySmall, color = Color.DarkGray, modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun EmptyVideoState() {
    Box(modifier = Modifier.fillMaxWidth().height(140.dp).clip(RoundedCornerShape(12.dp)).background(Color(0xFFEEEEEE)), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(Icons.Default.VideocamOff, null, tint = Color.Gray, modifier = Modifier.size(36.dp))
            Text("Video not available", color = Color.Gray)
        }
    }
}

// ─── MyAssistant Bottom Sheet ─────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MyAssistantSheet(
    uiState: MealDetailUiState,
    onDismiss: () -> Unit,
    onPeopleChange: (Int) -> Unit,
    onTimesChange: (Int) -> Unit,
    onCalculate: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = HomeSurface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(modifier = Modifier.padding(24.dp).navigationBarsPadding(), verticalArrangement = Arrangement.spacedBy(20.dp)) {
            Text("🍽️ MyAssistant", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = HomePrimaryDark)
            Text("Plan your cooking session", color = Color.Gray, fontSize = 14.sp)

            // People Count
            NumericStepper(label = "People eating", value = uiState.peopleCount, onValueChange = onPeopleChange)

            // Times Count
            NumericStepper(label = "Times this meal", value = uiState.timesCount, onValueChange = onTimesChange)

            // Calculate Button
            Button(
                onClick = onCalculate,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(HomePrimary),
                enabled = !uiState.isCalculating
            ) {
                if (uiState.isCalculating) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Icon(Icons.Default.Calculate, null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Calculate Plan", fontWeight = FontWeight.SemiBold)
                }
            }

            // Results
            if (uiState.cookingPlan != null) {
                CookingPlanResults(plan = uiState.cookingPlan)
            }

            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
private fun NumericStepper(label: String, value: Int, onValueChange: (Int) -> Unit) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, fontWeight = FontWeight.Medium, color = HomePrimaryDark)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            IconButton(onClick = { onValueChange(value - 1) }, modifier = Modifier.size(36.dp).background(HomePrimary.copy(0.1f), CircleShape)) {
                Icon(Icons.Default.Remove, null, tint = HomePrimary)
            }
            Text("$value", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = HomePrimaryDark)
            IconButton(onClick = { onValueChange(value + 1) }, modifier = Modifier.size(36.dp).background(HomePrimary, CircleShape)) {
                Icon(Icons.Default.Add, null, tint = Color.White)
            }
        }
    }
}

@Composable
private fun CookingPlanResults(plan: CookingPlanResponse) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeBackground)) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("📋 Your Cooking Plan", fontWeight = FontWeight.Bold, color = HomePrimaryDark)
            Divider()
            plan.ingredients.forEach { ingredient ->
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("${ingredient.name} (${ingredient.scaledQuantity} ${ingredient.unit})", fontSize = 13.sp, modifier = Modifier.weight(1f))
                    Text("${ingredient.costXaf.toInt()} XAF", fontSize = 13.sp, color = HomePrimary, fontWeight = FontWeight.Medium)
                }
            }
            Divider()
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Total Cost", fontWeight = FontWeight.Bold, color = HomePrimaryDark)
                Text("${plan.totalCostXaf.toInt()} XAF", fontWeight = FontWeight.Bold, color = HomePrimary, fontSize = 16.sp)
            }
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Total Time", fontWeight = FontWeight.Medium, color = HomePrimaryDark)
                Text("${plan.totalPrepTimeMinutes} min", fontWeight = FontWeight.Medium, color = HomePrimary)
            }

            OutlinedButton(
                onClick = { /* Share shopping list */ },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.Share, null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Generate Shopping List")
            }
        }
    }
}

// ─── Helper Composable ────────────────────────────────────────────────────────

@Composable
private fun SectionWithCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
        Text(title, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = HomePrimaryDark, modifier = Modifier.padding(bottom = 8.dp))
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface)) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                content()
            }
        }
    }
}
