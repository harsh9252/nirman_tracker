import React, { useState, useEffect } from 'react';
import { FiEdit2, FiCheck, FiX, FiUser, FiDollarSign, FiFileText, FiUsers, FiPackage, FiChevronLeft, FiChevronRight, FiMapPin, FiActivity, FiLayers, FiAlignLeft, FiList, FiClock, FiArrowRightCircle, FiCreditCard, FiCalendar, FiChevronDown, FiSearch, FiAlertCircle, FiRefreshCcw } from 'react-icons/fi';
import { FaTrash, FaRupeeSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AttendanceFormPopup from './AttendanceFormPopup';
import CreatePartyFormPopup from './CreatePartyFormPopup';
import PayrollDetailsFormPopup from './PayrollDetailsFormPopup';
import AttendanceListItem from './AttendanceListItem';
import PaymentInFormPopup from './PaymentInFormPopup';
import MaterialPurchaseFormPopup from './MaterialPurchaseFormPopup';
import MaterialReturnFormPopup from './MaterialReturnFormPopup';
import MaterialRequestFormPopup from './MaterialRequestFormPopup';
import MaterialUsageFormPopup from './MaterialUsageFormPopup';
import MaterialUsageReturnFormPopup from './MaterialUsageReturnFormPopup';
import PaymentOutFormPopup from './PaymentOutFormPopup';
import SalaryPaymentPopup from './SalaryPaymentPopup';

import TaskFormPopup from './TaskFormPopup';
import TransactionTable from './TransactionTable';
import SelectEmployeePopup from './SelectEmployeePopup';
import ConfirmationPopup from './ConfirmationPopup';
import useOnClickOutside from '../hooks/useOnClickOutside';
import { formatDateForInput, formatDateForDisplay } from '../utils/dateUtils';


const ProjectInfo = ({ selectedProject, onClose }) => {
    const { user } = useAuth();
    if (!selectedProject) return null;

    const [activeTab, setActiveTab] = useState('project-info');
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false);

    // Attendance filter state
    const [activeAttendanceFilter, setActiveAttendanceFilter] = useState('all');
    const [isCreatePartyFormOpen, setIsCreatePartyFormOpen] = useState(false);
    const [selectedPartyType, setSelectedPartyType] = useState('Worker');

    // Payroll workflow state
    const [isPayrollFormOpen, setIsPayrollFormOpen] = useState(false);
    const [currentPartyData, setCurrentPartyData] = useState(null);
    const [partiesList, setPartiesList] = useState([]);

    // Transaction section state
    const [showTransactionDropdown, setShowTransactionDropdown] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [showPaymentInForm, setShowPaymentInForm] = useState(false);
    const [showMaterialPurchaseForm, setShowMaterialPurchaseForm] = useState(false);
    const [showMaterialReturnForm, setShowMaterialReturnForm] = useState(false);
    const [showMaterialRequestForm, setShowMaterialRequestForm] = useState(false);
    const [showMaterialUsageForm, setShowMaterialUsageForm] = useState(false);
    const [showUsageReturnForm, setShowUsageReturnForm] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [materialRequests, setMaterialRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [materialActiveSubTab, setMaterialActiveSubTab] = useState('requests'); // 'requests', 'stock', 'history'
    const [stockSummary, setStockSummary] = useState([]);
    const [inventoryHistory, setInventoryHistory] = useState([]);
    const [loadingInventory, setLoadingInventory] = useState(false);

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
    const [isSelectEmployeeOpen, setIsSelectEmployeeOpen] = useState(false);

    // Task and Material Tab states
    const [projectTasks, setProjectTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Payroll Tab states
    const [payrollSlips, setPayrollSlips] = useState([]);
    const [loadingPayroll, setLoadingPayroll] = useState(false);
    const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
    const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);

    // Confirmation Popup State
    const [confirmPopup, setConfirmPopup] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    // Refs for click outside
    const transactionDropdownRef = React.useRef(null);

    // Click outside handlers
    useOnClickOutside(transactionDropdownRef, () => setShowTransactionDropdown(false));

    useEffect(() => {
        fetchClients();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (activeTab === 'transaction') {
            fetchTransactions();
            fetchFinancialSummary();

        } else if (activeTab === 'task') {
            fetchProjectTasks();
        } else if (activeTab === 'material') {
            fetchMaterialRequests();
            fetchInventoryData();
        }
    }, [activeTab, selectedProject.id]);

    const fetchMaterialRequests = async () => {
        if (selectedProject?.id) {
            setLoadingRequests(true);
            try {
                const data = await apiService.getMaterialRequestsByProject(selectedProject.id);
                setMaterialRequests(data || []);
            } catch (error) {
                console.error('Error fetching material requests:', error);
            } finally {
                setLoadingRequests(false);
            }
        }
    };

    const fetchInventoryData = async () => {
        if (selectedProject?.id) {
            setLoadingInventory(true);
            try {
                const summary = await apiService.getStockSummary(selectedProject.id);
                setStockSummary(summary || []);
                const history = await apiService.getProjectInventory(selectedProject.id);
                setInventoryHistory(history || []);
            } catch (error) {
                console.error('Error fetching inventory data:', error);
            } finally {
                setLoadingInventory(false);
            }
        }
    };

    const fetchPayrollSlips = async () => {
        if (!selectedProject?.id) return;
        setLoadingPayroll(true);
        try {
            const slips = await apiService.getSalarySlipsByProject(
                selectedProject.id,
                payrollMonth,
                payrollYear
            );
            setPayrollSlips(slips || []);
        } catch (error) {
            console.error('Error fetching payroll slips:', error);
            toast.error('Failed to load payroll data');
        } finally {
            setLoadingPayroll(false);
        }
    };

    const handleGeneratePayroll = async () => {
        setLoadingPayroll(true);
        try {
            const employees = await apiService.getEmployeesByProject(selectedProject.id);
            const promises = employees.map(emp =>
                apiService.generateSalarySlip({
                    employee_id: emp.id,
                    month: payrollMonth,
                    year: payrollYear
                })
            );
            await Promise.all(promises);
            toast.success('Payroll generated successfully');
            fetchPayrollSlips();
        } catch (error) {
            console.error('Error generating payroll:', error);
            toast.error('Failed to generate payroll');
        } finally {
            setLoadingPayroll(false);
        }
    };

    const handleRecordPayment = async (paymentData) => {
        try {
            await apiService.recordSalaryPayment({
                salary_slip_id: selectedSlip.id,
                employee_id: selectedSlip.employee_id,
                ...paymentData
            });
            toast.success('Payment recorded successfully');
            setShowPaymentForm(false);
            fetchPayrollSlips();
        } catch (error) {
            console.error('Error recording payment:', error);
            toast.error('Failed to record payment');
        }
    };

    useEffect(() => {
        if (activeTab === 'payroll') {
            fetchPayrollSlips();
        }
    }, [activeTab, payrollMonth, payrollYear]);


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
                id: emp.id,
                party_name: emp.name,
                party_type: emp.party_type || 'Worker',
                party_id: emp.party_id_custom,
                designation: emp.designation,
                phone: emp.phone,
                phone_number: emp.phone,
                country_code: '+91',
                email: emp.email,
                salary_amount: emp.salary,
                salary_period: emp.salary_period || (emp.employment_type === 'Monthly' ? 'Month' :
                    emp.employment_type === 'Daily Wage' ? 'Day' :
                        emp.employment_type || 'Month'),
                is_employee: true,
                original_id: emp.id,
                status: emp.status,
                employment_type: emp.employment_type,
                profile_image: emp.profile_image,
                // Add extended fields
                father_name: emp.father_name,
                address: emp.address,
                aadhaar_number: emp.aadhaar_number,
                pan_number: emp.pan_number,
                pf_number: emp.pf_number,
                uan_number: emp.uan_number,
                esi_number: emp.esi_number,
                shift_hours: emp.shift_hours,
                shift_period: emp.shift_period,
                overtime_amount: emp.overtime_amount,
                overtime_period: emp.overtime_period,
                cost_code: emp.cost_code,
                salary_calculation_method: emp.salary_calculation_method,
                role: emp.role || 'Employee'
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

    const handleAttendanceStatusChange = async (employeeId, status, shiftHours = 8.0, notes = '') => {
        try {
            // attendanceDate is already in YYYY-MM-DD format
            await apiService.recordAttendance({
                employee_id: employeeId,
                project_id: selectedProject.id,
                attendance_date: attendanceDate,
                status: status,
                shift_hours: shiftHours,
                notes: notes
            });
            fetchAttendanceData(); // Refresh records
        } catch (error) {
            console.error('Error recording attendance:', error);
            toast.error('Failed to record attendance');
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

    const fetchProjectTasks = async () => {
        setLoadingTasks(true);
        try {
            const data = await apiService.getTasks({ project_id: selectedProject.id });
            setProjectTasks(data || []);
        } catch (error) {
            console.error('Error fetching project tasks:', error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleTaskSubmit = async (taskData) => {
        try {
            if (editingTask) {
                await apiService.updateTask(editingTask.id, taskData);
            } else {
                await apiService.createTask(taskData);
            }
            fetchProjectTasks();
            setShowTaskForm(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('Failed to save task. Please try again.');
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

    const fetchUsers = async () => {
        try {
            const usersData = await apiService.getUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const formatDate = (dateString) => formatDateForDisplay(dateString);

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
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

    const getCompletionPercentage = (status) => {
        switch (status) {
            case "Planning": return 10;
            case "In Progress": return 50;
            case "On Hold": return 50;
            case "Completed": return 100;
            case "Cancelled": return 0;
            default: return 0;
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
            scope_of_work: selectedProject.scope_of_work || '',
            assigned_to: selectedProject.assigned_to || ''
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
            toast.success('Project updated successfully!');
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error(error.message || 'Failed to save project. Please try again.');
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

    const { user: loggedInUser } = useAuth();

    // Filter tabs based on module-level permissions
    const getPermissions = () => {
        if (loggedInUser?.role?.toLowerCase() === 'admin') return null; // Admin has all tabs
        if (!loggedInUser?.permissions) return null;

        const perms = typeof loggedInUser.permissions === 'string'
            ? JSON.parse(loggedInUser.permissions)
            : loggedInUser.permissions;

        return perms.project_tabs;
    };

    const userProjectTabs = getPermissions();

    const tabs = [
        { id: 'project-info', label: 'Project Info' },
        { id: 'transaction', label: 'Transaction' },

        { id: 'attendance', label: 'Attendance' },
        { id: 'task', label: 'Task' },
        { id: 'material', label: 'Material' },
        { id: 'payroll', label: 'Payroll' },
    ].filter(tab => {
        if (!userProjectTabs) return true; // Default to visible if no permissions defined (or admin)
        return userProjectTabs[tab.id] !== false;
    });

    // Set initial active tab to the first available permitted tab if original default is restricted
    useEffect(() => {
        if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs, activeTab]);

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
                        {activeTab === 'project-info' && (
                            isEditing ? (
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
                            )
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
                                        <span className="text-xl font-bold text-blue-700" style={{ fontFamily: 'var(--font-family)' }}>{getCompletionPercentage(selectedProject.status)}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${getCompletionPercentage(selectedProject.status)}%` }}
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
                                {/* Ownership Card */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Created By */}
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CREATED BY</label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                                                    {selectedProject.created_by_name?.substring(0, 1) || 'U'}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                                                    {selectedProject.created_by_name || 'System User'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Assigned To */}
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ASSIGNED TO</label>
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <select
                                                        value={editedData.assigned_to}
                                                        onChange={(e) => handleFieldChange('assigned_to', e.target.value)}
                                                        className="w-full text-sm font-semibold border-b-2 border-blue-100 focus:border-blue-500 outline-none py-0.5 transition-colors bg-transparent"
                                                        style={{ fontFamily: 'var(--font-family)' }}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {users.map(user => (
                                                            <option key={user.id} value={user.id}>
                                                                {user.first_name} {user.last_name || ''} ({user.role})
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <>
                                                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                                                            {selectedProject.assigned_to_name?.substring(0, 1) || '?'}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                                                            {selectedProject.assigned_to_name || 'Unassigned'}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

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
                                        <FaRupeeSign className="text-emerald-500" />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Financial Overview</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimated Budget</label>
                                            <div className="flex items-center gap-2">
                                                <FaRupeeSign className="text-emerald-500" size={14} />
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
                                                <FaRupeeSign className="text-rose-500" size={14} />
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
                            <div className="relative" ref={transactionDropdownRef}>
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
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions List */}
                        {/* Recent Transactions List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Transactions</h3>
                            </div>

                            {loadingTransactions ? (
                                <div className="p-12 text-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-sm text-gray-500 font-medium">Fetching transactions...</p>
                                </div>
                            ) : (
                                <TransactionTable transactions={transactions} />
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
                                <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-inner overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {[
                                        { id: 'all', label: 'ALL' },
                                        { id: 'employee', label: 'EMPLOYEE' },
                                        { id: 'office-member', label: 'OFFICE MEMBER' },
                                        { id: 'worker', label: 'SITE STAFF' },
                                        { id: 'contractor', label: 'LABOUR CONTRACTOR' }
                                    ].map(filter => (
                                        <button
                                            key={filter.id}
                                            onClick={() => setActiveAttendanceFilter(filter.id)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${activeAttendanceFilter === filter.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>                                <div className="flex items-center gap-3 w-full sm:w-auto">
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
                                    <button
                                        onClick={() => setIsSelectEmployeeOpen(true)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                                    >
                                        <FiUsers size={18} />
                                        ADD STAFF
                                    </button>
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
                                                (activeAttendanceFilter === 'employee' && p.role === 'Employee') ||
                                                (activeAttendanceFilter === 'office-member' && p.role === 'Office Member') ||
                                                (activeAttendanceFilter === 'worker' && p.party_type === 'Worker') ||
                                                (activeAttendanceFilter === 'contractor' && p.party_type === 'Contractor');
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
                                                    party={{
                                                        ...party,
                                                        applied_rate: record?.applied_rate,
                                                        calculated_amount: record?.calculated_amount,
                                                        shift_hours: record?.shift_hours || party.shift_hours
                                                    }}
                                                    currentStatus={record?.status || 'Not Recorded'}
                                                    isRangeMode={isAttendanceRangeMode}
                                                    absentDates={absentDates}
                                                    rangeStats={isAttendanceRangeMode ? {
                                                        present: employeeRecords.filter(r => r.status === 'Present').length,
                                                        absent: employeeRecords.filter(r => r.status !== 'Present').length,
                                                        total: employeeRecords.length
                                                    } : null}
                                                    onStatusChange={(partyId, status, hours) => handleAttendanceStatusChange(partyId, status, hours)}
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
                                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium">No staff members have been assigned to this project yet.</p>
                                <button
                                    onClick={() => setIsSelectEmployeeOpen(true)}
                                    className="text-blue-600 font-bold text-sm hover:underline"
                                >
                                    ADD EXISTING STAFF
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Task Tab */}
                {activeTab === 'task' && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Work Pipeline</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage Project Milestones</p>
                            </div>
                            <button
                                onClick={() => { setEditingTask(null); setShowTaskForm(true); }}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2 active:scale-95"
                            >
                                + NEW TASK
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</span>
                                    </div>
                                    <div className="col-span-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Task Name</span>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignee</span>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</span>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status / Due</span>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {loadingTasks ? (
                                    <div className="p-12 text-center">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-sm text-gray-500 font-medium">Fetching tasks...</p>
                                    </div>
                                ) : projectTasks.length > 0 ? (
                                    projectTasks.map((task) => (
                                        <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => { setEditingTask(task); setShowTaskForm(true); }}>
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-1">
                                                    <span className="text-xs font-bold text-gray-400">{task.taskNumber || `#${task.id}`}</span>
                                                </div>
                                                <div className="col-span-4">
                                                    <p className="text-sm font-bold text-gray-900">{task.name}</p>
                                                    <p className="text-[10px] font-medium text-gray-400 truncate">{task.description || 'No description'}</p>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold mb-1">
                                                            {task.assignToName?.substring(0, 1) || '?'}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{task.assignToName || 'Unassigned'}</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${task.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        }`}>
                                                        {task.priority || 'NORMAL'}
                                                    </span>
                                                </div>
                                                <div className="col-span-3 text-right">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${task.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}>
                                                        {task.status?.toUpperCase() || 'PENDING'}
                                                    </span>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1">DUE: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-16 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mx-auto mb-6">
                                            <FiFileText className="text-gray-300" size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">No Tasks Assigned</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 font-medium">Break down your project into manageable tasks and track progress here.</p>
                                        <button onClick={() => { setEditingTask(null); setShowTaskForm(true); }} className="text-blue-600 font-bold text-sm hover:underline uppercase tracking-wider">Create First Task</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Material Tab */}
                {activeTab === 'material' && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Procurement</p>
                                <p className="text-xl font-black text-gray-900">₹ {financialSummary.materialPurchase.toLocaleString()}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Returns</p>
                                <p className="text-xl font-black text-amber-600">₹ {financialSummary.materialReturn.toLocaleString()}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm bg-blue-50/30">
                                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1">Net Material Cost</p>
                                <p className="text-xl font-black text-blue-600">₹ {(financialSummary.materialPurchase - financialSummary.materialReturn).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Inventory Sub-Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl w-fit">
                            <button
                                onClick={() => setMaterialActiveSubTab('requests')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${materialActiveSubTab === 'requests' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Requests
                            </button>
                            <button
                                onClick={() => setMaterialActiveSubTab('stock')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${materialActiveSubTab === 'stock' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Stock Summary
                            </button>
                            <button
                                onClick={() => setMaterialActiveSubTab('history')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${materialActiveSubTab === 'history' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Movement History
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                                    {materialActiveSubTab === 'requests' ? 'Pending Material Requests' :
                                        materialActiveSubTab === 'stock' ? 'Current Stock Overview' : 'Material Movements'}
                                </h3>
                                <div className="flex gap-4">
                                    {materialActiveSubTab === 'requests' ? (
                                        <button onClick={() => setShowMaterialRequestForm(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider px-2">+ REQUEST</button>
                                    ) : (
                                        <>
                                            <button onClick={() => setShowMaterialPurchaseForm(true)} className="text-sm font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider px-2">+ MATERIAL IN</button>
                                            <span className="text-gray-300 self-center">|</span>
                                            <button onClick={() => setShowMaterialUsageForm(true)} className="text-sm font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider px-2">+ MATERIAL OUT</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 min-h-[300px]">
                                {materialActiveSubTab === 'requests' && (
                                    <>
                                        {loadingRequests ? (
                                            <div className="p-12 text-center">
                                                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-sm text-gray-500 font-medium">Fetching requests...</p>
                                            </div>
                                        ) : materialRequests.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <tr>
                                                            <th className="px-6 py-3">Material</th>
                                                            <th className="px-6 py-3 text-center">Qty</th>
                                                            <th className="px-6 py-3 text-center">Date</th>
                                                            <th className="px-6 py-3 text-center">By</th>
                                                            <th className="px-6 py-3 text-center">Assigned To</th>
                                                            <th className="px-6 py-3 text-center">Priority</th>
                                                            <th className="px-6 py-3 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {materialRequests.map((request) => (
                                                            <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <p className="font-bold text-gray-900">{request.material_name}</p>
                                                                    <p className="text-[10px] text-gray-400 line-clamp-1">{request.description || 'No description'}</p>
                                                                </td>
                                                                <td className="px-6 py-4 text-center font-bold text-gray-700">
                                                                    {request.quantity} <span className="text-[10px] text-gray-400">{request.unit}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                                                                    {request.request_date ? new Date(request.request_date).toLocaleDateString() : 'N/A'}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5">
                                                                            {request.first_name?.charAt(0) || '?'}
                                                                        </div>
                                                                        <span className="text-[9px] font-bold text-gray-500 uppercase">{request.first_name || 'N/A'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    {request.assigned_to_name ? (
                                                                        <div className="flex flex-col items-center">
                                                                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5">
                                                                                {request.assigned_to_name?.charAt(0) || '?'}
                                                                            </div>
                                                                            <span className="text-[9px] font-bold text-gray-500 uppercase">{request.assigned_to_name}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-400 font-medium italic">Unassigned</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${(request.priority || 'Medium') === 'High' || (request.priority || 'Medium') === 'Urgent' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                                        (request.priority || 'Medium') === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                            'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                                        }`}>
                                                                        {String(request.priority || 'Medium').replace(/`/g, '').toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex flex-col items-end gap-1">
                                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${(request.status || 'Pending') === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                            (request.status || 'Pending') === 'Arrived' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                                (request.status || 'Pending') === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                                                    (request.status || 'Pending') === 'Fulfilled' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                                            }`}>
                                                                            {String(request.status || 'Pending').toUpperCase()}
                                                                        </span>
                                                                        {(request.status || 'Pending') === 'Pending' && (user?.id === request.assigned_to || user?.role?.toLowerCase() === 'admin') && (
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setConfirmPopup({
                                                                                            isOpen: true,
                                                                                            title: 'Approve Request',
                                                                                            message: `Approve material request for ${request.material_name} (${request.quantity} ${request.unit})?`,
                                                                                            onConfirm: async () => {
                                                                                                try {
                                                                                                    await apiService.updateMaterialRequestStatus(request.id, 'Approved');
                                                                                                    fetchMaterialRequests();
                                                                                                    toast.success('Request approved');
                                                                                                } catch (error) {
                                                                                                    console.error('Error approving request:', error);
                                                                                                    toast.error('Failed to approve request');
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                    className="text-[9px] font-bold text-green-600 hover:underline"
                                                                                >
                                                                                    APPROVE
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setConfirmPopup({
                                                                                            isOpen: true,
                                                                                            title: 'Reject Request',
                                                                                            message: `Reject material request for ${request.material_name}?`,
                                                                                            onConfirm: async () => {
                                                                                                try {
                                                                                                    await apiService.updateMaterialRequestStatus(request.id, 'Rejected');
                                                                                                    fetchMaterialRequests();
                                                                                                    toast.info('Request rejected');
                                                                                                } catch (error) {
                                                                                                    console.error('Error rejecting request:', error);
                                                                                                    toast.error('Failed to reject request');
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                    className="text-[9px] font-bold text-rose-600 hover:underline"
                                                                                >
                                                                                    REJECT
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        {(request.status || 'Pending') === 'Approved' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setConfirmPopup({
                                                                                        isOpen: true,
                                                                                        title: 'Mark as Arrived',
                                                                                        message: `Mark ${request.material_name} as arrived? This will add it to stock.`,
                                                                                        onConfirm: async () => {
                                                                                            try {
                                                                                                await apiService.updateMaterialRequestStatus(request.id, 'Arrived');
                                                                                                fetchMaterialRequests();
                                                                                                fetchInventoryData(); // Refresh stock summary
                                                                                                toast.success('Material marked as arrived and added to stock');
                                                                                            } catch (error) {
                                                                                                console.error('Error marking as arrived:', error);
                                                                                                toast.error('Failed to mark material as arrived');
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                className="text-[9px] font-bold text-indigo-600 hover:underline"
                                                                            >
                                                                                MARK ARRIVED
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-16 text-center">
                                                <FiAlertCircle className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No material requests found</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {materialActiveSubTab === 'stock' && (
                                    <>
                                        {loadingInventory ? (
                                            <div className="p-12 text-center">
                                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-sm text-gray-500 font-medium">Calculating stock summary...</p>
                                            </div>
                                        ) : stockSummary.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <tr>
                                                            <th className="px-6 py-3">Material Name</th>
                                                            <th className="px-6 py-3 text-center">Total In</th>
                                                            <th className="px-6 py-3 text-center">Total Out</th>
                                                            <th className="px-6 py-3 text-center">Returned</th>
                                                            <th className="px-6 py-3 text-right">Remaining Stock</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {stockSummary.map((stock, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="px-6 py-4 font-bold text-gray-900">{stock.material_name}</td>
                                                                <td className="px-6 py-4 text-center font-medium text-green-600">{stock.total_in} <span className="text-[10px] text-gray-400">{stock.unit}</span></td>
                                                                <td className="px-6 py-4 text-center font-medium text-rose-600">{stock.total_out} <span className="text-[10px] text-gray-400">{stock.unit}</span></td>
                                                                <td className="px-6 py-4 text-center font-medium text-amber-600">{stock.total_return} <span className="text-[10px] text-gray-400">{stock.unit}</span></td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className={`px-3 py-1 rounded-lg font-black text-sm ${stock.current_stock > 0 ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                                                                        {stock.current_stock} <span className="text-[10px] opacity-70 uppercase">{stock.unit}</span>
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-16 text-center">
                                                <FiPackage className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No stock data available</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {materialActiveSubTab === 'history' && (
                                    <>
                                        {loadingInventory ? (
                                            <div className="p-12 text-center">
                                                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-sm text-gray-500 font-medium">Loading history...</p>
                                            </div>
                                        ) : inventoryHistory.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        <tr>
                                                            <th className="px-6 py-3">Date</th>
                                                            <th className="px-6 py-3">Type</th>
                                                            <th className="px-6 py-3">Material</th>
                                                            <th className="px-6 py-3 text-center">Quantity</th>
                                                            <th className="px-6 py-3">Reference / Description</th>
                                                            <th className="px-6 py-3 text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {inventoryHistory.map((item) => (
                                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="px-6 py-4 text-xs font-bold text-gray-500">{new Date(item.transaction_date).toLocaleDateString()}</td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${item.type === 'In' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                                        item.type === 'Out' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                                                        }`}>
                                                                        {item.type}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-gray-800">{item.material_name}</td>
                                                                <td className="px-6 py-4 text-center font-bold">
                                                                    {item.type === 'Out' ? '-' : '+'}{item.quantity} <span className="text-[10px] text-gray-400 font-medium">{item.unit}</span>
                                                                </td>
                                                                <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                                                    {item.description || 'No details'}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    {item.type === 'Out' && (
                                                                        <button
                                                                            onClick={() => { setSelectedIssue(item); setShowUsageReturnForm(true); }}
                                                                            className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1 mx-auto ml-auto"
                                                                            title="Return partial quantity to stock"
                                                                        >
                                                                            <FiRefreshCcw className="w-3.5 h-3.5" />
                                                                            <span className="text-[10px] font-bold uppercase">Return</span>
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="p-16 text-center">
                                                <FiClock className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No movement history</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Payroll Tab */}
                {activeTab === 'payroll' && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Gross</p>
                                <p className="text-xl font-black text-gray-900">₹ {payrollSlips.reduce((acc, slip) => acc + parseFloat(slip.gross_amount), 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Net</p>
                                <p className="text-xl font-black text-blue-600">₹ {payrollSlips.reduce((acc, slip) => acc + parseFloat(slip.net_amount), 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paid Amount</p>
                                <p className="text-xl font-black text-emerald-600">₹ {payrollSlips.reduce((acc, slip) => acc + (parseFloat(slip.net_amount) - parseFloat(slip.balance || slip.net_amount)), 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Balance</p>
                                <p className="text-xl font-black text-rose-600">₹ {payrollSlips.reduce((acc, slip) => acc + parseFloat(slip.balance || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Month</label>
                                    <select
                                        value={payrollMonth}
                                        onChange={(e) => setPayrollMonth(e.target.value)}
                                        className="p-2 border border-blue-100 bg-blue-50/30 rounded-lg text-xs font-bold text-blue-900 outline-none focus:border-blue-500"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Year</label>
                                    <select
                                        value={payrollYear}
                                        onChange={(e) => setPayrollYear(e.target.value)}
                                        className="p-2 border border-blue-100 bg-blue-50/30 rounded-lg text-xs font-bold text-blue-900 outline-none focus:border-blue-500"
                                    >
                                        {[2024, 2025, 2026].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={fetchPayrollSlips}
                                    className="mt-5 p-2 bg-gray-50 text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-lg transition-all border border-gray-100"
                                >
                                    <FiRefreshCcw size={16} className={loadingPayroll ? 'animate-spin' : ''} />
                                </button>
                            </div>

                            <button
                                onClick={handleGeneratePayroll}
                                disabled={loadingPayroll}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-50 active:scale-95"
                            >
                                <FiFileText size={16} />
                                + GENERATE PAYROLL
                            </button>
                        </div>

                        {/* Slips Table */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                            {loadingPayroll ? (
                                <div className="flex flex-col items-center justify-center h-[400px]">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compiling Payroll Data...</p>
                                </div>
                            ) : payrollSlips.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-400">Employee</th>
                                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-400 text-center">Gross</th>
                                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-400 text-center">Deductions</th>
                                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-400 text-center">Net Amount</th>
                                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-400 text-center">Status</th>
                                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-gray-400 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {payrollSlips.map((slip) => (
                                                <tr key={slip.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] uppercase">
                                                                {slip.employee_name?.substring(0, 2)}
                                                            </div>
                                                            <span className="font-bold text-gray-900">{slip.employee_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-600">₹{slip.gross_amount}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-rose-500">₹{slip.deductions}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-black text-blue-600">₹{slip.net_amount}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${slip.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                            slip.status === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                                'bg-rose-50 text-rose-700 border border-rose-100'
                                                            }`}>
                                                            {slip.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSlip(slip);
                                                                setShowPaymentForm(true);
                                                            }}
                                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest shadow-sm"
                                                        >
                                                            RECORD PAYMENT
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                        <FiFileText size={40} className="text-blue-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 uppercase tracking-wider">Payroll Not Generated</h3>
                                    <p className="text-sm text-gray-400 max-w-xs mb-8 font-medium">Salary slips for {new Date(2000, payrollMonth - 1).toLocaleString('default', { month: 'long' })} {payrollYear} have not been compiled yet.</p>
                                    <button
                                        onClick={handleGeneratePayroll}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-105 transition-all uppercase tracking-widest text-xs"
                                    >
                                        GENERATE PAYROLL NOW
                                    </button>
                                </div>
                            )}
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
                    onSubmit={async (payrollData) => {
                        try {
                            const newParty = {
                                ...currentPartyData,
                                ...payrollData
                            };

                            console.log('Final submission to backend:', newParty);

                            await apiService.createEmployee(newParty);

                            // Refresh the employees list
                            fetchProjectEmployees();

                            toast.success('Party created successfully!');
                            setIsPayrollFormOpen(false);
                            setCurrentPartyData(null);
                        } catch (error) {
                            console.error('Error creating party:', error);
                            toast.error(error.message || 'Failed to create party. Please try again.');
                        }
                    }}
                    partyData={currentPartyData}
                />

                {/* Payment In Form Popup */}
                <PaymentInFormPopup
                    isOpen={showPaymentInForm}
                    onClose={() => setShowPaymentInForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    clientName={selectedProject.client_name}
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
                    clientName={selectedProject.client_name}
                    onSuccess={() => {
                        fetchTransactions();
                        fetchFinancialSummary();
                        fetchInventoryData();
                    }}
                />

                {/* Material Return Form Popup */}
                <MaterialReturnFormPopup
                    isOpen={showMaterialReturnForm}
                    onClose={() => setShowMaterialReturnForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    clientName={selectedProject.client_name}
                    onSuccess={() => {
                        fetchTransactions();
                        fetchFinancialSummary();
                        fetchInventoryData();
                    }}
                />

                <PaymentOutFormPopup
                    isOpen={showPaymentOutForm}
                    onClose={() => setShowPaymentOutForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    clientName={selectedProject.client_name}
                    onSuccess={() => {
                        fetchTransactions();
                        fetchFinancialSummary();
                        fetchInventoryData();
                    }}
                />

                <MaterialUsageFormPopup
                    isOpen={showMaterialUsageForm}
                    onClose={() => setShowMaterialUsageForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    onSuccess={() => {
                        fetchInventoryData();
                    }}
                />

                <MaterialUsageReturnFormPopup
                    isOpen={showUsageReturnForm}
                    onClose={() => { setShowUsageReturnForm(false); setSelectedIssue(null); }}
                    issueDetails={selectedIssue}
                    onSuccess={() => {
                        fetchInventoryData();
                    }}
                />

                <MaterialRequestFormPopup
                    isOpen={showMaterialRequestForm}
                    onClose={() => setShowMaterialRequestForm(false)}
                    projectName={selectedProject.project_name}
                    projectId={selectedProject.id}
                    onSuccess={() => {
                        fetchMaterialRequests();
                        fetchInventoryData();
                    }}
                />

                <TaskFormPopup
                    isOpen={showTaskForm}
                    onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
                    onSubmit={handleTaskSubmit}
                    isEdit={!!editingTask}
                    taskToEdit={editingTask}
                    initialData={{
                        projectName: selectedProject.project_name,
                        relatedTo: 'Project',
                        project_id: selectedProject.id
                    }}
                />

                {/* Select Employee Popup */}
                <SelectEmployeePopup
                    isOpen={isSelectEmployeeOpen}
                    onClose={() => setIsSelectEmployeeOpen(false)}
                    onSelect={() => {
                        fetchProjectEmployees();
                        fetchAttendanceData();
                    }}
                    currentProjectId={selectedProject.id}
                    currentProjectName={selectedProject.project_name}
                />

                {/* Salary Payment Popup */}
                {showPaymentForm && selectedSlip && (
                    <SalaryPaymentPopup
                        isOpen={showPaymentForm}
                        onClose={() => setShowPaymentForm(false)}
                        slip={selectedSlip}
                        onSubmit={handleRecordPayment}
                    />
                )}

                {/* Central Confirmation Popup */}
                <ConfirmationPopup
                    isOpen={confirmPopup.isOpen}
                    title={confirmPopup.title}
                    message={confirmPopup.message}
                    onConfirm={confirmPopup.onConfirm}
                    onClose={() => setConfirmPopup(prev => ({ ...prev, isOpen: false }))}
                />
            </div>
        </div>
    );
};

export default ProjectInfo;
