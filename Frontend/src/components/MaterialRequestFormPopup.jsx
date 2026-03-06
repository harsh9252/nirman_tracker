import React, { useState, useEffect } from 'react';
import { FiX, FiLoader, FiCalendar, FiBox, FiCheck, FiAlertCircle, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MaterialRequestFormPopup = ({ isOpen, onClose, projectName, projectId, onSuccess }) => {
    const [formData, setFormData] = useState({
        material_name: '',
        quantity: '',
        unit: 'Units',
        request_date: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        description: '',
        assigned_to: ''
    });

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setFormData({
                material_name: '',
                quantity: '',
                unit: 'Units',
                request_date: new Date().toISOString().split('T')[0],
                priority: 'Medium',
                description: '',
                assigned_to: ''
            });
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await apiService.getUsers();
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.material_name || !formData.quantity || !formData.request_date) {
            toast.warning('Please fill in all required fields (Material Name, Quantity, Date)');
            return;
        }

        setSubmitting(true);
        try {
            const data = {
                project_id: projectId,
                ...formData
            };

            await apiService.createMaterialRequest(data);

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving material request:', error);
            toast.error(error.message || 'Failed to save material request');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all";
    const labelStyle = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Request Material</h2>
                        </div>
                        <p className="text-sm text-gray-500 font-medium mt-0.5 ml-4">{projectName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className={labelStyle}>Material Name <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FiBox />
                                </div>
                                <input
                                    type="text"
                                    value={formData.material_name}
                                    onChange={(e) => handleInputChange('material_name', e.target.value)}
                                    className={`${inputStyle} pl-10`}
                                    placeholder="Enter material name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Quantity <span className="text-rose-500">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange('quantity', e.target.value)}
                                className={inputStyle}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => handleInputChange('unit', e.target.value)}
                                className={inputStyle}
                            >
                                <option value="Units">Units</option>
                                <option value="Kg">Kg</option>
                                <option value="Tons">Tons</option>
                                <option value="Meters">Meters</option>
                                <option value="Sq. Ft">Sq. Ft</option>
                                <option value="Cu. Mt">Cu. Mt</option>
                                <option value="Bags">Bags</option>
                                <option value="Liters">Liters</option>
                                <option value="Nos">Nos</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelStyle}>Request Date <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FiCalendar />
                                </div>
                                <input
                                    type="date"
                                    value={formData.request_date}
                                    onChange={(e) => handleInputChange('request_date', e.target.value)}
                                    className={`${inputStyle} pl-10`}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => handleInputChange('priority', e.target.value)}
                                className={inputStyle}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelStyle}>Assign To (Recipient)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FiUser />
                                </div>
                                <select
                                    value={formData.assigned_to}
                                    onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                                    className={`${inputStyle} pl-10`}
                                >
                                    <option value="">Select User</option>
                                    {users
                                        .filter(u => u.status !== 'Inactive' && u.id !== currentUser?.id)
                                        .map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.first_name} {user.last_name} ({user.role})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={labelStyle}>Description / Notes</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className={inputStyle}
                                rows={3}
                                placeholder="Any additional details..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all flex items-center gap-2 uppercase tracking-wide disabled:opacity-50"
                        >
                            {submitting ? <FiLoader className="animate-spin" /> : <><FiCheck /> Submit Request</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaterialRequestFormPopup;
