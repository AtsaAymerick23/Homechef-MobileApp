package com.homechef.app.ui.quiz

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.homechef.app.data.model.QuizQuestion
import com.homechef.app.data.repository.AuthRepository
import com.homechef.app.data.repository.QuizRepository
import com.homechef.app.ui.components.EmptyState
import com.homechef.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

data class QuizUiState(
    val questions: List<QuizQuestion> = emptyList(),
    val currentIndex: Int = 0,
    val selectedAnswer: String? = null,
    val isAnswerSubmitted: Boolean = false,
    val score: Int = 0,
    val isCompleted: Boolean = false,
    val isAlreadyDoneToday: Boolean = false,
    val isLoading: Boolean = true,
    val showResult: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class QuizViewModel @Inject constructor(
    private val quizRepository: QuizRepository,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(QuizUiState())
    val uiState: StateFlow<QuizUiState> = _uiState.asStateFlow()

    init {
        loadQuiz()
    }

    private fun loadQuiz() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            val userId = authRepository.currentUserId ?: run {
                _uiState.update { it.copy(isLoading = false, error = "Not authenticated") }
                return@launch
            }

            // Check today's attempts
            quizRepository.getTodayAttempts(userId)
                .onSuccess { attempts ->
                    if (attempts.size >= 10) {
                        _uiState.update { it.copy(isLoading = false, isAlreadyDoneToday = true) }
                        return@launch
                    }
                }

            quizRepository.getDailyQuestions()
                .onSuccess { questions ->
                    _uiState.update { it.copy(questions = questions, isLoading = false) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(isLoading = false, error = e.message) }
                }
        }
    }

    fun selectAnswer(answer: String) {
        if (_uiState.value.isAnswerSubmitted) return
        _uiState.update { it.copy(selectedAnswer = answer) }
    }

    fun submitAnswer() {
        val state = _uiState.value
        val question = state.questions.getOrNull(state.currentIndex) ?: return
        val selected = state.selectedAnswer ?: return

        val isCorrect = selected == question.correctAnswer
        val newScore = if (isCorrect) state.score + 1 else state.score

        _uiState.update { it.copy(isAnswerSubmitted = true, score = newScore) }

        viewModelScope.launch {
            val userId = authRepository.currentUserId ?: return@launch
            quizRepository.submitAnswer(userId, question.id, selected, isCorrect)

            // Award point if correct
            if (isCorrect) {
                quizRepository.awardQuizPoints(userId, 1)
            }

            delay(1200)

            // Advance to next question or complete
            if (state.currentIndex + 1 >= state.questions.size) {
                // Quiz complete
                val bonusPoints = if (newScore == 10) 5 else 0
                if (bonusPoints > 0) {
                    quizRepository.awardQuizPoints(userId, bonusPoints)
                }
                _uiState.update { it.copy(isCompleted = true, showResult = true) }
            } else {
                _uiState.update { it.copy(currentIndex = it.currentIndex + 1, selectedAnswer = null, isAnswerSubmitted = false) }
            }
        }
    }

    fun parseOptions(optionsJson: String): List<String> = runCatching {
        Json.decodeFromString<List<String>>(optionsJson)
    }.getOrElse { listOf("Option A", "Option B", "Option C", "Option D") }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

@Composable
fun QuizScreen(viewModel: QuizViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Box(modifier = Modifier.fillMaxSize().background(HomeBackground)) {
        when {
            uiState.isLoading -> CircularProgressIndicator(modifier = Modifier.align(Alignment.Center), color = HomePrimary)
            uiState.isAlreadyDoneToday -> QuizCompletedToday()
            uiState.showResult -> QuizResultScreen(score = uiState.score, total = uiState.questions.size)
            uiState.questions.isNotEmpty() -> QuizContent(uiState = uiState, viewModel = viewModel)
            uiState.error != null -> EmptyState("❌", "Error", uiState.error ?: "Something went wrong", modifier = Modifier.align(Alignment.Center))
        }
    }
}

@Composable
private fun QuizContent(uiState: QuizUiState, viewModel: QuizViewModel) {
    val question = uiState.questions.getOrNull(uiState.currentIndex) ?: return
    val options = viewModel.parseOptions(question.optionsJson)

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Header
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Daily Quiz", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = HomePrimaryDark)
            Card(colors = CardDefaults.cardColors(HomePrimary), shape = RoundedCornerShape(20.dp)) {
                Text("${uiState.score} pts", color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp))
            }
        }

        // Progress
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Question ${uiState.currentIndex + 1} of ${uiState.questions.size}", color = Color.Gray, fontSize = 13.sp)
                Text("Score: ${uiState.score}/${uiState.currentIndex}", color = HomePrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
            LinearProgressIndicator(
                progress = { (uiState.currentIndex + 1).toFloat() / uiState.questions.size },
                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                color = HomePrimary,
                trackColor = HomePrimary.copy(0.15f)
            )
        }

        // Question Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(HomeSurface),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("🍽️ Culinary Question", fontSize = 12.sp, color = HomePrimary, fontWeight = FontWeight.SemiBold)
                Text(question.questionEn, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = HomePrimaryDark, lineHeight = 26.sp)
            }
        }

        // Options
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            options.forEach { option ->
                AnswerOption(
                    text = option,
                    isSelected = uiState.selectedAnswer == option,
                    isSubmitted = uiState.isAnswerSubmitted,
                    isCorrect = option == question.correctAnswer,
                    onClick = { viewModel.selectAnswer(option) }
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Submit Button
        if (!uiState.isAnswerSubmitted) {
            Button(
                onClick = { viewModel.submitAnswer() },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(HomePrimary),
                enabled = uiState.selectedAnswer != null
            ) {
                Text("Submit Answer", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        } else {
            val isCorrect = uiState.selectedAnswer == question.correctAnswer
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(if (isCorrect) Color(0xFF4CAF50) else MaterialTheme.colorScheme.errorContainer),
                shape = RoundedCornerShape(14.dp)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(if (isCorrect) "✅" else "❌", fontSize = 20.sp)
                    Text(
                        if (isCorrect) "Correct! +1 ChefPoint" else "Incorrect. The answer was: ${question.correctAnswer}",
                        color = if (isCorrect) Color.White else MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

@Composable
private fun AnswerOption(
    text: String,
    isSelected: Boolean,
    isSubmitted: Boolean,
    isCorrect: Boolean,
    onClick: () -> Unit
) {
    val borderColor = when {
        isSubmitted && isCorrect -> Color(0xFF4CAF50)
        isSubmitted && isSelected && !isCorrect -> MaterialTheme.colorScheme.error
        isSelected -> HomePrimary
        else -> Color.LightGray
    }
    val bgColor = when {
        isSubmitted && isCorrect -> Color(0xFF4CAF50).copy(0.1f)
        isSubmitted && isSelected && !isCorrect -> MaterialTheme.colorScheme.error.copy(0.1f)
        isSelected -> HomePrimary.copy(0.1f)
        else -> HomeSurface
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .border(2.dp, borderColor, RoundedCornerShape(12.dp))
            .clickable(enabled = !isSubmitted, onClick = onClick)
            .padding(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            if (isSubmitted) {
                Text(if (isCorrect) "✅" else if (isSelected) "❌" else "•", fontSize = 16.sp)
            } else {
                RadioButton(selected = isSelected, onClick = onClick, colors = RadioButtonDefaults.colors(selectedColor = HomePrimary))
            }
            Text(text, fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal, color = HomePrimaryDark)
        }
    }
}

@Composable
private fun QuizResultScreen(score: Int, total: Int) {
    val isPerfect = score == total
    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(if (isPerfect) "🏆" else if (score >= total / 2) "🎉" else "📚", fontSize = 64.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text("Quiz Complete!", style = MaterialTheme.typography.displayMedium, fontWeight = FontWeight.Bold, color = HomePrimaryDark, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(8.dp))
        Text("$score / $total Correct", style = MaterialTheme.typography.titleLarge, color = HomePrimary, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(16.dp))
        if (isPerfect) {
            Card(colors = CardDefaults.cardColors(HomeAccent), shape = RoundedCornerShape(16.dp)) {
                Text("🌟 Perfect Score! +5 Bonus ChefPoints!", color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(16.dp), textAlign = TextAlign.Center)
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
        Text("Come back tomorrow for a new quiz!", color = Color.Gray, textAlign = TextAlign.Center)
    }
}

@Composable
private fun QuizCompletedToday() {
    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("✅", fontSize = 64.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text("Quiz Done for Today!", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = HomePrimaryDark, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Come back tomorrow at midnight for 10 new culinary questions!", color = Color.Gray, textAlign = TextAlign.Center)
    }
}
