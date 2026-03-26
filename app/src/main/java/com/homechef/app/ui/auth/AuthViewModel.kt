package com.homechef.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.homechef.app.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.jan.supabase.auth.status.SessionStatus
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthState {
    object Loading : AuthState()
    object Unauthenticated : AuthState()
    object NeedsOnboarding : AuthState()
    data class Authenticated(val userId: String) : AuthState()
}

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val emailError: String? = null,
    val passwordError: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    val authState: StateFlow<AuthState> = authRepository.sessionStatus
        .map { status ->
            when (status) {
                is SessionStatus.Authenticated -> AuthState.Authenticated(
                    authRepository.currentUserId ?: ""
                )
                is SessionStatus.NotAuthenticated -> AuthState.Unauthenticated
                is SessionStatus.Initializing -> AuthState.Loading
                is SessionStatus.RefreshFailure -> AuthState.Unauthenticated
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), AuthState.Loading)

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun signInWithEmail(email: String, password: String, onSuccess: () -> Unit) {
        if (!validateLoginInputs(email, password)) return

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            authRepository.signInWithEmail(email, password)
                .onSuccess { onSuccess() }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Login failed")
                    }
                }
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun signUpWithEmail(
        email: String,
        password: String,
        username: String,
        onSuccess: () -> Unit
    ) {
        if (!validateRegisterInputs(email, password, username)) return

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            authRepository.signUpWithEmail(email, password, username)
                .onSuccess { onSuccess() }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Registration failed")
                    }
                }
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun signInWithGoogle(onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            authRepository.signInWithGoogle()
                .onSuccess { onSuccess() }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Google sign-in failed")
                    }
                }
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun signOut(onSuccess: () -> Unit) {
        viewModelScope.launch {
            authRepository.signOut()
                .onSuccess { onSuccess() }
        }
    }

    fun completeOnboarding(language: String, onComplete: () -> Unit) {
        viewModelScope.launch {
            authRepository.updateLanguagePreference(language)
                .onSuccess { onComplete() }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null, emailError = null, passwordError = null) }
    }

    private fun validateLoginInputs(email: String, password: String): Boolean {
        var isValid = true
        val emailErr = if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches())
            "Enter a valid email" else null
        val passErr = if (password.length < 6) "Password must be at least 6 characters" else null
        _uiState.update { it.copy(emailError = emailErr, passwordError = passErr) }
        if (emailErr != null || passErr != null) isValid = false
        return isValid
    }

    private fun validateRegisterInputs(email: String, password: String, username: String): Boolean {
        var isValid = true
        val emailErr = if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches())
            "Enter a valid email" else null
        val passErr = if (password.length < 6) "Password must be at least 6 characters" else null
        if (username.isBlank()) {
            _uiState.update { it.copy(error = "Username is required") }
            isValid = false
        }
        _uiState.update { it.copy(emailError = emailErr, passwordError = passErr) }
        if (emailErr != null || passErr != null) isValid = false
        return isValid
    }
}
