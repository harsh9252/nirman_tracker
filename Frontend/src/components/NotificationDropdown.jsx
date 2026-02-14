import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiX, FiExternalLink, FiUserCheck, FiClipboard, FiAlertCircle, FiInfo, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import io from 'socket.io-client';
import config from '../config/config';

// Notification sound - Option 1: Web Audio API (Current)
const playNotificationSoundWebAudio = () => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Customize frequency for different sounds:
    // - Bell: 800Hz
    // - Ding: 1000Hz
    // - Chime: 523Hz (C note)
    // - Alert: 440Hz (A note)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Web Audio not supported, trying HTML5 Audio...');
    playNotificationSoundHTML5();
  }
};

// Notification sound - Option 2: HTML5 Audio (External files)
const playNotificationSoundHTML5 = () => {
  try {
    // Create audio element for external sound files
    const audio = new Audio();

    // You can use:
    // 1. Local files in public folder: '/sounds/notification.mp3'
    // 2. External URLs: 'https://example.com/sound.mp3'
    // 3. Data URIs for embedded sounds

    // Example with data URI (embedded sound):
    // audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO1fLOfTIFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO1fLOfTIFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBzaO1fLOfTI=';

    // Using Sound-1.mp3 as requested
    audio.src = '/sounds/Sound-1.mp3'; // Place sound files in public/sounds/

    audio.volume = 0.5; // 50% volume
    audio.play().catch(e => console.log('Audio play failed:', e));
  } catch (error) {
    console.log('HTML5 Audio not supported');
  }
};

// Global audio context and initialization
let audioContext = null;
let audioInitialized = false;

// Initialize audio context on user interaction
const initializeAudio = () => {
  if (!audioInitialized) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // Resume audio context if suspended (required by browser autoplay policies)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      audioInitialized = true;
      console.log('Audio initialized successfully');
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }
};

// Main notification sound function with better reliability
const playNotificationSound = () => {
  // Initialize audio on first play
  initializeAudio();

  try {
    // Try HTML5 Audio first (more reliable for notifications)
    const audio = new Audio();
    audio.src = '/sounds/Sound-1.mp3';
    audio.volume = 1.0; // 100% volume
    audio.preload = 'auto';

    // Add event listeners for better debugging
    audio.oncanplaythrough = () => {
      console.log('Audio loaded successfully');
    };

    audio.onerror = (e) => {
      console.log('Audio load error:', e);
      // Fallback to Web Audio API
      playNotificationSoundWebAudio();
    };

    // Play with promise handling
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Audio played successfully');
        })
        .catch(error => {
          console.log('Audio play failed, trying Web Audio API:', error);
          // Fallback to Web Audio API
          playNotificationSoundWebAudio();
        });
    }
  } catch (error) {
    console.log('HTML5 Audio not supported, trying Web Audio API:', error);
    playNotificationSoundWebAudio();
  }
};

const NotificationDropdown = ({ size = 20 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
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
      setUnreadCount(prev => Math.max(0, prev - 1));
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
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    console.log('Notification clicked:', notification);
    console.log('Notification type:', notification.type);
    try {
      // Mark as read if not already
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      // Navigate based on notification type
      if ((notification.type === 'task_assigned' || notification.type === 'task_completed' || notification.type === 'task_overdue' || notification.type === 'comment') && notification.related_id) {
        console.log('Navigating to task:', notification.related_id);

        // For comment notifications, navigate to task with comments tab active
        if (notification.type === 'comment') {
          console.log('Opening comments tab for comment notification');
          navigate(`/task/${notification.related_id}`, {
            state: { activeTab: 'comments' }
          });
        } else {
          // For other task notifications, navigate with overview tab state
          console.log('Opening overview tab for task notification');
          navigate(`/task/${notification.related_id}`, {
            state: { activeTab: 'overview' }
          });
        }
      } else if (notification.related_id) {
        // Fallback: if we have a related_id but unknown type, assume it's a task
        console.log('Fallback navigation to task:', notification.related_id);
        navigate(`/task/${notification.related_id}`);
      } else {
        console.warn('No related_id found, cannot navigate');
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Still close the dropdown even if there's an error
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket.IO connection and real-time notifications
  useEffect(() => {
    if (user && user.id) {
      console.log('🔌 Initializing Socket.IO connection for user:', user.id);

      // Initialize socket connection
      const socketConnection = io(config.socket.url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      setSocket(socketConnection);

      // Connection event handlers
      socketConnection.on('connect', () => {
        console.log('✅ Socket.IO connected successfully:', socketConnection.id);
        // Join user-specific room after connection
        socketConnection.emit('join-user-room', user.id);
      });

      socketConnection.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
      });

      socketConnection.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO disconnected:', reason);
      });

      // Join user-specific room
      socketConnection.on('joined-room', (userId) => {
        console.log('✅ Joined user room:', userId);
      });

      // Listen for new notifications
      socketConnection.on('new-notification', (data) => {
        console.log('🔔 New notification received via Socket.IO:', data);

        // Add new notification to the list
        setNotifications(prev => [data.notification, ...prev]);

        // Update unread count
        setUnreadCount(prev => prev + 1);

        // Play notification sound
        playNotificationSound();
      });

      // Listen for updated notifications (for comment notifications)
      socketConnection.on('update-notification', (data) => {
        console.log('🔄 Notification updated via Socket.IO:', data);

        // Update existing notification in the list
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === data.notification.id ? data.notification : notif
          )
        );

        // Update unread count if notification became unread
        if (!data.notification.is_read) {
          setUnreadCount(prev => prev + 1);
        }
      });

      // Cleanup on unmount or user change
      return () => {
        console.log('🔌 Cleaning up Socket.IO connection');
        socketConnection.emit('leave-user-room', user.id);
        socketConnection.disconnect();
      };
    }
  }, [user]);

  // Initialize audio on user interaction (required for browser autoplay policies)
  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudio();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // Add listeners for user interactions
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  // Mark all notifications as read when dropdown is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen]);

  // Note: Sound is played in the socket 'new-notification' event handler
  // No need for additional sound playing logic here

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <FiBell size={size} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-1/2 top-full mt-4 w-56 sm:w-72 max-w-[calc(100vw-1rem)] -translate-x-1/2 sm:mt-4 bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-xl border border-blue-200 z-50 max-h-72 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-blue-200 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
            <div className="flex items-center gap-2">
              <FiBell size={14} className="text-white" />
              <h3 className="text-xs font-bold text-white" style={{ fontFamily: 'var(--font-family)' }}>Notifications</h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-white hover:text-blue-100 flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-full"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                <FiCheck size={8} />
                <span className="hidden sm:inline text-xs">Mark</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-48 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-3 sm:p-6 text-center text-gray-500">
                <FiBell size={16} className="sm:w-6 sm:h-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs sm:text-base">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 3).map((notification) => {
                // Get icon and color based on notification type
                const getNotificationIcon = (type) => {
                  switch (type) {
                    case 'task_assigned':
                      return { icon: FiUserCheck, color: 'text-blue-500', bgColor: 'bg-blue-100' };
                    case 'task_completed':
                      return { icon: FiClipboard, color: 'text-green-500', bgColor: 'bg-green-100' };
                    case 'task_overdue':
                      return { icon: FiAlertCircle, color: 'text-red-500', bgColor: 'bg-red-100' };
                    case 'comment':
                      return { icon: FiMessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-100' };
                    default:
                      return { icon: FiInfo, color: 'text-purple-500', bgColor: 'bg-purple-100' };
                  }
                };

                const { icon: NotificationIcon, color, bgColor } = getNotificationIcon(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`px-3 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                      !notification.is_read ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-l-blue-400' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    style={{ fontFamily: 'var(--font-family)' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Notification Type Icon */}
                      <div className={`w-6 h-6 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <NotificationIcon size={12} className={color} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title with Assigner Name */}
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold text-gray-900 break-words" style={{ fontFamily: 'var(--font-family)' }}>
                              {notification.type === 'task_assigned' && notification.assignByName
                                ? `New Task Assigned By ${notification.assignByName} To You`
                                : notification.title
                              }
                            </h4>
                          </div>
                          {/* Unread indicator */}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse ml-2"></div>
                          )}
                        </div>

                        {/* Task Description */}
                        <p className="text-xs text-gray-600 leading-relaxed mb-1 truncate" style={{ fontFamily: 'var(--font-family)' }}>
                          {notification.message}
                        </p>

                        {/* Time and external link */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-family)' }}>
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {notification.type === 'task_assigned' && (
                            <FiExternalLink size={10} className="text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer - Generic for all notification types */}
          {notifications.length > 0 && (
            <div className="px-3 py-1 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-xs text-blue-600 hover:text-blue-800 text-center"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
