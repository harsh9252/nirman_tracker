import React, { useState, useEffect, useRef } from 'react';
import { FiUsers, FiPlus, FiFilter, FiCheck, FiCalendar, FiPhone, FiMail } from 'react-icons/fi';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import TableActionButton from '../components/TableActionButton';
import Table from '../components/Table';
import EmployeeFormPopup from '../components/EmployeeFormPopup';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../services/translationService.jsx';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export default function EmployeesPage({ searchTerm = '' }) {
    const { user, hasPermission } = useAuth();

    // Check permissions
    const canCreate = hasPermission('employees', 'create');
    const canEdit = hasPermission('employees', 'edit');
    const canDelete = hasPermission('employees', 'delete');
    const { t } = useTranslation();
    const [employeesData, setEmployeesData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
    const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [loading, setLoading] = useState(true);
    const filterDropdownRef = useRef(null);

    // Fetch employees from API
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await apiService.getEmployees();
            setEmployeesData(response || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Handle clicks outside the filter dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setIsFilterPopupOpen(false);
            }
        };

        if (isFilterPopupOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterPopupOpen]);

    const filteredEmployees = employeesData.filter(employee => {
        const matchesSearch = searchTerm === '' ||
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.designation && employee.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (employee.project_name && employee.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (employee.phone && employee.phone.includes(searchTerm));

        const matchesStatus = selectedStatus === 'All' || employee.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const handleEditRow = (id) => {
        const employee = employeesData.find(e => e.id === id);
        if (employee) {
            setEmployeeToEdit(employee);
            setIsEditMode(true);
            setIsEmployeeFormOpen(true);
        }
    };

    const handleDeleteRow = async (id) => {
        const result = await Swal.fire({
            title: t('Are you sure?'),
            text: t('This action cannot be undone.'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('Yes, delete it!')
        });

        if (result.isConfirmed) {
            try {
                await apiService.deleteEmployee(id);
                fetchEmployees();
                toast.success(t('Employee deleted successfully'));
            } catch (error) {
                console.error('Error deleting employee:', error);
                toast.error(error.message || t('Failed to delete employee'));
            }
        }
    };

    const handleFormSubmit = () => {
        fetchEmployees();
        setIsEmployeeFormOpen(false);
        setIsEditMode(false);
        setEmployeeToEdit(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "bg-green-100 text-green-700 border-green-200";
            case "Inactive": return "bg-red-100 text-red-700 border-red-200";
            case "On Leave": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Pantry": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
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

    // Table configuration
    const employeeColumns = [
        { key: 'name', title: t('Name'), width: '15%' },
        { key: 'designation', title: t('Designation'), width: '12%' },
        { key: 'department', title: t('Department'), width: '12%' },
        { key: 'project_name', title: t('Assigned Project'), width: '15%' },
        { key: 'employment_type', title: t('Type'), width: '8%' },
        { key: 'phone', title: t('Phone'), width: '13%' },
        { key: 'status', title: t('Status'), width: '10%' },
        { key: 'joining_date', title: t('Joining Date'), width: '10%' },
        { key: 'actions', title: t('Actions'), align: 'center', width: '9%' }
    ];

    const renderEmployeeCell = (key, employee) => {
        switch (key) {
            case 'name':
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                            {employee.profile_image ? (
                                <img src={employee.profile_image} alt={employee.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-[10px] font-bold">
                                    {employee.name?.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="font-medium text-gray-900 truncate max-w-[150px]" title={employee.name}>
                            {employee.name}
                        </div>
                    </div>
                );
            case 'status':
                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-normal rounded-full border ${getStatusColor(employee.status)}`}>
                        {t(employee.status)}
                    </span>
                );
            case 'employment_type':
                return (
                    <span className="text-xs text-gray-600 font-medium">
                        {t(employee.employment_type || 'Monthly')}
                    </span>
                );
            case 'project_name':
                return (
                    <div className="text-gray-600 truncate max-w-[150px]" title={employee.project_name || t('Not Assigned')}>
                        {employee.project_name || <span className="text-gray-400 italic font-light">{t('Not Assigned')}</span>}
                    </div>
                );
            case 'joining_date':
                return formatDate(employee.joining_date);
            case 'actions':
                return (
                    <div className="flex justify-center gap-1 sm:gap-2">
                        {canEdit && (
                            <TableActionButton
                                icon={FaPencilAlt}
                                type="edit"
                                title={t("Edit")}
                                onClick={() => handleEditRow(employee.id)}
                                mobileSize={false}
                                extraSmall={true}
                            />
                        )}
                        {canDelete && (
                            <TableActionButton
                                icon={FaTrash}
                                type="delete"
                                title={t("Delete")}
                                onClick={() => handleDeleteRow(employee.id)}
                                mobileSize={false}
                                extraSmall={true}
                            />
                        )}
                        {!canEdit && !canDelete && (
                            <span className="text-gray-400 text-[10px] italic">{t('No actions')}</span>
                        )}
                    </div>
                );
            default:
                return employee[key] || 'N/A';
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full">
            <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24">
                {/* Stats Header or Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FiUsers className="text-primary" />
                        {t('Labour/Employee Management')}
                    </h1>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-xl border border-gray-400 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-2 pt-2 pb-2 border-b border-gray-200">
                        <div className="flex items-center justify-end gap-2 w-full">
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
                                    className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                                    style={{ height: '30px' }}
                                    title={t("Filter by status")}
                                >
                                    <div className="flex items-center justify-center w-7 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                                        <FiFilter size={14} />
                                    </div>
                                    <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px' }}>
                                        {selectedStatus === "All" ? t("All Status") : t(selectedStatus)}
                                    </span>
                                </button>
                                {isFilterPopupOpen && (
                                    <div ref={filterDropdownRef} className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1">
                                        {[
                                            { value: "All", label: t("All Status") },
                                            { value: "Active", label: t("Active") },
                                            { value: "Inactive", label: t("Inactive") },
                                            { value: "On Leave", label: t("On Leave") },
                                            { value: "Pantry", label: t("Pantry") }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSelectedStatus(option.value);
                                                    setIsFilterPopupOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${selectedStatus === option.value
                                                    ? "text-blue-600 font-medium"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                <span>{option.label}</span>
                                                {selectedStatus === option.value && (
                                                    <FiCheck className="text-blue-600" size={14} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {canCreate && (
                                <button
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setEmployeeToEdit(null);
                                        setIsEmployeeFormOpen(true);
                                    }}
                                    className="flex items-center gap-1 pl-2 pr-2 pt-1.5 pb-1.5 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm"
                                    style={{ backgroundColor: 'var(--primary-color)' }}
                                >
                                    <FiPlus size={17} color="#ffffff" />
                                    <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>{t('New')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div className="block sm:hidden mt-4">
                        {filteredEmployees.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('No employees found')}</h3>
                            </div>
                        ) : (
                            <div className="space-y-2 px-2">
                                {filteredEmployees.map((employee) => (
                                    <div key={employee.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
                                                <p className="text-xs text-gray-500">{employee.designation} • {employee.department}</p>
                                                {employee.project_name && (
                                                    <p className="text-[10px] text-blue-600 mt-0.5 font-medium">{t('Project')}: {employee.project_name}</p>
                                                )}
                                            </div>
                                            <span className={`inline-flex px-2 py-1 text-[10px] font-medium rounded-full border ${getStatusColor(employee.status)}`}>
                                                {t(employee.status)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-xs text-gray-600 mb-3">
                                            <div className="flex items-center gap-2">
                                                <FiPhone size={12} className="text-blue-500" />
                                                <span>{employee.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FiMail size={12} className="text-blue-500" />
                                                <span>{employee.email || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                            {canEdit && (
                                                <TableActionButton
                                                    icon={FaPencilAlt}
                                                    type="edit"
                                                    onClick={() => handleEditRow(employee.id)}
                                                    mobileSize={true}
                                                />
                                            )}
                                            {canDelete && (
                                                <TableActionButton
                                                    icon={FaTrash}
                                                    type="delete"
                                                    onClick={() => handleDeleteRow(employee.id)}
                                                    mobileSize={true}
                                                />
                                            )}
                                            {!canEdit && !canDelete && (
                                                <span className="text-gray-400 text-[10px] italic">{t('No actions')}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden sm:block">
                        <Table
                            data={filteredEmployees}
                            columns={employeeColumns}
                            loading={loading}
                            emptyMessage={t("No employees found")}
                            onEdit={handleEditRow}
                            onDelete={handleDeleteRow}
                            renderCell={renderEmployeeCell}
                            keyField="id"
                            user={user}
                        />
                    </div>
                </div>
            </main>

            <EmployeeFormPopup
                isOpen={isEmployeeFormOpen}
                onClose={() => {
                    setIsEmployeeFormOpen(false);
                    setIsEditMode(false);
                    setEmployeeToEdit(null);
                }}
                onSubmit={handleFormSubmit}
                editEmployee={employeeToEdit}
            />
        </div>
    );
}
