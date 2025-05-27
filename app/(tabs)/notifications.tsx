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
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

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
  } = useNotificationsStore();
  
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is agent using the store method
  const isAgent = isUserAgent();

  useEffect(() => {
    if (isAgent) {
      fetchNotifications(true);
    }
  }, [isAgent]);

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
    if (notification.type === 'promotion_expiring' && notification.data.property_id) {
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
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'promotion_expiring':
        return 'time-outline';
      case 'promotion_expired':
        return 'alert-circle-outline';
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
      default:
        return '#6B7280'; // gray
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isUnread = !item.read_at;
    const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });

    return (
      <TouchableOpacity
        className={`bg-white mx-4 mb-3 rounded-xl p-4 shadow-sm border ${
          isUnread ? 'border-blue-200 bg-blue-50' : 'border-gray-100'
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
                  isUnread ? 'text-gray-900' : 'text-gray-700'
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
                isUnread ? 'text-gray-700' : 'text-gray-500'
              }`}
              numberOfLines={2}
            >
              {item.body}
            </Text>
            
            <Text className="text-xs text-gray-400">
              {timeAgo}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="notifications-outline" size={32} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        No Notifications
      </Text>
      <Text className="text-sm text-gray-500 text-center">
        You'll receive notifications about your promoted properties here.
      </Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-4">
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

  if (!isAgent) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="business-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Agent Access Only
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Notifications are only available for registered agents. Please ensure your profile is set up as an agent.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text className="text-sm text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
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
        ListEmptyComponent={notifications.length === 0 && !loading ? renderEmpty : null}
        ListFooterComponent={
          loading && notifications.length > 0 ? (
            <View className="py-4 items-center">
              <Text className="text-gray-500">Loading more...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
