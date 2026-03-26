package com.homechef.app.ui.settings

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import coil3.compose.AsyncImage
import com.homechef.app.data.model.User
import com.homechef.app.data.repository.AuthRepository
import com.homechef.app.data.repository.UserRepository
import com.homechef.app.ui.theme.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

data class SettingsUiState(
    val user: User? = null,
    val usernameInput: String = "",
    val language: String = "EN",
    val isLoading: Boolean = true,
    val isSaving: Boolean = false,
    val showLogoutDialog: Boolean = false,
    val successMessage: String? = null,
    val error: String? = null
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init { loadUser() }

    private fun loadUser() {
        viewModelScope.launch {
            val user = authRepository.getCurrentUser()
            _uiState.update { it.copy(user = user, usernameInput = user?.username ?: "", language = user?.language ?: "EN", isLoading = false) }
        }
    }

    fun onUsernameChange(value: String) = _uiState.update { it.copy(usernameInput = value) }

    fun saveUsername() {
        val userId = authRepository.currentUserId ?: return
        val newUsername = _uiState.value.usernameInput.trim()
        if (newUsername.isBlank()) return
        viewModelScope.launch {
            _uiState.update { it.copy(isSaving = true) }
            userRepository.updateUsername(userId, newUsername)
                .onSuccess { _uiState.update { it.copy(isSaving = false, successMessage = "Username updated!") } }
                .onFailure { e -> _uiState.update { it.copy(isSaving = false, error = e.message) } }
        }
    }

    fun toggleLanguage() {
        val newLang = if (_uiState.value.language == "EN") "FR" else "EN"
        _uiState.update { it.copy(language = newLang) }
        viewModelScope.launch { authRepository.updateLanguagePreference(newLang) }
    }
\
    fun uploadProfilePicture(bytes: ByteArray) {
        val userId = authRepository.currentUserId ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSaving = true) }
            userRepository.updateProfilePicture(userId, bytes)
                .onSuccess { url ->
                    _uiState.update { it.copy(user = it.user?.copy(profilePicUrl = url), isSaving = false, successMessage = "Profile picture updated!") }
                }
                .onFailure { e -> _uiState.update { it.copy(isSaving = false, error = e.message) } }
        }
    }

    fun showLogoutDialog() = _uiState.update { it.copy(showLogoutDialog = true) }
    fun dismissLogoutDialog() = _uiState.update { it.copy(showLogoutDialog = false) }
    fun clearMessages() = _uiState.update { it.copy(successMessage = null, error = null) }

    fun logout(onSuccess: () -> Unit) {
        viewModelScope.launch {
            authRepository.signOut().onSuccess { onSuccess() }
        }
    }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

@Composable
fun SettingsScreen(onLogout: () -> Unit, viewModel: SettingsViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val user = uiState.user

    val imagePickerLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            val bytes = context.contentResolver.openInputStream(it)?.readBytes() ?: return@let
            viewModel.uploadProfilePicture(bytes)
        }
    }

    LaunchedEffect(uiState.successMessage) {
        if (uiState.successMessage != null) {
            kotlinx.coroutines.delay(2000)
            viewModel.clearMessages()
        }
    }

    Column(modifier = Modifier.fillMaxSize().background(HomeBackground).verticalScroll(rememberScrollState())) {
        // Header
        Box(modifier = Modifier.fillMaxWidth().background(HomePrimary).padding(16.dp)) {
            Text("⚙️ Settings", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
        }

        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = HomePrimary) }
            return@Column
        }

        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            // Profile Picture
            Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface)) {
                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Profile Picture", fontWeight = FontWeight.SemiBold, color = HomePrimaryDark)
                    Box(contentAlignment = Alignment.BottomEnd) {
                        if (user?.profilePicUrl != null) {
                            AsyncImage(model = user.profilePicUrl, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.size(80.dp).clip(CircleShape))
                        } else {
                            Box(modifier = Modifier.size(80.dp).clip(CircleShape).background(HomePrimary), contentAlignment = Alignment.Center) {
                                Text(user?.username?.take(1)?.uppercase() ?: "U", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 28.sp)
                            }
                        }
                        IconButton(onClick = { imagePickerLauncher.launch("image/*") }, modifier = Modifier.size(28.dp).background(HomeAccent, CircleShape)) {
                            Icon(Icons.Default.CameraAlt, null, tint = Color.White, modifier = Modifier.size(14.dp))
                        }
                    }
                    if (uiState.isSaving) CircularProgressIndicator(modifier = Modifier.size(24.dp), color = HomePrimary, strokeWidth = 2.dp)
                }
            }

            // Username
            Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface)) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Username", fontWeight = FontWeight.SemiBold, color = HomePrimaryDark)
                    OutlinedTextField(
                        value = uiState.usernameInput,
                        onValueChange = { viewModel.onUsernameChange(it) },
                        label = { Text("Username") },
                        leadingIcon = { Icon(Icons.Default.Person, null, tint = HomePrimary) },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = HomePrimary, focusedLabelColor = HomePrimary),
                        singleLine = true
                    )
                    Button(onClick = { viewModel.saveUsername() }, modifier = Modifier.align(Alignment.End), shape = RoundedCornerShape(10.dp), colors = ButtonDefaults.buttonColors(HomePrimary)) {
                        Text("Save")
                    }
                }
            }

            // Language
            Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(HomeSurface)) {
                Row(modifier = Modifier.padding(16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("Language", fontWeight = FontWeight.SemiBold, color = HomePrimaryDark)
                        Text("Current: ${if (uiState.language == "EN") "English 🇬🇧" else "Français 🇫🇷"}", fontSize = 13.sp, color = Color.Gray)
                    }
                    Switch(checked = uiState.language == "FR", onCheckedChange = { viewModel.toggleLanguage() }, colors = SwitchDefaults.colors(checkedThumbColor = HomePrimary, checkedTrackColor = HomePrimary.copy(0.3f)))
                }
            }

            // Success / Error messages
            uiState.successMessage?.let {
                Card(colors = CardDefaults.cardColors(Color(0xFF4CAF50)), shape = RoundedCornerShape(10.dp)) {
                    Text(it, color = Color.White, modifier = Modifier.padding(12.dp), fontWeight = FontWeight.SemiBold)
                }
            }
            uiState.error?.let {
                Card(colors = CardDefaults.cardColors(MaterialTheme.colorScheme.errorContainer), shape = RoundedCornerShape(10.dp)) {
                    Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(12.dp))
                }
            }

            // Logout
            OutlinedButton(
                onClick = { viewModel.showLogoutDialog() },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
            ) {
                Icon(Icons.Default.Logout, null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Log Out", fontWeight = FontWeight.SemiBold)
            }
        }
    }

    // Logout confirmation dialog
    if (uiState.showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissLogoutDialog() },
            title = { Text("Log Out?") },
            text = { Text("Are you sure you want to log out of HomeChef?") },
            confirmButton = {
                TextButton(onClick = { viewModel.logout(onLogout) }, colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)) {
                    Text("Log Out", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.dismissLogoutDialog() }) { Text("Cancel") }
            }
        )
    }
}
