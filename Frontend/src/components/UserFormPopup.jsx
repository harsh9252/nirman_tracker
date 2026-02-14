import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

// InputField component moved outside to prevent re-creation on each render
const InputField = ({ label, required, type = "text", value, onChange, placeholder, error, ...rest }) => (
  <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
    <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
      {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        height: 'var(--input-height)',
        padding: 'var(--input-padding)',
        paddingTop: '16px', // Extra top padding to accommodate the label
        paddingLeft: '12px', // Extra left padding to accommodate the label
        fontSize: 'var(--placeholder-font-size)',
        fontFamily: 'var(--font-family)',
        fontWeight: 'normal',
        lineHeight: '24px',
        border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
        borderRadius: 'var(--input-border-radius)',
        backgroundColor: 'var(--input-bg-color)',
        color: 'var(--input-text-color)',
        outline: 'none',
        transition: 'border-color 0.2s',
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

const SelectField = ({ label, required, options = [], value, onChange, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option) => {
    if (disabled) return; // Don't allow selection if disabled
    onChange(option); // This updates the parent state
    setIsOpen(false);
  };

  const handleClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={selectRef} className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
      <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
        {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
      </label>
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          height: 'var(--input-height)',
          padding: 'var(--input-padding)',
          paddingTop: '16px', // Extra top padding to accommodate the label
          paddingLeft: '12px', // Consistent left padding
          fontSize: 'var(--placeholder-font-size)',
          fontFamily: 'var(--font-family)',
          fontWeight: 'normal',
          lineHeight: '24px',
          border: '1px solid var(--input-border-color)',
          borderRadius: 'var(--input-border-radius)',
          backgroundColor: disabled ? '#f3f4f6' : 'var(--input-bg-color)',
          color: disabled ? '#6b7280' : 'var(--input-text-color)',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s',
          opacity: disabled ? 0.7 : 1,
        }}
        onFocus={(e) => !disabled && (e.target.style.borderColor = 'var(--input-focus-border-color)')}
        onBlur={(e) => e.target.style.borderColor = 'var(--input-border-color)'}
      >
        <span style={{
          color: value ? (disabled ? '#6b7280' : 'var(--input-text-color)') : 'var(--input-placeholder-color)',
          fontSize: 'var(--placeholder-font-size)',
          fontFamily: 'var(--font-family)',
          lineHeight: '24px',
        }}>
          {value || placeholder}
        </span>
        {!disabled && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto mt-1 w-full">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              style={{
                padding: '2px 12px',
                fontSize: 'var(--placeholder-font-size)',
                fontFamily: 'var(--font-family)',
                fontWeight: 'normal',
                color: option === value ? 'var(--input-text-color)' : 'var(--input-text-color)',
                cursor: 'pointer',
                backgroundColor: option === value ? '#f3f4f6' : '#ffffff',
                borderBottom: index < options.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = option === value ? '#f3f4f6' : '#ffffff'}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Phone Number Field Component
const PhoneField = ({ label, required, value, onChange, placeholder, error }) => {
  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    // Limit to 10 digits
    if (input.length > 10) {
      input = input.slice(0, 10);
    }
    onChange({ target: { value: input } });
  };

  return (
    <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
      <div className="relative">
        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
          {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          maxLength={10} // 10 digits for phone number
          style={{
            width: '100%',
            height: 'var(--input-height)',
            padding: 'var(--input-padding)',
            paddingTop: '16px',
            paddingLeft: '12px', // Normal left padding
            fontSize: 'var(--placeholder-font-size)',
            fontFamily: 'var(--font-family)',
            fontWeight: 'normal',
            lineHeight: '24px',
            border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
            borderRadius: 'var(--input-border-radius)',
            backgroundColor: 'var(--input-bg-color)',
            color: 'var(--input-text-color)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-focus-border-color)'}
          onBlur={(e) => e.target.style.borderColor = error ? 'var(--secondary-color)' : 'var(--input-border-color)'}
        />
      </div>
      {error && (
        <p style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)', fontSize: 'var(--error-font-size)', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  );
};

// Permissions Field Component
const PermissionsField = ({ label, permissions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const togglePermission = (key) => {
    onChange({ ...permissions, [key]: !permissions[key] });
  };

  const selectedCount = Object.values(permissions).filter(Boolean).length;
  const displayText = selectedCount === 5
    ? "All Sections"
    : selectedCount === 0
      ? "No Access"
      : `${selectedCount} Section${selectedCount > 1 ? 's' : ''} Selected`;

  return (
    <div ref={selectRef} className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
      <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: 'var(--input-height)',
          padding: 'var(--input-padding)',
          paddingTop: '16px',
          paddingLeft: '12px',
          fontSize: 'var(--placeholder-font-size)',
          fontFamily: 'var(--font-family)',
          border: '1px solid var(--input-border-color)',
          borderRadius: 'var(--input-border-radius)',
          backgroundColor: 'var(--input-bg-color)',
          color: 'var(--input-text-color)',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s',
        }}
      >
        <span style={{ fontSize: 'var(--placeholder-font-size)', fontFamily: 'var(--font-family)' }}>
          {displayText}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full mt-1">
          {[
            { key: 'leads', label: 'Leads Management' },
            { key: 'clients', label: 'Clients Management' },
            { key: 'projects', label: 'Projects Management' },
            { key: 'tasks', label: 'Tasks Management' },
            { key: 'users', label: 'Users Management' }
          ].map((item, index) => (
            <div key={item.key} onClick={() => togglePermission(item.key)} style={{ padding: '8px 12px', fontSize: 'var(--placeholder-font-size)', fontFamily: 'var(--font-family)', cursor: 'pointer', backgroundColor: '#ffffff', borderBottom: index < 4 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}>
              <input type="checkbox" checked={permissions[item.key]} onChange={() => { }} className="w-4 h-4 text-blue-600 border-gray-300 rounded pointer-events-none" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function UserFormPopup({ isOpen, onClose, onSubmit, editUser }) {
  const { user: loggedInUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [permissions, setPermissions] = useState({
    leads: false,
    clients: false,
    projects: false,
    tasks: false,
    users: false
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // RBAC: Check if non-admin is editing their own profile
  const isNonAdminEditingSelf = editUser &&
    loggedInUser?.role?.toLowerCase() !== 'admin' &&
    loggedInUser?.id === editUser.id;

  // Populate form when editing
  useEffect(() => {
    if (editUser) {
      setFirstName(editUser.first_name || editUser.firstName || "");
      setLastName(editUser.last_name || editUser.lastName || "");
      setEmail(editUser.email || "");
      setUsername(editUser.username || editUser.email || "");
      setPhone(editUser.phone || "");
      setRole(editUser.role || "");
      setStatus(editUser.status || "Active");
      // Load permissions if they exist
      if (editUser.permissions) {
        const perms = typeof editUser.permissions === 'string'
          ? JSON.parse(editUser.permissions)
          : editUser.permissions;
        setPermissions(perms);
      } else {
        // Default permissions for existing users without permissions
        setPermissions({
          leads: false,
          clients: false,
          projects: false,
          tasks: false,
          users: false
        });
      }
      // Clear any previous error messages when reopening for edit
      setShowErrorMessage(false);
      setErrorMessage("");
    } else {
      resetForm();
    }
  }, [editUser, isOpen]);

  // Auto-populate username with email when creating new user
  useEffect(() => {
    if (!editUser && email.trim()) {
      setUsername(email);
    }
  }, [email, editUser]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setPhone("");
    setRole("");
    setStatus("Active");
    setPermissions({
      leads: false,
      clients: false,
      projects: false,
      tasks: false,
      users: false
    });
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      setErrorMessage('First name is required');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Email is required');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Username is required');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Phone number is required');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }
    // Only validate role and status if user can edit them (admin or creating new user)
    if (!isNonAdminEditingSelf) {
      if (!role) {
        setErrorMessage('Please select a role');
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
        return;
      }
      if (!status) {
        setErrorMessage('Please select a status');
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 3000);
        return;
      }
    }

    // Validate phone number is exactly 10 digits
    if (phone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
      return;
    }

    try {
      const userData = {
        first_name: firstName,
        last_name: lastName,
        email,
        username,
        phone: phone,
        role: isNonAdminEditingSelf ? editUser.role : role,  // Use existing role for non-admin
        status: isNonAdminEditingSelf ? editUser.status : status,  // Use existing status for non-admin
        permissions
      };

      if (typeof onSubmit === "function") {
        const result = await onSubmit(userData);

        // API call succeeded - show success message
        setSuccessMessage(editUser ? 'User updated successfully!' : 'User created successfully!');
        setShowSuccessMessage(true);

        // For user updates, we need to handle success in the parent component
        // For user creation, close immediately
        if (!editUser) {
          // Hide success message and close form after 2 seconds
          setTimeout(() => {
            setShowSuccessMessage(false);
            resetForm();
            onClose();
          }, 2000);
        } else {
          // For updates, let parent handle success (refresh list, close popup)
          setTimeout(() => {
            setShowSuccessMessage(false);
            // Don't reset form or close here - let parent handle it
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      // Handle task validation errors
      if (error.response?.data?.pendingTasks) {
        console.log('Task validation error detected');
        // Use the message from backend directly, as it already includes task details
        const taskMessage = error.response.data.message || 'Cannot perform this action due to pending tasks.';
        console.log('Setting task error message:', taskMessage);
        setErrorMessage(taskMessage);
      } else {
        // Handle other errors
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Error updating user. Please try again.';
        console.log('Setting generic error message:', errorMsg);
        setErrorMessage(errorMsg);
      }

      setShowErrorMessage(true);
      // Error message stays visible until user fixes the issue or closes popup
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4 sm:p-6 overflow-auto">
      <div className="w-full max-w-5xl bg-white rounded-xl flex flex-col max-h-[95vh] task-modal">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-[1200] bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-family)' }}>
              {successMessage}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 sticky top-0 bg-white z-10 border-b-2 rounded-t-xl" style={{ borderBottomColor: 'var(--primary-color)' }}>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}>
              {editUser ? 'EDIT USER' : 'CREATE USER'}
            </h2>
          </div>
          <button
            onClick={handleSave}
            className="text-white px-3 sm:px-4 py-2 rounded-xl shadow-md hover:opacity-90 text-sm sm:text-base"
            style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
          >
            Save
          </button>
        </div>
        <div className="p-4 sm:p-6 pb-8 flex-1 overflow-y-auto rounded-b-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 pb-6" style={{ gap: 'var(--form-gap)' }}>
            <div>
              <InputField
                label="FIRST NAME"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <InputField
                label="LAST NAME"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <SelectField
                label="ROLE"
                required
                options={["Admin", "HR", "Site Manager", "Office Staff", "Field Rep"]}
                value={isNonAdminEditingSelf ? editUser.role : role}
                onChange={setRole}
                placeholder="Select role"
                disabled={isNonAdminEditingSelf}
              />
            </div>
            <div>
              <SelectField
                label="STATUS"
                required
                options={["Active", "Inactive"]}
                value={isNonAdminEditingSelf ? editUser.status : status}
                onChange={setStatus}
                placeholder="Select status"
                disabled={isNonAdminEditingSelf}
              />
            </div>
            <div>
              <InputField
                label="EMAIL"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <InputField
                label="USERNAME"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username will auto-populate from email"
              />
            </div>
            <div>
              <PhoneField
                label="PHONE NUMBER"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number"
              />
            </div>
            <div className="md:col-span-2">
              <PermissionsField
                label="ACCESS PERMISSIONS"
                permissions={permissions}
                onChange={setPermissions}
              />
            </div>
          </div>

          {/* Error Message at Bottom */}
          {showErrorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1" style={{ fontFamily: 'var(--font-family)' }}>
                    Cannot Update User
                  </h4>
                  <div className="text-sm text-red-700 whitespace-pre-line" style={{ fontFamily: 'var(--font-family)' }}>
                    {errorMessage}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
