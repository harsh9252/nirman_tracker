import React, { useState, useEffect, useRef } from "react";
import { FiX, FiCalendar } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { formatDateForInput, formatDateForDisplay, getCurrentDateForInput, isDateInPast, parseDisplayDate } from "../utils/dateUtils.jsx";
import apiService from "../services/api";

// InputField component moved outside to prevent re-creation on each render
const InputField = ({ label, required, type = "text", value, onChange, placeholder, error, ...rest }) => (
  <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
    <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
      <span>
        {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
      </span>
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
        fontSize: 'var(--placeholder-font-size)',
        fontFamily: 'var(--font-family)',
        fontWeight: 'normal',
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
            paddingTop: '16px', // Extra top padding to accommodate the label
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

export default function TaskFormPopup({ isOpen, onClose, onSubmit, isEdit = false, taskToEdit = null, dueDates, initialData = null }) {
  console.log('dueDates=========>', dueDates)
  const [taskNumber, setTaskNumber] = useState("");
  const [taskName, setTaskName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [leadName, setLeadName] = useState("");
  const [relatedTo, setRelatedTo] = useState("");


  const [createdDate, setCreatedDate] = useState(getCurrentDateForInput());
  const [assignTo, setAssignTo] = useState("");
  const [assignBy, setAssignBy] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [errors, setErrors] = useState({});
  const { user } = useAuth ? useAuth() : { user: null };

  // Generate task number and fetch users when component opens, and populate form for edit
  useEffect(() => {
    if (isOpen) {
      if (isEdit && taskToEdit) {
        // Populate form with existing task data
        const formattedCreatedDate = formatDateForInput(taskToEdit.createdDate);
        const formattedDueDate = formatDateForInput(taskToEdit.dueDate);

        setTaskNumber(taskToEdit.taskNumber || "");
        setTaskName(taskToEdit.name || "");
        setProjectName(taskToEdit.projectName || "");
        setLeadName(taskToEdit.leadName || "");
        setRelatedTo(taskToEdit.relatedTo || "");
        setCreatedDate(formattedCreatedDate || getCurrentDateForInput());
        // For edit mode, store the user ID
        setAssignTo(taskToEdit.assignTo || "");
        setAssignBy(taskToEdit.assignBy || ""); // Set the actual assigner from database
        setPriority(taskToEdit.priority || "");
        setStatus(taskToEdit.status || "");
        setDueDate(formattedDueDate || "");
        setDescription(taskToEdit.description || "");
      } else {
        // Reset form for new task
        setTaskName(initialData?.name || "");
        setProjectName(initialData?.projectName || "");
        setLeadName(initialData?.leadName || "");
        setRelatedTo(initialData?.relatedTo || "");
        setCreatedDate(getCurrentDateForInput());
        setAssignTo(initialData?.assignTo || "");
        setPriority(initialData?.priority || "");
        setStatus(initialData?.status || "New");
        setDueDate(initialData?.dueDate || "");
        setDescription(initialData?.description || "");
        setErrors({});
        fetchNextTaskNumber();
      }
      fetchUsers();
      fetchLeads();
    }
  }, [isOpen, isEdit, taskToEdit]);

  // Fetch next sequential task number
  const fetchNextTaskNumber = async () => {
    try {
      const data = await apiService.getNextTaskNumber();
      setTaskNumber(data.taskNumber);
    } catch (error) {
      console.error('Error fetching next task number:', error);
      setTaskNumber("TSK-10001"); // Fallback
    }
  };

  const fetchUsers = async () => {
    try {
      const userData = await apiService.getUsers();
      // Store users as objects with id and name
      const formattedUsers = userData.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Empty array if API fails
    }
  };

  const fetchLeads = async () => {
    try {
      const leadData = await apiService.getLeads();
      setLeads(leadData);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]); // Empty array if API fails
    }
  };



  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!taskName.trim()) {
      newErrors.taskName = "Task name is required";
    }

    // Validate ASSIGNED BY for admin users in edit mode only
    if (isEdit && user?.role?.toLowerCase() === 'admin' && !assignBy) {
      newErrors.assignBy = "Assigned By is required";
    }

    if (!assignTo) {
      newErrors.assignTo = "Assigned To is required";
    }

    if (!status) {
      newErrors.status = "Status is required";
    }

    if (!priority) {
      newErrors.priority = "Priority is required";
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    // Check if due date is not in the past
    if (dueDate && isDateInPast(dueDate)) {
      newErrors.dueDate = "Due date cannot be in the past";
    }

    // Validate PROJECT NAME when RELATED TO is Project
    if (relatedTo === "Project" && !projectName.trim()) {
      newErrors.projectName = "Project name is required when Related To is Project";
    }

    // Validate LEAD NAME when RELATED TO is Lead
    if (relatedTo === "Lead" && !leadName) {
      newErrors.leadName = "Lead name is required when Related To is Lead";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    const newTask = {
      taskNumber: taskNumber,
      name: taskName.trim(),
      projectName: projectName.trim() || "",
      leadName: leadName || "",
      relatedTo: relatedTo || "",
      assignTo: assignTo, // Already a user ID
      assignBy: (isEdit && user?.role?.toLowerCase() === 'admin') ? assignBy : (user?.id || 1), // Admin editing can select, others use current user
      priority: priority,
      status: status,
      dueDate: dueDate,
      description: description.trim() || "",
      createdDate: createdDate
    };

    console.log('💾 SAVE TASK - Data being sent to backend:', {
      ...newTask,
      dueDateType: typeof dueDate,
      createdDateType: typeof createdDate,
      dueDateValue: dueDate,
      createdDateValue: createdDate
    });

    if (typeof onSubmit === "function") onSubmit(newTask);

    // Reset form
    setTaskName("");
    setProjectName("");
    setLeadName("");
    setRelatedTo("");
    setCreatedDate(getCurrentDateForInput());
    setAssignTo("");
    setPriority("");
    setStatus("");
    setDueDate("");
    setDescription("");
    setErrors({});
    onClose();
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

    // Filter options based on search text
    const filteredOptions = searchable && searchText
      ? options.filter(option =>
        option.toLowerCase().includes(searchText.toLowerCase())
      )
      : options;

    const handleSelect = (option) => {
      onChange(option);
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
            value={isOpen ? searchText : (value || "")}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%',
              height: 'var(--input-height)',
              padding: 'var(--input-padding)',
              paddingTop: '16px', // Extra top padding to accommodate the label
              paddingRight: '40px', // Space for dropdown arrow
              fontSize: 'var(--placeholder-font-size)',
              fontFamily: 'var(--font-family)',
              border: `1px solid ${error ? 'var(--secondary-color)' : 'var(--input-border-color)'}`,
              borderRadius: 'var(--input-border-radius)',
              backgroundColor: 'var(--input-bg-color)',
              color: 'var(--input-text-color)',
              outline: 'none',
              transition: 'border-color 0.2s',
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
              paddingTop: '16px', // Extra top padding to accommodate the label
              fontSize: 'var(--input-font-size)',
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
            }}
          >
            <span style={{
              color: value ? 'var(--input-text-color)' : 'var(--input-placeholder-color)',
              fontSize: 'var(--placeholder-font-size)',
              fontFamily: 'var(--font-family)',
            }}>
              {value || placeholder}
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
          <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-1 w-full">
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
                    color: option === value ? 'var(--input-placeholder-color)' : 'var(--input-text-color)',
                    cursor: 'pointer',
                    backgroundColor: option === value ? '#f3f4f6' : 'transparent',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = option === value ? '#f3f4f6' : 'transparent'}
                >
                  {option}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-2 sm:p-6 overflow-auto">
      <div className="w-full max-w-5xl bg-white rounded-xl flex flex-col max-h-[75vh] sm:max-h-[90vh] mt-2 mb-2 sm:mt-0 sm:mb-0 task-modal">
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10 border-b-2 rounded-t-xl" style={{ borderBottomColor: 'var(--primary-color)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-bold" style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}>{isEdit ? 'EDIT TASK' : 'CREATE TASK'}</h2>
          </div>
          <button
            onClick={handleSave}
            className="text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-xl shadow-md hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
          >
            {isEdit ? 'Update' : 'Save'}
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--form-gap)' }}>
            {/* Row 0: TASK NUMBER (only show when editing) | TASK NAME* */}
            {isEdit && (
              <div className="md:col-span-1">
                <InputField
                  label="TASK NUMBER"
                  value={taskNumber}
                  readOnly
                  placeholder="Task number"
                />
              </div>
            )}
            <div className={`md:col-span-1 ${isEdit ? '' : 'md:col-span-2'}`}>
              <InputField
                label="TASK NAME"
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Enter task name"
                error={errors.taskName}
              />
            </div>

            {/* Row 1: CREATED DATE | DUE DATE* */}
            <div className="md:col-span-1">
              <DateInputField
                label="CREATED DATE"
                required
                value={createdDate}
                readOnly
                placeholder="Auto-selected date"
              />
            </div>
            <div className="md:col-span-1">
              <DateInputField
                label="DUE DATE"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Select due date"
                error={errors.dueDate}
              />
            </div>

            {/* Row 2: ASSIGNED BY | ASSIGNED TO */}
            <div className="md:col-span-1">
              {isEdit && user?.role?.toLowerCase() === 'admin' ? (
                <SelectField
                  label="ASSIGNED BY"
                  required
                  options={users.map(user => user.name)}
                  value={users.find(u => u.id === parseInt(assignBy))?.name || ""}
                  onChange={(name) => {
                    const user = users.find(u => u.name === name);
                    setAssignBy(user ? user.id : "");
                  }}
                  placeholder="Select assigned by"
                  searchable={true}
                  error={errors.assignBy}
                />
              ) : (
                <InputField
                  label="ASSIGNED BY"
                  required
                  value={user ? `${user.firstName} ${user.lastName}` : "Current User"}
                  readOnly
                  placeholder="Auto-selected current user"
                />
              )}
            </div>
            <div className="md:col-span-1">
              <SelectField
                label="ASSIGNED TO"
                required
                options={users.map(user => user.name)}
                value={users.find(u => u.id === parseInt(assignTo))?.name || ""}
                onChange={(name) => {
                  const user = users.find(u => u.name === name);
                  setAssignTo(user ? user.id : "");
                }}
                placeholder="Select assigned to"
                searchable={true}
                error={errors.assignTo}
              />
            </div>

            {/* Row 3: PRIORITY | STATUS */}
            <div className="md:col-span-1">
              <SelectField
                label="PRIORITY"
                required
                options={["High", "Medium", "Low"]}
                value={priority}
                onChange={setPriority}
                placeholder="Select priority"
                error={errors.priority}
              />
            </div>
            <div className="md:col-span-1">
              <SelectField
                label="STATUS"
                required
                options={["New", "Working", "Completed", "On Hold", "Cancelled"]}
                value={status}
                onChange={setStatus}
                placeholder="Select status"
                error={errors.status}
              />
            </div>

            {/* Row 4: RELATED TO | PROJECT NAME / LEAD NAME (conditional) */}
            <div className="md:col-span-1">
              <SelectField
                label="RELATED TO"
                options={
                  ["Lead", "Project", "Self"]
                }
                value={relatedTo}
                onChange={(value) => {
                  setRelatedTo(value);
                  // Clear the fields when changing relatedTo
                  if (value !== "Project") {
                    setProjectName("");
                  }
                  if (value !== "Lead") {
                    setLeadName("");
                  }
                }}
                placeholder="Select what this task is related to"
              />
            </div>
            {(relatedTo === "Project" || relatedTo === "Lead") && (
              <div className="md:col-span-1">
                {relatedTo === "Project" && (
                  <InputField
                    label="PROJECT NAME"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    error={errors.projectName}
                  />
                )}
                {relatedTo === "Lead" && (
                  <SelectField
                    label="LEAD NAME"
                    required
                    options={leads.map(lead => lead.contact_name)}
                    value={leadName}
                    onChange={(selectedName) => {
                      setLeadName(selectedName);
                    }}
                    placeholder="Select lead name"
                    searchable={true}
                    error={errors.leadName}
                  />
                )}
              </div>
            )}

            {/* Row 5: DESCRIPTION (full width) */}
            <div className="md:col-span-2">
              <TextAreaField
                label="DESCRIPTION"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
