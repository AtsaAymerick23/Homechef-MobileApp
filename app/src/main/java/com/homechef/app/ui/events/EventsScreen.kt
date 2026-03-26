package com.homechef.app.ui.events

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.homechef.app.data.model.Event
import com.homechef.app.data.model.EventSubmission
import com.homechef.app.data.repository.EventRepository
import com.homechef.app.ui.components.EmptyState
import com.homechef.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

data class EventsUiState(
    val upcomingEvents: List<Event> = emptyList(),
    val pastEvents: List<Event> = emptyList(),
    val selectedTab: Int = 0,
    val isLoading: Boolean = true,
    val error: String? = null
)

@HiltViewModel
class EventsViewModel @Inject constructor(
    private val eventRepository: EventRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(EventsUiState())
    val uiState: StateFlow<EventsUiState> = _uiState.asStateFlow()

    init {
        loadEvents()
    }

    private fun loadEvents() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            launch {
                eventRepository.getUpcomingEvents()
                    .onSuccess { events -> _uiState.update { it.copy(upcomingEvents = events) } }
            }
            launch {
                eventRepository.getPastEvents()
                    .onSuccess { events -> _uiState.update { it.copy(pastEvents = events) } }
            }
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun selectTab(tab: Int) = _uiState.update { it.copy(selectedTab = tab) }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

@Composable
fun EventsScreen(viewModel: EventsViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(HomeBackground)) {
        // Header
        Box(modifier = Modifier.fillMaxWidth().background(HomePrimary).padding(16.dp)) {
            Text("🏆 Competitions & Events", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
        }

        // Tabs
        TabRow(selectedTabIndex = uiState.selectedTab, containerColor = HomeSurface, contentColor = HomePrimary) {
            Tab(selected = uiState.selectedTab == 0, onClick = { viewModel.selectTab(0) }, text = { Text("Upcoming") })
            Tab(selected = uiState.selectedTab == 1, onClick = { viewModel.selectTab(1) }, text = { Text("Past") })
        }

        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = HomePrimary)
            }
            return@Column
        }

        val events = if (uiState.selectedTab == 0) uiState.upcomingEvents else uiState.pastEvents

        if (events.isEmpty()) {
            EmptyState(
                emoji = if (uiState.selectedTab == 0) "📅" else "📚",
                title = "No Events",
                subtitle = if (uiState.selectedTab == 0) "No upcoming events. Check back soon!" else "No past events yet.",
                modifier = Modifier.fillMaxSize().padding(top = 40.dp)
            )
            return@Column
        }

        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(events, key = { it.id }) { event ->
                EventCard(event = event, isUpcoming = uiState.selectedTab == 0)
            }
        }
    }
}

@Composable
private fun EventCard(event: Event, isUpcoming: Boolean) {
    val statusColor = when (event.status) {
        "ACTIVE" -> Color(0xFF4CAF50)
        "UPCOMING" -> HomeAccent
        else -> Color.Gray
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(HomeSurface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(event.titleEn, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = HomePrimaryDark)
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Default.CalendarToday, null, tint = Color.Gray, modifier = Modifier.size(12.dp))
                        Text("${event.startDate} – ${event.endDate}", fontSize = 11.sp, color = Color.Gray)
                    }
                }
                Surface(shape = RoundedCornerShape(8.dp), color = statusColor.copy(0.15f)) {
                    Text(event.status, color = statusColor, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                }
            }

            Text(event.descriptionEn, fontSize = 13.sp, color = Color.DarkGray, maxLines = 3)

            // Prize
            Row(
                modifier = Modifier.fillMaxWidth().background(HomeBackground, RoundedCornerShape(10.dp)).padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("🎁", fontSize = 18.sp)
                Column {
                    Text("Prize", fontSize = 11.sp, color = Color.Gray)
                    Text(event.prizeDescription, fontWeight = FontWeight.SemiBold, color = HomePrimaryDark, fontSize = 13.sp)
                }
            }

            // Submit entry button for active events
            if (event.status == "ACTIVE") {
                Button(
                    onClick = { /* Navigate to video upload */ },
                    modifier = Modifier.fillMaxWidth().height(44.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(HomePrimary)
                ) {
                    Icon(Icons.Default.VideoCall, null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Submit Entry (+2 pts)", fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
