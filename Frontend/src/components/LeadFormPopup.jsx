import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import apiService from "../services/api";
import SuccessPopup from "./SuccessPopup";
import ProjectFormPopup from "./ProjectFormPopup";
import LeadConversionWizard from "./LeadConversionWizard";

// InputField component moved outside to prevent re-creation on each render
const InputField = ({ label, required, type = "text", value, onChange, placeholder, helperText, helperTextColor, ...rest }) => (
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
        fontSize: 'var(--placeholder-font-size)',
        fontFamily: 'var(--font-family)',
        fontWeight: 'normal',
        border: `1px solid ${helperTextColor === 'red' ? '#ef4444' : 'var(--input-border-color)'}`,
        borderRadius: 'var(--input-border-radius)',
        backgroundColor: 'var(--input-bg-color)',
        color: 'var(--input-text-color)',
        outline: 'none',
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => e.target.style.borderColor = helperTextColor === 'red' ? '#ef4444' : 'var(--input-focus-border-color)'}
      onBlur={(e) => e.target.style.borderColor = helperTextColor === 'red' ? '#ef4444' : 'var(--input-border-color)'}
      {...rest}
    />
    {helperText && (
      <span style={{
        fontSize: '11px',
        color: helperTextColor || '#6b7280',
        fontFamily: 'var(--font-family)',
        marginTop: '4px',
        display: 'block'
      }}>
        {helperText}
      </span>
    )}
  </div>
);

// TextAreaField component for multi-line text input
const TextAreaField = ({ label, required, value, onChange, placeholder, rows = 3, maxLength, ...rest }) => (
  <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
    <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)', zIndex: 1 }}>
      <span>
        {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
      </span>
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      style={{
        width: '100%',
        minHeight: '80px',
        padding: 'var(--input-padding)',
        fontSize: 'var(--placeholder-font-size)',
        fontFamily: 'var(--font-family)',
        fontWeight: 'normal',
        border: `1px solid var(--input-border-color)`,
        borderRadius: 'var(--input-border-radius)',
        backgroundColor: 'var(--input-bg-color)',
        color: 'var(--input-text-color)',
        outline: 'none',
        transition: 'border-color 0.2s',
        resize: 'vertical',
        overflow: 'auto',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border-color)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--input-border-color)'}
      {...rest}
    />
    {maxLength && (
      <span style={{
        fontSize: '11px',
        color: '#6b7280',
        fontFamily: 'var(--font-family)',
        marginTop: '4px',
        display: 'block'
      }}>
        {value?.length || 0}/{maxLength} characters
      </span>
    )}
  </div>
);


// Helper to format any date input (ISO string, object, etc.) to YYYY-MM-DD
const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export default function LeadFormPopup({ isOpen, onClose, onSubmit, isEdit = false, editLead = null }) {
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [leadType, setLeadType] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [company, setCompany] = useState("");

  // ---- Added states for previously non-editable fields ----
  const [address, setAddress] = useState("");
  const [source, setSource] = useState(""); // if you want to store select values later
  const [leadStatus, setLeadStatus] = useState("Open");
  const [lastContactedDate, setLastContactedDate] = useState("");
  const [description, setDescription] = useState("");
  const [leadAssignee, setLeadAssignee] = useState("");
  const [users, setUsers] = useState([]);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '', clientId: null });
  const [showConversionWizard, setShowConversionWizard] = useState(false);

  // Project form state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectClientId, setProjectClientId] = useState(null);
  const [prefilledClientName, setPrefilledClientName] = useState('');
  const [prefilledAddress, setPrefilledAddress] = useState('');

  // Check if lead is read-only (converted or lost)
  const isReadOnly = isEdit && editLead && (editLead.is_converted || editLead.is_lost);


  useEffect(() => {
    if (isEdit && editLead) {
      setContactName(editLead.contact_name || '');
      setDate(formatDateForInput(editLead.date));
      setPhone(editLead.phone || '');
      setEmail(editLead.email || '');
      setEmailError('');
      setCompany(editLead.company_name || '');
      setAddress(editLead.address || '');
      setLeadType(editLead.lead_type || '');
      setSource(editLead.source || '');
      setLeadStatus(editLead.lead_status || '');
      setLastContactedDate(formatDateForInput(editLead.last_contacted_date));
      setLeadAssignee(editLead.lead_assignee || '');
      setDescription(editLead.description || '');
    } else {
      // Reset for new lead
      setContactName('');
      setDate(new Date().toISOString().slice(0, 10));
      setPhone('');
      setEmail('');
      setEmailError('');
      setCompany('');
      setAddress('');
      setLeadType('');
      setSource('');
      setLeadStatus('Open');
      setLastContactedDate('');
      setLeadAssignee('');
      setDescription('');
    }
  }, [isEdit, editLead]);

  // Fetch users for Lead Assignee dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await apiService.getUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Phone input handler - only allow numeric input
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (value === '' || /^\d+$/.test(value)) {
      setPhone(value);
    }
  };

  // Email input handler - validate format without popup
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Only show error if user has typed something and it's invalid
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!contactName) {
      return;
    }

    if (!phone) {
      return;
    }

    // Phone validation: exactly 10 digits
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return;
    }

    // Email validation: valid format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    const leadData = {
      contact_name: contactName,
      date: formatDateForInput(date),
      phone: phone,
      email,
      company_name: company,
      address,
      lead_type: leadType,
      source,
      lead_status: leadStatus,
      last_contacted_date: lastContactedDate ? formatDateForInput(lastContactedDate) : null,
      lead_assignee: leadAssignee,
      description
    };

    try {
      if (isEdit) {
        await apiService.updateLead(editLead.id, leadData);
      } else {
        await apiService.createLead(leadData);
      }
      onClose();
      if (onSubmit) onSubmit(); // Fetch leads after save
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };



  const SelectField = ({ label, options = [], value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (isOpen && selectRef.current && !selectRef.current.contains(e.target)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (option) => {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    };

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div ref={selectRef} className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
          {label}
        </label>
        <div
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          tabIndex={0}
          style={{
            width: '100%',
            height: 'var(--input-height)',
            padding: 'var(--input-padding)',
            fontSize: 'var(--input-font-size)',
            fontFamily: 'var(--font-family)',
            border: `1px solid var(--input-border-color)`,
            borderRadius: 'var(--input-border-radius)',
            backgroundColor: 'var(--input-bg-color)',
            color: value ? 'var(--input-text-color)' : 'var(--input-placeholder-color)',
            outline: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border-color)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--input-border-color)'}
        >
          <span style={{
            color: value ? 'var(--input-text-color)' : 'var(--input-placeholder-color)',
            fontSize: 'var(--placeholder-font-size)',
            fontFamily: 'var(--font-family)',
          }}>
            {value || placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-full mt-1">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ fontFamily: 'var(--font-family)' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
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
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 text-center" style={{ fontFamily: 'var(--font-family)' }}>
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-2 sm:p-6 overflow-auto">
      <div className="w-full max-w-5xl bg-white rounded-xl flex flex-col max-h-[75vh] sm:max-h-[90vh] mt-2 mb-2 sm:mt-0 sm:mb-0 lead-modal">
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10 border-b-2 rounded-t-xl" style={{ borderBottomColor: 'var(--primary-color)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-bold" style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}>{isEdit ? 'EDIT LEAD' : 'NEW LEAD'}</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Convert to Client button - only show when editing and not converted/lost */}
            {isEdit && editLead && !editLead.is_converted && !editLead.is_lost && (
              <button
                onClick={() => setShowConversionWizard(true)}
                className="text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-xl shadow-md hover:opacity-90 bg-green-600"
                style={{ fontFamily: 'var(--font-family)' }}
                title="Convert lead to client"
              >
                Convert
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isReadOnly}
              className="text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-xl shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
              title={isReadOnly ? 'Cannot edit this lead' : 'Save lead'}
            >
              Save
            </button>
          </div>
        </div>

        {/* Warning banner for read-only leads */}
        {isReadOnly && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                {editLead?.is_converted ? 'This lead has been converted to a client and cannot be edited.' : 'This lead has been marked as lost and cannot be edited.'}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 flex-1 overflow-y-auto rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--form-gap)' }}>
            {/* Row 1: CONTACT NAME* | DATE */}
            <div className="md:col-span-1">
              <InputField
                label="CONTACT NAME"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            <div className="md:col-span-1">
              <InputField
                label="DATE"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Row 2: PHONE NO. | EMAIL */}
            <div className="md:col-span-1">
              <InputField
                label="PHONE NO."
                required
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10 digit phone number"
                maxLength={10}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
            <div className="md:col-span-1">
              <InputField
                label="EMAIL"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email"
                helperText={emailError}
                helperTextColor={emailError ? 'red' : ''}
              />
            </div>

            {/* Row 3: COMPANY NAME | ADDRESS */}
            <div className="md:col-span-1">
              <InputField
                label="COMPANY NAME"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="md:col-span-1">
              <InputField
                label="ADDRESS"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
              />
            </div>

            {/* Row 4: LEAD TYPE | SOURCE */}
            <div className="md:col-span-1">
              <SelectField
                label="LEAD TYPE"
                options={["Construction", "Interior", "Renovation"]}
                value={leadType}
                onChange={setLeadType}
                placeholder="Select lead type"
              />
            </div>
            <div className="md:col-span-1">
              <SelectField
                label="SOURCE"
                options={["Manual", "Email", "Website", "Social Media", "Whatsapp"]}
                value={source}
                onChange={setSource}
                placeholder="Select source"
              />
            </div>

            {/* Row 5: LEAD STATUS | LEAD ASSIGNEE */}
            <div className="md:col-span-1">
              <SelectField
                label="LEAD STATUS"
                options={["Open", "Working", "Close - Converted", "Close Lost"]}
                value={leadStatus}
                onChange={setLeadStatus}
                placeholder="Select lead status"
              />
            </div>
            <div className="md:col-span-1">
              <SelectField
                label="LEAD ASSIGNEE"
                options={users.map(user => `${user.first_name} ${user.last_name}`)}
                value={leadAssignee}
                onChange={setLeadAssignee}
                placeholder="Select assignee"
              />
            </div>

            {/* Row 6: DESCRIPTION (full width) */}
            <div className="md:col-span-2">
              <TextAreaField
                label="DESCRIPTION"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lead Conversion Wizard */}
      <LeadConversionWizard
        isOpen={showConversionWizard}
        onClose={() => setShowConversionWizard(false)}
        leadData={editLead}
        onConversionComplete={() => {
          setShowConversionWizard(false);
          onClose();
          if (onSubmit) onSubmit();
        }}
        onCreateProject={(clientId, leadData) => {
          setProjectClientId(clientId);
          setPrefilledClientName(leadData.contact_name || leadData.name || '');
          setPrefilledAddress(leadData.address || '');
          setShowProjectForm(true);
          setShowConversionWizard(false);
        }}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => {
          setShowSuccessPopup(false);
          // Close lead form only if not opening project form
          onClose();
          if (onSubmit) onSubmit();
        }}
        title={successData.title}
        message={successData.message}
        clientId={successData.clientId}
        leadData={editLead}
        shouldCloseParent={false}
        onCreateProject={(clientId, leadData) => {
          setProjectClientId(clientId);
          setPrefilledClientName(leadData.contact_name || leadData.name || '');
          setPrefilledAddress(leadData.address || '');
          setShowProjectForm(true);
          setShowSuccessPopup(false);
          // Don't close the lead form yet - wait for project form to close
        }}
      />

      {/* Project Form Popup */}
      <ProjectFormPopup
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setProjectClientId(null);
          onClose();
          if (onSubmit) onSubmit();
        }}
        onSubmit={() => {
          setShowProjectForm(false);
          setProjectClientId(null);
          onClose();
          if (onSubmit) onSubmit();
        }}
        preselectedClientId={projectClientId}
        prefilledClientName={prefilledClientName}
        prefilledAddress={prefilledAddress}
      />
    </div>
  );
}
