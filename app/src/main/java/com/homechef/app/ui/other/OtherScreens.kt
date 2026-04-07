package com.homechef.app.ui.other

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
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
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
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

            // Did You K    now
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
    AboutDeveloper("Tanefo Valentin", "Developer 1", "pic1.png"),
    AboutDeveloper("Yemeli Tane", "Developer 3", "pic2.png"),
)

private val features = listOf(
    Feature(
        emoji = "🏺",
        title = "Cultural Preservation",
        description = "We document traditional recipes that have been passed down through generations, preserving cooking methods and ingredients that are central to Cameroonian cultural identity."
    ),
    Feature(
        emoji = "🌍",
        title = "Global Community",
        description = "We connect food enthusiasts from around the world who share a passion for Cameroonian cuisine, creating a community where cultural exchange happens through food."
    ),
)

private data class AboutDeveloper(val name: String, val role: String, val photoFileName: String)
data class Feature(val emoji: String, val title: String, val description: String)

@Composable
fun AboutScreen() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(HomeBackground),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {

        // ── Page Title ──────────────────────────────────────────────────────
        item {
            Text(
                text = "About HomeChef",
                fontWeight = FontWeight.Bold,
                fontSize = 26.sp,
                color = HomePrimaryDark,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 20.dp)
            )
        }

        // ── Our Mission Card ────────────────────────────────────────────────
        item {
            Card(
                modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 6.dp)
                    .fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = HomeSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Our Mission",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = HomePrimaryDark
                    )
                    Text(
                        text = "HomeChef is dedicated to preserving and promoting Cameroonian culinary traditions by creating a comprehensive digital repository of recipes from all regions of Cameroon.",
                        fontSize = 14.sp,
                        color = Color.DarkGray,
                        lineHeight = 22.sp
                    )
                    Text(
                        text = "We aim to make traditional Cameroonian cooking accessible to everyone, whether you're a Cameroonian living abroad missing the tastes of home, or someone interested in exploring the rich and diverse flavors of Cameroonian cuisine.",
                        fontSize = 14.sp,
                        color = Color.DarkGray,
                        lineHeight = 22.sp
                    )
                }
            }
        }

        // ── Feature Cards (Cultural Preservation, Global Community) ─────────
        items(features) { feature ->
            FeatureCard(feature = feature)
        }

        // ── Our Team Section ────────────────────────────────────────────────
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Our Team",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = HomePrimaryDark,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        item {
            Card(
                modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 4.dp)
                    .fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = HomeSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Text(
                    text = "HomeChef was created by a team of Cameroonian food enthusiasts, chefs, and software developers who are passionate about sharing their culinary heritage with the world.",
                    fontSize = 14.sp,
                    color = Color.DarkGray,
                    lineHeight = 22.sp,
                    modifier = Modifier.padding(20.dp)
                )
            }
        }

        // Developer photo cards
        items(developers) { dev ->
            DeveloperCard(developer = dev)
        }

        // ── Contact Us Section ──────────────────────────────────────────────
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Contact Us",
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = HomePrimaryDark,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        item {
            Card(
                modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 4.dp)
                    .fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = HomeSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "We'd love to hear from you! If you have questions, suggestions, or would like to contribute your own recipes, please reach out to us.",
                        fontSize = 14.sp,
                        color = Color.DarkGray,
                        lineHeight = 22.sp
                    )

                    // Email row
                    Card(
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = HomeBackground)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Email", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = HomePrimaryDark)
                            Text("homechefcm@gmail.com", fontSize = 14.sp, color = Color.DarkGray)
                        }
                    }

                    // Social Media row
                    Card(
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = HomeBackground)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Social Media", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = HomePrimaryDark)
                            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                                listOf("Instagram", "Facebook", "Twitter").forEach { platform ->
                                    Text(
                                        text = platform,
                                        fontSize = 14.sp,
                                        color = HomePrimary,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ── Feature Card (emoji + title + description) ───────────────────────────────
@Composable
private fun FeatureCard(feature: Feature) {
    Card(
        modifier = Modifier
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = HomeSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(text = feature.emoji, fontSize = 32.sp)
            Text(
                text = feature.title,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = HomePrimaryDark
            )
            Text(
                text = feature.description,
                fontSize = 14.sp,
                color = Color.DarkGray,
                lineHeight = 22.sp
            )
        }
    }
}

// ── Developer Card (photo avatar, centered name + role) ──────────────────────
@Composable
private fun DeveloperCard(developer: AboutDeveloper) {
    val context = LocalContext.current

    // Load pic1.png / pic2.png from res/raw or assets at runtime
    val painter: Painter = remember(developer.photoFileName) {
        try {
            val assetStream = context.assets.open(developer.photoFileName)
            val bitmap = BitmapFactory.decodeStream(assetStream)
            BitmapPainter(bitmap.asImageBitmap())
        } catch (_: Exception) {
            // Fallback: try res/raw by stripping extension
            try {
                val resName = developer.photoFileName.substringBeforeLast(".")
                val resId = context.resources.getIdentifier(resName, "raw", context.packageName)
                val stream = context.resources.openRawResource(resId)
                val bitmap = BitmapFactory.decodeStream(stream)
                BitmapPainter(bitmap.asImageBitmap())
            } catch (_: Exception) {
                BitmapPainter(ImageBitmap(72, 72)) // transparent placeholder
            }
        }
    }
    Card(
        modifier = Modifier
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = HomeSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 24.dp, horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Circular photo avatar
            Image(
                painter = painter,
                contentDescription = developer.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
            )
            Text(
                text = developer.name,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = HomePrimaryDark
            )
            Text(
                text = developer.role,
                fontSize = 13.sp,
                color = Color.Gray
            )
        }
    }
}