import React, { useState, useRef, useEffect } from "react";
import { FiUserPlus, FiMail, FiPhone, FiCalendar, FiEdit, FiTrash2, FiSearch, FiPlus, FiSliders, FiList, FiUpload, FiFilter, FiCheck, FiUser } from "react-icons/fi";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import TableActionButton from "../components/TableActionButton";
import UserFormPopup from "../components/UserFormPopup";
import UserInfo from "../components/UserInfo";

import Table from "../components/Table";
import { useAuth } from "../contexts/AuthContext";
import { formatDateForDisplay } from "../utils/dateUtils.jsx";
import apiService from "../services/api";

export default function UsersPage({ searchTerm = '' }) {
  const { user, hasPermission } = useAuth();

  // Check permissions
  const canCreate = hasPermission('users', 'create');
  const canEdit = hasPermission('users', 'edit');
  const canDelete = hasPermission('users', 'delete');

  const currentUserName = user ? `${user.firstName} ${user.lastName}` : "Admin";
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

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

  // ⬇️ Reusable function to fetch users

  const fetchUsers = async () => {
    try {
      // setLoading(true);

      const users = await apiService.getUsers();
      setUsersData(users);
      console.log("Users fetched:", users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = usersData.filter(userItem => {
    // RBAC check
    const canViewAllUsers = hasPermission('users', 'view');

    if (!canViewAllUsers) {
      // If not admin and doesn't have explicit view permission, only show themselves
      if (userItem.id !== user?.id) {
        return false;
      }
    }

    // Existing search and status filters
    const fullName = `${userItem.first_name} ${userItem.last_name}`;
    const matchesSearch = searchTerm === '' ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || userItem.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteUser = async (id) => {
    // Simple confirmation dialog
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await apiService.deleteUser(id);
      // Immediately remove from UI
      setUsersData(usersData.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditRow = (id) => {
    const user = usersData.find(u => u.id === id);
    if (user) {
      setUserToEdit(user);
      setIsEditMode(true);
      setIsUserFormOpen(true);
    }
  };

  const handleDeleteRow = async (id) => {
    const user = usersData.find(u => u.id === id);
    if (!user) return;

    // First check if user can be deleted (has pending tasks)
    try {
      const checkResult = await apiService.checkUserDeletion(id);

      // If we reach here, user can be deleted (no pending tasks)
      setUserToDelete(user);
      setDeleteError(null); // Clear any previous error
      setShowDeleteConfirm(true);
    } catch (error) {
      // If there are pending tasks or other issues, show the error
      if (error.response?.data?.pendingTasks) {
        setUserToDelete(user);
        setDeleteError(error.response.data.message);
        setShowDeleteConfirm(true);
      } else {
        // Handle other errors
        setUserToDelete(user);
        setDeleteError(error.response?.data?.message || 'Unable to check user status. Please try again.');
        setShowDeleteConfirm(true);
      }
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteError(null); // Clear any previous error

    try {
      console.log('🔄 DEBUG: Starting delete operation for user ID:', userToDelete.id);

      await apiService.deleteUser(userToDelete.id);

      console.log('✅ DEBUG: Delete successful, removing from UI');
      // Immediately remove from UI
      setUsersData(usersData.filter(user => user.id !== userToDelete.id));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setDeleteError(null);
    } catch (error) {
      console.error('❌ DEBUG: Delete operation error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      // Handle task validation errors with detailed information
      if (error.response?.data?.pendingTasks) {
        console.log('Task validation error detected for delete');
        // Use the message from backend directly, as it already includes task details
        const taskMessage = error.response.data.message || 'Cannot delete this user because they have pending tasks.';
        console.log('Setting delete task error message:', taskMessage);
        setDeleteError(taskMessage);
      } else {
        // Handle other errors
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred while deleting the user. Check console for details.';
        console.log('Setting delete generic error message:', errorMsg);
        setDeleteError(errorMsg);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleCreateUser = async (newUser) => {
    try {
      console.log('🔄 DEBUG: Starting user creation with data:', newUser);

      const result = await apiService.createUser(newUser);
      console.log('✅ DEBUG: User created successfully:', result);

      // Show credentials to admin
      const { credentials } = result;
      console.log(`User created successfully!\n\nLogin Credentials:\nEmail: ${credentials.email}\nPhone: ${credentials.phone}\nTemporary Password: ${credentials.temporaryPassword}\n\nPlease share these credentials with the user.`);

      // Refresh the users list
      fetchUsers();

      setIsUserFormOpen(false); // Close the popup on success
      setIsEditMode(false);
      setUserToEdit(null);
    } catch (error) {
      console.error('❌ DEBUG: Create user operation error:', error);
      throw error; // Re-throw to let UserFormPopup handle it
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      console.log('🔄 DEBUG: Starting user update for ID:', userToEdit.id, 'with data:', updatedUser);

      const result = await apiService.updateUser(userToEdit.id, updatedUser);
      console.log('✅ DEBUG: User updated successfully:', result);

      // Update the user in the local state
      setUsersData(usersData.map(user =>
        user.id === userToEdit.id ? { ...user, ...updatedUser } : user
      ));

      // If the updated user is the currently logged-in user, update localStorage
      if (user && user.id === userToEdit.id) {
        console.log('🔄 DEBUG: Updated user is the logged-in user, updating localStorage');
        const updatedUserData = {
          ...user,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          status: updatedUser.status,
          permissions: updatedUser.permissions
        };

        // Update localStorage to trigger sidebar refresh
        localStorage.setItem('user', JSON.stringify(updatedUserData));

        // Force a page reload to ensure all components pick up the new permissions
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }

      // Refresh the data to ensure consistency
      fetchUsers();

      // Close the popup and reset state
      setIsUserFormOpen(false);
      setIsEditMode(false);
      setUserToEdit(null);

      // Show success message
      setSuccessMessage(`${updatedUser.first_name} ${updatedUser.last_name} has been updated successfully!`);
      setShowSuccessMessage(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage("");
      }, 3000);

      return result;
    } catch (error) {
      console.error('❌ DEBUG: Update user operation error:', error);
      // Re-throw the error so UserFormPopup can handle it
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700 border-green-200";
      case "Inactive": return "bg-red-100 text-red-700 border-red-200";
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
  const userColumns = [
    { key: 'name', title: 'Full Name', width: '25%' },
    { key: 'email', title: 'Email', width: '25%' },
    { key: 'phone', title: 'Phone Number', width: '20%' },
    { key: 'role', title: 'Role', width: '15%' },
    { key: 'status', title: 'Status', width: '15%' },
    { key: 'actions', title: 'Actions', align: 'center', width: '0%' }
  ];

  const renderUserCell = (key, user) => {
    switch (key) {
      case 'name':
        const fullName = `${user.first_name} ${user.last_name}`;
        return (
          <div
            className="max-w-xs truncate cursor-pointer hover:underline"
            style={{
              color: 'var(--primary-color)',
              fontFamily: 'var(--font-family)'
            }}
            title={fullName}
            onClick={() => setSelectedUser(user)}
            onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.color = 'var(--primary-color)'}
          >
            {fullName}
          </div>
        );
      case 'email':
        return <span style={{ fontFamily: 'var(--font-family)' }}>{user.email}</span>;
      case 'phone':
        return <span style={{ fontFamily: 'var(--font-family)' }}>{user.phone || ''}</span>;
      case 'role':
        return <span style={{ fontFamily: 'var(--font-family)' }}>{user.role}</span>;
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-normal rounded-full ${getStatusColor(user.status)}`} style={{ fontFamily: 'var(--font-family)' }}>
            {user.status}
          </span>
        );
      case 'actions':
        return (
          <div className="flex justify-center gap-2">
            {canEdit && (
              <TableActionButton
                icon={FaPencilAlt}
                type="edit"
                title="Edit"
                onClick={() => handleEditRow(user.id)}
                extraSmall={true}
              />
            )}
            {canDelete && (
              <TableActionButton
                icon={FaTrash}
                type="delete"
                title="Delete"
                onClick={() => handleDeleteRow(user.id)}
                extraSmall={true}
              />
            )}
            {!canEdit && !canDelete && (
              <span className="text-gray-400 text-[10px] italic">No actions</span>
            )}
          </div>
        );
      default:
        return <span style={{ fontFamily: 'var(--font-family)' }}>{user[key]}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col">

      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-[1200] bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-family)' }}>
            {successMessage}
          </p>
        </div>
      )}

      <div className="flex-1 flex">
        <main className="flex-1 overflow-hidden px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24 ">

          {/* USERS TABLE */}
          <div className="bg-white rounded-xl border borderr flex flex-col overflow-hidden" style={{ height: window.innerWidth < 640 ? 'calc(100vh - 180px)' : 'calc(100vh - 90px)' }}>
            {selectedUser ? (
              <UserInfo
                selectedUser={selectedUser}
                onClose={() => setSelectedUser(null)}
                onEdit={handleEditRow}
                onDelete={handleDeleteRow}
              />
            ) : (
              <>
                {/* FIXED FILTER HEADER */}
                <div className="sticky top-0 z-10 bg-white rounded-t-xl border-b border-gray-200 shadow-sm flex-shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 pt-2 pb-2">
                    {/* Mobile: All filters in one row */}
                    <div className="flex items-center justify-end gap-2 w-full py-0 flex-wrap sm:hidden ml-auto">
                      {/* Status Filter - Mobile version with Active/Inactive options only */}
                      <div className="relative flex-shrink-0">
                        <button
                          data-filter-button="true"
                          onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
                          className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                          style={{ height: '30px' }}
                          title="Filter by status"
                        >
                          <div className="flex items-center justify-center w-7 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                            <FiFilter size={14} />
                          </div>
                          <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px', fontFamily: 'var(--font-family)' }}>
                            {selectedStatus === "Active" ? "Active" :
                              selectedStatus === "Inactive" ? "Inactive" : "Active"}
                          </span>
                        </button>
                        {isFilterPopupOpen && (
                          <div ref={filterDropdownRef} className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1">
                            {[
                              { value: "Active", label: "Active" },
                              { value: "Inactive", label: "Inactive" }
                            ].map((option) => (
                              <button
                                key={option.value}
                                data-dropdown-option="true"
                                onClick={() => {
                                  setSelectedStatus(option.value);
                                  setIsFilterPopupOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${selectedStatus === option.value
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

                      {/* New User Button */}
                      <div className="flex-shrink-0">
                        {canCreate && (
                          <button
                            onClick={() => setIsUserFormOpen(true)}
                            className="flex items-center gap-1 px-2 py-1.5 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm"
                            style={{
                              backgroundColor: 'var(--primary-color)',
                              borderColor: 'var(--primary-color)'
                            }}
                          >
                            <FiPlus size={17} color="#ffffff" />
                            <span className="hidden sm:inline" style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>New</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Desktop: Left Side - Title */}
                    <div className="hidden sm:flex items-center gap-3 mb-3 sm:mb-0">
                      <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>Users</h2>
                    </div>

                    {/* Desktop: Right Side - All Filters and New Button */}
                    <div className="hidden sm:flex items-center justify-end gap-2 sm:gap-3 py-0 flex-wrap">
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
                          <span className="hidden sm:inline" style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px', fontFamily: 'var(--font-family)' }}>
                            {selectedStatus === "All" ? "All Status" :
                              selectedStatus === "Active" ? "Active" :
                                selectedStatus === "Inactive" ? "Inactive" : "All Status"}
                          </span>
                        </button>
                        {isFilterPopupOpen && (
                          <div ref={filterDropdownRef} className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1">
                            {[
                              { value: "All", label: "All Status" },
                              { value: "Active", label: "Active" },
                              { value: "Inactive", label: "Inactive" }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSelectedStatus(option.value);
                                  setIsFilterPopupOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${selectedStatus === option.value
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

                      {/* New User Button */}
                      {canCreate && (
                        <button
                          onClick={() => setIsUserFormOpen(true)}
                          className="flex items-center gap-1 px-2 py-1.5 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm"
                          style={{
                            backgroundColor: 'var(--primary-color)',
                            borderColor: 'var(--primary-color)'
                          }}
                        >
                          <FiPlus size={17} color="#ffffff" />
                          <span className="hidden sm:inline" style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>New</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="flex-1 overflow-auto">

                  {/* MOBILE CARD VIEW */}
                  <div className="block sm:hidden mt-4" style={{ fontFamily: 'var(--font-family)' }}>
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <FiUserPlus className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>No users found</h3>
                        <p className="mt-1 text-sm text-gray-500" style={{ fontFamily: 'var(--font-family)' }}>Get started by adding a new user.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 px-2">
                        {filteredUsers.map((user) => (
                          <div
                            key={`mobile-user-${user.id}`}
                            className="bg-white rounded-lg border border-gray-200 p-3 pb-1 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            style={{ fontFamily: 'var(--font-family)' }}
                            onClick={() => setSelectedUser(user)}
                          >
                            {/* Row 1: Name (left) and Status (right) */}
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="text-sm font-semibold hover:underline transition-colors cursor-pointer"
                                  style={{
                                    fontFamily: 'var(--font-family)',
                                    color: 'var(--primary-color)'
                                  }}
                                  onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                                  onMouseLeave={(e) => e.target.style.color = 'var(--primary-color)'}
                                >
                                  {`${user.first_name} ${user.last_name}`}
                                </h3>
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.status)}`} style={{ fontFamily: 'var(--font-family)' }}>
                                {user.status}
                              </span>
                            </div>

                            {/* Row 2: Email and Phone */}
                            <div className="flex justify-between items-center mb-2 text-xs text-gray-600" style={{ fontFamily: 'var(--font-family)' }}>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                                  <FiMail size={10} className="text-purple-600" />
                                </div>
                                <span className="font-medium truncate" style={{ fontFamily: 'var(--font-family)' }}>{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-3">
                                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FiPhone size={10} className="text-blue-600" />
                                </div>
                                <span className="truncate" style={{ fontFamily: 'var(--font-family)' }}>{user.phone || ''}</span>
                              </div>
                            </div>

                            {/* Row 3: Role (left) and Action Buttons (right) */}
                            <div className="flex justify-between items-center text-xs text-gray-600" style={{ fontFamily: 'var(--font-family)' }}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                  <FiUser size={10} className="text-green-600" />
                                </div>
                                <span style={{ fontFamily: 'var(--font-family)' }}>Role: {user.role}</span>
                              </div>
                              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                {canEdit && (
                                  <TableActionButton
                                    icon={FaPencilAlt}
                                    type="edit"
                                    title="Edit"
                                    onClick={() => handleEditRow(user.id)}
                                    mobileSize={true}
                                  />
                                )}
                                {canDelete && (
                                  <TableActionButton
                                    icon={FaTrash}
                                    type="delete"
                                    title="Delete"
                                    onClick={() => handleDeleteRow(user.id)}
                                    mobileSize={true}
                                  />
                                )}
                                {!canEdit && !canDelete && (
                                  <span className="text-gray-400 text-[10px] italic">No actions</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <Table
                    data={filteredUsers}
                    columns={userColumns}
                    loading={loading}
                    emptyMessage="No users found"
                    emptyDescription="Get started by adding a new user."
                    onEdit={handleEditRow}
                    onDelete={handleDeleteRow}
                    renderCell={renderUserCell}
                    loadingMessage="Loading users..."
                    keyField="id"
                    user={user}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <UserFormPopup
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setIsEditMode(false);
          setUserToEdit(null);
        }}
        onSubmit={isEditMode ? handleUpdateUser : handleCreateUser}
        editUser={userToEdit}
      />

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FaTrash className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                  Delete User
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
                        Unable to Delete User
                      </h4>
                      <div className="text-sm text-red-700 whitespace-pre-line" style={{ fontFamily: 'var(--font-family)' }}>
                        {deleteError}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>
                  Are you sure you want to delete <strong>{userToDelete.first_name} {userToDelete.last_name}</strong>?
                  This will permanently remove the user from the system.
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
                className={`px-4 py-2 rounded-lg transition-colors ${deleteError
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                style={{ fontFamily: 'var(--font-family)' }}
                title={deleteError ? 'Cannot delete user with pending tasks' : 'Delete this user'}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
