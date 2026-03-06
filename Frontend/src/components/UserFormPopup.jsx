import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import InputField from "./common/InputField";
import SelectField from "./common/SelectField";

// Phone Number Field Component (internal for now, could be commonized later)
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
            fontSize: 'var(--placeholder-font-size)',
            fontFamily: 'var(--font-family)',
            fontWeight: 'normal',
            lineHeight: '24px',
            border: `1px solid ${error ? '#ef4444' : 'var(--input-border-color)'}`,
            borderRadius: 'var(--input-border-radius)',
            backgroundColor: 'var(--input-bg-color)',
            color: 'var(--input-text-color)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = error ? '#ef4444' : 'var(--input-focus-border-color)'}
          onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : 'var(--input-border-color)'}
        />
      </div>
      {error && (
        <span style={{ color: '#ef4444', fontFamily: 'var(--font-family)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};

// Permissions Field Component
const PermissionsField = ({ label, permissions, onChange, projects = [] }) => {
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

  const toggleAction = (moduleKey, action) => {
    const modulePermissions = permissions[moduleKey] || { view: false, create: false, edit: false, delete: false };
    onChange({
      ...permissions,
      [moduleKey]: {
        ...modulePermissions,
        [action]: !modulePermissions[action]
      }
    });
  };



  const toggleModule = (moduleKey) => {
    const modulePermissions = permissions[moduleKey] || { view: false, create: false, edit: false, delete: false };
    const allActions = ['view', 'create', 'edit', 'delete'];
    const isAllSelected = allActions.every(action => modulePermissions[action]);

    const newModulePermissions = { ...(permissions[moduleKey] || {}) };
    allActions.forEach(action => {
      newModulePermissions[action] = !isAllSelected;
    });

    onChange({
      ...permissions,
      [moduleKey]: newModulePermissions
    });
  };

  const toggleAllModules = () => {
    const allActions = ['view', 'create', 'edit', 'delete'];
    const allModules = ['leads', 'clients', 'projects', 'tasks', 'employees', 'users'];

    // Check if ALL permissions in ALL modules are selected
    const isAllSelected = allModules.every(moduleKey => {
      const modulePerms = permissions[moduleKey] || {};
      return allActions.every(action => modulePerms[action]);
    });

    const newPermissions = { ...permissions };
    allModules.forEach(moduleKey => {
      const modulePerms = { ...(permissions[moduleKey] || {}) };
      allActions.forEach(action => {
        modulePerms[action] = !isAllSelected;
      });
      newPermissions[moduleKey] = modulePerms;
    });

    onChange(newPermissions);
  };

  const isModuleFullySelected = (moduleKey) => {
    const modulePermissions = permissions[moduleKey];
    if (!modulePermissions) return false;
    return ['view', 'create', 'edit', 'delete'].every(action => modulePermissions[action]);
  };

  const areAllModulesFullySelected = () => {
    return ['leads', 'clients', 'projects', 'tasks', 'employees', 'users'].every(moduleKey => isModuleFullySelected(moduleKey));
  };

  const modules = [
    { key: 'leads', label: 'Leads' },
    { key: 'clients', label: 'Clients' },
    { key: 'projects', label: 'Projects' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'employees', label: 'Employees' },
    { key: 'users', label: 'Users' }
  ];

  const projectTabModules = [
    { key: 'project-info', label: 'Project Info' },
    { key: 'transaction', label: 'Transaction' },

    { key: 'attendance', label: 'Attendance' },
    { key: 'task', label: 'Task' },
    { key: 'material', label: 'Material' }
  ];

  const actions = ['view', 'create', 'edit', 'delete'];

  const toggleProjectTab = (tabKey) => {
    const projectTabs = permissions.project_tabs || {
      'project-info': true,
      'transaction': true,

      'attendance': true,
      'task': true,
      'material': true
    };
    onChange({
      ...permissions,
      project_tabs: {
        ...projectTabs,
        [tabKey]: !projectTabs[tabKey]
      }
    });
  };



  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50/30">
        <div className="bg-gray-100/80 px-4 py-2 border-b border-gray-200">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest" style={{ fontFamily: 'var(--font-family)' }}>
            Module-Level Permissions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider items-center gap-2 flex" style={{ fontFamily: 'var(--font-family)' }}>
                  <input
                    type="checkbox"
                    checked={areAllModulesFullySelected()}
                    onChange={toggleAllModules}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary transition-all cursor-pointer"
                    title="Select All Modules"
                  />
                  Module
                </th>
                {actions.map(action => (
                  <th key={action} className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'var(--font-family)' }}>
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module, idx) => (
                <tr key={module.key} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} border-b border-gray-100 last:border-0`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isModuleFullySelected(module.key)}
                        onChange={() => toggleModule(module.key)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary transition-all cursor-pointer"
                        title={`Select all permissions for ${module.label}`}
                      />
                      {module.label}
                    </div>
                  </td>
                  {actions.map(action => (
                    <td key={action} className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={permissions[module.key]?.[action] || false}
                          onChange={() => toggleAction(module.key, action)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary transition-all cursor-pointer"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50/30">
        <div className="bg-gray-100/80 px-4 py-2 border-b border-gray-200">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest" style={{ fontFamily: 'var(--font-family)' }}>
            Project Section Tab Permissions
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {projectTabModules.map((tab) => (
            <label key={tab.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={permissions.project_tabs ? permissions.project_tabs[tab.key] !== false : true}
                onChange={() => toggleProjectTab(tab.key)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary transition-all cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-family)' }}>
                {tab.label}
              </span>
            </label>
          ))}
        </div>
      </div>

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
  const [projects, setProjects] = useState([]);
  const [permissions, setPermissions] = useState({
    leads: { view: false, create: false, edit: false, delete: false },
    clients: { view: false, create: false, edit: false, delete: false },
    projects: { view: false, create: false, edit: false, delete: false, accessible_projects: [] },
    tasks: { view: false, create: false, edit: false, delete: false },
    employees: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    project_tabs: {
      'project-info': true,
      'transaction': true,
      'party': true,
      'attendance': true,
      'task': true,
      'material': true
    }
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Helper to clear error for a specific field
  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Fetch projects for access control
  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        try {
          const data = await apiService.getProjects();
          setProjects(data || []);
        } catch (error) {
          console.error("Error fetching projects for permissions:", error);
        }
      };
      fetchProjects();
    }
  }, [isOpen]);

  // RBAC: Check if non-admin is editing their own profile
  const isNonAdminEditingSelf = editUser &&
    loggedInUser?.role?.toLowerCase() !== 'admin' &&
    loggedInUser?.id === editUser.id;

  // Function to initialize permissions with nested structure
  const initializePermissions = (userPerms) => {
    const defaultPerms = {
      leads: { view: false, create: false, edit: false, delete: false },
      clients: { view: false, create: false, edit: false, delete: false },
      projects: { view: false, create: false, edit: false, delete: false, accessible_projects: [] },
      tasks: { view: false, create: false, edit: false, delete: false },
      employees: { view: false, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false }
    };

    if (!userPerms) return defaultPerms;

    const parsedPerms = typeof userPerms === 'string' ? JSON.parse(userPerms) : userPerms;

    // Support legacy flat permissions and upgrade them
    const modules = ['leads', 'clients', 'projects', 'tasks', 'users', 'employees'];
    const upgradedPerms = { ...defaultPerms };

    modules.forEach(module => {
      if (parsedPerms[module]) {
        if (typeof parsedPerms[module] === 'boolean') {
          // Legacy: { projects: true } -> { projects: { view: true, create: true, edit: true, delete: true } }
          upgradedPerms[module] = {
            view: parsedPerms[module],
            create: parsedPerms[module],
            edit: parsedPerms[module],
            delete: parsedPerms[module]
          };
          if (module === 'projects') upgradedPerms.projects.accessible_projects = [];
        } else {
          // New nested structure, just merge with default to ensure all actions exist
          upgradedPerms[module] = { ...defaultPerms[module], ...parsedPerms[module] };
        }
      }
    });

    // Handle project_tabs separately to ensure defaults for existing users
    const defaultProjectTabs = {
      'project-info': true,
      'transaction': true,

      'attendance': true,
      'task': true,
      'material': true
    };

    if (parsedPerms.project_tabs) {
      upgradedPerms.project_tabs = { ...defaultProjectTabs, ...parsedPerms.project_tabs };
    } else {
      upgradedPerms.project_tabs = defaultProjectTabs;
    }

    return upgradedPerms;
  };

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

      setPermissions(initializePermissions(editUser.permissions));

      // Clear any previous error messages when reopening for edit
      setShowErrorMessage(false);
      setErrorMessage("");
    } else {
      resetForm();
    }
    setErrors({});
    setShowErrorMessage(false);
    setErrorMessage("");
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
      leads: { view: false, create: false, edit: false, delete: false },
      clients: { view: false, create: false, edit: false, delete: false },
      projects: { view: false, create: false, edit: false, delete: false, accessible_projects: [] },
      tasks: { view: false, create: false, edit: false, delete: false },
      employees: { view: false, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      project_tabs: {
        'project-info': true,
        'transaction': true,

        'attendance': true,
        'task': true,
        'material': true
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Only validate role and status if user can edit them (admin or creating new user)
    if (!isNonAdminEditingSelf) {
      if (!role) {
        newErrors.role = 'Please select a role';
      }
      if (!status) {
        newErrors.status = 'Please select a status';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setErrorMessage('Please fix the validation errors');
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
                onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
                placeholder="Enter first name"
                error={errors.firstName}
              />
            </div>
            <div>
              <InputField
                label="LAST NAME"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
                placeholder="Enter last name"
                error={errors.lastName}
              />
            </div>
            <div>
              <SelectField
                label="ROLE"
                required
                options={["Admin", "Project Manager", "HR", "Site Manager", "Office Staff", "Field Rep"]}
                value={isNonAdminEditingSelf ? editUser.role : role}
                onChange={(val) => { setRole(val); clearError('role'); }}
                placeholder="Select role"
                disabled={isNonAdminEditingSelf}
                error={errors.role}
              />
            </div>
            <div>
              <SelectField
                label="STATUS"
                required
                options={["Active", "Inactive"]}
                value={isNonAdminEditingSelf ? editUser.status : status}
                onChange={(val) => { setStatus(val); clearError('status'); }}
                placeholder="Select status"
                disabled={isNonAdminEditingSelf}
                error={errors.status}
              />
            </div>
            <div>
              <InputField
                label="EMAIL"
                required
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                placeholder="Enter email address"
                error={errors.email}
              />
            </div>
            <div>
              <InputField
                label="USERNAME"
                required
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError('username'); }}
                placeholder="Username will auto-populate from email"
                error={errors.username}
              />
            </div>
            <div>
              <PhoneField
                label="PHONE NUMBER"
                required
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                placeholder="Enter 10-digit phone number"
                error={errors.phone}
              />
            </div>
            <div className="md:col-span-2">
              <PermissionsField
                label="ACCESS PERMISSIONS"
                permissions={permissions}
                onChange={setPermissions}
                projects={projects}
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
