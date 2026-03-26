package com.homechef.app.ui.other

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil3.compose.AsyncImage
import com.homechef.app.data.model.Developer
import com.homechef.app.data.model.Partnership
import com.homechef.app.data.model.RecipeOfTheDay
import com.homechef.app.data.model.UserRecipe
import com.homechef.app.data.repository.AuthRepository
import com.homechef.app.data.repository.RecipeOfTheDayRepository
import com.homechef.app.data.repository.UserRepository
import com.homechef.app.ui.components.EmptyState
import com.homechef.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ═══════════════════════════════════════════════════════════════════════════
// My Recipes
// ═══════════════════════════════════════════════════════════════════════════

data class MyRecipesUiState(
    val recipes: List<UserRecipe> = emptyList(),
    val isLoading: Boolean = true
)

@HiltViewModel
class MyRecipesViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val authRepository: AuthRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(MyRecipesUiState())
    val uiState: StateFlow<MyRecipesUiState> = _uiState.asStateFlow()

    init { loadRecipes() }

    private fun loadRecipes() {
        val userId = authRepository.currentUserId ?: return
        viewModelScope.launch {
            userRepository.getUserRecipes(userId)
                .onSuccess { recipes -> _uiState.update { it.copy(recipes = recipes, isLoading = false) } }
                .onFailure { _uiState.update { it.copy(isLoading = false) } }
        }
    }

    fun toggleVisibility(recipe: UserRecipe) {
        viewModelScope.launch {
            userRepository.toggleRecipeVisibility(recipe.id, !recipe.isPublic)
                .onSuccess {
                    _uiState.update { state ->
                        state.copy(recipes = state.recipes.map { if (it.id == recipe.id) it.copy(isPublic = !recipe.isPublic) else it })
                    }
                }
        }
    }

    fun deleteRecipe(recipeId: String) {
        viewModelScope.launch {
            userRepository.deleteUserRecipe(recipeId)
                .onSuccess { _uiState.update { it.copy(recipes = it.recipes.filter { r -> r.id != recipeId }) } }
        }
    }
}

@Composable
fun MyRecipesScreen(onCreateRecipe: () -> Unit, viewModel: MyRecipesViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(HomeBackground)) {
        Row(
            modifier = Modifier.fillMaxWidth().background(HomePrimary).padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("📖 My Recipes", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
            FloatingActionButton(onClick = onCreateRecipe, containerColor = HomeAccent, modifier = Modifier.size(40.dp)) {
                Icon(Icons.Default.Add, "Create recipe", tint = Color.White, modifier = Modifier.size(20.dp))
            }
        }

        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = HomePrimary) }
            return@Column
        }

        if (uiState.recipes.isEmpty()) {
            EmptyState("📝", "No Recipes Yet", "Create your first custom recipe!", modifier = Modifier.fillMaxSize().padding(top = 40.dp)) {
                Button(onClick = onCreateRecipe, colors = ButtonDefaults.buttonColors(HomePrimary), shape = RoundedCornerShape(12.dp)) {
                    Icon(Icons.Default.Add, null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Create Recipe")
                }
            }
            return@Column
        }

        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(uiState.recipes, key = { it.id }) { recipe ->
                UserRecipeCard(recipe = recipe, onToggleVisibility = { viewModel.toggleVisibility(recipe) }, onDelete = { viewModel.deleteRecipe(recipe.id) })
            }
        }
    }
}

@Composable
private fun UserRecipeCard(recipe: UserRecipe, onToggleVisibility: () -> Unit, onDelete: () -> Unit) {
    var showDeleteConfirm by remember { mutableStateOf(false) }

    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(HomeSurface)) {
        Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            if (recipe.imageUrl != null) {
                AsyncImage(model = recipe.imageUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.size(72.dp).let { it.background(Color.LightGray, RoundedCornerShape(8.dp)) })
            } else {
                Box(modifier = Modifier.size(72.dp).background(HomePrimary.copy(0.1f), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) { Text("🍽️", fontSize = 28.sp) }
            }

            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(recipe.titleEn, fontWeight = FontWeight.Bold, color = HomePrimaryDark, modifier = Modifier.weight(1f))
                    Surface(shape = RoundedCornerShape(6.dp), color = if (recipe.isPublic) Color(0xFF4CAF50).copy(0.15f) else Color.Gray.copy(0.15f)) {
                        Text(if (recipe.isPublic) "Public" else "Private", color = if (recipe.isPublic) Color(0xFF4CAF50) else Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
                if (recipe.description.isNotBlank()) Text(recipe.description, fontSize = 12.sp, color = Color.Gray, maxLines = 2)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextButton(onClick = onToggleVisibility, contentPadding = PaddingValues(4.dp)) {
                        Icon(if (recipe.isPublic) Icons.Default.LockOpen else Icons.Default.Lock, null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(if (recipe.isPublic) "Make Private" else "Make Public", fontSize = 11.sp)
                    }
                    TextButton(onClick = { showDeleteConfirm = true }, contentPadding = PaddingValues(4.dp), colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)) {
                        Icon(Icons.Default.Delete, null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Delete", fontSize = 11.sp)
                    }
                }
            }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Delete Recipe?") },
            text = { Text("This action cannot be undone.") },
            confirmButton = { TextButton(onClick = { onDelete(); showDeleteConfirm = false }, colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)) { Text("Delete", fontWeight = FontWeight.Bold) } },
            dismissButton = { TextButton(onClick = { showDeleteConfirm = false }) { Text("Cancel") } }
        )
    }
}

@Composable
fun CreateRecipeScreen(onBack: () -> Unit, onSaved: () -> Unit, viewModel: MyRecipesViewModel) {
    Column(modifier = Modifier.fillMaxSize().background(HomeBackground)) {
        Row(modifier = Modifier.fillMaxWidth().background(HomePrimary).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, null, tint = Color.White) }
            Text("Create Recipe", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
        }
        // Full recipe creation form would be implemented here with fields for title, description, steps, ingredients
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Recipe creation form\n(fields: title, description, steps, ingredients)", color = Color.Gray, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Recipe Of The Day
// ═══════════════════════════════════════════════════════════════════════════

data class RecipeOfTheDayUiState(val recipe: RecipeOfTheDay? = null, val partnership: Partnership? = null, val isLoading: Boolean = true)

@HiltViewModel
class RecipeOfTheDayViewModel @Inject constructor(private val repository: RecipeOfTheDayRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(RecipeOfTheDayUiState())
    val uiState: StateFlow<RecipeOfTheDayUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            launch { repository.getTodayRecipe().onSuccess { r -> _uiState.update { it.copy(recipe = r) } } }
            launch { repository.getActivePartnership().onSuccess { p -> _uiState.update { it.copy(partnership = p) } } }
            _uiState.update { it.copy(isLoading = false) }
        }
    }
}

@Composable
fun RecipeOfTheDayScreen(onViewFullRecipe: (String) -> Unit, viewModel: RecipeOfTheDayViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(HomeBackground).verticalScroll(rememberScrollState())) {
        Box(modifier = Modifier.fillMaxWidth().background(HomePrimary).padding(16.dp)) {
            Text("🌟 Recipe of the Day", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
        }

        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize().height(300.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = HomePrimary) }
            return@Column
        }

        // Show partnership branding if active
        val partnership = uiState.partnership
        if (partnership != null) {
            Card(modifier = Modifier.padding(16.dp).fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface)) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("✨ Featured Partner", fontWeight = FontWeight.SemiBold, color = HomePrimary, fontSize = 12.sp)
                    AsyncImage(model = partnership.logoUrl, contentDescription = null, modifier = Modifier.height(60.dp).fillMaxWidth(), contentScale = ContentScale.Fit)
                    Text(partnership.restaurantName, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = HomePrimaryDark)
                    Button(onClick = { /* Open menu URL */ }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp), colors = ButtonDefaults.buttonColors(HomePrimary)) {
                        Icon(Icons.Default.Restaurant, null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("View Menu")
                    }
                }
            }
        }

        val recipe = uiState.recipe
        val meal = recipe?.meal
        if (recipe != null && meal != null) {
            Card(modifier = Modifier.padding(16.dp).fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface)) {
                Column {
                    AsyncImage(model = meal.imageUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxWidth().height(200.dp))
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(meal.nameEn, fontWeight = FontWeight.Bold, fontSize = 22.sp, color = HomePrimaryDark)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            AssistChip(onClick = {}, label = { Text(meal.regionOfOrigin, fontSize = 11.sp) }, colors = AssistChipDefaults.assistChipColors(containerColor = HomePrimary.copy(0.1f)), border = null)
                            AssistChip(onClick = {}, label = { Text(meal.difficulty, fontSize = 11.sp) }, colors = AssistChipDefaults.assistChipColors(containerColor = HomeAccent.copy(0.1f)), border = null)
                        }
                        Text(meal.descriptionEn, color = Color.DarkGray, style = MaterialTheme.typography.bodyMedium)
                        Button(onClick = { onViewFullRecipe(meal.id) }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(HomePrimary)) {
                            Text("View Full Recipe", fontWeight = FontWeight.SemiBold)
                            Spacer(modifier = Modifier.width(6.dp))
                            Icon(Icons.Default.ArrowForward, null, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }

            // Did You Know
            if (recipe.didYouKnowEn.isNotBlank()) {
                Card(modifier = Modifier.padding(horizontal = 16.dp).fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeAccent.copy(0.1f))) {
                    Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("💡", fontSize = 24.sp)
                        Column {
                            Text("Did You Know?", fontWeight = FontWeight.Bold, color = HomePrimary, fontSize = 13.sp)
                            Text(recipe.didYouKnowEn, fontSize = 13.sp, color = Color.DarkGray, lineHeight = 20.sp)
                        }
                    }
                }
            }
        } else {
            Box(modifier = Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                Text("No recipe scheduled for today.", color = Color.Gray, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            }
        }
        Spacer(modifier = Modifier.height(32.dp))
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// About
// ═══════════════════════════════════════════════════════════════════════════

private val developers = listOf(
    Developer("Team Member 1", "Lead Developer", "Full-stack engineer passionate about African cuisine and mobile development."),
    Developer("Team Member 2", "UI/UX Designer", "Creates beautiful and intuitive interfaces that feel native to Cameroon culture."),
    Developer("Team Member 3", "Backend Engineer", "Supabase & API specialist keeping HomeChef running smoothly."),
    Developer("Team Member 4", "ML / Ontology Engineer", "Builds the semantic recipe recommendation engine using OWL/RDF."),
    Developer("Team Member 5", "Android Developer", "Kotlin expert ensuring the best experience on every Android device."),
    Developer("Team Member 6", "Content & QA", "Curates authentic Cameroonian recipes and ensures quality."),
)

@Composable
fun AboutScreen() {
    LazyColumn(modifier = Modifier.fillMaxSize().background(HomeBackground), contentPadding = PaddingValues(bottom = 32.dp)) {
        item {
            // Header
            Box(modifier = Modifier.fillMaxWidth().background(HomePrimary).padding(24.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(buildAnnotatedString {
                        withStyle(SpanStyle(color = HomeWordmarkHome, fontWeight = FontWeight.Black, fontSize = 36.sp)) { append("Home") }
                        withStyle(SpanStyle(color = HomeWordmarkChef, fontWeight = FontWeight.Black, fontSize = 36.sp)) { append("Chef") }
                    })
                    Text("Version 1.0.0", color = Color.White.copy(0.8f), fontSize = 13.sp)
                }
            }
        }

        item {
            Card(modifier = Modifier.padding(16.dp).fillMaxWidth(), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface)) {
                Column(modifier = Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("🍲 Our Mission", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = HomePrimaryDark)
                    Text(
                        "HomeChef is a gamified culinary platform celebrating the rich and diverse food culture of Cameroon. We connect people to their roots through recipes, cooking challenges, and community events — making African cuisine accessible to everyone.",
                        textAlign = TextAlign.Center,
                        color = Color.DarkGray,
                        lineHeight = 22.sp,
                        fontSize = 14.sp
                    )
                    HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                    Text("👋 A warm greeting to our community! May every meal you cook bring joy, culture, and connection.", textAlign = TextAlign.Center, color = HomePrimary, fontWeight = FontWeight.Medium, fontSize = 13.sp)
                }
            }
        }

        item {
            Text("Meet the Team", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = HomePrimaryDark, modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
        }

        items(developers) { dev ->
            DeveloperCard(developer = dev)
        }
    }
}

@Composable
private fun DeveloperCard(developer: Developer) {
    Card(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp).fillMaxWidth(), shape = RoundedCornerShape(14.dp), colors = CardDefaults.cardColors(HomeSurface)) {
        Row(modifier = Modifier.padding(14.dp), horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(52.dp).clip(CircleShape).background(HomePrimary), contentAlignment = Alignment.Center) {
                Text(developer.name.take(2).uppercase(), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(developer.name, fontWeight = FontWeight.Bold, color = HomePrimaryDark)
                Text(developer.role, fontSize = 12.sp, color = HomePrimary, fontWeight = FontWeight.SemiBold)
                Text(developer.bio, fontSize = 12.sp, color = Color.Gray, lineHeight = 18.sp)
            }
        }
    }
}
