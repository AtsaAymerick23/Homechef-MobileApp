package com.homechef.app.data.repository

import com.homechef.app.data.model.User
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.providers.Google
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.auth.status.SessionStatus
import io.github.jan.supabase.postgrest.Postgrest
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

interface AuthRepository {
    val sessionStatus: Flow<SessionStatus>
    val currentUserId: String?
    suspend fun signUpWithEmail(email: String, password: String, username: String): Result<Unit>
    suspend fun signInWithEmail(email: String, password: String): Result<Unit>
    suspend fun signInWithGoogle(): Result<Unit>
    suspend fun signOut(): Result<Unit>
    suspend fun getCurrentUser(): User?
    suspend fun updateLanguagePreference(language: String): Result<Unit>
}

class AuthRepositoryImpl @Inject constructor(
    private val auth: Auth,
    private val postgrest: Postgrest
) : AuthRepository {

    override val sessionStatus: Flow<SessionStatus>
        get() = auth.sessionStatus

    override val currentUserId: String?
        get() = auth.currentUserOrNull()?.id

    override suspend fun signUpWithEmail(
        email: String,
        password: String,
        username: String
    ): Result<Unit> = runCatching {
        auth.signUpWith(Email) {
            this.email = email
            this.password = password
        }
        // Insert user profile
        val userId = auth.currentUserOrNull()?.id ?: throw Exception("User not found after signup")
        postgrest.from("users").insert(
            mapOf(
                "id" to userId,
                "email" to email,
                "username" to username,
                "language" to "EN",
                "chef_points" to 0
            )
        )
    }

    override suspend fun signInWithEmail(email: String, password: String): Result<Unit> =
        runCatching {
            auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
        }

    override suspend fun signInWithGoogle(): Result<Unit> = runCatching {
        auth.signInWith(Google)
    }

    override suspend fun signOut(): Result<Unit> = runCatching {
        auth.signOut()
    }

    override suspend fun getCurrentUser(): User? {
        val userId = currentUserId ?: return null
        return runCatching {
            postgrest.from("users")
                .select {
                    filter { eq("id", userId) }
                    limit(1)
                }
                .decodeSingle<User>()
        }.getOrNull()
    }

    override suspend fun updateLanguagePreference(language: String): Result<Unit> = runCatching {
        val userId = currentUserId ?: throw Exception("Not authenticated")
        postgrest.from("users").update(
            mapOf("language" to language)
        ) {
            filter { eq("id", userId) }
        }
    }
}
