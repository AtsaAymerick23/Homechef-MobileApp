package com.homechef.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
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
import com.homechef.app.data.model.Meal
import com.homechef.app.data.repository.MealRepository
import com.homechef.app.ui.components.DifficultyBadge
import com.homechef.app.ui.components.MealCard
import com.homechef.app.ui.components.LoadingCard
import com.homechef.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

data class HomeUiState(
    val featuredMeals: List<Meal> = emptyList(),
    val feedMeals: List<Meal> = emptyList(),
    val isLoadingFeatured: Boolean = true,
    val isLoadingFeed: Boolean = true,
    val isLoadingMore: Boolean = false,
    val currentPage: Int = 0,
    val hasMore: Boolean = true,
    val error: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val mealRepository: MealRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadFeaturedMeals()
        loadFeedMeals()
    }

    private fun loadFeaturedMeals() {
        viewModelScope.launch {
            mealRepository.getFeaturedMeals()
                .onSuccess { meals ->
                    _uiState.update { it.copy(featuredMeals = meals, isLoadingFeatured = false) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(isLoadingFeatured = false, error = e.message) }
                }
        }
    }

    fun loadFeedMeals(loadMore: Boolean = false) {
        if (_uiState.value.isLoadingFeed || _uiState.value.isLoadingMore) return
        if (loadMore && !_uiState.value.hasMore) return

        viewModelScope.launch {
            val page = if (loadMore) _uiState.value.currentPage + 1 else 0
            _uiState.update {
                if (loadMore) it.copy(isLoadingMore = true) else it.copy(isLoadingFeed = true)
            }

            mealRepository.getMeals(page = page, pageSize = 7)
                .onSuccess { meals ->
                    _uiState.update { state ->
                        state.copy(
                            feedMeals = if (loadMore) state.feedMeals + meals else meals,
                            isLoadingFeed = false,
                            isLoadingMore = false,
                            currentPage = page,
                            hasMore = meals.size == 7
                        )
                    }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(isLoadingFeed = false, isLoadingMore = false, error = e.message) }
                }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(currentPage = 0, hasMore = true) }
        loadFeaturedMeals()
        loadFeedMeals()
    }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

@Composable
fun HomeScreen(
    onMealClick: (String) -> Unit,
    viewModel: HomeViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()

    // Infinite scroll detection
    val shouldLoadMore by remember {
        derivedStateOf {
            val lastVisible = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            val total = listState.layoutInfo.totalItemsCount
            lastVisible >= total - 3 && !uiState.isLoadingMore && uiState.hasMore
        }
    }

    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore) viewModel.loadFeedMeals(loadMore = true)
    }

    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize().background(HomeBackground),
        contentPadding = PaddingValues(bottom = 16.dp)
    ) {
        // ── Hero Carousel ─────────────────────────────────────────────────────
        item {
            HeroCarousel(
                meals = uiState.featuredMeals,
                isLoading = uiState.isLoadingFeatured,
                onMealClick = onMealClick
            )
        }

        // ── Section Header ────────────────────────────────────────────────────
        item {
            Text(
                text = "For You",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = HomePrimaryDark,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
            )
        }

        // ── Feed Skeletons ────────────────────────────────────────────────────
        if (uiState.isLoadingFeed) {
            items(3) { LoadingCard() }
        }

        // ── Meal Feed ─────────────────────────────────────────────────────────
        items(uiState.feedMeals, key = { it.id }) { meal ->
            MealCard(
                meal = meal,
                onClick = { onMealClick(meal.id) },
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
            )
        }

        // ── Load More Indicator ───────────────────────────────────────────────
        if (uiState.isLoadingMore) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = HomePrimary, modifier = Modifier.size(32.dp))
                }
            }
        }
    }
}

// ─── Hero Carousel ────────────────────────────────────────────────────────────

@Composable
private fun HeroCarousel(
    meals: List<Meal>,
    isLoading: Boolean,
    onMealClick: (String) -> Unit
) {
    if (isLoading) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .background(Color.LightGray.copy(alpha = 0.3f))
        )
        return
    }

    if (meals.isEmpty()) return

    val pagerState = rememberPagerState { meals.size }

    // Auto-scroll
    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(3500)
            val nextPage = (pagerState.currentPage + 1) % meals.size
            pagerState.animateScrollToPage(nextPage)
        }
    }

    Box(modifier = Modifier.fillMaxWidth()) {
        HorizontalPager(state = pagerState, modifier = Modifier.fillMaxWidth()) { page ->
            HeroCard(meal = meals[page], onMealClick = onMealClick)
        }

        // Page indicators
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            repeat(meals.size) { index ->
                val isSelected = index == pagerState.currentPage
                Box(
                    modifier = Modifier
                        .size(if (isSelected) 20.dp else 6.dp, 6.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(if (isSelected) HomeAccent else Color.White.copy(alpha = 0.5f))
                )
            }
        }
    }
}

@Composable
private fun HeroCard(meal: Meal, onMealClick: (String) -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(220.dp)
            .clickable { onMealClick(meal.id) }
    ) {
        AsyncImage(
            model = meal.imageUrl,
            contentDescription = meal.nameEn,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.75f)),
                        startY = 80f
                    )
                )
        )
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(
                    onClick = {},
                    label = { Text(meal.regionOfOrigin, fontSize = 11.sp, color = Color.White) },
                    colors = AssistChipDefaults.assistChipColors(containerColor = HomePrimary.copy(alpha = 0.8f)),
                    border = null,
                    modifier = Modifier.height(24.dp)
                )
                DifficultyBadge(meal.difficulty)
            }
            Text(meal.nameEn, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Button(
                    onClick = { onMealClick(meal.id) },
                    colors = ButtonDefaults.buttonColors(containerColor = HomeAccent),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    modifier = Modifier.height(32.dp)
                ) {
                    Text("Explore", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.ArrowForward, null, modifier = Modifier.size(14.dp))
                }
            }
        }
    }
}
