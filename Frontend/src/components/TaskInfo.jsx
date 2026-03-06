import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import apiService from '../services/api';
import config from '../config/config';
import { formatDateForDisplay, parseDisplayDate } from '../utils/dateUtils';
import { calculateDistance } from '../utils/locationUtils';
import { toast } from 'react-toastify';
import { FiFileText, FiMessageSquare, FiEdit2, FiCheck, FiX, FiCalendar, FiSend, FiMapPin } from 'react-icons/fi';
import CheckInActionPopup from './CheckInActionPopup';



// InputField component for basic text inputs
const InputField = ({ label, required, value, onChange, placeholder, readOnly = false, error, ...rest }) => (
  <div className="relative" >
    <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
      <span>
        {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
      </span>
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: '100%',
        height: 'var(--input-height)',
        padding: 'var(--input-padding)',
        paddingTop: '20px',
        paddingBottom: '8px',
        fontSize: 'var(--placeholder-font-size)',
        fontFamily: 'var(--font-family)',
        fontWeight: 'normal',
        border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
        borderRadius: 'var(--input-border-radius)',
        backgroundColor: readOnly ? '#f9fafb' : 'var(--input-bg-color)',
        color: 'var(--input-text-color)',
        outline: 'none',
        transition: 'border-color 0.2s',
        cursor: readOnly ? 'default' : 'text',
        boxSizing: 'border-box',
        lineHeight: '1.2',
      }}
      onFocus={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-focus-border-color)'}
      onBlur={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-border-color)'}
      {...rest}
    />
    {error && (
      <p style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)', fontSize: 'var(--error-font-size)', marginTop: '4px' }}>
        {error}
      </p>
    )}
  </div>
);

// TextAreaField component for description
const TextAreaField = ({ label, required, value, onChange, placeholder, ...rest }) => (
  <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
    <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
      <span>
        {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
      </span>
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      style={{
        width: '100%',
        padding: 'var(--input-padding)',
        fontSize: 'var(--placeholder-font-size)',
        fontFamily: 'var(--font-family)',
        fontWeight: 'normal',
        border: '1px solid var(--input-border-color)',
        borderRadius: 'var(--input-border-radius)',
        backgroundColor: 'var(--input-bg-color)',
        color: 'var(--input-text-color)',
        outline: 'none',
        transition: 'border-color 0.2s',
        resize: 'vertical',
        minHeight: '80px'
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border-color)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--input-border-color)'}
      {...rest}
    />
  </div>
);

// Custom DateInputField that shows dates in consistent DD-MMM-YY format across devices with optional date picker
const DateInputField = ({ label, required, value, onChange, placeholder, error, readOnly = false, ...rest }) => {
  const hiddenDateRef = useRef(null);

  const handleTextChange = (e) => {
    if (readOnly) return; // Don't allow manual editing for read-only fields
    const inputValue = e.target.value;
    const parsedValue = parseDisplayDate(inputValue);
    onChange({ target: { value: parsedValue } });
  };

  const handleDateChange = (e) => {
    if (readOnly) return; // Don't allow date picker changes for read-only fields
    const selectedDate = e.target.value; // YYYY-MM-DD format from date input
    onChange({ target: { value: selectedDate } });
  };

  const openDatePicker = () => {
    if (!readOnly && hiddenDateRef.current) {
      hiddenDateRef.current.showPicker();
    }
  };

  return (
    <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
      <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
        <span>
          {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
        </span>
      </label>

      {/* Hidden date input for picker functionality - only if not readOnly */}
      {!readOnly && (
        <input
          ref={hiddenDateRef}
          type="date"
          value={value}
          onChange={handleDateChange}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px' }}
        />
      )}

      {/* Visible text input */}
      <div className="relative">
        <input
          type="text"
          value={formatDateForDisplay(value)}
          onChange={handleTextChange}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{
            width: '100%',
            height: 'var(--input-height)',
            padding: 'var(--input-padding)',
            paddingTop: '20px', // Extra top padding to accommodate the label and center text
            paddingBottom: '8px', // Add bottom padding for better centering
            paddingRight: '40px', // Always space for calendar icon
            fontSize: 'var(--placeholder-font-size)',
            fontFamily: 'var(--font-family)',
            fontWeight: 'normal',
            border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
            borderRadius: 'var(--input-border-radius)',
            backgroundColor: readOnly ? '#f9fafb' : 'var(--input-bg-color)', // Different background for read-only
            color: 'var(--input-text-color)',
            outline: 'none',
            transition: 'border-color 0.2s',
            cursor: readOnly ? 'default' : 'text',
            boxSizing: 'border-box',
            lineHeight: '1.2', // Better line height for centering
          }}
          onFocus={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-focus-border-color)'}
          onBlur={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-border-color)'}
          {...rest}
        />

        {/* Calendar icon - show always but disable click for readOnly */}
        <div
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${readOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}
          style={{ color: 'var(--input-text-color)' }}
          onClick={readOnly ? undefined : openDatePicker}
          title={readOnly ? "Auto-selected date" : "Select date"}
        >
          <FiCalendar size={16} />
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)', fontSize: 'var(--error-font-size)', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  );
};

const SelectField = ({ label, required, options = [], value, onChange, placeholder, searchable = false, disabled = false, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Normalize options to objects with value and label
  const normalizedOptions = options.map(option =>
    typeof option === 'string' ? { value: option, label: option } : option
  );

  // Filter options based on search text
  const filteredOptions = searchable && searchText
    ? normalizedOptions.filter(option =>
      option.label.toLowerCase().includes(searchText.toLowerCase())
    )
    : normalizedOptions;

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchText("");
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchText("");
    } else if (e.key === 'Enter' && filteredOptions.length === 1) {
      handleSelect(filteredOptions[0]);
    }
  };

  // Find the selected option to display its label
  const selectedOption = normalizedOptions.find(option => option.value === value);

  return (
    <div ref={selectRef} className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
      <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
        <span>
          {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
        </span>
      </label>
      {searchable ? (
        <input
          type="text"
          value={isOpen ? searchText : (selectedOption?.label || "")}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 'var(--input-height)',
            padding: 'var(--input-padding)',
            paddingTop: '20px', // Extra top padding to accommodate the label and center text
            paddingBottom: '8px', // Add bottom padding for better centering
            paddingRight: '40px', // Space for dropdown arrow
            fontSize: 'var(--placeholder-font-size)',
            fontFamily: 'var(--font-family)',
            border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
            borderRadius: 'var(--input-border-radius)',
            backgroundColor: 'var(--input-bg-color)',
            color: 'var(--input-text-color)',
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
            lineHeight: '1.2', // Better line height for centering
          }}
          onBlur={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-border-color)'}
        />
      ) : (
        <div
          onClick={disabled ? undefined : () => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            height: 'var(--input-height)',
            padding: 'var(--input-padding)',
            paddingTop: '20px', // Extra top padding to accommodate the label and center text
            paddingBottom: '8px', // Add bottom padding for better centering
            fontSize: 'var(--placeholder-font-size)',
            fontFamily: 'var(--font-family)',
            border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
            borderRadius: 'var(--input-border-radius)',
            backgroundColor: disabled ? '#f9fafb' : 'var(--input-bg-color)',
            color: value ? 'var(--input-text-color)' : 'var(--input-placeholder-color)',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s',
            opacity: disabled ? 0.6 : 1,
            boxSizing: 'border-box',
            lineHeight: '1.2', // Better line height for centering
          }}
        >
          <span style={{
            color: value ? 'var(--input-text-color)' : 'var(--input-placeholder-color)',
            fontSize: 'var(--placeholder-font-size)',
            fontFamily: 'var(--font-family)',
          }}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
      )}

      {/* Dropdown arrow - show for both searchable and non-searchable */}
      <div
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${isOpen ? 'rotate-180' : ''}`}
        style={{
          color: 'var(--input-text-color)',
          transition: 'transform 0.2s',
          pointerEvents: searchable ? 'none' : 'auto',
          cursor: searchable ? 'default' : 'pointer'
        }}
        onClick={searchable ? undefined : () => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto mt-1 w-full">
          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding: '8px 12px',
                fontSize: 'var(--input-font-size)',
                fontFamily: 'var(--font-family)',
                color: 'var(--input-placeholder-color)',
              }}
            >
              No matches found
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelect(option)}
                style={{
                  padding: '8px 12px',
                  fontSize: 'var(--input-font-size)',
                  fontFamily: 'var(--font-family)',
                  color: option.value === value ? 'var(--input-placeholder-color)' : 'var(--input-text-color)',
                  cursor: 'pointer',
                  backgroundColor: option.value === value ? '#f3f4f6' : 'transparent',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = option.value === value ? '#f3f4f6' : 'transparent'}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const TaskInfo = ({ selectedTask, onClose, onTaskUpdate }) => {
  if (!selectedTask) return null;

  const { user, token } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [postingComment, setPostingComment] = useState(false);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Map());

  // Task editing state
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editedTaskData, setEditedTaskData] = useState({});
  const [savingTask, setSavingTask] = useState(false);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [relatedTo, setRelatedTo] = useState("");

  const [checkingIn, setCheckingIn] = useState(false);

  // Check-In Popup State
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);
  const [checkInDistance, setCheckInDistance] = useState(null);

  // Check-In Functionality
  const handleCheckIn = () => {
    if (!selectedTask.latitude || !selectedTask.longitude) {
      toast.error("Task location is not set. Cannot check in.");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setCheckingIn(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const taskLat = parseFloat(selectedTask.latitude);
        const taskLon = parseFloat(selectedTask.longitude);

        const distance = calculateDistance(userLat, userLon, taskLat, taskLon);

        // Threshold in meters (e.g., 200m)
        const THRESHOLD_METERS = 200;

        if (distance <= THRESHOLD_METERS) {
          setCheckInDistance(Math.round(distance));
          setShowCheckInPopup(true);
        } else {
          toast.error(`You are too far from the task location. (Distance: ${Math.round(distance)}m)`);
        }
        setCheckingIn(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to retrieve your location. Please allow location access.");
        setCheckingIn(false);
      }
    );
  };

  const handleCheckInAction = async ({ action, date }) => {
    if (action === 'start') {
      // Start Work: Just update status to Working
      try {
        const updatedTask = {
          ...selectedTask,
          status: "Working"
        };
        const result = await apiService.updateTask(selectedTask.id, updatedTask);

        if (result && onTaskUpdate) {
          onTaskUpdate(result);
        }
        toast.success(`Check-in successful! Status updated to Working. (Distance: ${checkInDistance}m)`);
      } catch (error) {
        console.error("Error updating task status:", error);
        toast.error("Failed to update task status.");
      }
    } else if (action === 'reschedule') {
      // Reschedule: Create NEW task + Complete OLD task
      try {
        // 0. Get Next Task Number
        const { taskNumber } = await apiService.getNextTaskNumber();

        // 1. Create New Task
        const newTaskData = {
          taskNumber: taskNumber, // Include the fetched task number
          name: selectedTask.name, // Same name
          description: selectedTask.description, // Same description
          status: "New", // Reset status
          priority: selectedTask.priority,
          assignTo: selectedTask.assignTo, // Same assignee
          assignBy: user.id,
          projectName: selectedTask.projectName,
          leadName: selectedTask.leadName,
          relatedTo: selectedTask.relatedTo,
          dueDate: date, // NEW DATE
          createdDate: new Date().toISOString().split('T')[0], // CURRENT DATE
          project_id: selectedTask.project_id || null,
          lead_id: selectedTask.lead_id || null,
          latitude: selectedTask.latitude, // Same Location
          longitude: selectedTask.longitude
        };

        const newTask = await apiService.createTask(newTaskData);

        // 2. Complete Old Task & Add Comment
        const completedTask = {
          ...selectedTask,
          status: "Completed"
        };

        await apiService.updateTask(selectedTask.id, completedTask);

        // Add system comment
        await apiService.createComment({
          task_id: selectedTask.id,
          message: `Check-in recorded. User rescheduled follow-up task to ${formatDate(date)}. New Task ID: #${newTask.taskNumber || 'Created'}`,
        });

        toast.success(`Follow-up task created for ${formatDate(date)} and current task marked Completed.`);

        // Close popup and refresh parent
        if (onTaskUpdate) {
          // Pass the OLD task (now completed) to update UI, 
          // OR we could trigger a full refresh if the parent list needs to show the new task.
          // For now, updating the current item view is key.
          onTaskUpdate(completedTask);
        }

      } catch (error) {
        console.error("Error creating follow-up task:", error);
        toast.error("Failed to create follow-up task.");
      }
    }
  };

  // PERFECT SCROLL REFS
  const chatContainerRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const wasNearBottomRef = useRef(true);
  const typingTimeoutRef = useRef(null);

  // ====== Utils ======
  const formatDate = (dateString) => formatDateForDisplay(dateString);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-light-green-bg text-green-text border-green-200";
      case "Working":
        return "bg-light-primary-bg text-primary border-blue-200";
      case "New":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "On Hold":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-light-gray-bg text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Low":
        return "bg-light-green-bg text-green-text border-green-200";
      default:
        return "bg-light-gray-bg text-gray-700 border-gray-200";
    }
  };

  // oldest first (top), newest last (bottom)
  const sortByCreatedAt = (data) =>
    [...data].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

  // Check navigation state for comment notifications
  useEffect(() => {
    console.log('TaskInfo location state changed:', location.state);
    if (location.state?.activeTab === 'comments') {
      console.log('Setting active tab to comments from navigation state');
      setActiveTab('comments');
    } else if (location.state?.activeTab === 'overview' || !location.state?.activeTab) {
      console.log('Setting active tab to overview (default)');
      setActiveTab('overview');
    }
  }, [location.state]);

  // ====== PERFECT AUTO-SCROLL FUNCTIONS =====
  const scrollToBottom = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const isNearBottom = useCallback((threshold = 100) => {
    const el = chatContainerRef.current;
    if (!el) return false;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;

    // User upar scroll kiya hai
    isUserScrollingRef.current = !isNearBottom(200);

    // Previous state update karo
    wasNearBottomRef.current = isNearBottom(100);
  }, [isNearBottom]);

  // ====== Comments fetch (sirf initial / tab change par) ======
  const fetchComments = async () => {
    if (!selectedTask?.id) return;
    setLoadingComments(true);
    try {
      const data = await apiService.getCommentsByTask(selectedTask.id);
      setComments(sortByCreatedAt(data));
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Task change / comments tab open hone par load
  useEffect(() => {
    if (selectedTask?.id && activeTab === "comments") {
      fetchComments();
      // Reset scroll state for new task
      isUserScrollingRef.current = false;
      wasNearBottomRef.current = true;
    }
    // Infer relatedTo if not present
    if (selectedTask) {
      if (selectedTask.relatedTo) {
        setRelatedTo(selectedTask.relatedTo);
      } else if (selectedTask.leadName) {
        setRelatedTo("Lead");
      } else if (selectedTask.projectName) {
        setRelatedTo("Project");
      } else {
        setRelatedTo("Self");
      }
    }
  }, [selectedTask?.id, activeTab]);

  // SCROLL LISTENER: Tab open hone par
  useEffect(() => {
    if (activeTab !== "comments") return;

    const el = chatContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });

    // Initial scroll to bottom
    requestAnimationFrame(() => {
      scrollToBottom();
      wasNearBottomRef.current = true;
      isUserScrollingRef.current = false;
    });

    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab, handleScroll, scrollToBottom]);

  // AUTO-SCROLL: Jab comments change ho (NEW MESSAGE)
  useEffect(() => {
    if (activeTab !== "comments" || !chatContainerRef.current) return;

    // Sirf tab auto-scroll karo jab:
    // - User bottom pe tha PEHLE
    // - Ya user manual scroll nahi kar raha
    if (wasNearBottomRef.current || !isUserScrollingRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom();
        wasNearBottomRef.current = true;
        isUserScrollingRef.current = false;
      });
    }
  }, [comments, activeTab, scrollToBottom, isNearBottom]);

  // Socket.IO connection for real-time comments
  useEffect(() => {
    if (user && user.id && selectedTask?.id && activeTab === "comments") {
      console.log('🔌 Initializing Socket.IO connection for TaskInfo comments:', selectedTask.id);

      const socketConnection = io(config.socket.url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      setSocket(socketConnection);

      socketConnection.on('connect', () => {
        console.log('✅ TaskInfo Socket.IO connected successfully:', socketConnection.id);
        // Join task-specific room for comments
        socketConnection.emit('join-task-room', selectedTask.id);
      });

      socketConnection.on('connect_error', (error) => {
        console.error('❌ TaskInfo Socket.IO connection error:', error);
      });

      socketConnection.on('disconnect', (reason) => {
        console.log('🔌 TaskInfo Socket.IO disconnected:', reason);
      });

      // Listen for real-time new comments
      socketConnection.on('new-comment', (data) => {
        console.log('💬 New comment received via Socket.IO:', data);
        const { comment, taskId } = data;

        // Only add if it's for this task and not from current user (to avoid duplicates)
        if (taskId === selectedTask.id && comment.user_id !== user.id) {
          setComments(prev => sortByCreatedAt([...prev, comment]));
        }
      });

      // Listen for typing indicators
      socketConnection.on('user-typing', (data) => {
        const { userId, userName, taskId, isTyping } = data;

        // Only show typing for this task and not for current user
        if (taskId === selectedTask.id && userId !== user.id) {
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            if (isTyping) {
              newMap.set(userId, { userName, timestamp: Date.now() });
            } else {
              newMap.delete(userId);
            }
            return newMap;
          });
        }
      });

      // Cleanup on unmount or task change
      return () => {
        console.log('🔌 Cleaning up TaskInfo Socket.IO connection');
        socketConnection.emit('leave-task-room', selectedTask.id);
        socketConnection.disconnect();
      };
    }
  }, [user, selectedTask?.id, activeTab]);

  // Handle typing indicators
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Send typing start/stop events
    if (socket && selectedTask?.id) {
      if (value.trim() && !typingTimeoutRef.current) {
        // Start typing
        socket.emit('typing-start', {
          taskId: selectedTask.id,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`
        });
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 1 second of no input
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && selectedTask?.id) {
          socket.emit('typing-stop', {
            taskId: selectedTask.id,
            userId: user.id
          });
        }
        typingTimeoutRef.current = null;
      }, 1000);
    }
  };

  // Clean up typing indicators that are too old
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const newMap = new Map();
        for (const [userId, data] of prev) {
          if (now - data.timestamp < 5000) { // Remove after 5 seconds
            newMap.set(userId, data);
          }
        }
        return newMap;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ====== Send comment (local append, no refetch) ======
  const handleSendComment = async () => {
    if (!newComment.trim() || !token || !user) return;

    setPostingComment(true);
    try {
      // API call
      const saved = await apiService.createComment({
        task_id: selectedTask.id,
        message: newComment.trim(),
        parent_comment_id: replyingTo || null,
      });

      // Local state me smooth append (UI reload nahi hoga)
      const newItem = {
        id: saved?.id ?? Date.now(),
        userName: user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown User',
        message: newComment.trim(),
        parent_comment_id: replyingTo || null,
        created_at: saved?.created_at ?? new Date().toISOString(),
      };

      if (replyingTo) {
        // Add as reply to parent comment
        setComments((prev) =>
          prev.map(comment =>
            comment.id === replyingTo
              ? {
                ...comment,
                replies: [...(comment.replies || []), newItem]
              }
              : comment
          )
        );
      } else {
        // Add as new top-level comment
        setComments((prev) =>
          sortByCreatedAt([...prev, { ...newItem, replies: [] }])
        );
      }

      setNewComment("");
      setReplyingTo(null);

    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setPostingComment(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  // Fetch users and leads when editing starts
  const fetchUsers = async () => {
    try {
      const userData = await apiService.getUsers();
      const formattedUsers = userData.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchLeads = async () => {
    try {
      const leadData = await apiService.getLeads();
      setLeads(leadData);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    }
  };

  // Task editing functions
  const startEditingTask = () => {
    // Fetch users and leads when starting edit
    fetchUsers();
    fetchLeads();

    // Format dates for input fields (convert ISO to YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    setEditedTaskData({
      name: selectedTask.name,
      description: selectedTask.description,
      status: selectedTask.status,
      priority: selectedTask.priority,
      assignTo: selectedTask.assignTo,
      assignBy: selectedTask.assignBy,
      projectName: selectedTask.projectName || "",
      leadName: selectedTask.leadName || "",
      relatedTo: selectedTask.relatedTo || relatedTo,
      dueDate: formatDateForInput(selectedTask.dueDate),
      createdDate: formatDateForInput(selectedTask.createdDate),
      latitude: selectedTask.latitude || "",
      longitude: selectedTask.longitude || ""
    });
    setIsEditingTask(true);
  };

  const cancelEditingTask = () => {
    setIsEditingTask(false);
    setEditedTaskData({});
  };

  const saveTask = async () => {
    setSavingTask(true);
    try {
      const updatedTask = {
        taskNumber: editedTaskData.taskNumber || selectedTask.taskNumber,
        name: editedTaskData.name,
        description: editedTaskData.description,
        status: editedTaskData.status,
        priority: editedTaskData.priority,
        assignTo: editedTaskData.assignTo,
        assignBy: editedTaskData.assignBy,
        projectName: editedTaskData.projectName || "",
        leadName: editedTaskData.leadName || "",
        relatedTo: editedTaskData.relatedTo || "",
        dueDate: editedTaskData.dueDate,
        createdDate: editedTaskData.createdDate,
        latitude: editedTaskData.latitude,
        longitude: editedTaskData.longitude
      };

      const result = await apiService.updateTask(selectedTask.id, updatedTask);

      // Update the local selectedTask with the returned data
      if (result && onTaskUpdate) {
        onTaskUpdate(result);
      }

      setIsEditingTask(false);
      setEditedTaskData({});

      console.log('Task updated successfully');

    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setSavingTask(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FiFileText },
    { id: "comments", label: "Comments", icon: FiMessageSquare },
  ];

  return (
    <div className="bg-white rounded-xl overflow-hidden h-full sm:h-[calc(100vh-90px)] flex flex-col relative">
      {/* Tab Navigation - Top */}
      <div className="border-b-[2px] border-primary bg-white">
        <nav className="flex">
          <button
            onClick={onClose}
            className="flex items-center justify-center px-2 sm:px-3 py-1 text-sm font-medium text-white hover:text-gray-100 bg-gray-400 hover:bg-gray-450 transition-all duration-300"
            title="Go back"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                animation: 'wave 2.5s ease-in-out infinite'
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1 text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                  ? "text-white bg-primary"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Header - Desktop */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-light-gray-bg">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate" style={{ fontFamily: 'var(--font-family)' }}>
            {selectedTask.name}
          </h2>
          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap" style={{ fontFamily: 'var(--font-family)' }}>
            Assigned to: {selectedTask.assignToName || selectedTask.assignTo}
          </span>
        </div>
        {activeTab === "overview" && (
          !isEditingTask ? (
            <div className="flex gap-2">
              <button
                onClick={handleCheckIn}
                disabled={selectedTask.status === "Working" || checkingIn}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                {checkingIn ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FiMapPin size={16} />
                )}
                <span>Check In</span>
              </button>
              <button
                onClick={startEditingTask}
                disabled={selectedTask.status !== "Working"}
                className={`flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium ${selectedTask.status !== "Working" ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ fontFamily: 'var(--font-family)' }}
              >
                <FiEdit2 size={16} />
                <span>Edit</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveTask}
                disabled={savingTask}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm font-medium"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                {savingTask ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FiCheck size={16} />
                )}
                <span>{savingTask ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={cancelEditingTask}
                disabled={savingTask}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm font-medium"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                <FiX size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Mobile Header */}
      <div className="block sm:hidden border-b border-gray-200 bg-light-gray-bg">
        {/* Task Name */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 break-words">
            {selectedTask.name}
          </h2>
        </div>

        {/* Assigned To Info + Edit Button Row */}
        <div className="flex items-start justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-family)' }}>
              Assigned to:
            </span>
            <span className="text-sm text-gray-900 font-medium" style={{ fontFamily: 'var(--font-family)' }}>
              {selectedTask.assignToName || selectedTask.assignTo}
            </span>
          </div>
          {activeTab === "overview" && !isEditingTask && (
            <button
              onClick={startEditingTask}
              disabled={selectedTask.status !== "Working"}
              className={`flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm ml-4 ${selectedTask.status !== "Working" ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ fontFamily: 'var(--font-family)' }}
            >
              <FiEdit2 size={14} />
              <span>Edit</span>
            </button>
          )}
          {activeTab === "overview" && !isEditingTask && (
            <button
              onClick={handleCheckIn}
              disabled={selectedTask.status === "Working" || checkingIn}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ml-2"
              style={{ fontFamily: 'var(--font-family)' }}
            >
              {checkingIn ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <FiMapPin size={14} />
              )}
              <span>Check In</span>
            </button>
          )}
          {activeTab === "overview" && isEditingTask && (
            <div className="flex gap-1 ml-4">
              <button
                onClick={saveTask}
                disabled={savingTask}
                className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors text-xs"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                {savingTask ? (
                  <div className="animate-spin rounded-full h-2.5 w-2.5 border-b border-white"></div>
                ) : (
                  <FiCheck size={12} />
                )}
                <span>{savingTask ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={cancelEditingTask}
                disabled={savingTask}
                className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors text-xs"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                <FiX size={12} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`flex-1 overflow-hidden ${activeTab === "comments" ? "pb-20" : ""}`}>
        {activeTab === "overview" && (
          <div className="p-4 sm:p-6 overflow-auto h-full">
            {/* Mobile View - Responsive Form Layout */}
            <div className="block sm:hidden" style={{ fontFamily: 'var(--font-family)' }}>
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                {/* Task Name - Full Width */}
                <div>
                  {isEditingTask ? (
                    <InputField
                      label="TASK NAME"
                      required
                      value={editedTaskData.name}
                      onChange={(e) => setEditedTaskData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter task name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                        Task Name
                      </div>
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {selectedTask.name}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status and Priority - 2 Column Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    {isEditingTask ? (
                      <SelectField
                        label="STATUS"
                        required
                        value={editedTaskData.status}
                        onChange={(value) => setEditedTaskData(prev => ({ ...prev, status: value }))}
                        options={[
                          { value: "New", label: "New" },
                          { value: "Working", label: "Working" },
                          { value: "Completed", label: "Completed" },
                          { value: "On Hold", label: "On Hold" },
                          { value: "Cancelled", label: "Cancelled" }
                        ]}
                        placeholder="Select status"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Status
                        </div>
                        <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTask.status)}`}>
                          {selectedTask.status}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditingTask ? (
                      <SelectField
                        label="PRIORITY"
                        required
                        value={editedTaskData.priority}
                        onChange={(value) => setEditedTaskData(prev => ({ ...prev, priority: value }))}
                        options={[
                          { value: "Low", label: "Low" },
                          { value: "Medium", label: "Medium" },
                          { value: "High", label: "High" },
                        ]}
                        placeholder="Select priority"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Priority
                        </div>
                        <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                          {selectedTask.priority}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned By and Assigned To - 2 Column Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex-1 min-w-0">
                    {isEditingTask ? (
                      user?.role?.toLowerCase() === 'admin' ? (
                        <SelectField
                          label="ASSIGNED BY"
                          required
                          value={editedTaskData.assignBy || ""}
                          onChange={(userId) => {
                            setEditedTaskData(prev => ({ ...prev, assignBy: userId }));
                          }}
                          options={users.map(user => ({ value: user.id, label: user.name }))}
                          placeholder="Select assigned by"
                          searchable={true}
                        />
                      ) : (
                        <InputField
                          label="ASSIGNED BY"
                          required
                          value={user ? `${user.firstName} ${user.lastName}` : "Current User"}
                          readOnly
                          placeholder="Auto-selected current user"
                        />
                      )
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg h-full">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Assigned By
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {selectedTask.assignByName || selectedTask.assignBy}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditingTask ? (
                      <SelectField
                        label="ASSIGNED TO"
                        required
                        value={editedTaskData.assignTo || ""}
                        onChange={(userId) => {
                          setEditedTaskData(prev => ({ ...prev, assignTo: userId }));
                        }}
                        options={users.map(user => ({ value: user.id, label: user.name }))}
                        placeholder="Select assigned to"
                        searchable={true}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg h-full">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Assigned To
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {selectedTask.assignToName || selectedTask.assignTo}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related To - 2 Column Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    {isEditingTask ? (
                      <SelectField
                        label="RELATED TO"
                        value={editedTaskData.relatedTo}
                        onChange={(value) => {
                          setEditedTaskData(prev => ({
                            ...prev,
                            relatedTo: value,
                            projectName: value !== "Project" ? "" : prev.projectName,
                            leadName: value !== "Lead" ? "" : prev.leadName
                          }));
                        }}
                        options={["Lead", "Project", "Self"]}
                        placeholder="Select related to"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Related To
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {relatedTo || "Self"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditingTask ? (
                      editedTaskData.relatedTo === "Lead" ? (
                        <SelectField
                          label="LEAD NAME"
                          required
                          value={editedTaskData.leadName}
                          onChange={(value) => setEditedTaskData(prev => ({ ...prev, leadName: value }))}
                          options={leads.map(l => l.contact_name)}
                          placeholder="Select lead"
                          searchable={true}
                        />
                      ) : editedTaskData.relatedTo === "Project" ? (
                        <InputField
                          label="PROJECT NAME"
                          required
                          value={editedTaskData.projectName}
                          onChange={(e) => setEditedTaskData(prev => ({ ...prev, projectName: e.target.value }))}
                          placeholder="Enter project name"
                        />
                      ) : (
                        <InputField
                          label="RELATED NAME"
                          value="N/A"
                          readOnly
                        />
                      )
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          {relatedTo === "Lead" ? "Lead Name" : relatedTo === "Project" ? "Project Name" : "Related Name"}
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {relatedTo === "Lead" ? selectedTask.leadName : relatedTo === "Project" ? selectedTask.projectName : "N/A"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Created Date and Due Date - 2 Column Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    {isEditingTask ? (
                      <DateInputField
                        label="CREATED DATE"
                        required
                        value={editedTaskData.createdDate}
                        readOnly
                        placeholder="Auto-selected date"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Created Date
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {formatDate(selectedTask.createdDate)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditingTask ? (
                      <DateInputField
                        label="DUE DATE"
                        required
                        value={editedTaskData.dueDate}
                        onChange={(e) => setEditedTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                        placeholder="Select due date"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Due Date
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {formatDate(selectedTask.dueDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Latitude and Longitude - 2 Column Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    {isEditingTask ? (
                      <InputField
                        label="LATITUDE"
                        value={editedTaskData.latitude}
                        onChange={(e) => setEditedTaskData(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="Enter latitude"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Latitude
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {selectedTask.latitude || "N/A"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditingTask ? (
                      <InputField
                        label="LONGITUDE"
                        value={editedTaskData.longitude}
                        onChange={(e) => setEditedTaskData(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="Enter longitude"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                          Longitude
                        </div>
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {selectedTask.longitude || "N/A"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description - Full Width */}
                <div>
                  {isEditingTask ? (
                    <TextAreaField
                      label="DESCRIPTION"
                      value={editedTaskData.description}
                      onChange={(e) => setEditedTaskData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter task description"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                        Description
                      </div>
                      <div className="text-sm text-gray-900 break-words">
                        {selectedTask.description || "N/A"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop/Tablet View - Custom Grid Layout */}
            <div className="hidden sm:block" style={{ fontFamily: 'var(--font-family)' }}>
              <div className="space-y-2 sm:space-y-3">
                {/* Row 1: Task Name (full width) */}
                <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                  {isEditingTask ? (
                    <InputField
                      label="TASK NAME"
                      required
                      value={editedTaskData.name}
                      onChange={(e) => setEditedTaskData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter task name"
                    />
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Task Name
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTask.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Row 2: Status + Priority */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      <SelectField
                        label="STATUS"
                        required
                        value={editedTaskData.status}
                        onChange={(value) => setEditedTaskData(prev => ({ ...prev, status: value }))}
                        options={[
                          { value: "New", label: "New" },
                          { value: "Working", label: "Working" },
                          { value: "Completed", label: "Completed" },
                          { value: "On Hold", label: "On Hold" },
                          { value: "Cancelled", label: "Cancelled" }
                        ]}
                        placeholder="Select status"
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Status
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            selectedTask.status
                          )}`}
                        >
                          {selectedTask.status}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      <SelectField
                        label="PRIORITY"
                        required
                        value={editedTaskData.priority}
                        onChange={(value) => setEditedTaskData(prev => ({ ...prev, priority: value }))}
                        options={[
                          { value: "Low", label: "Low" },
                          { value: "Medium", label: "Medium" },
                          { value: "High", label: "High" }
                        ]}
                        placeholder="Select priority"
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Priority
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            selectedTask.priority
                          )}`}
                        >
                          {selectedTask.priority}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: Assigned By + Assigned To */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      user?.role?.toLowerCase() === 'admin' ? (
                        <SelectField
                          label="ASSIGNED BY"
                          required
                          value={editedTaskData.assignBy || ""}
                          onChange={(userId) => {
                            setEditedTaskData(prev => ({ ...prev, assignBy: userId }));
                          }}
                          options={users.map(user => ({ value: user.id, label: user.name }))}
                          placeholder="Select assigned by"
                          searchable={true}
                        />
                      ) : (
                        <InputField
                          label="ASSIGNED BY"
                          required
                          value={user ? `${user.firstName} ${user.lastName}` : "Current User"}
                          readOnly
                          placeholder="Auto-selected current user"
                        />
                      )
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Assigned By
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedTask.assignByName || selectedTask.assignBy}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      <SelectField
                        label="ASSIGNED TO"
                        required
                        value={editedTaskData.assignTo || ""}
                        onChange={(userId) => {
                          setEditedTaskData(prev => ({ ...prev, assignTo: userId }));
                        }}
                        options={users.map(user => ({ value: user.id, label: user.name }))}
                        placeholder="Select assigned to"
                        searchable={true}
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Assigned To
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedTask.assignToName || selectedTask.assignTo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 5: Related To + Lead/Project Name */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      <SelectField
                        label="RELATED TO"
                        value={editedTaskData.relatedTo}
                        onChange={(value) => {
                          setEditedTaskData(prev => ({
                            ...prev,
                            relatedTo: value,
                            projectName: value !== "Project" ? "" : prev.projectName,
                            leadName: value !== "Lead" ? "" : prev.leadName
                          }));
                        }}
                        options={["Lead", "Project", "Self"]}
                        placeholder="Select related to"
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Related To
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {relatedTo || "Self"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      editedTaskData.relatedTo === "Lead" ? (
                        <SelectField
                          label="LEAD NAME"
                          required
                          value={editedTaskData.leadName}
                          onChange={(value) => setEditedTaskData(prev => ({ ...prev, leadName: value }))}
                          options={leads.map(l => l.contact_name)}
                          placeholder="Select lead"
                          searchable={true}
                        />
                      ) : editedTaskData.relatedTo === "Project" ? (
                        <InputField
                          label="PROJECT NAME"
                          required
                          value={editedTaskData.projectName}
                          onChange={(e) => setEditedTaskData(prev => ({ ...prev, projectName: e.target.value }))}
                          placeholder="Enter project name"
                        />
                      ) : (
                        <InputField
                          label="RELATED NAME"
                          value="N/A"
                          readOnly
                        />
                      )
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          {relatedTo === "Lead" ? "Lead Name" : relatedTo === "Project" ? "Project Name" : "Related Name"}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {relatedTo === "Lead" ? selectedTask.leadName : relatedTo === "Project" ? selectedTask.projectName : "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: Created Date + Due Date */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      <DateInputField
                        label="CREATED DATE"
                        required
                        value={editedTaskData.createdDate}
                        readOnly
                        placeholder="Auto-selected date"
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Created Date
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(selectedTask.createdDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      <DateInputField
                        label="DUE DATE"
                        required
                        value={editedTaskData.dueDate}
                        onChange={(e) => setEditedTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                        placeholder="Select due date"
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Due Date
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(selectedTask.dueDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 6: Latitude + Longitude */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      <InputField
                        label="LATITUDE"
                        value={editedTaskData.latitude}
                        onChange={(e) => setEditedTaskData(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="Enter latitude"
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Latitude
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedTask.latitude || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                    {isEditingTask ? (
                      <InputField
                        label="LONGITUDE"
                        value={editedTaskData.longitude}
                        onChange={(e) => setEditedTaskData(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="Enter longitude"
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                          Longitude
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedTask.longitude || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 7: Description (full width at bottom) */}
                <div className="bg-light-gray-bg rounded-lg p-4 border border-gray-200">
                  {isEditingTask ? (
                    <TextAreaField
                      label="DESCRIPTION"
                      value={editedTaskData.description}
                      onChange={(e) => setEditedTaskData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter task description"
                    />
                  ) : (
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium mr-4">
                        Description
                      </span>
                      <span className="text-sm text-gray-900 flex-1">
                        {selectedTask.description || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div >
          </div >
        )}

        {
          activeTab === "comments" && (
            <div className="flex flex-col h-full min-h-0 relative">
              {/* Chat Messages - PERFECT SCROLL CONTAINER */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50"
                style={{
                  scrollBehavior: "smooth",
                  paddingBottom: "4rem",
                }}
              >
                {loadingComments ? (
                  <div className="flex justify-center items-center py-6 sm:py-8">
                    <div className="text-sm text-gray-500">Loading comments...</div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex justify-center items-center py-6 sm:py-8">
                    <div className="text-sm text-gray-500 text-center px-4">
                      No comments yet. Start the conversation!
                    </div>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      {/* Main Comment */}
                      <div className="flex gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium flex-shrink-0">
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {comment.userName}
                              </span>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatTime(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 break-words">
                              {comment.message}
                            </p>
                          </div>
                          <button
                            onClick={() => setReplyingTo(comment.id)}
                            className="text-xs text-primary hover:text-blue-600 mt-1 ml-2 sm:ml-3"
                          >
                            Reply
                          </button>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies &&
                        comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2 sm:gap-3 ml-8 sm:ml-11">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {reply.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-100 rounded-lg p-2 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-900 truncate">
                                    {reply.userName}
                                  </span>
                                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                    {formatTime(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 break-words">
                                  {reply.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        }
      </div >

      {/* Chat Input - Fixed at bottom when comments tab is active */}
      {
        activeTab === "comments" && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
            {/* Reply Indicator */}
            {replyingTo && (
              <div className="px-3 sm:px-4 py-2 text-xs text-gray-600 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
                <span>
                  Replying to{' '}
                  <span className="font-medium">
                    {comments.find(c => c.id === replyingTo)?.userName || 'Unknown User'}
                  </span>
                </span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                  title="Cancel reply"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Typing Indicators */}
            {typingUsers.size > 0 && (
              <div className="px-3 sm:px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                {Array.from(typingUsers.values()).map((user, index) => (
                  <span key={index} className="inline-flex items-center">
                    <span className="font-medium">{user.userName}</span>
                    <span className="ml-1">is typing</span>
                    {index < typingUsers.size - 1 && <span className="mx-1">,</span>}
                  </span>
                ))}
                <span className="ml-1 animate-pulse">...</span>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 sm:p-4">
              <div className="flex">
                <textarea
                  value={newComment}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
                  rows={1}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim() || postingComment}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-primary text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  style={{ minHeight: '40px' }}
                >
                  <FiSend size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Check In Action Popup */}
      <CheckInActionPopup
        isOpen={showCheckInPopup}
        onClose={() => setShowCheckInPopup(false)}
        onConfirm={handleCheckInAction}
      />
    </div >
  );
};

export default TaskInfo;
