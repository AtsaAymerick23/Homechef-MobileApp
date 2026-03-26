package com.homechef.app.data.repository

import com.homechef.app.data.model.*
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.query.Order
import io.ktor.client.call.body
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject

interface MealRepository {
    suspend fun getMeals(page: Int, pageSize: Int): Result<List<Meal>>
    suspend fun getMealById(mealId: String): Result<Meal>
    suspend fun searchMeals(query: String): Result<List<Meal>>
    suspend fun getMealIngredients(mealId: String): Result<List<MealIngredient>>
    suspend fun getRecipeSteps(mealId: String): Result<List<RecipeStep>>
    suspend fun calculateCookingPlan(
        mealId: String,
        peopleCount: Int,
        timesCount: Int
    ): Result<CookingPlanResponse>
    suspend fun getSimilarRecipes(mealId: String): Result<List<Meal>>
    suspend fun recordCookedMeal(
        userId: String,
        mealId: String,
        peopleCount: Int,
        timesCount: Int,
        totalCostXaf: Double,
        totalDurationMinutes: Int
    ): Result<Unit>
    suspend fun getFeaturedMeals(): Result<List<Meal>>
    suspend fun getMealsByRegion(region: String, limit: Int = 10): Result<List<Meal>>
}

class MealRepositoryImpl @Inject constructor(
    private val postgrest: Postgrest,
    private val functions: Functions
) : MealRepository {

    override suspend fun getMeals(page: Int, pageSize: Int): Result<List<Meal>> = runCatching {
        postgrest.from("meals")
            .select {
                filter { eq("is_published", true) }
                val start = (page * pageSize).toLong()
                range(start, start + pageSize - 1)
                order("created_at", Order.DESCENDING)
            }
            .decodeList<Meal>()
    }

    override suspend fun getMealById(mealId: String): Result<Meal> = runCatching {
        postgrest.from("meals")
            .select {
                filter { eq("id", mealId) }
                limit(1)
            }
            .decodeSingle<Meal>()
    }

    override suspend fun searchMeals(query: String): Result<List<Meal>> = runCatching {
        postgrest.from("meals")
            .select {
                filter {
                    eq("is_published", true)
                    or {
                        ilike("name_en", "%$query%")
                        ilike("name_fr", "%$query%")
                        ilike("region_of_origin", "%$query%")
                        ilike("difficulty", "%$query%")
                        ilike("category", "%$query%")
                    }
                }
                limit(20)
            }
            .decodeList<Meal>()
    }

    override suspend fun getMealIngredients(mealId: String): Result<List<MealIngredient>> =
        runCatching {
            postgrest.from("meal_ingredients")
                .select {
                    filter { eq("meal_id", mealId) }
                }
                .decodeList<MealIngredient>()
        }

    override suspend fun getRecipeSteps(mealId: String): Result<List<RecipeStep>> = runCatching {
        postgrest.from("recipe_steps")
            .select {
                filter { eq("meal_id", mealId) }
                order("step_number", Order.ASCENDING)
            }
            .decodeList<RecipeStep>()
    }

    override suspend fun calculateCookingPlan(
        mealId: String,
        peopleCount: Int,
        timesCount: Int
    ): Result<CookingPlanResponse> = runCatching {
        val request = CookingPlanRequest(mealId, peopleCount, timesCount)
        val response = functions.invoke(
            function = "calculateCookingPlan",
            body = Json.encodeToString(request)
        )
        Json.decodeFromString<CookingPlanResponse>(response.body())
    }

    override suspend fun getSimilarRecipes(mealId: String): Result<List<Meal>> = runCatching {
        val response = functions.invoke(
            function = "generateSimilarRecipes",
            body = """{"meal_id":"$mealId"}"""
        )
        val similar = Json.decodeFromString<SimilarRecipesResponse>(response.body())
        similar.meals
    }

    override suspend fun recordCookedMeal(
        userId: String,
        mealId: String,
        peopleCount: Int,
        timesCount: Int,
        totalCostXaf: Double,
        totalDurationMinutes: Int
    ): Result<Unit> = runCatching {
        postgrest.from("user_history").insert(
            mapOf(
                "user_id" to userId,
                "meal_id" to mealId,
                "people_count" to peopleCount,
                "times_count" to timesCount,
                "total_cost_xaf" to totalCostXaf,
                "total_duration_minutes" to totalDurationMinutes,
                "chef_points_earned" to 3
            )
        )
        // Award ChefPoints via edge function
        functions.invoke(
            function = "awardChefPoints",
            body = """{"user_id":"$userId","points_delta":3,"reason":"cooked_meal"}"""
        )
    }

    override suspend fun getFeaturedMeals(): Result<List<Meal>> = runCatching {
        postgrest.from("meals")
            .select {
                filter { eq("is_published", true) }
                limit(5)
                order("created_at", Order.DESCENDING)
            }
            .decodeList<Meal>()
    }

    override suspend fun getMealsByRegion(region: String, limit: Int): Result<List<Meal>> =
        runCatching {
            postgrest.from("meals")
                .select {
                    filter {
                        eq("is_published", true)
                        eq("region_of_origin", region)
                    }
                    limit(limit.toLong())
                }
                .decodeList<Meal>()
        }
}
