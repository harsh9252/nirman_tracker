import React, { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import InputField from './common/InputField';
import SelectField from './common/SelectField';
import TextAreaField from './common/TextAreaField';
import { formatDateForInput } from '../utils/dateUtils';


export default function ProjectFormPopup({ isOpen, onClose, onSubmit, editProject = null, preselectedClientId = null, prefilledClientName = null, prefilledAddress = null, prefilledProjectType = null }) {
    const [formData, setFormData] = useState({
        project_name: '',
        client_id: preselectedClientId || '',
        address: prefilledAddress || '',
        project_type: prefilledProjectType || 'Other',
        status: 'Planning',
        start_date: '',
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
                    start_date: formatDateForInput(editProject.start_date),
                    expected_completion_date: formatDateForInput(editProject.expected_completion_date || editProject.end_date),
                    actual_completion_date: formatDateForInput(editProject.actual_completion_date),
                    estimated_budget: editProject.estimated_budget || '',
                    actual_cost: editProject.actual_cost || '',
                    description: editProject.description || '',
                    assigned_to: editProject.assigned_to || ''
                });
            } else if (preselectedClientId || prefilledAddress || prefilledClientName || prefilledProjectType) {
                setFormData(prev => ({
                    ...prev,
                    client_id: preselectedClientId || prev.client_id || '',
                    address: prefilledAddress || prev.address || '',
                    project_type: prefilledProjectType || prev.project_type || 'Other'
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
                expected_completion_date: '',
                actual_completion_date: '',
                estimated_budget: '',
                actual_cost: '',
                description: '',
                assigned_to: ''
            });
            setErrors({});
        }
    }, [isOpen, editProject, preselectedClientId, prefilledAddress, prefilledClientName, prefilledProjectType]);

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

        if (formData.estimated_budget && isNaN(formData.estimated_budget)) {
            newErrors.estimated_budget = 'Budget must be a number';
        } else if (formData.estimated_budget && parseFloat(formData.estimated_budget) < 0) {
            newErrors.estimated_budget = 'Budget cannot be negative';
        }

        if (formData.actual_cost && isNaN(formData.actual_cost)) {
            newErrors.actual_cost = 'Cost must be a number';
        } else if (formData.actual_cost && parseFloat(formData.actual_cost) < 0) {
            newErrors.actual_cost = 'Cost cannot be negative';
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

            toast.success(editProject ? 'Project updated successfully!' : 'Project created successfully!');

            if (onSubmit) onSubmit();
            onClose();
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error(error.message || 'Failed to save project');
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
                            <InputField
                                label="PROJECT NAME"
                                required
                                value={formData.project_name}
                                onChange={(e) => handleChange('project_name', e.target.value)}
                                placeholder="Enter project name"
                                list="existing-projects"
                                error={errors.project_name}
                            />
                            <datalist id="existing-projects">
                                {projects.map((p, idx) => (
                                    <option key={idx} value={p.project_name} />
                                ))}
                            </datalist>
                        </div>
                        <div className="md:col-span-1">
                            <SelectField
                                label="CLIENT"
                                required
                                options={clients}
                                value={formData.client_id}
                                onChange={(val) => {
                                    handleChange('client_id', val);
                                    const client = clients.find(c => c.id === val);
                                    if (client) {
                                        handleChange('address', client.address || '');
                                    }
                                }}
                                valueKey="id"
                                labelKey={(client) => `${client.client_name}${client.company_name ? ` (${client.company_name})` : ''}`}
                                placeholder="Select a client"
                                error={errors.client_id}
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
                                options={["Construction", "Interior", "Renovation", "Residential", "Commercial", "Other"]}
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
                                error={errors.start_date}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <InputField
                                label="EXPECTED COMPLETION"
                                type="date"
                                value={formData.expected_completion_date}
                                onChange={(e) => handleChange('expected_completion_date', e.target.value)}
                                error={errors.expected_completion_date}
                            />
                        </div>

                        {/* Row 5: ACTUAL COMPLETION | ESTIMATED BUDGET */}
                        <div className="md:col-span-1">
                            <InputField
                                label="ACTUAL COMPLETION"
                                type="date"
                                value={formData.actual_completion_date}
                                onChange={(e) => handleChange('actual_completion_date', e.target.value)}
                                error={errors.actual_completion_date}
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
                                error={errors.estimated_budget}
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
                                error={errors.actual_cost}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <SelectField
                                label="ASSIGNEE"
                                options={users}
                                value={formData.assigned_to}
                                onChange={(val) => handleChange('assigned_to', val)}
                                valueKey="id"
                                labelKey={(user) => `${user.first_name} ${user.last_name || ''} (${user.role})`}
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
