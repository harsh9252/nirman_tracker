import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiUser, FiCheck } from 'react-icons/fi';
import apiService from '../services/api'; // Adjust path if needed
import { toast } from 'react-toastify';

const SelectEmployeePopup = ({ isOpen, onClose, onSelect, currentProjectId, currentProjectName }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            setSelectedEmployeeIds([]);
            setSearchQuery('');
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await apiService.getEmployees();
            // Filter out employees already in this project
            const eligibleEmployees = data.filter(emp => emp.project_id !== parseInt(currentProjectId));
            setEmployees(eligibleEmployees);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSelect = (employeeId) => {
        setSelectedEmployeeIds(prev => {
            if (prev.includes(employeeId)) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedEmployeeIds.length === 0) {
            toast.warning('Please select at least one employee.');
            return;
        }

        setSubmitting(true);
        try {
            // Update each selected employee to link them to the current project
            const updatePromises = selectedEmployeeIds.map(id => {
                const employee = employees.find(e => e.id === id);
                return apiService.updateEmployee(id, {
                    ...employee,
                    project_id: currentProjectId
                });
            });

            await Promise.all(updatePromises);

            toast.success(`Successfully added ${selectedEmployeeIds.length} staff members to ${currentProjectName}.`);
            onSelect(); // Callback to refresh the parent list
            onClose();
        } catch (error) {
            console.error('Error adding employees to project:', error);
            toast.error('Failed to add employees. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.designation && emp.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.phone && emp.phone.includes(searchQuery))
    );

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add Existing Staff</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">Select employees to assign to <span className="text-blue-600 font-bold">{currentProjectName}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, designation, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Employee List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm text-gray-500">Loading staff list...</p>
                        </div>
                    ) : filteredEmployees.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredEmployees.map(emp => {
                                const isSelected = selectedEmployeeIds.includes(emp.id);
                                return (
                                    <div
                                        key={emp.id}
                                        onClick={() => handleToggleSelect(emp.id)}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                            ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                            : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-1 transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                                            }`}>
                                            {isSelected && <FiCheck size={12} className="text-white" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{emp.name}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${emp.project_name
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    : 'bg-green-50 text-green-600 border border-green-100'
                                                    }`}>
                                                    {emp.project_name ? 'Reassign' : 'Available'}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{emp.designation || 'No Designation'}</p>

                                            {emp.project_name && (
                                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                    Currently in: <span className="font-bold text-gray-600">{emp.project_name}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiUser className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">No staff found</h3>
                            <p className="text-xs text-gray-500 mt-1">Try adjusting your search query</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedEmployeeIds.length === 0}
                        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Adding...
                            </>
                        ) : (
                            <>
                                Add {selectedEmployeeIds.length > 0 ? `${selectedEmployeeIds.length} Staff` : 'Staff'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectEmployeePopup;
