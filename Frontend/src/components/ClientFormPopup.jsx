import React, { useState, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

const InputField = ({ label, required, type = "text", value, onChange, placeholder, ...rest }) => (
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
        fontSize: 'var(--input-font-size)',
        fontFamily: 'var(--font-family)',
        border: `1px solid var(--input-border-color)`,
        borderRadius: 'var(--input-border-radius)',
        backgroundColor: 'var(--input-bg-color)',
        color: 'var(--input-text-color)',
        outline: 'none',
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border-color)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--input-border-color)'}
      {...rest}
    />

  </div>
);

const SelectField = ({ label, options = [], value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

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
        <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto mt-1 w-full">
          {options.map((option, index) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default function ClientFormPopup({ isOpen, onClose, onSubmit, editClient = null }) {
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Pre-fill form when editing
  useEffect(() => {
    if (editClient) {
      setClientName(editClient.name || "");
      setEmail(editClient.email || "");
      setPhone(editClient.phone || "");
      setCompany(editClient.company || "");
      setAddress(editClient.address || "");
      setDescription(editClient.description || "");
      setStatus(editClient.status || "Active");
      // Format date for input field
      if (editClient.date) {
        const dateObj = new Date(editClient.date);
        setDate(dateObj.toISOString().slice(0, 10));
      }
    } else {
      // Reset form for new client
      setClientName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setAddress("");
      setDescription("");
      setStatus("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [editClient, isOpen]);




  const handleSave = async () => {
    const clientData = {
      client_name: clientName || "Unnamed Client",
      email: email || "",
      phone: phone || "",
      company_name: company || "",
      address: address || "",
      description: description || "",
      conversion_date: date
    };

    try {
      await onSubmit(clientData);
      // Form will be reset by useEffect when editClient changes
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-6 overflow-auto">
      <div className="w-full max-w-5xl bg-white rounded-xl flex flex-col max-h-[90vh] client-modal">
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10 border-b-2 rounded-t-xl" style={{ borderBottomColor: 'var(--primary-color)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-bold" style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}>
              {editClient ? 'EDIT CLIENT' : 'CREATE CLIENT'}
            </h2>
          </div>
          <button
            onClick={handleSave}
            className="text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
          >
            Save
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--form-gap)' }}>
            <div className="md:col-span-2">
              <InputField
                label="CLIENT NAME"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="md:col-span-1">
              <InputField
                label="COMPANY"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter company name"
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
            <div className="md:col-span-1">
              <SelectField
                label="STATUS"
                options={["Active", "Inactive"]}
                value={status}
                onChange={setStatus}
                placeholder="Select status"
              />
            </div>
            <div className="md:col-span-1">
              <InputField
                label="EMAIL"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="md:col-span-1">
              <InputField
                label="PHONE NO."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="ADDRESS"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
              />
            </div>
            <div className="md:col-span-2">
              <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                  DESCRIPTION
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 'var(--input-padding)',
                    fontSize: 'var(--input-font-size)',
                    fontFamily: 'var(--font-family)',
                    border: `1px solid var(--input-border-color)`,
                    borderRadius: 'var(--input-border-radius)',
                    backgroundColor: 'var(--input-bg-color)',
                    color: 'var(--input-text-color)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--input-focus-border-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--input-border-color)'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
