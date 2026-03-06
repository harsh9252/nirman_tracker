import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';

// InputField component (reused from CreatePartyFormPopup)
const InputField = ({ label, required, type = "text", value, onChange, placeholder, helperText, helperTextColor, ...rest }) => (
    <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)', zIndex: 10 }}>
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
            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)', zIndex: 10 }}>
                <span>
                    {label}{required && <span style={{ color: 'var(--secondary-color)', fontFamily: 'var(--font-family)' }} className="ml-1">*</span>}
                </span>
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
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
            >
                <span style={{
                    color: value ? 'var(--input-text-color)' : 'var(--input-placeholder-color)',
                    fontSize: 'var(--placeholder-font-size)',
                    fontFamily: 'var(--font-family)',
                }}>
                    {value || placeholder}
                </span>
                <svg className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
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

export default function PayrollDetailsFormPopup({ isOpen, onClose, onSubmit, partyData }) {
    const [formData, setFormData] = useState({
        salary_amount: '',
        salary_period: 'Per month',
        shift_hours: '',
        shift_period: 'Per shift',
        overtime_amount: '',
        overtime_period: 'Per hour',
        designation: '',
        assigned_projects: '',
        cost_code: '',
        salary_calculation_method: 'Shift wise',
        photos: []
    });

    const [showSalaryBreakup, setShowSalaryBreakup] = useState(false);
    const [photoPreview, setPhotoPreview] = useState([null, null, null]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        if (!isOpen) {
            // Reset form when closed
            setFormData({
                salary_amount: '',
                salary_period: 'Per month',
                shift_hours: '',
                shift_period: 'Per shift',
                overtime_amount: '',
                overtime_period: 'Per hour',
                designation: '',
                assigned_projects: '',
                cost_code: '',
                salary_calculation_method: 'Shift wise',
                photos: []
            });
            setPhotoPreview([null, null, null]);
            setErrors({});
            setShowSalaryBreakup(false);
        }
    }, [isOpen]);

    const handlePhotoUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...photoPreview];
                newPreviews[index] = reader.result;
                setPhotoPreview(newPreviews);

                const newPhotos = [...formData.photos];
                newPhotos[index] = file;
                setFormData(prev => ({ ...prev, photos: newPhotos }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.salary_amount) {
            newErrors.salary_amount = 'Salary amount is required';
        }

        if (!formData.shift_hours) {
            newErrors.shift_hours = 'Shift hours is required';
        }

        if (!formData.designation.trim()) {
            newErrors.designation = 'Designation is required';
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
            const payrollData = {
                salary: formData.salary_amount,
                salary_period: formData.salary_period,
                shift_hours: formData.shift_hours,
                shift_period: formData.shift_period,
                overtime_amount: formData.overtime_amount,
                overtime_period: formData.overtime_period,
                designation: formData.designation,
                cost_code: formData.cost_code,
                salary_calculation_method: formData.salary_calculation_method,
                // In a real app, photos would be uploaded and URLs returned
                profile_image: photoPreview[0]
            };

            console.log('Finalizing payroll data:', payrollData);

            if (onSubmit) onSubmit(payrollData);
            onClose();
        } catch (error) {
            console.error('Error in payroll form:', error);
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
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-2 sm:p-6 overflow-auto">
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
                        <div>
                            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                                {partyData?.party_name || 'Party Name'}
                            </h2>
                            <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-family)' }}>
                                Payroll details
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="text-white px-4 py-2 text-sm rounded-xl shadow-md hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 flex-1 overflow-y-auto rounded-b-xl">
                    <div className="space-y-4">
                        {/* Photo Upload Section */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'var(--font-family)' }}>
                                Photo Upload (For Verification)
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[0, 1, 2].map((index) => (
                                    <div
                                        key={index}
                                        onClick={() => fileInputRefs[index].current?.click()}
                                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                                        style={{ backgroundColor: photoPreview[index] ? 'transparent' : '#f9fafb' }}
                                    >
                                        {photoPreview[index] ? (
                                            <img src={photoPreview[index]} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <>
                                                <FiUpload className="text-blue-600 mb-2" size={24} />
                                                <span className="text-xs text-blue-600" style={{ fontFamily: 'var(--font-family)' }}>Upload ↑</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {[0, 1, 2].map((index) => (
                                    <input
                                        key={index}
                                        ref={fileInputRefs[index]}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePhotoUpload(index, e)}
                                        className="hidden"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Salary Amount with Period */}
                        <div className="grid grid-cols-[1fr_auto] gap-3">
                            <InputField
                                label="SALARY AMOUNT"
                                required
                                type="number"
                                value={formData.salary_amount}
                                onChange={(e) => handleChange('salary_amount', e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                helperText={errors.salary_amount}
                                helperTextColor={errors.salary_amount ? 'red' : ''}
                            />
                            <SelectField
                                label="PERIOD"
                                options={["Per month", "Per day", "Per hour"]}
                                value={formData.salary_period}
                                onChange={(value) => handleChange('salary_period', value)}
                                placeholder="Select period"
                            />
                        </div>

                        {/* Add Salary Breakup Link */}
                        <button
                            type="button"
                            onClick={() => setShowSalaryBreakup(!showSalaryBreakup)}
                            className="text-sm font-medium hover:opacity-80"
                            style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                        >
                            + Add Salary Breakup
                        </button>

                        {/* Shift Hours with Period */}
                        <div className="grid grid-cols-[1fr_auto] gap-3">
                            <InputField
                                label="SHIFT HOURS"
                                required
                                type="number"
                                value={formData.shift_hours}
                                onChange={(e) => handleChange('shift_hours', e.target.value)}
                                placeholder="0"
                                step="0.5"
                                helperText={errors.shift_hours}
                                helperTextColor={errors.shift_hours ? 'red' : ''}
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
                        <div className="grid grid-cols-[1fr_auto] gap-3">
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

                        {/* Designation */}
                        <InputField
                            label="DESIGNATION"
                            required
                            value={formData.designation}
                            onChange={(e) => handleChange('designation', e.target.value)}
                            placeholder="Enter designation"
                            helperText={errors.designation}
                            helperTextColor={errors.designation ? 'red' : ''}
                        />

                        {/* Assigned Projects */}
                        <SelectField
                            label="ASSIGNED PROJECTS"
                            options={["Project 1", "Project 2", "Project 3"]}
                            value={formData.assigned_projects}
                            onChange={(value) => handleChange('assigned_projects', value)}
                            placeholder="Select project"
                        />

                        {/* Cost Code */}
                        <SelectField
                            label="COST CODE"
                            options={["CC001", "CC002", "CC003"]}
                            value={formData.cost_code}
                            onChange={(value) => handleChange('cost_code', value)}
                            placeholder="Select cost code"
                        />

                        {/* Salary Calculation Method */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'var(--font-family)' }}>
                                Salary to be calculated by
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salary_calculation_method"
                                        value="Shift wise"
                                        checked={formData.salary_calculation_method === 'Shift wise'}
                                        onChange={(e) => handleChange('salary_calculation_method', e.target.value)}
                                        className="w-4 h-4"
                                        style={{ accentColor: 'var(--primary-color)' }}
                                    />
                                    <span className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>Shift wise</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salary_calculation_method"
                                        value="Punch difference"
                                        checked={formData.salary_calculation_method === 'Punch difference'}
                                        onChange={(e) => handleChange('salary_calculation_method', e.target.value)}
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
