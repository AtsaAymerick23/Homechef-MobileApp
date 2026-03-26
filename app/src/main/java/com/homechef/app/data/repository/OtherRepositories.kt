package com.homechef.app.data.repository

import com.homechef.app.data.model.*
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.storage.Storage
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import javax.inject.Inject

// ─── Event Repository ────────────────────────────────────────────────────────

interface EventRepository {
    suspend fun getUpcomingEvents(): Result<List<Event>>
    suspend fun getPastEvents(): Result<List<Event>>
    suspend fun getEventSubmissions(eventId: String): Result<List<EventSubmission>>
    suspend fun submitEventEntry(
        eventId: String,
        userId: String,
        videoBytes: ByteArray
    ): Result<Unit>
}

class EventRepositoryImpl @Inject constructor(
    private val postgrest: Postgrest,
    private val storage: Storage,
    private val functions: Functions
) : EventRepository {

    override suspend fun getUpcomingEvents(): Result<List<Event>> = runCatching {
        postgrest.from("events")
            .select {
                filter {
                    or {
                        eq("status", "UPCOMING")
                        eq("status", "ACTIVE")
                    }
                }
                order("start_date", Order.ASCENDING)
            }
            .decodeList<Event>()
    }

    override suspend fun getPastEvents(): Result<List<Event>> = runCatching {
        postgrest.from("events")
            .select {
                filter { eq("status", "PAST") }
                order("end_date", Order.DESCENDING)
            }
            .decodeList<Event>()
    }

    override suspend fun getEventSubmissions(eventId: String): Result<List<EventSubmission>> =
        runCatching {
            postgrest.from("event_submissions")
                .select {
                    filter { eq("event_id", eventId) }
                    order("upvotes", Order.DESCENDING)
                }
                .decodeList<EventSubmission>()
        }

    override suspend fun submitEventEntry(
        eventId: String,
        userId: String,
        videoBytes: ByteArray
    ): Result<Unit> = runCatching {
        val bucket = storage.from("event-submissions")
        val path = "$eventId/$userId/submission.mp4"
        bucket.upload(path, videoBytes) { upsert = true }
        val videoUrl = bucket.publicUrl(path)

        postgrest.from("event_submissions").insert(
            mapOf(
                "event_id" to eventId,
                "user_id" to userId,
                "video_url" to videoUrl,
                "upvotes" to 0
            )
        )

        // Award submission points
        functions.invoke(
            function = "awardChefPoints",
            body = """{"user_id":"$userId","points_delta":2,"reason":"event_submission"}"""
        )
    }
}

// ─── Leaderboard Repository ──────────────────────────────────────────────────

interface LeaderboardRepository {
    suspend fun getLeaderboard(limit: Int = 50): Result<List<LeaderboardEntry>>
    suspend fun getUserRank(userId: String): Result<Int>
}

class LeaderboardRepositoryImpl @Inject constructor(
    private val postgrest: Postgrest
) : LeaderboardRepository {

    override suspend fun getLeaderboard(limit: Int): Result<List<LeaderboardEntry>> = runCatching {
        val users = postgrest.from("users")
            .select {
                order("chef_points", Order.DESCENDING)
                limit(limit.toLong())
            }
            .decodeList<User>()

        users.mapIndexed { index, user ->
            LeaderboardEntry(
                rank = index + 1,
                userId = user.id,
                username = user.username,
                profilePicUrl = user.profilePicUrl,
                chefPoints = user.chefPoints
            )
        }
    }

    override suspend fun getUserRank(userId: String): Result<Int> = runCatching {
        val currentUser = postgrest.from("users")
            .select {
                filter { eq("id", userId) }
                limit(1)
            }
            .decodeSingle<User>()

        val rank = postgrest.from("users")
            .select {
                filter { gt("chef_points", currentUser.chefPoints) }
            }
            .decodeList<User>()
            .size + 1

        rank
    }
}

// ─── Recipe of the Day Repository ────────────────────────────────────────────

interface RecipeOfTheDayRepository {
    suspend fun getTodayRecipe(): Result<RecipeOfTheDay?>
    suspend fun getActivePartnership(): Result<Partnership?>
}

class RecipeOfTheDayRepositoryImpl @Inject constructor(
    private val postgrest: Postgrest
) : RecipeOfTheDayRepository {

    override suspend fun getTodayRecipe(): Result<RecipeOfTheDay?> = runCatching {
        val today = Clock.System.now()
            .toLocalDateTime(TimeZone.currentSystemDefault())
            .date
            .toString()

        runCatching {
            postgrest.from("recipe_of_the_day")
                .select {
                    filter { eq("scheduled_date", today) }
                    limit(1)
                }
                .decodeSingle<RecipeOfTheDay>()
        }.getOrElse {
            // Fallback: pick random published meal
            null
        }
    }

    override suspend fun getActivePartnership(): Result<Partnership?> = runCatching {
        runCatching {
            postgrest.from("partnerships")
                .select {
                    filter { eq("is_active", true) }
                    limit(1)
                }
                .decodeSingle<Partnership>()
        }.getOrNull()
    }
}
