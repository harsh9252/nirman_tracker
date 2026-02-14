import React, { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import apiService from '../services/api';

// InputField component matching LeadFormPopup style
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

// TextAreaField component
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

// SelectField component matching LeadFormPopup style
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

export default function ProjectFormPopup({ isOpen, onClose, onSubmit, editProject = null, preselectedClientId = null, prefilledClientName = null, prefilledAddress = null }) {
    const [formData, setFormData] = useState({
        project_name: '',
        client_id: preselectedClientId || '',
        address: prefilledAddress || '',
        project_type: 'Other',
        status: 'Planning',
        start_date: '',
        end_date: '',
        expected_completion_date: '',
        actual_completion_date: '',
        estimated_budget: '',
        actual_cost: '',
        description: '',
        assigned_to: ''
    });

    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchClients();
            fetchUsers();
            fetchProjects();
            if (editProject) {
                setFormData({
                    project_name: editProject.project_name || '',
                    client_id: editProject.client_id || '',
                    address: editProject.client_address || '',
                    project_type: editProject.project_type || 'Other',
                    status: editProject.status || 'Planning',
                    start_date: editProject.start_date || '',
                    end_date: editProject.end_date || editProject.expected_completion_date || '',
                    expected_completion_date: editProject.expected_completion_date || '',
                    actual_completion_date: editProject.actual_completion_date || '',
                    estimated_budget: editProject.estimated_budget || '',
                    actual_cost: editProject.actual_cost || '',
                    description: editProject.description || '',
                    assigned_to: editProject.assigned_to || ''
                });
            } else if (preselectedClientId || prefilledAddress || prefilledClientName) {
                setFormData(prev => ({
                    ...prev,
                    client_id: preselectedClientId || prev.client_id || '',
                    address: prefilledAddress || prev.address || ''
                }));
            }
        } else {
            // Reset form when closed
            setFormData({
                project_name: '',
                client_id: '',
                address: '',
                project_type: 'Other',
                status: 'Planning',
                start_date: '',
                end_date: '',
                expected_completion_date: '',
                actual_completion_date: '',
                estimated_budget: '',
                actual_cost: '',
                description: '',
                assigned_to: ''
            });
            setErrors({});
        }
    }, [isOpen, editProject, preselectedClientId, prefilledAddress, prefilledClientName]);

    const fetchClients = async () => {
        try {
            const clientsData = await apiService.getClients();
            setClients(clientsData);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const usersData = await apiService.getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const projectsData = await apiService.getProjects();
            setProjects(projectsData);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.project_name.trim()) {
            newErrors.project_name = 'Project name is required';
        }

        if (!formData.client_id) {
            newErrors.client_id = 'Client is required';
        }

        if (!formData.start_date) {
            newErrors.start_date = 'Start date is required';
        }

        if (formData.expected_completion_date && formData.start_date) {
            if (new Date(formData.expected_completion_date) < new Date(formData.start_date)) {
                newErrors.expected_completion_date = 'Expected completion date must be after start date';
            }
        }

        if (formData.actual_completion_date && formData.start_date) {
            if (new Date(formData.actual_completion_date) < new Date(formData.start_date)) {
                newErrors.actual_completion_date = 'Actual completion date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            console.log('Validation failed:', errors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Get current user ID from localStorage
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const projectData = {
                ...formData,
                created_by: user?.id || null,
                // Convert empty strings to null for optional fields
                expected_completion_date: formData.expected_completion_date || null,
                actual_completion_date: formData.actual_completion_date || null,
                estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : null,
                actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
                description: formData.description || null
            };

            console.log('Submitting project data:', projectData);

            let result;
            if (editProject) {
                result = await apiService.updateProject(editProject.id, projectData);
                console.log('Project updated:', result);
            } else {
                result = await apiService.createProject(projectData);
                console.log('Project created:', result);
            }

            alert(editProject ? 'Project updated successfully!' : 'Project created successfully!');

            if (onSubmit) onSubmit();
            onClose();
        } catch (error) {
            console.error('Error saving project:', error);
            alert(error.message || 'Failed to save project');
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
            <div className="w-full max-w-4xl bg-white rounded-xl flex flex-col max-h-[75vh] sm:max-h-[90vh] mt-2 mb-2 sm:mt-0 sm:mb-0">
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
                            {editProject ? 'EDIT PROJECT' : 'NEW PROJECT'}
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
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--form-gap)' }}>
                        {/* Row 1: PROJECT NAME* | CLIENT* */}
                        <div className="md:col-span-1">
                            <div className="relative" style={{ marginBottom: 'var(--form-margin-bottom)' }}>
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider font-medium" style={{ fontSize: '11px', zIndex: 10 }}>
                                    PROJECT NAME <span className="text-red-500">*</span>
                                </label>
                                <div className="relative flex flex-col">
                                    <input
                                        type="text"
                                        list="existing-projects"
                                        value={formData.project_name}
                                        onChange={(e) => handleChange('project_name', e.target.value)}
                                        placeholder="Enter or select project name"
                                        style={{
                                            width: '100%',
                                            height: 'var(--input-height)',
                                            padding: 'var(--input-padding)',
                                            fontSize: 'var(--input-font-size)',
                                            fontFamily: 'var(--font-family)',
                                            border: `1px solid ${errors.project_name ? '#ef4444' : 'var(--input-border-color)'}`,
                                            borderRadius: 'var(--input-border-radius)',
                                            backgroundColor: 'var(--input-bg-color)',
                                            outline: 'none'
                                        }}
                                    />
                                    <datalist id="existing-projects">
                                        {projects.map((p, idx) => (
                                            <option key={idx} value={p.project_name} />
                                        ))}
                                    </datalist>
                                    {errors.project_name && (
                                        <span className="text-red-500 text-[11px] mt-1">{errors.project_name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <SelectField
                                label="CLIENT"
                                required
                                options={clients.map(client =>
                                    `${client.client_name}${client.company_name ? ` (${client.company_name})` : ''}`
                                )}
                                value={(() => {
                                    const client = clients.find(c => c.id === parseInt(formData.client_id));
                                    if (client) return `${client.client_name}${client.company_name ? ` (${client.company_name})` : ''}`;
                                    return prefilledClientName || '';
                                })()}
                                onChange={(selected) => {
                                    const client = clients.find(c =>
                                        `${c.client_name}${c.company_name ? ` (${c.company_name})` : ''}` === selected
                                    );
                                    if (client) {
                                        handleChange('client_id', client.id);
                                        // Auto-fill address when client is selected
                                        handleChange('address', client.address || '');
                                    }
                                }}
                                placeholder="Select a client"
                            />
                        </div>

                        {/* Row 2: ADDRESS (full width, auto-filled from client) */}
                        <div className="md:col-span-2">
                            <InputField
                                label="ADDRESS"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Enter or select client to auto-fill address"
                            />
                        </div>

                        {/* Row 3: PROJECT TYPE | STATUS */}
                        <div className="md:col-span-1">
                            <SelectField
                                label="PROJECT TYPE"
                                options={["Residential", "Commercial", "Renovation", "Other"]}
                                value={formData.project_type}
                                onChange={(value) => handleChange('project_type', value)}
                                placeholder="Select project type"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <SelectField
                                label="STATUS"
                                options={["Planning", "In Progress", "On Hold", "Completed", "Cancelled"]}
                                value={formData.status}
                                onChange={(value) => handleChange('status', value)}
                                placeholder="Select status"
                            />
                        </div>

                        {/* Row 4: START DATE* | END DATE */}
                        <div className="md:col-span-1">
                            <InputField
                                label="START DATE"
                                required
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                helperText={errors.start_date}
                                helperTextColor={errors.start_date ? 'red' : ''}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <InputField
                                label="END DATE"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => handleChange('end_date', e.target.value)}
                                helperText={errors.end_date}
                                helperTextColor={errors.end_date ? 'red' : ''}
                            />
                        </div>

                        {/* Row 5: ACTUAL COMPLETION | ESTIMATED BUDGET */}
                        <div className="md:col-span-1">
                            <InputField
                                label="ACTUAL COMPLETION"
                                type="date"
                                value={formData.actual_completion_date}
                                onChange={(e) => handleChange('actual_completion_date', e.target.value)}
                                helperText={errors.actual_completion_date}
                                helperTextColor={errors.actual_completion_date ? 'red' : ''}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <InputField
                                label="ESTIMATED BUDGET"
                                type="number"
                                value={formData.estimated_budget}
                                onChange={(e) => handleChange('estimated_budget', e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>

                        {/* Row 6: ACTUAL COST | ASSIGNEE */}
                        <div className="md:col-span-1">
                            <InputField
                                label="ACTUAL COST"
                                type="number"
                                value={formData.actual_cost}
                                onChange={(e) => handleChange('actual_cost', e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <SelectField
                                label="ASSIGNEE"
                                options={users.map(user =>
                                    `${user.first_name} ${user.last_name || ''} (${user.role})`
                                )}
                                value={(() => {
                                    const user = users.find(u => u.id === parseInt(formData.assigned_to));
                                    return user ? `${user.first_name} ${user.last_name || ''} (${user.role})` : '';
                                })()}
                                onChange={(selected) => {
                                    const user = users.find(u =>
                                        `${u.first_name} ${u.last_name || ''} (${u.role})` === selected
                                    );
                                    if (user) {
                                        handleChange('assigned_to', user.id);
                                    }
                                }}
                                placeholder="Select assignee"
                            />
                        </div>

                        {/* Row 7: DESCRIPTION (full width) */}
                        <div className="md:col-span-2">
                            <TextAreaField
                                label="DESCRIPTION"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Enter project description"
                                rows={4}
                                maxLength={1000}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
