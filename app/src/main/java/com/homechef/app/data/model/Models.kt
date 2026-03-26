package com.homechef.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ─── User ───────────────────────────────────────────────────────────────────

@Serializable
data class User(
    val id: String = "",
    val email: String = "",
    val username: String = "",
    @SerialName("profile_pic_url") val profilePicUrl: String? = null,
    val language: String = "EN",
    @SerialName("chef_points") val chefPoints: Int = 0,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("updated_at") val updatedAt: String = ""
)

// ─── Meal ────────────────────────────────────────────────────────────────────

@Serializable
data class Meal(
    val id: String = "",
    @SerialName("name_en") val nameEn: String = "",
    @SerialName("name_fr") val nameFr: String = "",
    @SerialName("description_en") val descriptionEn: String = "",
    @SerialName("description_fr") val descriptionFr: String = "",
    @SerialName("region_of_origin") val regionOfOrigin: String = "",
    val difficulty: String = "easy", // easy | medium | hard
    val category: String = "",
    @SerialName("image_url") val imageUrl: String = "",
    @SerialName("presentation_video_url") val presentationVideoUrl: String? = null,
    @SerialName("prep_time_minutes") val prepTimeMinutes: Int = 0,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("is_published") val isPublished: Boolean = true
)

// ─── Recipe Step ─────────────────────────────────────────────────────────────

@Serializable
data class RecipeStep(
    val id: String = "",
    @SerialName("meal_id") val mealId: String = "",
    @SerialName("step_number") val stepNumber: Int = 0,
    @SerialName("instruction_en") val instructionEn: String = "",
    @SerialName("instruction_fr") val instructionFr: String = "",
    @SerialName("video_url") val videoUrl: String? = null
)

// ─── Ingredient ──────────────────────────────────────────────────────────────

@Serializable
data class Ingredient(
    val id: String = "",
    @SerialName("name_en") val nameEn: String = "",
    @SerialName("name_fr") val nameFr: String = "",
    @SerialName("price_xaf") val priceXaf: Double = 0.0,
    val unit: String = "",
    @SerialName("last_updated_by") val lastUpdatedBy: String? = null
)

@Serializable
data class MealIngredient(
    val id: String = "",
    @SerialName("meal_id") val mealId: String = "",
    @SerialName("ingredient_id") val ingredientId: String = "",
    val quantity: Double = 0.0,
    val unit: String = "",
    val ingredient: Ingredient? = null
)

// ─── User History ─────────────────────────────────────────────────────────────

@Serializable
data class UserHistory(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("meal_id") val mealId: String = "",
    @SerialName("cooked_at") val cookedAt: String = "",
    @SerialName("people_count") val peopleCount: Int = 1,
    @SerialName("times_count") val timesCount: Int = 1,
    @SerialName("total_cost_xaf") val totalCostXaf: Double = 0.0,
    @SerialName("total_duration_minutes") val totalDurationMinutes: Int = 0,
    @SerialName("chef_points_earned") val chefPointsEarned: Int = 0,
    val meal: Meal? = null
)

// ─── User Recipe (MyRecipes) ──────────────────────────────────────────────────

@Serializable
data class UserRecipe(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("title_en") val titleEn: String = "",
    @SerialName("title_fr") val titleFr: String = "",
    val description: String = "",
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("is_public") val isPublic: Boolean = false,
    @SerialName("created_at") val createdAt: String = ""
)

@Serializable
data class UserRecipeStep(
    val id: String = "",
    @SerialName("recipe_id") val recipeId: String = "",
    @SerialName("step_number") val stepNumber: Int = 0,
    @SerialName("instruction_en") val instructionEn: String = "",
    @SerialName("instruction_fr") val instructionFr: String = ""
)

@Serializable
data class UserRecipeIngredient(
    val id: String = "",
    @SerialName("recipe_id") val recipeId: String = "",
    val name: String = "",
    val quantity: String = "",
    @SerialName("cost_xaf") val costXaf: Double = 0.0
)

// ─── Badge ────────────────────────────────────────────────────────────────────

@Serializable
data class Badge(
    val id: String = "",
    @SerialName("name_en") val nameEn: String = "",
    @SerialName("name_fr") val nameFr: String = "",
    @SerialName("icon_url") val iconUrl: String = "",
    @SerialName("required_points") val requiredPoints: Int = 0,
    val category: String = "POINTS" // POINTS | EVENT | CATEGORY
)

@Serializable
data class UserBadge(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("badge_id") val badgeId: String = "",
    @SerialName("awarded_at") val awardedAt: String = "",
    val badge: Badge? = null
)

// ─── Quiz ─────────────────────────────────────────────────────────────────────

@Serializable
data class QuizQuestion(
    val id: String = "",
    @SerialName("question_en") val questionEn: String = "",
    @SerialName("question_fr") val questionFr: String = "",
    @SerialName("options_json") val optionsJson: String = "[]",
    @SerialName("correct_answer") val correctAnswer: String = "",
    val source: String = "ADMIN",
    @SerialName("created_at") val createdAt: String = ""
)

@Serializable
data class QuizAttempt(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("question_id") val questionId: String = "",
    @SerialName("selected_answer") val selectedAnswer: String = "",
    @SerialName("is_correct") val isCorrect: Boolean = false,
    @SerialName("attempted_at") val attemptedAt: String = ""
)

// ─── Events ───────────────────────────────────────────────────────────────────

@Serializable
data class Event(
    val id: String = "",
    @SerialName("title_en") val titleEn: String = "",
    @SerialName("title_fr") val titleFr: String = "",
    @SerialName("description_en") val descriptionEn: String = "",
    @SerialName("description_fr") val descriptionFr: String = "",
    @SerialName("start_date") val startDate: String = "",
    @SerialName("end_date") val endDate: String = "",
    @SerialName("prize_description") val prizeDescription: String = "",
    val status: String = "UPCOMING" // UPCOMING | ACTIVE | PAST
)

@Serializable
data class EventSubmission(
    val id: String = "",
    @SerialName("event_id") val eventId: String = "",
    @SerialName("user_id") val userId: String = "",
    @SerialName("video_url") val videoUrl: String = "",
    val upvotes: Int = 0,
    @SerialName("created_at") val createdAt: String = "",
    val user: User? = null
)

// ─── Partnerships ─────────────────────────────────────────────────────────────

@Serializable
data class Partnership(
    val id: String = "",
    @SerialName("restaurant_name") val restaurantName: String = "",
    @SerialName("logo_url") val logoUrl: String = "",
    @SerialName("menu_url") val menuUrl: String = "",
    @SerialName("start_date") val startDate: String = "",
    @SerialName("end_date") val endDate: String = "",
    @SerialName("is_active") val isActive: Boolean = false
)

// ─── Recipe of the Day ────────────────────────────────────────────────────────

@Serializable
data class RecipeOfTheDay(
    val id: String = "",
    @SerialName("meal_id") val mealId: String = "",
    @SerialName("scheduled_date") val scheduledDate: String = "",
    @SerialName("did_you_know_en") val didYouKnowEn: String = "",
    @SerialName("did_you_know_fr") val didYouKnowFr: String = "",
    val meal: Meal? = null
)

// ─── Leaderboard Entry ────────────────────────────────────────────────────────

@Serializable
data class LeaderboardEntry(
    val rank: Int = 0,
    val userId: String = "",
    val username: String = "",
    @SerialName("profile_pic_url") val profilePicUrl: String? = null,
    @SerialName("chef_points") val chefPoints: Int = 0
)

// ─── Cooking Plan (Edge Function Response) ───────────────────────────────────

@Serializable
data class CookingPlanRequest(
    @SerialName("meal_id") val mealId: String,
    @SerialName("people_count") val peopleCount: Int,
    @SerialName("times_count") val timesCount: Int
)

@Serializable
data class CookingPlanResponse(
    val ingredients: List<CookingPlanIngredient> = emptyList(),
    @SerialName("total_cost_xaf") val totalCostXaf: Double = 0.0,
    @SerialName("total_prep_time_minutes") val totalPrepTimeMinutes: Int = 0
)

@Serializable
data class CookingPlanIngredient(
    val name: String = "",
    @SerialName("scaled_quantity") val scaledQuantity: Double = 0.0,
    val unit: String = "",
    @SerialName("cost_xaf") val costXaf: Double = 0.0
)

// ─── Similar Recipes ─────────────────────────────────────────────────────────

@Serializable
data class SimilarRecipesResponse(
    val meals: List<Meal> = emptyList()
)

// ─── About Developer ─────────────────────────────────────────────────────────

data class Developer(
    val name: String,
    val role: String,
    val bio: String,
    val photoResId: Int? = null
)
