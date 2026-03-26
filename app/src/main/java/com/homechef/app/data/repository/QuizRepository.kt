package com.homechef.app.data.repository

import com.homechef.app.data.model.QuizAttempt
import com.homechef.app.data.model.QuizQuestion
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.postgrest.Postgrest
import javax.inject.Inject

interface QuizRepository {
    suspend fun getDailyQuestions(): Result<List<QuizQuestion>>
    suspend fun getTodayAttempts(userId: String): Result<List<QuizAttempt>>
    suspend fun submitAnswer(
        userId: String,
        questionId: String,
        selectedAnswer: String,
        isCorrect: Boolean
    ): Result<Unit>
    suspend fun awardQuizPoints(userId: String, points: Int): Result<Unit>
}

class QuizRepositoryImpl @Inject constructor(
    private val postgrest: Postgrest,
    private val functions: Functions
) : QuizRepository {

    override suspend fun getDailyQuestions(): Result<List<QuizQuestion>> = runCatching {
        // Fetch 10 random published questions
        postgrest.from("quiz_questions")
            .select()
            .decodeList<QuizQuestion>()
            .shuffled()
            .take(10)
    }

    override suspend fun getTodayAttempts(userId: String): Result<List<QuizAttempt>> =
        runCatching {
            // Get today's date range
            postgrest.from("quiz_attempts")
                .select {
                    filter {
                        eq("user_id", userId)
                        // Filter today: gte("attempted_at", todayStart)
                    }
                }
                .decodeList<QuizAttempt>()
        }

    override suspend fun submitAnswer(
        userId: String,
        questionId: String,
        selectedAnswer: String,
        isCorrect: Boolean
    ): Result<Unit> = runCatching {
        postgrest.from("quiz_attempts").insert(
            mapOf(
                "user_id" to userId,
                "question_id" to questionId,
                "selected_answer" to selectedAnswer,
                "is_correct" to isCorrect
            )
        )
    }

    override suspend fun awardQuizPoints(userId: String, points: Int): Result<Unit> = runCatching {
        functions.invoke(
            function = "awardChefPoints",
            body = """{"user_id":"$userId","points_delta":$points,"reason":"quiz_completion"}"""
        )
    }
}
