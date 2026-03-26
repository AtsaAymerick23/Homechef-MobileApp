package com.homechef.app.ui.leaderboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil3.compose.AsyncImage
import com.homechef.app.data.model.LeaderboardEntry
import com.homechef.app.data.repository.AuthRepository
import com.homechef.app.data.repository.LeaderboardRepository
import com.homechef.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

data class LeaderboardUiState(
    val entries: List<LeaderboardEntry> = emptyList(),
    val currentUserRank: Int = 0,
    val currentUserId: String = "",
    val isLoading: Boolean = true,
    val error: String? = null
)

@HiltViewModel
class LeaderboardViewModel @Inject constructor(
    private val leaderboardRepository: LeaderboardRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(LeaderboardUiState())
    val uiState: StateFlow<LeaderboardUiState> = _uiState.asStateFlow()

    init {
        val userId = authRepository.currentUserId ?: ""
        _uiState.update { it.copy(currentUserId = userId) }
        loadLeaderboard()
    }

    fun loadLeaderboard() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            leaderboardRepository.getLeaderboard()
                .onSuccess { entries ->
                    _uiState.update { it.copy(entries = entries, isLoading = false) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(isLoading = false, error = e.message) }
                }
            val userId = authRepository.currentUserId ?: return@launch
            leaderboardRepository.getUserRank(userId)
                .onSuccess { rank -> _uiState.update { it.copy(currentUserRank = rank) } }
        }
    }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

@Composable
fun LeaderboardScreen(viewModel: LeaderboardViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(HomeBackground)) {
        // Header
        Box(
            modifier = Modifier.fillMaxWidth().background(HomePrimary).padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("🏆 Leaderboard", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Top Chefs by ChefPoints", color = Color.White.copy(0.8f), fontSize = 13.sp)
            }
        }

        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = HomePrimary)
            }
            return@Column
        }

        LazyColumn(modifier = Modifier.weight(1f), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            // Top 3 Podium
            if (uiState.entries.size >= 3) {
                item { PodiumSection(top3 = uiState.entries.take(3)) }
            }

            // Rest of ranking
            itemsIndexed(uiState.entries.drop(3)) { index, entry ->
                LeaderboardRow(entry = entry, isCurrentUser = entry.userId == uiState.currentUserId)
            }
        }

        // Sticky current user row if outside top 10
        val userInTop10 = uiState.entries.take(10).any { it.userId == uiState.currentUserId }
        if (!userInTop10 && uiState.currentUserRank > 0) {
            val userEntry = uiState.entries.find { it.userId == uiState.currentUserId }
            if (userEntry != null) {
                Divider()
                LeaderboardRow(entry = userEntry, isCurrentUser = true, modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
            }
        }
    }
}

@Composable
private fun PodiumSection(top3: List<LeaderboardEntry>) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.SpaceEvenly) {
        // 2nd place
        PodiumEntry(entry = top3[1], medal = "🥈", height = 90.dp, medalColor = SilverColor)
        // 1st place
        PodiumEntry(entry = top3[0], medal = "🥇", height = 120.dp, medalColor = GoldColor)
        // 3rd place
        PodiumEntry(entry = top3[2], medal = "🥉", height = 70.dp, medalColor = BronzeColor)
    }
}

@Composable
private fun PodiumEntry(entry: LeaderboardEntry, medal: String, height: androidx.compose.ui.unit.Dp, medalColor: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(medal, fontSize = 24.sp)
        Box(modifier = Modifier.size(52.dp).clip(CircleShape).background(medalColor.copy(0.2f)).padding(2.dp)) {
            if (entry.profilePicUrl != null) {
                AsyncImage(model = entry.profilePicUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize().clip(CircleShape))
            } else {
                Box(modifier = Modifier.fillMaxSize().clip(CircleShape).background(HomePrimary), contentAlignment = Alignment.Center) {
                    Text(entry.username.take(1).uppercase(), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            }
        }
        Text(entry.username, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = HomePrimaryDark, maxLines = 1)
        Text("${entry.chefPoints} pts", fontSize = 11.sp, color = HomePrimary, fontWeight = FontWeight.Medium)
        Box(modifier = Modifier.width(80.dp).height(height).background(medalColor.copy(0.3f), RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp)), contentAlignment = Alignment.Center) {
            Text("#${entry.rank}", fontWeight = FontWeight.Black, color = medalColor, fontSize = 20.sp)
        }
    }
}

@Composable
private fun LeaderboardRow(entry: LeaderboardEntry, isCurrentUser: Boolean, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(if (isCurrentUser) HomePrimary.copy(0.1f) else HomeSurface),
        border = if (isCurrentUser) CardDefaults.outlinedCardBorder() else null
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("#${entry.rank}", fontWeight = FontWeight.Bold, color = if (isCurrentUser) HomePrimary else Color.Gray, fontSize = 14.sp, modifier = Modifier.width(36.dp))
            Box(modifier = Modifier.size(40.dp).clip(CircleShape).background(HomePrimary.copy(0.1f))) {
                if (entry.profilePicUrl != null) {
                    AsyncImage(model = entry.profilePicUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                } else {
                    Box(modifier = Modifier.fillMaxSize().background(HomePrimary), contentAlignment = Alignment.Center) {
                        Text(entry.username.take(1).uppercase(), color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
            Text(if (isCurrentUser) "${entry.username} (You)" else entry.username, fontWeight = if (isCurrentUser) FontWeight.Bold else FontWeight.Normal, modifier = Modifier.weight(1f), color = HomePrimaryDark)
            Text("${entry.chefPoints} pts", fontWeight = FontWeight.SemiBold, color = HomePrimary)
        }
    }
}
