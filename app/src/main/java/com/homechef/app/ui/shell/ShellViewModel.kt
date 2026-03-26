package com.homechef.app.ui.shell

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.homechef.app.data.model.User
import com.homechef.app.data.repository.AuthRepository
import com.homechef.app.data.repository.MealRepository
import com.homechef.app.data.model.Meal
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ShellUiState(
    val user: User? = null,
    val language: String = "EN",
    val searchQuery: String = "",
    val searchResults: List<Meal> = emptyList(),
    val isSearching: Boolean = false
)

@HiltViewModel
class ShellViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val mealRepository: MealRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ShellUiState())
    val uiState: StateFlow<ShellUiState> = _uiState.asStateFlow()

    private val _searchQuery = MutableStateFlow("")

    init {
        loadUser()
        observeSearch()
    }

    private fun loadUser() {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser()
            _uiState.update { it.copy(user = user, language = user?.language ?: "EN") }
        }
    }

    @OptIn(FlowPreview::class)
    private fun observeSearch() {
        viewModelScope.launch {
            _searchQuery
                .debounce(300)
                .distinctUntilChanged()
                .collectLatest { query ->
                    if (query.isBlank()) {
                        _uiState.update { it.copy(searchResults = emptyList(), isSearching = false) }
                        return@collectLatest
                    }
                    _uiState.update { it.copy(isSearching = true) }
                    mealRepository.searchMeals(query)
                        .onSuccess { meals ->
                            _uiState.update { it.copy(searchResults = meals, isSearching = false) }
                        }
                        .onFailure {
                            _uiState.update { it.copy(isSearching = false) }
                        }
                }
        }
    }

    fun onSearch(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
        _searchQuery.value = query
    }

    fun toggleLanguage() {
        val newLang = if (_uiState.value.language == "EN") "FR" else "EN"
        _uiState.update { it.copy(language = newLang) }
        viewModelScope.launch {
            val userId = authRepository.currentUserId ?: return@launch
            authRepository.updateLanguagePreference(newLang)
        }
    }
}
