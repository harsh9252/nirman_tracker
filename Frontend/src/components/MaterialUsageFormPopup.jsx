import React, { useState, useEffect } from 'react';
import { FiX, FiLoader, FiCalendar, FiUser, FiBox, FiPlus, FiTrash2, FiFileText, FiUpload, FiCheck, FiCornerDownRight, FiHash } from 'react-icons/fi';
import AddMaterialFormPopup from './AddMaterialFormPopup';
import apiService from '../services/api';
import { toast } from 'react-toastify';

const MaterialUsageFormPopup = ({ isOpen, onClose, projectName, projectId, onSuccess }) => {
    const [formData, setFormData] = useState({
        usageDate: new Date().toISOString().split('T')[0],
        materials: [],
        note: ''
    });

    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                usageDate: new Date().toISOString().split('T')[0],
                materials: [],
                note: ''
            });
        }
    }, [isOpen]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (formData.materials.length === 0) {
            toast.error('Please add at least one material');
            return;
        }

        setSubmitting(true);
        try {
            // Log each material as an 'Out' entry in inventory
            const promises = formData.materials.map(material => {
                return apiService.createInventoryEntry({
                    project_id: projectId,
                    material_name: material.materialName,
                    quantity: material.quantity,
                    unit: material.unit || 'unit',
                    type: 'Out',
                    transaction_date: formData.usageDate,
                    description: formData.note ? `${formData.note} (Usage)` : 'Material Usage'
                });
            });

            await Promise.all(promises);

            toast.success('Material usage recorded successfully');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving material usage:', error);
            toast.error('Failed to save material usage');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all";
    const labelStyle = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5";

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-family)' }}>Record Material Usage</h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-0.5 ml-4" style={{ fontFamily: 'var(--font-family)' }}>{projectName}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* Section 1: Usage Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelStyle}>Usage Date <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiCalendar />
                                    </div>
                                    <input
                                        type="date"
                                        value={formData.usageDate}
                                        onChange={(e) => handleInputChange('usageDate', e.target.value)}
                                        className={`${inputStyle} pl-10`}
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Note / Remarks</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiFileText />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.note}
                                        onChange={(e) => handleInputChange('note', e.target.value)}
                                        className={`${inputStyle} pl-10`}
                                        placeholder="e.g. Used for floor tiling"
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Materials List */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2">
                                    <FiCornerDownRight /> Used Items
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowMaterialForm(true)}
                                    className="text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                                >
                                    <FiPlus size={16} /> Add Consumed Material
                                </button>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-rose-50/50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Item Name</th>
                                            <th className="px-4 py-3 text-right">Qty</th>
                                            <th className="px-4 py-3 text-right">Unit</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {formData.materials.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-gray-400 italic">
                                                    No items added for consumption.
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.materials.map((material, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{material.materialName}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{material.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-500">{material.unit || 'unit'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                const newMaterials = formData.materials.filter((_, i) => i !== index);
                                                                handleInputChange('materials', newMaterials);
                                                            }}
                                                            className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200 transition-all uppercase tracking-wide"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all flex items-center gap-2 uppercase tracking-wide"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            {submitting ? <FiLoader className="animate-spin" /> : <><FiCheck /> Record Consumption</>}
                        </button>
                    </div>
                </div>
            </div>

            <AddMaterialFormPopup
                isOpen={showMaterialForm}
                onClose={() => setShowMaterialForm(false)}
                onSave={(materialData) => {
                    handleInputChange('materials', [...formData.materials, materialData]);
                    setShowMaterialForm(false);
                }}
            />
        </>
    );
};

export default MaterialUsageFormPopup;
