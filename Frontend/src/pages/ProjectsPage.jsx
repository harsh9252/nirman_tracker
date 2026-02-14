import React, { useState, useEffect, useRef } from 'react';
import { FiFolder, FiPlus, FiFilter, FiCheck, FiCalendar, FiUser, FiDollarSign } from 'react-icons/fi';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import TableActionButton from '../components/TableActionButton';
import Table from '../components/Table';
import ProjectFormPopup from '../components/ProjectFormPopup';
import ProjectInfo from '../components/ProjectInfo';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectsPage({ searchTerm = '' }) {
    const { user } = useAuth();
    const [projectsData, setProjectsData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [stats, setStats] = useState(null);
    const filterDropdownRef = useRef(null);

    // Fetch projects from API
    const fetchProjects = async () => {
        try {
            const projects = await apiService.getProjects();
            setProjectsData(projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Fetch project statistics
    const fetchStats = async () => {
        try {
            const statsData = await apiService.getProjectStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching project stats:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchStats();
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

    const filteredProjects = projectsData.filter(project => {
        const matchesSearch = searchTerm === '' ||
            project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (project.company_name && project.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const handleEditRow = (id) => {
        const project = projectsData.find(p => p.id === id);
        if (project) {
            setProjectToEdit(project);
            setIsEditMode(true);
            setIsProjectFormOpen(true);
        }
    };

    const handleDeleteRow = async (id) => {
        if (window.confirm('Are you sure you want to delete this project? All associated tasks will be unlinked from this project.')) {
            try {
                await apiService.deleteProject(id);
                fetchProjects();
                fetchStats();
            } catch (error) {
                console.error('Error deleting project:', error);
                alert(error.message || 'Failed to delete project');
            }
        }
    };

    const handleFormSubmit = () => {
        fetchProjects();
        fetchStats();
        setIsProjectFormOpen(false);
        setIsEditMode(false);
        setProjectToEdit(null);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Table configuration
    const projectColumns = [
        { key: 'project_name', title: 'Project Name', width: '20%' },
        { key: 'client_name', title: 'Client', width: '18%' },
        { key: 'project_type', title: 'Type', width: '12%' },
        { key: 'status', title: 'Status', width: '12%' },
        { key: 'start_date', title: 'Start Date', width: '13%' },
        { key: 'end_date', title: 'End Date', width: '13%' },
        { key: 'actions', title: 'Actions', align: 'center', width: '12%' }
    ];

    const renderProjectCell = (key, project) => {
        switch (key) {
            case 'project_name':
                return (
                    <div
                        className="cursor-pointer hover:opacity-80 transition-colors truncate max-w-[250px]"
                        onClick={() => setSelectedProject(project)}
                        title={project.project_name}
                        style={{ color: 'var(--primary-color)' }}
                    >
                        {project.project_name}
                    </div>
                );
            case 'client_name':
                return (
                    <div className="truncate max-w-[200px]" title={project.client_name}>
                        {project.client_name || 'N/A'}
                    </div>
                );
            case 'status':
                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-normal rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                    </span>
                );
            case 'start_date':
                return formatDate(project.start_date);
            case 'end_date':
                return formatDate(project.end_date || project.expected_completion_date);
            case 'actions':
                return (
                    <div className="flex justify-center gap-1 sm:gap-2">
                        <TableActionButton
                            icon={FaPencilAlt}
                            type="edit"
                            title="Edit"
                            onClick={() => handleEditRow(project.id)}
                            mobileSize={false}
                            extraSmall={true}
                        />
                        <TableActionButton
                            icon={FaTrash}
                            type="delete"
                            title="Delete"
                            onClick={() => handleDeleteRow(project.id)}
                            mobileSize={false}
                            extraSmall={true}
                        />
                    </div>
                );
            default:
                return project[key];
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24">
                    {selectedProject ? (
                        <ProjectInfo
                            selectedProject={selectedProject}
                            onClose={() => {
                                setSelectedProject(null);
                                fetchProjects();
                                fetchStats();
                            }}
                        />
                    ) : (
                        <>
                            {/* Statistics Cards */}
                            {stats && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                    <div className="bg-white rounded-lg border border-gray-300 p-3">
                                        <div className="text-xs text-gray-500 mb-1">Total Projects</div>
                                        <div className="text-2xl font-bold text-gray-900">{stats.total_projects || 0}</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                                        <div className="text-xs text-blue-600 mb-1">Planning</div>
                                        <div className="text-2xl font-bold text-blue-700">{stats.planning_count || 0}</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg border border-green-200 p-3">
                                        <div className="text-xs text-green-600 mb-1">In Progress</div>
                                        <div className="text-2xl font-bold text-green-700">{stats.in_progress_count || 0}</div>
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3">
                                        <div className="text-xs text-yellow-600 mb-1">On Hold</div>
                                        <div className="text-2xl font-bold text-yellow-700">{stats.on_hold_count || 0}</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg border border-purple-200 p-3">
                                        <div className="text-xs text-purple-600 mb-1">Completed</div>
                                        <div className="text-2xl font-bold text-purple-700">{stats.completed_count || 0}</div>
                                    </div>
                                </div>
                            )}

                            {/* Projects Table */}
                            <div className="bg-white rounded-xl border border-gray-400 pb-4 sm:h-[calc(100vh-230px)]">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-0 px-4 sm:px-2 pt-2 pb-2 border-b border-gray-200">
                                    <div className="hidden sm:flex items-center gap-3 mb-3 sm:mb-0"></div>
                                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto py-0">
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
                                                className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                                                style={{ height: '30px' }}
                                                title="Filter by status"
                                            >
                                                <div className="flex items-center justify-center w-7 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                                                    <FiFilter size={14} />
                                                </div>
                                                <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px' }}>
                                                    {selectedStatus === "All" ? "All Status" : selectedStatus}
                                                </span>
                                            </button>
                                            {isFilterPopupOpen && (
                                                <div ref={filterDropdownRef} className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1">
                                                    {[
                                                        { value: "All", label: "All Status" },
                                                        { value: "Planning", label: "Planning" },
                                                        { value: "In Progress", label: "In Progress" },
                                                        { value: "On Hold", label: "On Hold" },
                                                        { value: "Completed", label: "Completed" },
                                                        { value: "Cancelled", label: "Cancelled" }
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
                                        <button
                                            onClick={() => {
                                                setIsEditMode(false);
                                                setProjectToEdit(null);
                                                setIsProjectFormOpen(true);
                                            }}
                                            className="flex items-center gap-1 pl-2 pr-2 pt-1.5 pb-1.5 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm"
                                            style={{
                                                backgroundColor: 'var(--primary-color)'
                                            }}
                                        >
                                            <FiPlus size={17} color="#ffffff" />
                                            <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>New</span>
                                        </button>
                                    </div>
                                </div>

                                {/* MOBILE CARD VIEW */}
                                <div className="block sm:hidden mt-4">
                                    {filteredProjects.length === 0 ? (
                                        <div className="text-center py-12 px-4">
                                            <FiFolder className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 px-2">
                                            {filteredProjects.map((project) => (
                                                <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                                                    {/* Row 1: Project Name and Status */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3
                                                                className="text-sm font-semibold truncate cursor-pointer hover:opacity-80"
                                                                onClick={() => setSelectedProject(project)}
                                                                style={{ color: 'var(--primary-color)' }}
                                                            >
                                                                {project.project_name}
                                                            </h3>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border mt-1 ${getStatusColor(project.status)}`}>
                                                                {project.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2 ml-3">
                                                            <TableActionButton
                                                                icon={FaPencilAlt}
                                                                type="edit"
                                                                title="Edit"
                                                                onClick={() => handleEditRow(project.id)}
                                                                mobileSize={true}
                                                            />
                                                            <TableActionButton
                                                                icon={FaTrash}
                                                                type="delete"
                                                                title="Delete"
                                                                onClick={() => handleDeleteRow(project.id)}
                                                                mobileSize={true}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Client and Type */}
                                                    <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <FiUser size={12} className="text-blue-500 flex-shrink-0" />
                                                            <span className="font-medium text-gray-900">{project.client_name || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FiFolder size={12} className="text-gray-500 flex-shrink-0" />
                                                            <span>{project.project_type}</span>
                                                        </div>
                                                    </div>

                                                    {/* Row 3: Start Date and End Date */}
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                                        <FiCalendar size={12} className="text-gray-500 flex-shrink-0" />
                                                        <span>Started: {formatDate(project.start_date)}</span>
                                                    </div>
                                                    {(project.end_date || project.expected_completion_date) && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <FiCalendar size={12} className="text-gray-500 flex-shrink-0" />
                                                            <span>End: {formatDate(project.end_date || project.expected_completion_date)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* DESKTOP TABLE VIEW */}
                                <Table
                                    data={filteredProjects}
                                    columns={projectColumns}
                                    loading={false}
                                    emptyMessage="No projects found"
                                    emptyDescription="Get started by creating a new project."
                                    onEdit={handleEditRow}
                                    onDelete={handleDeleteRow}
                                    renderCell={renderProjectCell}
                                    keyField="id"
                                    user={user}
                                />
                            </div>
                        </>
                    )}
                </main>
            </div>

            <ProjectFormPopup
                isOpen={isProjectFormOpen}
                onClose={() => {
                    setIsProjectFormOpen(false);
                    setIsEditMode(false);
                    setProjectToEdit(null);
                }}
                onSubmit={handleFormSubmit}
                editProject={projectToEdit}
            />
        </div>
    );
}
