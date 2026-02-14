import React, { useState, useEffect } from 'react';
import { FiEdit2, FiCheck, FiX, FiUser, FiDollarSign, FiFileText, FiUsers, FiPackage, FiChevronLeft, FiChevronRight, FiMapPin, FiActivity, FiLayers, FiAlignLeft, FiList, FiClock, FiArrowRightCircle, FiCreditCard, FiCalendar, FiChevronDown, FiSearch } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import apiService from '../services/api';
import AttendanceFormPopup from './AttendanceFormPopup';
import CreatePartyFormPopup from './CreatePartyFormPopup';
import PayrollDetailsFormPopup from './PayrollDetailsFormPopup';
import AttendanceListItem from './AttendanceListItem';
import PaymentInFormPopup from './PaymentInFormPopup';
import MaterialPurchaseFormPopup from './MaterialPurchaseFormPopup';
import MaterialReturnFormPopup from './MaterialReturnFormPopup';
import PaymentOutFormPopup from './PaymentOutFormPopup';

const ProjectInfo = ({ selectedProject, onClose }) => {
    if (!selectedProject) return null;

    const [activeTab, setActiveTab] = useState('project-info');
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false);

    // Attendance filter state
    const [activeAttendanceFilter, setActiveAttendanceFilter] = useState('all');
    const [isCreatePartyFormOpen, setIsCreatePartyFormOpen] = useState(false);
    const [selectedPartyType, setSelectedPartyType] = useState('Worker');
    const [showAddDropdown, setShowAddDropdown] = useState(false);

    // Payroll workflow state
    const [isPayrollFormOpen, setIsPayrollFormOpen] = useState(false);
    const [currentPartyData, setCurrentPartyData] = useState(null);
    const [partiesList, setPartiesList] = useState([]);

    // Transaction section state
    const [showTransactionDropdown, setShowTransactionDropdown] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceActionMenuOpen, setAttendanceActionMenuOpen] = useState(false);
    const [showPaymentInForm, setShowPaymentInForm] = useState(false);
    const [showMaterialPurchaseForm, setShowMaterialPurchaseForm] = useState(false);
    const [showMaterialReturnForm, setShowMaterialReturnForm] = useState(false);
    const [showPaymentOutForm, setShowPaymentOutForm] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [financialSummary, setFinancialSummary] = useState({
        paymentIn: 0,
        paymentOut: 0,
        materialPurchase: 0,
        materialReturn: 0,
        cashFlow: 0,
        netMargin: 0
    });
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    // Advanced Attendance States
    const [isAttendanceRangeMode, setIsAttendanceRangeMode] = useState(false);
    const [attendanceStartDate, setAttendanceStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceEndDate, setAttendanceEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (activeTab === 'transaction') {
            fetchTransactions();
            fetchFinancialSummary();
        } else if (activeTab === 'party') { // Only fetch parties for 'party' tab
            fetchProjectEmployees();
        }
    }, [activeTab, selectedProject.id]);

    useEffect(() => {
        if (activeTab === 'attendance') {
            fetchProjectEmployees(); // Fetch employees when attendance tab is active
        }
    }, [activeTab, selectedProject.id]);

    useEffect(() => {
        if (activeTab === 'attendance') {
            fetchAttendanceData(); // Fetch attendance data when attendance-related states change
        }
    }, [attendanceDate, isAttendanceRangeMode, attendanceStartDate, attendanceEndDate, activeTab]);


    const fetchProjectEmployees = async () => {
        try {
            const employees = await apiService.getEmployeesByProject(selectedProject.id);
            // Map employees to the same format as parties for consistent rendering
            const mappedEmployees = (employees || []).map(emp => ({
                id: emp.id, // using real numeric ID
                party_name: emp.name,
                party_type: 'Worker',
                designation: emp.designation,
                phone: emp.phone,
                phone_number: emp.phone,
                country_code: '+91',
                email: emp.email,
                salary_amount: emp.salary,
                salary_period: emp.employment_type === 'Monthly' ? 'Month' :
                    emp.employment_type === 'Daily Wage' ? 'Day' :
                        emp.employment_type || 'Month',
                is_employee: true,
                original_id: emp.id,
                status: emp.status,
                employment_type: emp.employment_type,
                profile_image: emp.profile_image
            }));
            setPartiesList(mappedEmployees);

            // After fetching employees, fetch their attendance for the current selection
            // This call is now handled by the new useEffect for attendance-related state changes
            // fetchAttendanceData();
        } catch (error) {
            console.error('Error fetching project employees:', error);
        }
    };

    const fetchAttendanceData = async () => {
        if (!selectedProject?.id) return;
        setLoadingAttendance(true);
        try {
            let records = [];
            if (isAttendanceRangeMode) {
                records = await apiService.getAttendanceByRange(selectedProject.id, attendanceStartDate, attendanceEndDate);
            } else {
                // attendanceDate is already in YYYY-MM-DD format
                records = await apiService.getAttendanceByDate(selectedProject.id, attendanceDate);
            }
            setAttendanceRecords(records || []);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleAttendanceStatusChange = async (employeeId, status, notes = '') => {
        try {
            // attendanceDate is already in YYYY-MM-DD format
            await apiService.recordAttendance({
                employee_id: employeeId,
                project_id: selectedProject.id,
                attendance_date: attendanceDate,
                status: status,
                shift_hours: 8.0, // Default for now
                notes: notes
            });
            fetchAttendanceData(); // Refresh records
        } catch (error) {
            console.error('Error recording attendance:', error);
            alert('Failed to record attendance');
        }
    };

    const fetchTransactions = async () => {
        setLoadingTransactions(true);
        try {
            const data = await apiService.getProjectTransactions(selectedProject.id);
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const fetchFinancialSummary = async () => {
        try {
            const data = await apiService.getProjectFinancialSummary(selectedProject.id);
            setFinancialSummary(data);
        } catch (error) {
            console.error('Error fetching financial summary:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const clientsData = await apiService.getClients();
            setClients(clientsData);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            weekday: 'short'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Planning": return "bg-blue-100 text-blue-700 border-blue-200";
            case "In Progress": return "bg-green-100 text-green-700 border-green-200";
            case "On Hold": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Completed": return "bg-purple-100 text-purple-700 border-purple-200";
            case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const startEditing = () => {
        setEditedData({
            project_name: selectedProject.project_name,
            client_id: selectedProject.client_id,
            address: selectedProject.client_address || '',
            project_type: selectedProject.project_type || 'Other',
            status: selectedProject.status || 'Planning',
            start_date: formatDateForInput(selectedProject.start_date),
            expected_completion_date: formatDateForInput(selectedProject.expected_completion_date),
            actual_completion_date: formatDateForInput(selectedProject.actual_completion_date),
            estimated_budget: selectedProject.estimated_budget || '',
            actual_cost: selectedProject.actual_cost || '',
            description: selectedProject.description || '',
            scope_of_work: selectedProject.scope_of_work || ''
        });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditedData({});
    };

    const saveProject = async () => {
        setSaving(true);
        try {
            const projectData = {
                ...editedData,
                estimated_budget: editedData.estimated_budget ? parseFloat(editedData.estimated_budget) : null,
                actual_cost: editedData.actual_cost ? parseFloat(editedData.actual_cost) : null,
                expected_completion_date: editedData.expected_completion_date || null,
                actual_completion_date: editedData.actual_completion_date || null
            };

            await apiService.updateProject(selectedProject.id, projectData);

            // Refetch the project to get updated client information including address
            const updatedProject = await apiService.getProjectById(selectedProject.id);

            // Update the selectedProject object with fresh data
            Object.assign(selectedProject, updatedProject);

            setIsEditing(false);
            alert('Project updated successfully!');
        } catch (error) {
            console.error('Error updating project:', error);
            alert(error.message || 'Failed to save project. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (direction) => {
        const current = new Date(attendanceDate);
        if (direction === 'next') {
            current.setDate(current.getDate() + 1);
        } else { // 'prev'
            current.setDate(current.getDate() - 1);
        }
        setAttendanceDate(current.toISOString().split('T')[0]);
    };

    const tabs = [
        { id: 'project-info', label: 'Project Info' },
        { id: 'transaction', label: 'Transaction' },
        { id: 'party', label: 'Party' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'task', label: 'Task' },
        { id: 'material', label: 'Material' },
    ];

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-400 overflow-hidden">
            {/* Fixed Top Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
                {/* Main Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #1e40af 100%)' }}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-white hover:opacity-80 transition-opacity"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-family)' }}>
                            {selectedProject.project_name.toUpperCase()}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={saveProject}
                                    disabled={saving}
                                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Save"
                                >
                                    <FiCheck className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Cancel"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={startEditing}
                                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <FiEdit2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto bg-white border-b border-gray-200" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'border-b-2'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            style={activeTab === tab.id ? {
                                borderBottomColor: 'var(--primary-color)',
                                color: 'var(--primary-color)',
                                fontFamily: 'var(--font-family)'
                            } : { fontFamily: 'var(--font-family)' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-4">
                {/* Project Info Tab */}
                {activeTab === 'project-info' && (
                    <div className="p-6 space-y-8 animate-in fade-in duration-500">
                        {/* Progress and Status Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-blue-900 uppercase tracking-wider" style={{ fontFamily: 'var(--font-family)' }}>Project Completion</span>
                                        <span className="text-xl font-bold text-blue-700" style={{ fontFamily: 'var(--font-family)' }}>0%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: '0%' }}
                                        />
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2 font-medium" style={{ fontFamily: 'var(--font-family)' }}>Project is currently in {selectedProject.status} phase</p>
                                </div>
                                <div className="flex flex-col items-center md:items-end gap-2">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-widest" style={{ fontFamily: 'var(--font-family)' }}>Current Status</span>
                                    <span className={`inline-flex px-4 py-1.5 text-xs font-bold rounded-full shadow-sm border ${getStatusColor(selectedProject.status)}`}>
                                        {selectedProject.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Project Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Primary Details */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                                        <FiActivity className="text-blue-500" />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Core Information</span>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Project Name */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Name</label>
                                            <div className="flex items-center gap-2">
                                                <FiPackage className="text-blue-500 flex-shrink-0" size={16} />
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editedData.project_name}
                                                        onChange={(e) => handleFieldChange('project_name', e.target.value)}
                                                        className="w-full text-sm font-semibold border-b-2 border-blue-100 focus:border-blue-500 outline-none py-0.5 transition-colors"
                                                        style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                                                    />
                                                ) : (
                                                    <span className="text-base font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>{selectedProject.project_name}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Project Type */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                                            <div className="flex items-center gap-2">
                                                <FiLayers className="text-blue-500 flex-shrink-0" size={16} />
                                                {isEditing ? (
                                                    <select
                                                        value={editedData.project_type}
                                                        onChange={(e) => handleFieldChange('project_type', e.target.value)}
                                                        className="w-full text-sm font-semibold border-b-2 border-blue-100 focus:border-blue-500 outline-none py-0.5 transition-colors bg-transparent"
                                                        style={{ fontFamily: 'var(--font-family)' }}
                                                    >
                                                        <option value="Residential">Residential</option>
                                                        <option value="Commercial">Commercial</option>
                                                        <option value="Renovation">Renovation</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-base font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>{selectedProject.project_type || 'Other'}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Client */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</label>
                                            <div className="flex items-center gap-2">
                                                <FiUser className="text-blue-500 flex-shrink-0" size={16} />
                                                {isEditing ? (
                                                    <select
                                                        value={editedData.client_id}
                                                        onChange={(e) => {
                                                            const clientId = e.target.value;
                                                            handleFieldChange('client_id', clientId);
                                                            const client = clients.find(c => c.id === parseInt(clientId));
                                                            if (client) {
                                                                handleFieldChange('address', client.address || '');
                                                            }
                                                        }}
                                                        className="w-full text-sm font-semibold border-b-2 border-blue-100 focus:border-blue-500 outline-none py-0.5 transition-colors bg-transparent"
                                                        style={{ fontFamily: 'var(--font-family)' }}
                                                    >
                                                        {clients.map(client => (
                                                            <option key={client.id} value={client.id}>
                                                                {client.client_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-base font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>{selectedProject.client_name || 'N/A'}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</label>
                                            <div className="flex items-center gap-2">
                                                <FiMapPin className="text-blue-500 flex-shrink-0" size={16} />
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editedData.address}
                                                        onChange={(e) => handleFieldChange('address', e.target.value)}
                                                        className="w-full text-sm font-semibold border-b-2 border-blue-100 focus:border-blue-500 outline-none py-0.5 transition-colors"
                                                        placeholder="Site location"
                                                        style={{ fontFamily: 'var(--font-family)' }}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>{selectedProject.client_address || 'N/A'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description & Scope */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                                            <FiAlignLeft className="text-blue-500" />
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</span>
                                        </div>
                                        <div className="p-4">
                                            {isEditing ? (
                                                <textarea
                                                    value={editedData.description}
                                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                                    rows={4}
                                                    className="w-full text-sm font-medium border border-gray-200 rounded-lg p-3 focus:border-blue-500 outline-none transition-colors"
                                                    style={{ fontFamily: 'var(--font-family)' }}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-family)' }}>{selectedProject.description || 'No description provided.'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                                            <FiList className="text-blue-500" />
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Scope of Work</span>
                                        </div>
                                        <div className="p-4">
                                            {isEditing ? (
                                                <textarea
                                                    value={editedData.scope_of_work}
                                                    onChange={(e) => handleFieldChange('scope_of_work', e.target.value)}
                                                    rows={4}
                                                    className="w-full text-sm font-medium border border-gray-200 rounded-lg p-3 focus:border-blue-500 outline-none transition-colors"
                                                    style={{ fontFamily: 'var(--font-family)' }}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-family)' }}>{selectedProject.scope_of_work || 'Scope not defined.'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Details (Timeline & Budget) */}
                            <div className="space-y-6">
                                {/* Timeline Card */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                                        <FiClock className="text-blue-500" />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Timeline</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-blue-400" size={14} />
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        value={editedData.start_date}
                                                        onChange={(e) => handleFieldChange('start_date', e.target.value)}
                                                        className="w-full text-sm font-semibold border-b border-gray-200 outline-none focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-800">{formatDate(selectedProject.start_date)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 border-t border-gray-50 pt-3">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Completion</label>
                                            <div className="flex items-center gap-2">
                                                <FiClock className="text-amber-400" size={14} />
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        value={editedData.expected_completion_date}
                                                        onChange={(e) => handleFieldChange('expected_completion_date', e.target.value)}
                                                        className="w-full text-sm font-semibold border-b border-gray-200 outline-none focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-800">{formatDate(selectedProject.expected_completion_date)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 border-t border-gray-50 pt-3">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actual Completion</label>
                                            <div className="flex items-center gap-2">
                                                <FiArrowRightCircle className="text-emerald-400" size={14} />
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        value={editedData.actual_completion_date}
                                                        onChange={(e) => handleFieldChange('actual_completion_date', e.target.value)}
                                                        className="w-full text-sm font-semibold border-b border-gray-200 outline-none focus:border-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-800">{formatDate(selectedProject.actual_completion_date)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Card */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                                        <FiDollarSign className="text-emerald-500" />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Financial Overview</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimated Budget</label>
                                            <div className="flex items-center gap-2">
                                                <FiCreditCard className="text-emerald-500" size={14} />
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editedData.estimated_budget}
                                                        onChange={(e) => handleFieldChange('estimated_budget', e.target.value)}
                                                        className="w-full text-sm font-bold text-emerald-600 border-b border-gray-200 outline-none focus:border-emerald-500 bg-transparent"
                                                        placeholder="0.00"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-emerald-600 tracking-tight">{formatCurrency(selectedProject.estimated_budget)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 border-t border-gray-50 pt-3">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actual Cost to Date</label>
                                            <div className="flex items-center gap-2">
                                                <FiDollarSign className="text-rose-500" size={14} />
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editedData.actual_cost}
                                                        onChange={(e) => handleFieldChange('actual_cost', e.target.value)}
                                                        className="w-full text-sm font-bold text-rose-600 border-b border-gray-200 outline-none focus:border-rose-500 bg-transparent"
                                                        placeholder="0.00"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-bold text-rose-600 tracking-tight">{formatCurrency(selectedProject.actual_cost)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transaction Tab */}
                {activeTab === 'transaction' && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-500">
                        {/* Summary Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Financial Ledger</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Transaction History</p>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowTransactionDropdown(!showTransactionDropdown)}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    + NEW TRANSACTION
                                    <FiChevronDown size={14} className={`transition-transform duration-300 ${showTransactionDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showTransactionDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-gray-100 rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                                        <button
                                            onClick={() => { setShowTransactionDropdown(false); setShowPaymentInForm(true); }}
                                            className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm font-bold text-green-600 flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FiArrowRightCircle size={16} />
                                            </div>
                                            PAYMENT IN
                                        </button>
                                        <button
                                            onClick={() => { setShowTransactionDropdown(false); setShowPaymentOutForm(true); }}
                                            className="w-full text-left px-4 py-3 hover:bg-rose-50 text-sm font-bold text-rose-600 flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                                                <FiArrowRightCircle size={16} className="rotate-180" />
                                            </div>
                                            PAYMENT OUT
                                        </button>
                                        <div className="h-[1px] bg-gray-100 my-1" />
                                        <button
                                            onClick={() => { setShowTransactionDropdown(false); setShowMaterialPurchaseForm(true); }}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-bold text-blue-600 flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FiPackage size={16} />
                                            </div>
                                            MATERIAL PURCHASE
                                        </button>
                                        <button
                                            onClick={() => { setShowTransactionDropdown(false); setShowMaterialReturnForm(true); }}
                                            className="w-full text-left px-4 py-3 hover:bg-amber-50 text-sm font-bold text-amber-600 flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <FiPackage size={16} />
                                            </div>
                                            MATERIAL RETURN
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Project Balance Card */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Cash Flow</p>
                                            <p className="text-2xl font-black text-gray-900">₹ {financialSummary.cashFlow.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3 pt-1">
                                            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">IN: ₹ {financialSummary.paymentIn.toLocaleString()}</span>
                                            </div>
                                            <div className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">OUT: ₹ {financialSummary.paymentOut.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <FiCreditCard size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Margin Card */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Project Margin</p>
                                            <p className={`text-2xl font-black ${financialSummary.netMargin >= 0 ? 'text-green-600' : 'text-rose-600'}`}>₹ {financialSummary.netMargin.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3 pt-1">
                                            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">SALES: ₹ {financialSummary.paymentIn.toLocaleString()}</span>
                                            </div>
                                            <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">EXP: ₹ {(financialSummary.paymentOut + financialSummary.materialPurchase - financialSummary.materialReturn).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <FiDollarSign size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-6">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Details</span>
                                    </div>
                                    <div className="col-span-3 text-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</span>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status / Date</span>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction List */}
                            <div className="divide-y divide-gray-100">
                                {loadingTransactions ? (
                                    <div className="p-12 text-center">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-sm text-gray-500 font-medium">Fetching transactions...</p>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <div key={tx.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-6 flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'Payment In' ? 'bg-green-100 text-green-600' :
                                                        tx.type === 'Payment Out' ? 'bg-rose-100 text-rose-600' :
                                                            tx.type === 'Material Purchase' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-amber-100 text-amber-600'
                                                        }`}>
                                                        {tx.type === 'Payment In' ? <FiArrowRightCircle size={18} /> :
                                                            tx.type === 'Payment Out' ? <FiArrowRightCircle size={18} className="rotate-180" /> :
                                                                <FiPackage size={18} />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{tx.party_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {tx.type} {tx.payment_method ? `• ${tx.payment_method.toUpperCase()}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-span-3 text-center">
                                                    <p className={`text-sm font-black ${tx.type === 'Payment In' || tx.type === 'Material Return' ? 'text-green-600' : 'text-rose-600'
                                                        }`}>
                                                        {tx.type === 'Payment In' || tx.type === 'Material Return' ? '+' : '-'} ₹ {parseFloat(tx.amount).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="col-span-3 text-right">
                                                    <p className="text-sm font-bold text-gray-700">{new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">RECORDED</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* Empty State */
                                    <div className="p-16 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-6">
                                            <FiList className="text-gray-300" size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">No Transactions Recorded</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium">Click the "New Transaction" button to start tracking project payments and material procurement.</p>
                                        <button
                                            onClick={() => setShowTransactionDropdown(true)}
                                            className="text-blue-600 font-bold text-sm hover:underline"
                                        >
                                            ADD YOUR FIRST TRANSACTION
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Party Tab */}
                {activeTab === 'party' && (
                    <div className="p-6 space-y-8 animate-in fade-in duration-500">
                        {/* Client Overview Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                        <FiUser size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Client Details</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Stakeholder</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-wider">ACTIVE CLIENT</span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Name</label>
                                    <p className="text-sm font-bold text-gray-800">{selectedProject.client_name || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Phone</label>
                                    <p className="text-sm font-bold text-gray-800">{clients.find(c => c.id === selectedProject.client_id)?.phone_number || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Address</label>
                                    <p className="text-sm font-semibold text-gray-600 leading-tight">{selectedProject.client_address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Associated Parties Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Assigned Personnel ({partiesList.length})</h3>
                                <button
                                    onClick={() => {
                                        setSelectedPartyType('Worker');
                                        setIsCreatePartyFormOpen(true);
                                    }}
                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                                >
                                    + ADD NEW PARTY
                                </button>
                            </div>

                            {partiesList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {partiesList.map((party) => (
                                        <div key={party.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                                                    {party.party_name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{party.party_name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{party.party_type} / {party.designation || 'No Role'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setCurrentPartyData(party);
                                                        setIsPayrollFormOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this staff member from the project?')) {
                                                            setPartiesList(prev => prev.filter(p => p.id !== party.id));
                                                        }
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <FiUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No assigned parties found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-500">
                        {/* Attendance Header Controls */}
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 shadow-inner w-fit">
                                        <button
                                            onClick={() => setIsAttendanceRangeMode(false)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${!isAttendanceRangeMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            SINGLE DATE
                                        </button>
                                        <button
                                            onClick={() => setIsAttendanceRangeMode(true)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isAttendanceRangeMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            DATE RANGE
                                        </button>
                                    </div>

                                    <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-inner">
                                        {!isAttendanceRangeMode ? (
                                            <>
                                                <button
                                                    onClick={() => handleDateChange('prev')}
                                                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-blue-600 shadow-sm hover:shadow"
                                                >
                                                    <FiChevronLeft size={20} />
                                                </button>
                                                <div className="px-4 flex flex-col items-center min-w-[140px]">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Attendance Date</span>
                                                    <input
                                                        type="date"
                                                        value={attendanceDate}
                                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                                        className="text-sm font-bold text-gray-800 bg-transparent outline-none text-center"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleDateChange('next')}
                                                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-blue-600 shadow-sm hover:shadow"
                                                >
                                                    <FiChevronRight size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">From</span>
                                                    <input
                                                        type="date"
                                                        value={attendanceStartDate}
                                                        onChange={(e) => setAttendanceStartDate(e.target.value)}
                                                        className="text-xs font-bold text-gray-800 bg-transparent outline-none"
                                                    />
                                                </div>
                                                <span className="text-gray-300 font-bold mx-1">→</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">To</span>
                                                    <input
                                                        type="date"
                                                        value={attendanceEndDate}
                                                        onChange={(e) => setAttendanceEndDate(e.target.value)}
                                                        className="text-xs font-bold text-gray-800 bg-transparent outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Attendance Stats Cards */}
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                            <FiCheck size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none">Present</p>
                                            <p className="text-lg font-bold text-green-700 leading-tight">
                                                {isAttendanceRangeMode
                                                    ? attendanceRecords.filter(r => r.status === 'Present').length
                                                    : partiesList.filter(p => attendanceRecords.some(r => r.employee_id === p.id && r.status === 'Present')).length}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                            <FiX size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-none">Absent</p>
                                            <p className="text-lg font-bold text-rose-700 leading-tight">
                                                {isAttendanceRangeMode
                                                    ? attendanceRecords.filter(r => r.status !== 'Present').length
                                                    : partiesList.filter(p => attendanceRecords.some(r => r.employee_id === p.id && r.status !== 'Present')).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 w-full sm:w-auto">
                                    <button
                                        onClick={() => setActiveAttendanceFilter('all')}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeAttendanceFilter === 'all' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        ALL STAFF
                                    </button>
                                    <button
                                        onClick={() => setActiveAttendanceFilter('site-staff')}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeAttendanceFilter === 'site-staff' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        SITE STAFF
                                    </button>
                                    <button
                                        onClick={() => setActiveAttendanceFilter('labour-contractor')}
                                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeAttendanceFilter === 'labour-contractor' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        CONTRACTORS
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiSearch size={14} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setAttendanceActionMenuOpen(!attendanceActionMenuOpen)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                                        >
                                            <FiUsers size={18} />
                                            MANAGE
                                            <FiChevronDown size={14} className={`transition-transform duration-300 ${attendanceActionMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {attendanceActionMenuOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-full sm:w-[220px] bg-white border border-gray-100 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPartyType('Worker');
                                                        setIsCreatePartyFormOpen(true);
                                                        setAttendanceActionMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-bold text-gray-700 flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                        <FiUser size={16} />
                                                    </div>
                                                    ADD SITE STAFF
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPartyType('Contractor');
                                                        setIsCreatePartyFormOpen(true);
                                                        setAttendanceActionMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-sm font-bold text-gray-700 flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                                        <FiUsers size={16} />
                                                    </div>
                                                    ADD CONTRACTOR
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parties List or Empty State */}
                        {partiesList.length > 0 ? (
                            <div className="space-y-1">
                                <div className="grid grid-cols-1 gap-3">
                                    {partiesList
                                        .filter(p => {
                                            const matchesFilter = activeAttendanceFilter === 'all' ||
                                                (activeAttendanceFilter === 'site-staff' && p.party_type === 'Worker') ||
                                                (activeAttendanceFilter === 'labour-contractor' && p.party_type === 'Contractor');
                                            const matchesSearch = p.party_name.toLowerCase().includes(searchQuery.toLowerCase());
                                            return matchesFilter && matchesSearch;
                                        })
                                        .map((party) => {
                                            // Find record for this employee
                                            const record = isAttendanceRangeMode ? null : attendanceRecords.find(r => r.employee_id === party.id);
                                            const employeeRecords = attendanceRecords.filter(r => r.employee_id === party.id);
                                            const absentDates = employeeRecords
                                                .filter(r => r.status !== 'Present')
                                                .map(r => r.attendance_date);

                                            return (
                                                <AttendanceListItem
                                                    key={party.id}
                                                    party={party}
                                                    currentStatus={record?.status || 'Not Recorded'}
                                                    isRangeMode={isAttendanceRangeMode}
                                                    absentDates={absentDates}
                                                    rangeStats={isAttendanceRangeMode ? {
                                                        present: employeeRecords.filter(r => r.status === 'Present').length,
                                                        absent: employeeRecords.filter(r => r.status !== 'Present').length,
                                                        total: employeeRecords.length
                                                    } : null}
                                                    onStatusChange={(partyId, status) => handleAttendanceStatusChange(partyId, status)}
                                                    onUpdate={(partyId, formData) => {
                                                        setPartiesList(prev => prev.map(p =>
                                                            p.id === partyId ? { ...p, ...formData } : p
                                                        ));
                                                    }}
                                                    onDelete={(partyId) => {
                                                        setPartiesList(prev => prev.filter(p => p.id !== partyId));
                                                    }}
                                                />
                                            );
                                        })}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 py-16 px-4 text-center">
                                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-6">
                                    <FiUsers className="text-gray-300" size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">No Attendance Records</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium">Use the "Manage Staff" button above to add personnel to this project and track their daily attendance.</p>
                                <button
                                    onClick={() => setAttendanceActionMenuOpen(true)}
                                    className="text-blue-600 font-bold text-sm hover:underline"
                                >
                                    GET STARTED BY ADDING STAFF
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Task Tab */}
                {activeTab === 'task' && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FiFileText className="text-blue-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">Tasks Pipeline</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium">Efficiently manage project milestones and daily tasks. This feature is being finalized to provide real-time tracking.</p>
                            <button className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all opacity-50 cursor-not-allowed">
                                COMING SOON
                            </button>
                        </div>
                    </div>
                )}

                {/* Material Tab */}
                {activeTab === 'material' && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FiPackage className="text-amber-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">Resources & Inventory</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium">Track material procurement, consumption, and stock levels across the site.</p>
                            <button className="px-8 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all opacity-50 cursor-not-allowed">
                                UNDER DEVELOPMENT
                            </button>
                        </div>
                    </div>
                )}

                {/* Attendance Form Popup */}
                < AttendanceFormPopup
                    isOpen={isAttendanceFormOpen}
                    onClose={() => setIsAttendanceFormOpen(false)}
                    onSubmit={() => {
                        setIsAttendanceFormOpen(false);
                    }}
                    projectId={selectedProject.id}
                />

                {/* Create Party Form Popup */}
                < CreatePartyFormPopup
                    isOpen={isCreatePartyFormOpen}
                    onClose={() => setIsCreatePartyFormOpen(false)}
                    onSubmit={(partyData) => {
                        setCurrentPartyData(partyData);
                        setIsCreatePartyFormOpen(false);
                        setIsPayrollFormOpen(true);
                    }}
                    projectId={selectedProject.id}
                    defaultPartyType={selectedPartyType}
                />

                {/* Payroll Details Form Popup */}
                < PayrollDetailsFormPopup
                    isOpen={isPayrollFormOpen}
                    onClose={() => {
                        setIsPayrollFormOpen(false);
                        setCurrentPartyData(null);
                    }}
                    onSubmit={(payrollData) => {
                        const newParty = {
                            ...currentPartyData,
                            ...payrollData,
                            id: Date.now()
                        };
                        setPartiesList(prev => [...prev, newParty]);
                        setIsPayrollFormOpen(false);
                        setCurrentPartyData(null);
                    }}
                    partyData={currentPartyData}
                />

                {/* Payment In Form Popup */}
                <PaymentInFormPopup
                    isOpen={showPaymentInForm}
                    onClose={() => setShowPaymentInForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    onSuccess={() => {
                        fetchTransactions();
                        fetchFinancialSummary();
                    }}
                />

                {/* Material Purchase Form Popup */}
                <MaterialPurchaseFormPopup
                    isOpen={showMaterialPurchaseForm}
                    onClose={() => setShowMaterialPurchaseForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    onSuccess={() => {
                        fetchTransactions();
                        fetchFinancialSummary();
                    }}
                />

                {/* Material Return Form Popup */}
                <MaterialReturnFormPopup
                    isOpen={showMaterialReturnForm}
                    onClose={() => setShowMaterialReturnForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    onSuccess={() => {
                        fetchTransactions();
                        fetchFinancialSummary();
                    }}
                />

                {/* Payment Out Form Popup */}
                <PaymentOutFormPopup
                    isOpen={showPaymentOutForm}
                    onClose={() => setShowPaymentOutForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    onSuccess={() => {
                        fetchTransactions();
                        fetchFinancialSummary();
                    }}
                />
            </div>
        </div>
    );
};

export default ProjectInfo;
