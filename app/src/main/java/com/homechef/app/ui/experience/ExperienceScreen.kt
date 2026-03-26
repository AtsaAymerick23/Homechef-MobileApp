package com.homechef.app.ui.experience

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil3.compose.AsyncImage
import com.homechef.app.data.model.Badge
import com.homechef.app.data.model.UserBadge
import com.homechef.app.data.model.UserHistory
import com.homechef.app.data.repository.AuthRepository
import com.homechef.app.data.repository.UserRepository
import com.homechef.app.ui.components.EmptyState
import com.homechef.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

data class ExperienceUiState(
    val history: List<UserHistory> = emptyList(),
    val userBadges: List<UserBadge> = emptyList(),
    val allBadges: List<Badge> = emptyList(),
    val selectedTab: Int = 0,
    val isLoading: Boolean = true
)

@HiltViewModel
class ExperienceViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ExperienceUiState())
    val uiState: StateFlow<ExperienceUiState> = _uiState.asStateFlow()

    init { loadData() }

    private fun loadData() {
        val userId = authRepository.currentUserId ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            launch {
                userRepository.getUserHistory(userId)
                    .onSuccess { h -> _uiState.update { it.copy(history = h) } }
            }
            launch {
                userRepository.getUserBadges(userId)
                    .onSuccess { b -> _uiState.update { it.copy(userBadges = b) } }
            }
            launch {
                userRepository.getAllBadges()
                    .onSuccess { b -> _uiState.update { it.copy(allBadges = b) } }
            }
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun selectTab(tab: Int) = _uiState.update { it.copy(selectedTab = tab) }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

@Composable
fun ExperienceScreen(
    onMealClick: (String) -> Unit,
    viewModel: ExperienceViewModel
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(HomeBackground)) {
        Box(modifier = Modifier.fillMaxWidth().background(HomePrimary).padding(16.dp)) {
            Text("⭐ My Experience", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
        }

        TabRow(selectedTabIndex = uiState.selectedTab, containerColor = HomeSurface, contentColor = HomePrimary) {
            Tab(selected = uiState.selectedTab == 0, onClick = { viewModel.selectTab(0) }, text = { Text("History") })
            Tab(selected = uiState.selectedTab == 1, onClick = { viewModel.selectTab(1) }, text = { Text("Badges") })
        }

        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = HomePrimary)
            }
            return@Column
        }

        if (uiState.selectedTab == 0) {
            HistoryTab(history = uiState.history, onMealClick = onMealClick)
        } else {
            BadgesTab(userBadges = uiState.userBadges, allBadges = uiState.allBadges)
        }
    }
}

// ─── History Tab ──────────────────────────────────────────────────────────────

@Composable
private fun HistoryTab(history: List<UserHistory>, onMealClick: (String) -> Unit) {
    if (history.isEmpty()) {
        EmptyState("🍳", "No History Yet", "Cook your first meal to see it here!", modifier = Modifier.fillMaxSize().padding(top = 40.dp))
        return
    }

    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            // Summary stats
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatCard("Meals Cooked", "${history.size}", "🍽️", modifier = Modifier.weight(1f))
                StatCard("Total Cost", "${history.sumOf { it.totalCostXaf }.toInt()} XAF", "💰", modifier = Modifier.weight(1f))
                StatCard("Points Earned", "${history.sumOf { it.chefPointsEarned }}", "⭐", modifier = Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(4.dp))
        }

        items(history, key = { it.id }) { entry ->
            HistoryCard(entry = entry, onClick = { onMealClick(entry.mealId) })
        }
    }
}

@Composable
private fun StatCard(label: String, value: String, emoji: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(HomeSurface)) {
        Column(modifier = Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(emoji, fontSize = 20.sp)
            Text(value, fontWeight = FontWeight.Bold, color = HomePrimary, fontSize = 14.sp)
            Text(label, fontSize = 10.sp, color = Color.Gray)
        }
    }
}

@Composable
private fun HistoryCard(entry: UserHistory, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(HomeSurface), onClick = onClick) {
        Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            // Meal thumbnail
            if (entry.meal?.imageUrl != null) {
                AsyncImage(model = entry.meal.imageUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.size(60.dp).let { it.background(Color.LightGray, RoundedCornerShape(8.dp)) })
            } else {
                Box(modifier = Modifier.size(60.dp).background(HomePrimary.copy(0.1f), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                    Text("🍽️", fontSize = 24.sp)
                }
            }

            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(entry.meal?.nameEn ?: "Unknown Meal", fontWeight = FontWeight.SemiBold, color = HomePrimaryDark)
                Text(entry.cookedAt.take(10), fontSize = 12.sp, color = Color.Gray)
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("👥 ${entry.peopleCount}", fontSize = 12.sp, color = Color.DarkGray)
                    Text("💰 ${entry.totalCostXaf.toInt()} XAF", fontSize = 12.sp, color = HomePrimary)
                }
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("⭐", fontSize = 16.sp)
                Text("+${entry.chefPointsEarned}", fontWeight = FontWeight.Bold, color = HomeAccent, fontSize = 13.sp)
            }
        }
    }
}

// ─── Badges Tab ───────────────────────────────────────────────────────────────

@Composable
private fun BadgesTab(userBadges: List<UserBadge>, allBadges: List<Badge>) {
    val earnedIds = userBadges.map { it.badgeId }.toSet()

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("${earnedIds.size} / ${allBadges.size} Badges Earned", fontWeight = FontWeight.SemiBold, color = HomePrimary, modifier = Modifier.padding(bottom = 12.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(allBadges, key = { it.id }) { badge ->
                val isEarned = badge.id in earnedIds
                val awardedBadge = userBadges.find { it.badgeId == badge.id }
                BadgeItem(badge = badge, isEarned = isEarned, awardedAt = awardedBadge?.awardedAt)
            }
        }
    }
}

@Composable
private fun BadgeItem(badge: Badge, isEarned: Boolean, awardedAt: String?) {
    Card(
        modifier = Modifier.fillMaxWidth().alpha(if (isEarned) 1f else 0.45f),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(if (isEarned) HomeSurface else Color(0xFFEEEEEE)),
        border = if (isEarned) CardDefaults.outlinedCardBorder() else null
    ) {
        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Box(modifier = Modifier.size(48.dp), contentAlignment = Alignment.Center) {
                if (badge.iconUrl.isNotEmpty()) {
                    AsyncImage(model = badge.iconUrl, contentDescription = badge.nameEn, contentScale = ContentScale.Fit, modifier = Modifier.fillMaxSize())
                } else {
                    Text(if (isEarned) "🏅" else "🔒", fontSize = 28.sp)
                }
            }
            Text(badge.nameEn, fontWeight = FontWeight.SemiBold, fontSize = 11.sp, color = if (isEarned) HomePrimaryDark else Color.Gray, maxLines = 2, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            if (isEarned && awardedAt != null) {
                Text(awardedAt.take(10), fontSize = 9.sp, color = Color.Gray)
            } else if (!isEarned) {
                Text("${badge.requiredPoints} pts needed", fontSize = 9.sp, color = Color.Gray)
            }
        }
    }
}
