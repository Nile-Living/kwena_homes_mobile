// app/(tabs)/notifications.tsx
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationsStore, Notification } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useColorScheme } from 'nativewind'; // Import useColorScheme

const NotificationsScreen = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    setError,
    isUserAgent,
    isRegularUser,
  } = useNotificationsStore();

  const { user } = useAuthStore();
  const { isSubscribed } = useSubscriptionStore();
  const [refreshing, setRefreshing] = useState(false);
  const { colorScheme } = useColorScheme(); // Get the current color scheme

  // Check if user can access notifications
  const isAgent = isUserAgent();
  const isUser = isRegularUser();
  const canAccessNotifications = isAgent || (isUser && isSubscribed);

  useEffect(() => {
    if (canAccessNotifications) {
      fetchNotifications(true);
    }
  }, [canAccessNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications(true);
    setRefreshing(false);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(false);
    }
  }, [loading, hasMore]);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (
      notification.type === 'promotion_expiring' &&
      notification.data.property_id
    ) {
      router.push(`/property/${notification.data.property_id}` as any);
    } else if (
      notification.type === 'property_match' &&
      notification.data.property_id
    ) {
      router.push(`/property/${notification.data.property_id}` as any);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;

    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark All', onPress: markAllAsRead },
      ],
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'promotion_expiring':
        return 'time-outline';
      case 'promotion_expired':
        return 'alert-circle-outline';
      case 'property_match':
        return 'home-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'promotion_expiring':
        return '#F59E0B'; // amber
      case 'promotion_expired':
        return '#EF4444'; // red
      case 'property_match':
        return '#10B981'; // green
      default:
        return '#6B7280'; // gray
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isUnread = !item.read_at;
    const timeAgo = formatDistanceToNow(new Date(item.created_at), {
      addSuffix: true,
    });

    return (
      <TouchableOpacity
        className={`mx-4 mb-3 rounded-xl p-4 shadow-sm border dark:bg-slate-800 ${
          isUnread
            ? 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-700'
            : 'border-gray-100 dark:border-slate-700'
        }`}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-start space-x-3">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: getNotificationColor(item.type) + '20' }}
          >
            <Ionicons
              name={getNotificationIcon(item.type) as any}
              size={20}
              color={getNotificationColor(item.type)}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className={`text-base font-semibold ${
                  isUnread
                    ? 'text-gray-900 dark:text-gray-50'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {isUnread && (
                <View className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </View>

            <Text
              className={`text-sm mb-2 ${
                isUnread
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              numberOfLines={2}
            >
              {item.body}
            </Text>

            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {timeAgo}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    const emptyMessage = isAgent
      ? "You'll receive notifications about your promoted properties here."
      : "You'll receive notifications when new properties match your saved searches.";

    return (
      <View className="flex-1 items-center justify-center px-6 py-20">
        <View className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
          <Ionicons
            name="notifications-outline"
            size={32}
            className="text-gray-400 dark:text-gray-500"
          />
        </View>
        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
          No Notifications
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {emptyMessage}
        </Text>
      </View>
    );
  };

  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 bg-red-100 dark:bg-red-950 rounded-full items-center justify-center mb-4">
        <Ionicons
          name="alert-circle-outline"
          size={32}
          className="text-red-500 dark:text-red-400"
        />
      </View>
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
        Something went wrong
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
        {error}
      </Text>
      <TouchableOpacity
        className="bg-blue-500 px-6 py-3 rounded-lg"
        onPress={() => {
          setError(null);
          fetchNotifications(true);
        }}
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Show subscription required message for regular users without subscription
  if (isUser && !isSubscribed) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-blue-100 dark:bg-blue-950 rounded-full items-center justify-center mb-4">
            <Ionicons
              name="notifications-outline"
              size={32}
              className="text-blue-500 dark:text-blue-400"
            />
          </View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
            Subscription Required
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Subscribe to get notifications when new properties match your saved
            searches.
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => router.push('/subscription' as any)}
          >
            <Text className="text-white font-semibold">
              View Subscription Plans
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show access denied for users who are neither agents nor regular users
  if (!canAccessNotifications) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full items-center justify-center mb-4">
            <Ionicons
              name="person-outline"
              size={32}
              className="text-gray-400 dark:text-gray-500"
            />
          </View>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
            Access Restricted
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Notifications are available for agents and subscribed users only.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#1e293b' : '#F9FAFB'}
      />

      {/* Header */}
      <View className="bg-white dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount} unread notification
                {unreadCount !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={handleMarkAllAsRead}
            >
              <Text className="text-white font-semibold text-sm">
                Mark All Read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role-specific info banner */}
      {isUser && isSubscribed && (
        <View className="px-4 py-2 bg-green-50 dark:bg-green-950 border-b border-green-200 dark:border-green-800">
          <Text className="text-green-800 dark:text-green-300 text-sm">
            📬 You'll receive notifications when properties match your saved
            searches
          </Text>
        </View>
      )}

      {isAgent && (
        <View className="px-4 py-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
          <Text className="text-blue-800 dark:text-blue-300 text-sm">
            🏠 You'll receive notifications about your property promotions
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          notifications.length === 0 && !loading ? renderEmpty : null
        }
        ListFooterComponent={
          loading && notifications.length > 0 ? (
            <View className="py-4 items-center">
              <Text className="text-gray-500 dark:text-gray-400">
                Loading more...
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;