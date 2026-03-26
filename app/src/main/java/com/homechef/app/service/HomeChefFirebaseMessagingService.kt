package com.homechef.app.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.homechef.app.MainActivity

/**
 * Firebase Cloud Messaging service for receiving push notifications.
 *
 * Handles:
 * - Daily Quiz Reminders (9:00 AM)
 * - Recipe of the Day alerts (8:00 AM)
 * - New Event notifications
 * - Badge earned notifications
 * - Event result notifications
 */
class HomeChefFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        val title = message.notification?.title ?: message.data["title"] ?: "HomeChef"
        val body = message.notification?.body ?: message.data["body"] ?: ""
        val notifType = message.data["type"] ?: "general"

        showNotification(title, body, notifType)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Save FCM token to Supabase user_push_tokens table
        // This would typically be handled by the repository layer
    }

    private fun showNotification(title: String, body: String, type: String) {
        val channelId = getChannelId(type)
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create notification channel for API 26+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                getChannelName(type),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "HomeChef $type notifications"
            }
            notificationManager.createNotificationChannel(channel)
        }

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("notification_type", type)
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info) // Replace with actual app icon
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun getChannelId(type: String) = when (type) {
        "quiz" -> "homechef_quiz"
        "recipe_of_day" -> "homechef_recipe_day"
        "event" -> "homechef_events"
        "badge" -> "homechef_badges"
        else -> "homechef_general"
    }

    private fun getChannelName(type: String) = when (type) {
        "quiz" -> "Daily Quiz"
        "recipe_of_day" -> "Recipe of the Day"
        "event" -> "Events & Competitions"
        "badge" -> "Badges & Achievements"
        else -> "General"
    }
}
