package com.homechef.app.data.repository

import com.homechef.app.data.model.*
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.storage.Storage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject

interface UserRepository {
    suspend fun getUserProfile(userId: String): Result<User>
    suspend fun updateUsername(userId: String, username: String): Result<Unit>
    suspend fun updateProfilePicture(userId: String, imageBytes: ByteArray): Result<String>
    suspend fun getUserHistory(userId: String): Result<List<UserHistory>>
    suspend fun getUserBadges(userId: String): Result<List<UserBadge>>
    suspend fun getAllBadges(): Result<List<Badge>>
    suspend fun getUserRecipes(userId: String): Result<List<UserRecipe>>
    suspend fun createUserRecipe(recipe: UserRecipe, steps: List<UserRecipeStep>, ingredients: List<UserRecipeIngredient>): Result<Unit>
    suspend fun updateUserRecipe(recipe: UserRecipe): Result<Unit>
    suspend fun deleteUserRecipe(recipeId: String): Result<Unit>
    suspend fun toggleRecipeVisibility(recipeId: String, isPublic: Boolean): Result<Unit>
}

class UserRepositoryImpl @Inject constructor(
    private val postgrest: Postgrest,
    private val storage: Storage
) : UserRepository {

    override suspend fun getUserProfile(userId: String): Result<User> = runCatching {
        postgrest.from("users")
            .select {
                filter { eq("id", userId) }
                limit(1)
            }
            .decodeSingle<User>()
    }

    override suspend fun updateUsername(userId: String, username: String): Result<Unit> =
        runCatching {
            postgrest.from("users").update(
                mapOf("username" to username, "updated_at" to "now()")
            ) {
                filter { eq("id", userId) }
            }
        }

    override suspend fun updateProfilePicture(
        userId: String,
        imageBytes: ByteArray
    ): Result<String> = runCatching {
        val bucket = storage.from("profile-pictures")
        val path = "$userId/avatar.jpg"
        bucket.upload(path, imageBytes) { upsert = true }
        val url = bucket.publicUrl(path)
        postgrest.from("users").update(
            mapOf("profile_pic_url" to url, "updated_at" to "now()")
        ) {
            filter { eq("id", userId) }
        }
        url
    }

    override suspend fun getUserHistory(userId: String): Result<List<UserHistory>> = runCatching {
        postgrest.from("user_history")
            .select {
                filter { eq("user_id", userId) }
                order("cooked_at", Order.DESCENDING)
            }
            .decodeList<UserHistory>()
    }

    override suspend fun getUserBadges(userId: String): Result<List<UserBadge>> = runCatching {
        postgrest.from("user_badges")
            .select {
                filter { eq("user_id", userId) }
                order("awarded_at", Order.DESCENDING)
            }
            .decodeList<UserBadge>()
    }

    override suspend fun getAllBadges(): Result<List<Badge>> = runCatching {
        postgrest.from("badges")
            .select {
                order("required_points", Order.ASCENDING)
            }
            .decodeList<Badge>()
    }

    override suspend fun getUserRecipes(userId: String): Result<List<UserRecipe>> = runCatching {
        postgrest.from("user_recipes")
            .select {
                filter { eq("user_id", userId) }
                order("created_at", Order.DESCENDING)
            }
            .decodeList<UserRecipe>()
    }

    override suspend fun createUserRecipe(
        recipe: UserRecipe,
        steps: List<UserRecipeStep>,
        ingredients: List<UserRecipeIngredient>
    ): Result<Unit> = runCatching {
        // Insert recipe
        val createdRecipe = postgrest.from("user_recipes")
            .insert(recipe) { select() }
            .decodeSingle<UserRecipe>()

        // Insert steps
        if (steps.isNotEmpty()) {
            val stepsWithId = steps.map { it.copy(recipeId = createdRecipe.id) }
            postgrest.from("user_recipe_steps").insert(stepsWithId)
        }

        // Insert ingredients
        if (ingredients.isNotEmpty()) {
            val ingredientsWithId = ingredients.map { it.copy(recipeId = createdRecipe.id) }
            postgrest.from("user_recipe_ingredients").insert(ingredientsWithId)
        }
    }

    override suspend fun updateUserRecipe(recipe: UserRecipe): Result<Unit> = runCatching {
        postgrest.from("user_recipes").update(recipe) {
            filter { eq("id", recipe.id) }
        }
    }

    override suspend fun deleteUserRecipe(recipeId: String): Result<Unit> = runCatching {
        postgrest.from("user_recipes").delete {
            filter { eq("id", recipeId) }
        }
    }

    override suspend fun toggleRecipeVisibility(recipeId: String, isPublic: Boolean): Result<Unit> =
        runCatching {
            postgrest.from("user_recipes").update(
                mapOf("is_public" to isPublic)
            ) {
                filter { eq("id", recipeId) }
            }
        }
}
