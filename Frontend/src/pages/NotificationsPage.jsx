import React, { useState, useEffect } from "react";
import { FiBell, FiCheck, FiX, FiExternalLink, FiUserCheck, FiClipboard, FiAlertCircle, FiInfo, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/api';

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, read, unread
  const [deletedTasks, setDeletedTasks] = useState(new Set()); // Track which task IDs are deleted

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if ((notification.type === 'task_assigned' || notification.type === 'task_completed' || notification.type === 'task_overdue' || notification.type === 'comment') && notification.related_id) {
      try {
        // Check if the task still exists
        const taskData = await apiService.getTaskById(notification.related_id);

        // For comment notifications, navigate to task with comments tab active
        if (notification.type === 'comment') {
          navigate(`/task/${notification.related_id}`, {
            state: { activeTab: 'comments' }
          });
        } else {
          // For other task notifications, navigate normally
          navigate(`/task/${notification.related_id}`);
        }
      } catch (error) {
        // Task not found (deleted) - show toast error
        toast.error('This task has been deleted and cannot be opened.');
      }
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'read') return notification.is_read;
    if (filter === 'unread') return !notification.is_read;
    return true; // all
  });

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Mark all notifications as read when page loads
  useEffect(() => {
    if (!loading && notifications.length > 0 && notifications.some(n => !n.is_read)) {
      markAllAsRead();
    }
  }, [loading, notifications]);

  return (
    <div className="flex-1 flex flex-col hero-section">
      <div className="flex-1 flex">
        <main className="flex-1 overflow-hidden px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800 transition-colors p-1"
                >
                  <FiArrowLeft size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline text-sm">Back</span>
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <FiBell size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                  <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-xs sm:text-sm text-gray-600">View all your notifications</p>
                  </div>
                </div>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiCheck size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Mark All Read</span>
                  <span className="sm:hidden">Mark Read</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
              {[
                { value: 'all', label: 'All', count: notifications.length },
                { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.is_read).length },
                { value: 'read', label: 'Read', count: notifications.filter(n => n.is_read).length }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-md sm:rounded-t-lg transition-colors whitespace-nowrap ${
                    filter === tab.value
                      ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.value === 'all' ? 'All' :
                     tab.value === 'unread' ? 'New' :
                     'Read'}
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
                    filter === tab.value
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-2 sm:space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <FiBell size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filter === 'unread' ? 'No unread notifications' :
                     filter === 'read' ? 'No read notifications' :
                     'No notifications'}
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'unread' ? 'You have read all your notifications!' :
                     filter === 'read' ? 'No notifications have been read yet.' :
                     'You don\'t have any notifications yet.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  // Get icon and color based on notification type
                  const getNotificationIcon = (type) => {
                    switch (type) {
                      case 'task_assigned':
                        return { icon: FiUserCheck, color: 'text-blue-500', bgColor: 'bg-blue-100' };
                      case 'task_completed':
                        return { icon: FiClipboard, color: 'text-green-500', bgColor: 'bg-green-100' };
                      case 'task_overdue':
                        return { icon: FiAlertCircle, color: 'text-red-500', bgColor: 'bg-red-100' };
                      default:
                        return { icon: FiInfo, color: 'text-purple-500', bgColor: 'bg-purple-100' };
                    }
                  };

                  const { icon: NotificationIcon, color, bgColor } = getNotificationIcon(notification.type);

                  return (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Notification Type Icon */}
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <NotificationIcon size={16} className={`sm:w-5 sm:h-5 ${color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header with title and time */}
                          <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                            <div className="flex-1">
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-900 break-words leading-tight">
                                {notification.type === 'task_assigned' && notification.assignByName
                                  ? `New Task Assigned By ${notification.assignByName} To You`
                                  : notification.title
                                }
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                              {!notification.is_read && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>

                          {/* Message */}
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-2 sm:mb-3 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Action indicator */}
                          {notification.type === 'task_assigned' && (
                            <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-600">
                              <FiExternalLink size={10} className="sm:w-3 sm:h-3" />
                              <span>Click to view task</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
