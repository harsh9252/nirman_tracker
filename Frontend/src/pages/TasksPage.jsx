import React, { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { FiUserPlus, FiMail, FiPhone, FiCalendar, FiEdit2, FiTrash2, FiSearch, FiPlus, FiSliders, FiList, FiUpload, FiFilter, FiCheck, FiUser, FiUserCheck } from "react-icons/fi";
import TableActionButton from "../components/TableActionButton";
import TaskFormPopup from "../components/TaskFormPopup";
import TaskInfo from "../components/TaskInfo";
import Table from "../components/Table";
import { useAuth } from "../contexts/AuthContext";
import { formatDateForDisplay } from "../utils/dateUtils.jsx";
import apiService from "../services/api";
import io from 'socket.io-client';
import config from '../config/config';

export default function TasksPage({ searchTerm = '' }) {
  const { user } = useAuth();
  const location = useLocation();
  const { taskId } = useParams();
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);

  const currentUserName = user ? `${user.firstName} ${user.lastName}` : "Admin";
  const [dueDates, setDueDates] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isDateFilterPopupOpen, setIsDateFilterPopupOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskViews, setTaskViews] = useState([
    { id: 1, name: "All Tasks", pinned: true },
    { id: 2, name: "My Tasks", pinned: false }
  ]);
  const [currentViewId, setCurrentViewId] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [hasShownDeletedTaskError, setHasShownDeletedTaskError] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
  if (user) {
    fetchTasks(user,  setLoading);
  }
}, [user]);

  // Reset selectedTask when navigating back to tasks page
  useEffect(() => {
    if (location.pathname === '/my-tasks') {
      setSelectedTask(null);
    }
  }, [location.pathname]);

  // Handle direct task route navigation (e.g., /task/123)
  useEffect(() => {
    if (taskId && tasksData.length > 0 && !hasShownDeletedTaskError) {
      console.log('Direct task route navigation:', taskId);
      const taskToOpen = tasksData.find(task => task.id == taskId);
      if (taskToOpen) {
        console.log('Task found for direct route, opening:', taskToOpen);
        setSelectedTask(taskToOpen);
      } else {
        console.log('Task not found for direct route ID:', taskId);
        // Show error toast for deleted task only once
        setErrorMessage('Task not found. It may have been deleted.');
        setShowErrorMessage(true);
        setHasShownDeletedTaskError(true);
        // Hide error message after 5 seconds
        setTimeout(() => {
          setShowErrorMessage(false);
          setErrorMessage("");
        }, 5000);
      }
    }
  }, [taskId, tasksData, hasShownDeletedTaskError]);

  // Handle notification navigation - open task directly or highlight in table
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openTaskId = urlParams.get('openTaskId');
    const highlightTaskId = urlParams.get('highlightTaskId');
    const fromNotification = urlParams.get('fromNotification') === 'true';

    console.log('TasksPage URL params:', { openTaskId, highlightTaskId, fromNotification });
    console.log('TasksPage tasksData.length:', tasksData.length);

    if ((openTaskId || highlightTaskId) && tasksData.length > 0) {
      console.log('Processing notification navigation:', { openTaskId, highlightTaskId, fromNotification });

      if (openTaskId) {
        console.log('Opening task directly:', openTaskId);
        // Directly open the task info
        const taskToOpen = tasksData.find(task => task.id == openTaskId);
        if (taskToOpen) {
          console.log('Task found, opening:', taskToOpen);
          setSelectedTask(taskToOpen);
        } else if (!hasShownDeletedTaskError) {
          console.log('Task not found for ID:', openTaskId);
          // Show error toast for deleted task only once
          setErrorMessage('Task not found. It may have been deleted.');
          setShowErrorMessage(true);
          setHasShownDeletedTaskError(true);
          // Hide error message after 5 seconds
          setTimeout(() => {
            setShowErrorMessage(false);
            setErrorMessage("");
          }, 5000);
        }
        // Clear the URL params to prevent repeated actions
        setTimeout(() => {
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', newUrl);
        }, 100);
      } else if (highlightTaskId) {
        console.log('Highlighting task:', highlightTaskId);
        // Just highlight the task in the table
        const taskToHighlight = tasksData.find(task => task.id == highlightTaskId);
        if (taskToHighlight) {
          setHighlightedTaskId(highlightTaskId);
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedTaskId(null);
          }, 3000);
        } else if (!hasShownDeletedTaskError) {
          // Show error toast for deleted task only once
          setErrorMessage('Task not found. It may have been deleted.');
          setShowErrorMessage(true);
          setHasShownDeletedTaskError(true);
          // Hide error message after 5 seconds
          setTimeout(() => {
            setShowErrorMessage(false);
            setErrorMessage("");
          }, 5000);
        }
        // Clear the URL params to prevent repeated alerts
        setTimeout(() => {
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', newUrl);
        }, 100);
      }
    }
  }, [tasksData, location.search]);

  // Handle clicks outside the filter dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on dropdown options or the filter button itself
      if (event.target.closest('[data-dropdown-option]') || event.target.closest('[data-filter-button]')) {
        return;
      }

      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterPopupOpen(false);
      }
    };

    if (isFilterPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPopupOpen]);

  // Handle clicks outside the date filter dropdown to close it
  useEffect(() => {
    const handleClickOutsideDate = (event) => {
      // Don't close if clicking on the date filter button or dropdown
      if (event.target.closest('[data-date-filter-button]') || event.target.closest('.date-filter-dropdown')) {
        return;
      }
      setIsDateFilterPopupOpen(false);
    };

    if (isDateFilterPopupOpen) {
      document.addEventListener('mousedown', handleClickOutsideDate);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDate);
    };
  }, [isDateFilterPopupOpen]);

  // Handle clicks outside the view dropdown to close it
  useEffect(() => {
    const handleClickOutsideView = (event) => {
      // Don't close if clicking on the view filter button or dropdown
      if (event.target.closest('[data-view-filter-button]') || event.target.closest('.view-dropdown')) {
        return;
      }
      setIsViewDropdownOpen(false);
    };

    if (isViewDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutsideView);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideView);
    };
  }, [isViewDropdownOpen]);

  // Socket.IO connection for real-time task updates
  useEffect(() => {
    if (user && user.id) {
      console.log('🔌 Initializing Socket.IO connection for TasksPage user:', user.id);

      const socketConnection = io(config.socket.url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      setSocket(socketConnection);

      socketConnection.on('connect', () => {
        console.log('✅ TasksPage Socket.IO connected successfully:', socketConnection.id);
        // Join user-specific room for task updates
        socketConnection.emit('join-user-room', user.id);
      });

      socketConnection.on('connect_error', (error) => {
        console.error('❌ TasksPage Socket.IO connection error:', error);
      });

      socketConnection.on('disconnect', (reason) => {
        console.log('🔌 TasksPage Socket.IO disconnected:', reason);
      });

      // Listen for real-time task creation
      socketConnection.on('task-created', (data) => {
        console.log('📝 New task created via Socket.IO:', data);
        const { task } = data;

        // Check if this task should be visible to current user
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        const shouldShowTask = isAdmin || task.assignBy === user?.id || task.assignTo === user?.id;

        if (shouldShowTask) {
          // Add new task to the list and sort
          setTasksData(prevTasks => {
            const updatedTasks = [...prevTasks, task].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            return updatedTasks;
          });

          // Only show notification to the assigned user, not success messages
          if (task.assignTo === user?.id) {
            setSuccessMessage(`New task "${task.name}" has been assigned to you!`);
            setShowSuccessMessage(true);
            setTimeout(() => {
              setShowSuccessMessage(false);
              setSuccessMessage("");
            }, 5000);
          }
        }
      });

      // Listen for real-time task updates
      socketConnection.on('task-updated', (data) => {
        console.log('📝 Task updated via Socket.IO:', data);
        const { task } = data;

        // Check if this task should be visible to current user
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        const shouldShowTask = isAdmin || task.assignBy === user?.id || task.assignTo === user?.id;

        if (shouldShowTask) {
          // Update the task in the list
          setTasksData(prevTasks => {
            const updatedTasks = prevTasks.map(t =>
              t.id === task.id ? { ...task } : t
            ).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            return updatedTasks;
          });

          // If the currently selected task is updated, update it too
          if (selectedTask && selectedTask.id === task.id) {
            setSelectedTask(task);
          }
        }
      });

      // Listen for real-time task deletions
      socketConnection.on('task-deleted', (data) => {
        console.log('🗑️ Task deleted via Socket.IO:', data);
        const { taskId } = data;

        // Remove the task from the list
        setTasksData(prevTasks => {
          const filteredTasks = prevTasks.filter(t => t.id !== parseInt(taskId));
          return filteredTasks;
        });

        // If the currently selected task is deleted, close it
        if (selectedTask && selectedTask.id === parseInt(taskId)) {
          setSelectedTask(null);
        }
      });

      // Cleanup on unmount or user change
      return () => {
        console.log('🔌 Cleaning up TasksPage Socket.IO connection');
        socketConnection.emit('leave-user-room', user.id);
        socketConnection.disconnect();
      };
    }
  }, [user]);

  // ⬇️ Reusable function to fetch tasks

const fetchTasks = async () => {
  try {
    // Always fetch all tasks for the current user (both assigned to and assigned by)
    // The frontend filtering will handle the "My Tasks" vs "All Tasks" view
    const params = { user_id: user.id };

    console.log('TasksPage fetchTasks - User ID:', user?.id, 'params:', params);

    const tasks = await apiService.getTasks(params);
    const sortedTasks = tasks.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    setTasksData(sortedTasks);
    console.log("Tasks fetched:", sortedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  } finally {
    setLoading(false);
  }
};

  const filteredTasks = tasksData.filter(task => {
    const matchesSearch = searchTerm === '' ||
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignToName && task.assignToName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.assignByName && task.assignByName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || task.status === selectedStatus;

    // Date-based filtering (by due date or created date)
    let matchesDateFilter = true;
    if (selectedDateFilter !== 'All') {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfNextWeek = new Date(startOfWeek);
      startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // For "Today", check both due date and created date
      if (selectedDateFilter === 'Today') {
        let matchesDueDate = false;
        let matchesCreatedDate = false;

        // Check due date if it exists
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          matchesDueDate = dueDate >= startOfToday && dueDate < startOfTomorrow;
        }

        // Check created date
        if (task.createdDate) {
          const createdDate = new Date(task.createdDate);
          matchesCreatedDate = createdDate >= startOfToday && createdDate < startOfTomorrow;
        }

        matchesDateFilter = matchesCreatedDate;
      } else if (selectedDateFilter === 'This Week') {
        // For week/month, only check due date
        if (task.dueDate) {
          const taskDate = new Date(task.dueDate);
          matchesDateFilter = taskDate >= startOfWeek && taskDate < startOfNextWeek;
        } else {
          matchesDateFilter = false;
        }
      } else if (selectedDateFilter === 'This Month') {
        // For month, only check due date
        if (task.dueDate) {
          const taskDate = new Date(task.dueDate);
          matchesDateFilter = taskDate >= startOfMonth && taskDate < startOfNextMonth;
        } else {
          matchesDateFilter = false;
        }
      }
    }

    // View-based filtering
    let matchesView = true;
    if (currentViewId === 2) { // My Tasks - tasks assigned to current user
      matchesView = task.assignTo === user?.id;
    } else if (currentViewId === 3) { // New Tasks
      matchesView = task.status === 'New';
    } else if (currentViewId === 4) { // Completed Tasks
      matchesView = task.status === 'Completed';
    } else if (currentViewId === 5) { // Overdue Tasks
      matchesView = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
    }
    // currentViewId === 1 is "All Tasks" - no additional filtering

    return matchesSearch && matchesStatus && matchesDateFilter && matchesView;
  });

  const handleDeleteTask = async (id) => {
    const task = tasksData.find(t => t.id === id);
    if (!task) return;

    // Check if user is admin
    if (user?.role?.toLowerCase() !== 'admin') {
      setTaskToDelete(task);
      setDeleteError('Access denied: Only administrators can delete tasks. Regular users can only create tasks.');
      setShowDeleteConfirm(true);
      return;
    }

    // For admin, proceed with confirmation
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const handleEditRow = (id) => {
    console.log('all tasks ========>', tasksData)
    const task = tasksData.find(t => t.id === id);
    console.log('edit record=======>',task, task.dueDate)
    setDueDates(task.dueDate || []);
    if (task) {
      setTaskToEdit(task);
      setIsEditMode(true);
      setIsTaskFormOpen(true);
    }
  };

  const handleDeleteRow = (id) => {
    handleDeleteTask(id);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    setDeleteError(null); // Clear any previous error

    try {
      console.log('🔄 DEBUG: Starting delete operation for task ID:', taskToDelete.id);

      await apiService.deleteTask(taskToDelete.id);

      console.log('✅ DEBUG: Delete successful, removing from UI');
      // Immediately remove from UI
      setTasksData(tasksData.filter(task => task.id !== taskToDelete.id));
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      setDeleteError(null);

      // Show success message
      setSuccessMessage(`Task "${taskToDelete.name}" has been deleted successfully!`);
      setShowSuccessMessage(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error('❌ DEBUG: Delete operation error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      // Handle task validation errors with detailed information
      if (error.response?.data?.pendingTasks) {
        console.log('Task validation error detected for delete');
        // Use the message from backend directly, as it already includes task details
        const taskMessage = error.response.data.message || 'Cannot delete this task because it has pending dependencies.';
        console.log('Setting delete task error message:', taskMessage);
        setDeleteError(taskMessage);
      } else {
        // Handle other errors
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred while deleting the task. Check console for details.';
        console.log('Setting delete generic error message:', errorMsg);
        setDeleteError(errorMsg);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
    setDeleteError(null);
  };

  const handleCreateTask = async (newTask) => {
    // Ensure new tasks have the user_id field for tracking the creator
    const taskWithUserData = {
      ...newTask,
      user_id: user?.id
    };

    try {
      const savedTask = await apiService.createTask(taskWithUserData);
      // Don't add to local state here - let Socket.IO handle real-time updates
      console.log('Task created:', savedTask);

      // Show success message to the task creator
      setSuccessMessage(`Task "${newTask.name}" has been successfully assigned!`);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage("");
      }, 5000);

      setIsTaskFormOpen(false); // Close the popup on success
      setIsEditMode(false);
      setTaskToEdit(null);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    console.log('----------before updated-----------------')
    console.log("updated form data",updatedTask)
    try {
      const updatedTaskData = await apiService.updateTask(taskToEdit.id, updatedTask);
      // Don't update local state here - let Socket.IO handle real-time updates
      console.log("updated form response",updatedTaskData)
      setIsTaskFormOpen(false); // Close the popup on success
      setIsEditMode(false);
      setTaskToEdit(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "Working": return "bg-blue-100 text-blue-700 border-blue-200";
      case "New": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "On Hold": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return formatDateForDisplay(dateString);
  };

  // Table configuration
  const taskColumns = [
    { key: 'name', title: 'Task Name', width: '27%' },
    { key: 'assignByName', title: 'Assigned By', width: '16%' },
    { key: 'assignToName', title: 'Assigned To', width: '16%' },
    { key: 'status', title: 'Status', width: '12%' },
    { key: 'createdDate', title: 'Created Date', width: '15%' },
    { key: 'dueDate', title: 'Due Date', width: '14%' },
    { key: 'actions', title: 'Actions', align: 'center', width: '0%' }
  ];

  const renderTaskCell = (key, task) => {
    switch (key) {
      case 'name':
        return (
          <div
            className="max-w-xs truncate text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
            title={task.description}
            onClick={() => setSelectedTask(task)}
          >
            {task.name}
          </div>
        );
      case 'assignByName':
        const assignByName = task.assignByName || task.assignBy;
        return (
          <span
            className={task.assignByStatus === 'Deleted' ? 'line-through text-gray-500' : ''}
            title={task.assignByStatus === 'Deleted' ? 'This user has been deleted' : ''}
          >
            {assignByName}
          </span>
        );
      case 'assignToName':
        const assignToName = task.assignToName || task.assignTo;
        return (
          <span
            className={task.assignToStatus === 'Deleted' ? 'line-through text-gray-500' : ''}
            title={task.assignToStatus === 'Deleted' ? 'This user has been deleted' : ''}
          >
            {assignToName}
          </span>
        );
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-normal rounded-full ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        );
      case 'createdDate':
        return formatDate(task.createdDate);
      case 'dueDate':
        return formatDate(task.dueDate);
      default:
        return task[key];
    }
  };

  return (
    <div className="flex-1 flex flex-col hero-section">
      <div className="flex-1 flex">
        <main className="flex-1 overflow-hidden px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24">

          {/* TASKS TABLE */}
          <div className="bg-white rounded-xl border borderr flex flex-col overflow-hidden" style={{ height: window.innerWidth < 640 ? 'calc(100vh - 180px)' : 'calc(100vh - 90px)' }}>
            {selectedTask ? (
              <TaskInfo
                selectedTask={selectedTask}
                onClose={() => setSelectedTask(null)}
                onTaskUpdate={(updatedTask) => setSelectedTask(updatedTask)}
              />
            ) : (
              <>
                {/* FIXED FILTER HEADER */}
                <div className="sticky top-0 z-10 bg-white rounded-t-xl border-b border-gray-200 shadow-sm flex-shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 pt-2 pb-2">
                    {/* Mobile: All filters in one row */}
                    <div className="flex items-center justify-end gap-2 w-full py-0 flex-wrap sm:hidden">
                      {/* View Filter */}
                      <div className="relative flex-shrink-0">
                        <button
                          data-view-filter-button="true"
                          onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                          className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                          style={{ height: '28px', width: '90px' }}
                          title="Select view"
                        >
                          <div className="flex items-center justify-center w-5 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <span className="text-center font-medium" style={{ fontWeight: '500', fontSize: '10px', padding: '0 4px' }}>
                            {currentViewId === 1 ? "All Tasks" : currentViewId === 2 ? "My Tasks" : "All Tasks"}
                          </span>
                        </button>
                        {isViewDropdownOpen && (
                          <div className="view-dropdown absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg w-24 py-1">
                            {taskViews.map((view) => (
                              <button
                                key={view.id}
                                data-dropdown-option="true"
                                onClick={() => {
                                  setCurrentViewId(view.id);
                                  setIsViewDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2 py-1.5 text-left text-xs hover:bg-blue-50 transition-colors ${
                                  currentViewId === view.id
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                <span>{view.id === 1 ? "All Tasks" : view.id === 2 ? "My Tasks" : view.name}</span>
                                {currentViewId === view.id && (
                                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Date Filter */}
                      <div className="relative flex-shrink-0">
                        <button
                          data-date-filter-button="true"
                          onClick={() => setIsDateFilterPopupOpen(!isDateFilterPopupOpen)}
                          className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                          style={{ height: '28px', fontSize: '10px' }}
                          title="Filter by date"
                        >
                          <div className="flex items-center justify-center w-5 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                            <FiCalendar size={10} />
                          </div>
                          <span className="truncate" style={{ fontWeight: '400', padding: '0 3px' }}>
                            {selectedDateFilter === "All" ? "All Tasks" :
                             selectedDateFilter === "Today" ? "Today's Task" :
                             selectedDateFilter === "This Week" ? "This Week Task" :
                             selectedDateFilter === "This Month" ? "This Month Task" : "All Tasks"}
                          </span>
                        </button>
                        {isDateFilterPopupOpen && (
                          <div className="date-filter-dropdown absolute top-full mt-1 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-32 py-1">
                            {[
                              { value: "All", label: "All Tasks" },
                              { value: "Today", label: "Today's Task" },
                              { value: "This Week", label: "This Week Task" },
                              { value: "This Month", label: "This Month Task" }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSelectedDateFilter(option.value);
                                  setIsDateFilterPopupOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2 py-1 text-left text-xs hover:bg-gray-50 transition-colors ${
                                  selectedDateFilter === option.value
                                    ? "text-blue-600 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                <span>{option.label}</span>
                                {selectedDateFilter === option.value && (
                                  <FiCheck className="text-blue-600" size={12} />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Status Filter */}
                      <div className="relative flex-shrink-0">
                        <button
                          data-filter-button="true"
                          onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
                          className={`flex items-center justify-center w-8 h-7 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm ${selectedStatus !== 'All' ? 'bg-blue-50 border-blue-300' : ''}`}
                          title="Filter by status"
                        >
                          <FiFilter size={14} className={selectedStatus !== 'All' ? 'text-blue-600' : ''} />
                        </button>
                        {isFilterPopupOpen && (
                          <div ref={filterDropdownRef} className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-32 py-1" data-dropdown="status-filter">
                            {[
                              { value: "All", label: "All Status" },
                              { value: "New", label: "New" },
                              { value: "Working", label: "Working" },
                              { value: "Completed", label: "Completed" },
                              { value: "On Hold", label: "On Hold" },
                              { value: "Cancelled", label: "Cancelled" }
                            ].map((option) => (
                              <button
                                key={option.value}
                                data-dropdown-option="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStatus(option.value);
                                  setIsFilterPopupOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2 py-1 text-left text-xs hover:bg-gray-50 transition-colors ${
                                  selectedStatus === option.value
                                    ? "text-blue-600 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                <span>{option.label}</span>
                                {selectedStatus === option.value && (
                                  <FiCheck className="text-blue-600" size={12} />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* New Task Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => setIsTaskFormOpen(true)}
                          className="flex items-center justify-center px-2 py-1.5 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm"
                          style={{
                            backgroundColor: 'var(--primary-color)',
                            borderColor: 'var(--primary-color)',
                            height: '28px',
                            fontSize: '10px'
                          }}
                        >
                          <FiPlus size={12} color="#ffffff" />
                          <span className="hidden" style={{ fontWeight: '400', lineHeight: '18px', marginLeft: '2px' }}>New</span>
                        </button>
                      </div>
                    </div>

                    {/* Desktop: Left Side - View Filter */}
                    <div className="hidden sm:flex items-center gap-3 mb-3 sm:mb-0">
                      <div className="relative">
                        <button
                          onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                          className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                          style={{ height: '30px' }}
                          title="Select view"
                        >
                          <div className="flex items-center justify-center w-7 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <span className="truncate" style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px' }}>
                            {currentViewId === 1 ? "All Tasks" : currentViewId === 2 ? "My Tasks" : "All Tasks"}
                          </span>
                        </button>
                        {isViewDropdownOpen && (
                          <div className="view-dropdown absolute top-full mt-2 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1">
                            {taskViews.map((view) => (
                              <button
                                key={view.id}
                                data-dropdown-option="true"
                                onClick={() => {
                                  setCurrentViewId(view.id);
                                  setIsViewDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${
                                  currentViewId === view.id
                                    ? "text-blue-600 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                <span>{view.id === 1 ? "All Tasks" : view.id === 2 ? "My Tasks" : view.name}</span>
                                {currentViewId === view.id && (
                                  <FiCheck className="text-blue-600" size={14} />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop: Right Side - Other Filters */}
                    <div className="hidden sm:flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto py-0 flex-wrap">
                      {/* Date Filter */}
                      <div className="relative">
                        <button
                          onClick={() => setIsDateFilterPopupOpen(!isDateFilterPopupOpen)}
                          className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                          style={{ height: '30px' }}
                          title="Filter by date"
                        >
                          <div className="flex items-center justify-center w-7 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                            <FiCalendar size={14} />
                          </div>
                          <span className="truncate" style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px' }}>
                            {selectedDateFilter === "All" ? "All Tasks" :
                             selectedDateFilter === "Today" ? "Today's Task" :
                             selectedDateFilter === "This Week" ? "This Week Task" :
                             selectedDateFilter === "This Month" ? "This Month Task" : "All Tasks"}
                          </span>
                        </button>
                        {isDateFilterPopupOpen && (
                          <div className="date-filter-dropdown absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1">
                            {[
                              { value: "All", label: "All Tasks" },
                              { value: "Today", label: "Today's Task" },
                              { value: "This Week", label: "This Week Task" },
                              { value: "This Month", label: "This Month Task" }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSelectedDateFilter(option.value);
                                  setIsDateFilterPopupOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${
                                  selectedDateFilter === option.value
                                    ? "text-blue-600 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                <span>{option.label}</span>
                                {selectedDateFilter === option.value && (
                                  <FiCheck className="text-blue-600" size={14} />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Status Filter */}
                      <div className="relative">
                        <button
                          onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
                          className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                          style={{ height: '30px' }}
                          title="Filter by status"
                        >
                          <div className="flex items-center justify-center w-7 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                            <FiFilter size={14} />
                          </div>
                          <span className="hidden sm:inline" style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px' }}>
                            {selectedStatus === "All" ? "All Status" :
                             selectedStatus === "New" ? "New" :
                             selectedStatus === "Working" ? "Working" :
                             selectedStatus === "Completed" ? "Completed" :
                             selectedStatus === "On Hold" ? "On Hold" :
                             selectedStatus === "Cancelled" ? "Cancelled" : "All Status"}
                          </span>
                        </button>
                        {isFilterPopupOpen && (
                          <div ref={filterDropdownRef} className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1">
                            {[
                              { value: "All", label: "All Status" },
                              { value: "New", label: "New" },
                              { value: "Working", label: "Working" },
                              { value: "Completed", label: "Completed" },
                              { value: "On Hold", label: "On Hold" },
                              { value: "Cancelled", label: "Cancelled" }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSelectedStatus(option.value);
                                  setIsFilterPopupOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${
                                  selectedStatus === option.value
                                    ? "text-blue-600 font-medium"
                                    : "text-gray-700"
                                }`}
                              >
                                <span>{option.label}</span>
                                {selectedStatus === option.value && (
                                  <FiCheck className="text-blue-600" size={14} />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* New Task Button */}
                      <button
                        onClick={() => setIsTaskFormOpen(true)}
                        className="flex items-center gap-1 px-2 py-1.5 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm"
                        style={{
                          backgroundColor: 'var(--primary-color)',
                          borderColor: 'var(--primary-color)'
                        }}
                      >
                        <FiPlus size={17} color="#ffffff" />
                        <span className="hidden sm:inline" style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>New</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="flex-1 overflow-auto">
                  {/* MOBILE CARD VIEW */}
                  <div className="block sm:hidden p-4">
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <FiUserPlus className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new task.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-white rounded-lg border border-gray-200 p-3 pb-1 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedTask(task)}
                          >
                            {/* Row 1: Name and Status */}
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex-1 min-w-0 flex items-center gap-3">
                                <h3
                                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline "
                                  title={task.description}
                                >
                                  {task.name}
                                </h3>
                              </div>
                              <div className="flex items-center ml-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                            </div>

                            {/* Row 2: Assigned By and Assigned To in same row with equal widths */}
                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                              <div className="flex items-center gap-2">
                                <FiUser className="text-purple-600 flex-shrink-0" size={14} />
                                <div className="min-w-0">
                                  <div className="font-medium">By:</div>
                                  <div className="truncate">{renderTaskCell('assignByName', task)}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiUserCheck className="text-blue-600 flex-shrink-0" size={14} />
                                <div className="min-w-0">
                                  <div className="font-medium">To:</div>
                                  <div className="truncate">{renderTaskCell('assignToName', task)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Row 3: Priority, Due Date, and Action buttons in grid layout */}
                            <div className="grid grid-cols-3 gap-1 text-xs text-gray-600 px-1 py-1" onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-xs leading-tight mb-0.5">Priority</span>
                                <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded border text-xs leading-tight ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-xs leading-tight mb-0.5">Due</span>
                                <div className="flex items-center">
                                  <FiCalendar className="text-orange-500 flex-shrink-0 mr-0.5" size={8} />
                                  <span className={`text-xs leading-tight ${
                                    task.dueDate &&
                                    new Date(task.dueDate) < new Date() &&
                                    task.status !== "Completed"
                                      ? "text-red-600 font-medium"
                                      : ""
                                  }`}>
                                    {renderTaskCell('dueDate', task)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1">
                                  <TableActionButton
                                    icon={FiEdit2}
                                    type="edit"
                                    title="Edit"
                                    onClick={() => handleEditRow(task.id)}
                                    disabled={task.status === "Completed"}
                                    mobileSize={true}
                                  />
                                  {user?.role?.toLowerCase() === 'admin' && (
                                    <TableActionButton
                                      icon={FiTrash2}
                                      type="delete"
                                      title="Delete"
                                      onClick={() => handleDeleteRow(task.id)}
                                      mobileSize={true}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <Table
                    data={filteredTasks}
                    columns={taskColumns}
                    loading={loading}
                    emptyMessage="No tasks found"
                    emptyDescription="Get started by adding a new task."
                    onEdit={handleEditRow}
                    onDelete={handleDeleteRow}
                    renderCell={renderTaskCell}
                    loadingMessage="Loading tasks..."
                    keyField="id"
                    user={user}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <TaskFormPopup
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setIsEditMode(false);
          setTaskToEdit(null);
        }}
        onSubmit={isEditMode ? handleUpdateTask : handleCreateTask}
        isEdit={isEditMode}
        taskToEdit={taskToEdit}
        dueDates={dueDates}
      />

      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-[1200] bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-family)' }}>
            {successMessage}
          </p>
        </div>
      )}

      {/* Error Message Toast */}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-[1200] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-family)' }}>
            {errorMessage}
          </p>
        </div>
      )}

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteConfirm && taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FiTrash2 className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                  Delete Task
                </h3>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-family)' }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              {deleteError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-800 mb-1" style={{ fontFamily: 'var(--font-family)' }}>
                        Unable to Delete Task
                      </h4>
                      <div className="text-sm text-red-700 whitespace-pre-line" style={{ fontFamily: 'var(--font-family)' }}>
                        {deleteError}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>
                  Are you sure you want to delete <strong>{taskToDelete.name}</strong>?
                  This will permanently remove the task from the system.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'var(--font-family)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!deleteError}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  deleteError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                style={{ fontFamily: 'var(--font-family)' }}
                title={deleteError ? 'Cannot delete task with dependencies' : 'Delete this task'}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
