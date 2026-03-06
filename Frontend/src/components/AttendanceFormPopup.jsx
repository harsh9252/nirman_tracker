import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiMapPin, FiCheckCircle, FiLoader, FiCamera } from 'react-icons/fi';
import { toast } from 'react-toastify';

// InputField component
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

export default function AttendanceFormPopup({ isOpen, onClose, onSubmit, projectId }) {
    const [formData, setFormData] = useState({
        name: '',
        role: 'Site Staff',
        designation: '',
        shift_hours: '',
        overtime_amount: '',
        salary_amount: '',
        salary_period: 'Per month',
        shift_period: 'Per shift',
        overtime_period: 'Per hour',
        salary_calculated_by: 'Shift wise',
        photo: null,
        location: null
    });

    const [photoPreview, setPhotoPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when closed
            setFormData({
                name: '',
                role: 'Site Staff',
                designation: '',
                shift_hours: '',
                overtime_amount: '',
                salary_amount: '',
                salary_period: 'Per month',
                shift_period: 'Per shift',
                overtime_period: 'Per hour',
                salary_calculated_by: 'Shift wise',
                photo: null,
                location: null
            });
            setPhotoPreview(null);
            setErrors({});
        }
    }, [isOpen]);

    const requestLocationPermission = async () => {
        if ("geolocation" in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                setFormData(prev => ({
                    ...prev,
                    location: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                }));

                toast.success('Location captured successfully!');
            } catch (error) {
                console.error('Error getting location:', error);
                toast.error('Unable to get location. Please enable location permissions.');
            }
        } else {
            toast.error("Geolocation is not supported by your browser");
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Request location when photo is uploaded
            await requestLocationPermission();

            // Set photo
            setFormData(prev => ({ ...prev, photo: file }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        if (!formData.photo) {
            newErrors.photo = 'Photo is required for verification';
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
            // Here you would send the data to your backend
            const attendanceData = {
                ...formData,
                project_id: projectId
            };

            console.log('Submitting attendance data:', attendanceData);

            toast.success('Attendance recorded successfully!');

            if (onSubmit) onSubmit();
            onClose();
        } catch (error) {
            console.error('Error recording attendance:', error);
            toast.error(error.message || 'Failed to record attendance');
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
                <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10 border-b-2 rounded-t-xl" style={{ borderBottomColor: 'var(--primary-color)' }}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        >
                            <FiX size={20} />
                        </button>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}>
                            MARK ATTENDANCE
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-xl shadow-md hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 flex-1 overflow-y-auto rounded-b-xl">
                    <div className="space-y-4">
                        {/* Photo Upload Section */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-family)' }}>
                                Photo Upload (For Verification){errors.photo && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {/* Photo Upload Box */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                                    style={{ backgroundColor: photoPreview ? 'transparent' : '#f9fafb' }}
                                >
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <>
                                            <FiUpload className="text-blue-600 mb-2" size={24} />
                                            <span className="text-xs text-blue-600" style={{ fontFamily: 'var(--font-family)' }}>Upload</span>
                                        </>
                                    )}
                                </div>
                                {/* Empty upload boxes */}
                                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
                                    <FiUpload className="text-gray-400 mb-2" size={24} />
                                    <span className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-family)' }}>Upload</span>
                                </div>
                                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
                                    <FiUpload className="text-gray-400 mb-2" size={24} />
                                    <span className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-family)' }}>Upload</span>
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                            {errors.photo && (
                                <span className="text-xs text-red-500 mt-1 block" style={{ fontFamily: 'var(--font-family)' }}>
                                    {errors.photo}
                                </span>
                            )}
                            {formData.location && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                    <FiMapPin size={12} />
                                    <span style={{ fontFamily: 'var(--font-family)' }}>Location captured</span>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <InputField
                            label="NAME"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Enter name"
                            helperText={errors.name}
                            helperTextColor={errors.name ? 'red' : ''}
                        />

                        {/* Role */}
                        <SelectField
                            label="ROLE"
                            required
                            options={["Site Staff", "Labour", "Contractor"]}
                            value={formData.role}
                            onChange={(value) => handleChange('role', value)}
                            placeholder="Select role"
                        />

                        {/* Designation */}
                        <InputField
                            label="DESIGNATION"
                            value={formData.designation}
                            onChange={(e) => handleChange('designation', e.target.value)}
                            placeholder="Enter designation"
                        />

                        {/* Salary Amount with Period */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="SALARY AMOUNT"
                                type="number"
                                value={formData.salary_amount}
                                onChange={(e) => handleChange('salary_amount', e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                            />
                            <SelectField
                                label="PERIOD"
                                options={["Per month", "Per day", "Per hour"]}
                                value={formData.salary_period}
                                onChange={(value) => handleChange('salary_period', value)}
                                placeholder="Select period"
                            />
                        </div>

                        {/* Shift Hours with Period */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="SHIFT HOURS"
                                type="number"
                                value={formData.shift_hours}
                                onChange={(e) => handleChange('shift_hours', e.target.value)}
                                placeholder="0"
                                step="0.5"
                            />
                            <SelectField
                                label="PERIOD"
                                options={["Per shift", "Per day"]}
                                value={formData.shift_period}
                                onChange={(value) => handleChange('shift_period', value)}
                                placeholder="Select period"
                            />
                        </div>

                        {/* Overtime Amount with Period */}
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="OVERTIME AMOUNT"
                                type="number"
                                value={formData.overtime_amount}
                                onChange={(e) => handleChange('overtime_amount', e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                            />
                            <SelectField
                                label="PERIOD"
                                options={["Per hour", "Per day"]}
                                value={formData.overtime_period}
                                onChange={(value) => handleChange('overtime_period', value)}
                                placeholder="Select period"
                            />
                        </div>

                        {/* Salary Calculation Method */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'var(--font-family)' }}>
                                Salary to be calculated by
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salary_calculated_by"
                                        value="Shift wise"
                                        checked={formData.salary_calculated_by === 'Shift wise'}
                                        onChange={(e) => handleChange('salary_calculated_by', e.target.value)}
                                        className="w-4 h-4"
                                        style={{ accentColor: 'var(--primary-color)' }}
                                    />
                                    <span className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>Shift wise</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salary_calculated_by"
                                        value="Punch difference"
                                        checked={formData.salary_calculated_by === 'Punch difference'}
                                        onChange={(e) => handleChange('salary_calculated_by', e.target.value)}
                                        className="w-4 h-4"
                                        style={{ accentColor: 'var(--primary-color)' }}
                                    />
                                    <span className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>Punch difference</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
