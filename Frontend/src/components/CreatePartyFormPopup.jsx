import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiEdit2, FiCalendar } from 'react-icons/fi';

// InputField component
const InputField = ({ label, required, type = "text", value, onChange, placeholder, helperText, helperTextColor, icon, ...rest }) => (
    <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)', zIndex: 10 }}>
            <span>
                {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
            </span>
        </label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: icon ? '8px 40px 8px 12px' : 'var(--input-padding)',
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
            {icon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
            )}
        </div>
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

// SelectField component
const SelectField = ({ label, required, options = [], value, onChange, placeholder }) => {
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
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div ref={selectRef} className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                <span>
                    {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
                </span>
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

// PhoneInputField component
const PhoneInputField = ({ label, required, countryCode, phoneNumber, onCountryCodeChange, onPhoneNumberChange }) => {
    return (
        <div style={{ marginBottom: 'var(--form-margin-bottom)' }}>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                {label}{required && <span style={{ color: 'var(--secondary-color)' }} className="ml-1">*</span>}
            </label>
            <div className="flex gap-2">
                <select
                    value={countryCode}
                    onChange={(e) => onCountryCodeChange(e.target.value)}
                    style={{
                        width: '100px',
                        height: 'var(--input-height)',
                        padding: 'var(--input-padding)',
                        fontSize: 'var(--placeholder-font-size)',
                        fontFamily: 'var(--font-family)',
                        border: '1px solid var(--input-border-color)',
                        borderRadius: 'var(--input-border-radius)',
                        backgroundColor: 'var(--input-bg-color)',
                        color: 'var(--input-text-color)',
                        outline: 'none',
                    }}
                >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                </select>
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => onPhoneNumberChange(e.target.value)}
                    placeholder="Phone Number"
                    style={{
                        flex: 1,
                        height: 'var(--input-height)',
                        padding: 'var(--input-padding)',
                        fontSize: 'var(--placeholder-font-size)',
                        fontFamily: 'var(--font-family)',
                        border: '1px solid var(--input-border-color)',
                        borderRadius: 'var(--input-border-radius)',
                        backgroundColor: 'var(--input-bg-color)',
                        color: 'var(--input-text-color)',
                        outline: 'none',
                    }}
                />
            </div>
        </div>
    );
};

// DocumentUploadField component
const DocumentUploadField = ({ label, value, onChange }) => {
    const fileInputRef = useRef(null);

    return (
        <div className="grid grid-cols-[1fr_auto] gap-3" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
            <InputField
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-0 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                style={{
                    height: 'var(--input-height)',
                    fontSize: 'var(--placeholder-font-size)',
                    fontFamily: 'var(--font-family)',
                    color: 'var(--primary-color)',
                    backgroundColor: 'transparent',
                }}
            >
                Upload ↑
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        // Handle file upload
                        console.log('File selected:', e.target.files[0]);
                    }
                }}
            />
        </div>
    );
};

export default function CreatePartyFormPopup({ isOpen, onClose, onSubmit, projectId, defaultPartyType = 'Worker' }) {
    const [formData, setFormData] = useState({
        party_type: defaultPartyType,
        party_id: '',
        party_name: '',
        country_code: '+91',
        phone_number: '',
        email: '',
        father_name: '',
        date_of_joining: '',
        address: '',
        aadhar_number: '',
        pan_number: '',
        pf_number: '',
        uan_number: '',
        esi_number: '',
    });

    const [showOpeningBalance, setShowOpeningBalance] = useState(false);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when closed
            setFormData({
                party_type: defaultPartyType,
                party_id: '',
                party_name: '',
                country_code: '+91',
                phone_number: '',
                email: '',
                father_name: '',
                date_of_joining: '',
                address: '',
                aadhar_number: '',
                pan_number: '',
                pf_number: '',
                uan_number: '',
                esi_number: '',
            });
            setShowOpeningBalance(false);
            setShowBankDetails(false);
            setErrors({});
        } else {
            // Generate party ID when opened
            generatePartyId();
        }
    }, [isOpen, defaultPartyType]);

    const generatePartyId = () => {
        // Generate a simple party ID (in real app, this would come from backend)
        const randomNum = Math.floor(Math.random() * 1000);
        setFormData(prev => ({
            ...prev,
            party_id: `PID--${randomNum}`
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.party_name.trim()) {
            newErrors.party_name = 'Party name is required';
        }

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Phone number must be 10 digits';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Map frontend fields to backend schema
            const partyData = {
                name: formData.party_name,
                party_type: formData.party_type,
                party_id_custom: formData.party_id,
                country_code: formData.country_code,
                phone: formData.phone_number,
                email: formData.email,
                father_name: formData.father_name,
                joining_date: formData.date_of_joining,
                address: formData.address,
                aadhaar_number: formData.aadhar_number,
                pan_number: formData.pan_number,
                pf_number: formData.pf_number,
                uan_number: formData.uan_number,
                esi_number: formData.esi_number,
                project_id: projectId
            };

            console.log('Finalizing initial party data:', partyData);

            // Pass party data to parent to open payroll form
            if (onSubmit) onSubmit(partyData);
        } catch (error) {
            console.error('Error in party form:', error);
            alert('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-2 sm:p-6 overflow-auto">
            <div className="w-full max-w-2xl bg-white rounded-xl flex flex-col max-h-[90vh] mt-2 mb-2 sm:mt-0 sm:mb-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10 border-b border-gray-200 rounded-t-xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        >
                            <FiX size={20} />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                            Create New Party
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="text-white px-4 py-2 text-sm rounded-xl shadow-md hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 flex-1 overflow-y-auto rounded-b-xl">
                    <div className="space-y-4">
                        {/* Party Type and Party ID */}
                        <div className="grid grid-cols-2 gap-3">
                            <SelectField
                                label="PARTY TYPE"
                                required
                                options={["Worker", "Contractor", "Supplier", "Consultant"]}
                                value={formData.party_type}
                                onChange={(value) => handleChange('party_type', value)}
                                placeholder="Select party type"
                            />
                            <InputField
                                label="PARTY ID"
                                value={formData.party_id}
                                onChange={(e) => handleChange('party_id', e.target.value)}
                                placeholder="PID--"
                                icon={<FiEdit2 size={16} className="cursor-pointer" onClick={generatePartyId} />}
                            />
                        </div>

                        {/* Party Name */}
                        <InputField
                            label="PARTY NAME"
                            required
                            value={formData.party_name}
                            onChange={(e) => handleChange('party_name', e.target.value)}
                            placeholder="Enter party name"
                            helperText={errors.party_name}
                            helperTextColor={errors.party_name ? 'red' : ''}
                        />

                        {/* Phone Number */}
                        <PhoneInputField
                            label="PHONE NUMBER"
                            required
                            countryCode={formData.country_code}
                            phoneNumber={formData.phone_number}
                            onCountryCodeChange={(value) => handleChange('country_code', value)}
                            onPhoneNumberChange={(value) => handleChange('phone_number', value)}
                        />
                        {errors.phone_number && (
                            <span style={{ fontSize: '11px', color: '#ef4444', fontFamily: 'var(--font-family)', marginTop: '-8px', display: 'block' }}>
                                {errors.phone_number}
                            </span>
                        )}

                        {/* Email */}
                        <InputField
                            label="EMAIL"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="Enter email"
                            helperText={errors.email}
                            helperTextColor={errors.email ? 'red' : ''}
                        />

                        {/* Father Name */}
                        <InputField
                            label="FATHER NAME"
                            value={formData.father_name}
                            onChange={(e) => handleChange('father_name', e.target.value)}
                            placeholder="Enter father name"
                        />

                        {/* Date of Joining */}
                        <InputField
                            label="DATE OF JOINING"
                            type="date"
                            value={formData.date_of_joining}
                            onChange={(e) => handleChange('date_of_joining', e.target.value)}
                            icon={<FiCalendar size={16} />}
                        />

                        {/* Address */}
                        <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                ADDRESS
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Enter address"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: 'var(--input-padding)',
                                    fontSize: 'var(--placeholder-font-size)',
                                    fontFamily: 'var(--font-family)',
                                    border: '1px solid var(--input-border-color)',
                                    borderRadius: 'var(--input-border-radius)',
                                    backgroundColor: 'var(--input-bg-color)',
                                    color: 'var(--input-text-color)',
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        {/* Additional Fields Section */}
                        <div className="pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-family)' }}>
                                Additional Fields
                            </h3>

                            {/* Aadhar Number with Upload */}
                            <DocumentUploadField
                                label="AADHAR NUMBER"
                                value={formData.aadhar_number}
                                onChange={(value) => handleChange('aadhar_number', value)}
                            />

                            {/* PAN Number with Upload */}
                            <DocumentUploadField
                                label="PAN NUMBER"
                                value={formData.pan_number}
                                onChange={(value) => handleChange('pan_number', value)}
                            />

                            {/* PF No. */}
                            <InputField
                                label="PF NO."
                                value={formData.pf_number}
                                onChange={(e) => handleChange('pf_number', e.target.value)}
                                placeholder="Enter PF number"
                            />

                            {/* UAN No. */}
                            <InputField
                                label="UAN NO."
                                value={formData.uan_number}
                                onChange={(e) => handleChange('uan_number', e.target.value)}
                                placeholder="Enter UAN number"
                            />

                            {/* ESI No. */}
                            <InputField
                                label="ESI NO."
                                value={formData.esi_number}
                                onChange={(e) => handleChange('esi_number', e.target.value)}
                                placeholder="Enter ESI number"
                            />
                        </div>

                        {/* Collapsible Sections */}
                        <div className="space-y-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowOpeningBalance(!showOpeningBalance)}
                                className="w-full text-left py-2 text-sm font-medium hover:opacity-80"
                                style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                            >
                                + Opening Balance
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowBankDetails(!showBankDetails)}
                                className="w-full text-left py-2 text-sm font-medium hover:opacity-80"
                                style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                            >
                                + Add Bank Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
