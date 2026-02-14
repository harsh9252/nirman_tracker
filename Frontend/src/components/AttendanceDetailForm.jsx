import React, { useState } from 'react';
import { FiX, FiEdit2, FiTrash2, FiChevronUp } from 'react-icons/fi';

export default function AttendanceDetailForm({ isOpen, onClose, party, onSave, onDelete }) {
    const [formData, setFormData] = useState({
        shift: 1.0,
        customShift: '',
        allowances: [{ label: 'H', value: 22 }],
        overtime: 2,
        notes: party?.notes || 'Gh',
        photos: []
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showNotes, setShowNotes] = useState(true);

    const shiftOptions = [0.5, 1.0, 2.0, 'Custom'];

    const calculateNetAmount = () => {
        const baseSalary = parseFloat(party?.salary_amount || 0);
        const shiftValue = formData.shift === 'Custom' ? parseFloat(formData.customShift || 0) : formData.shift;
        const allowanceTotal = formData.allowances.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
        const overtimeValue = parseFloat(formData.overtime || 0);

        const total = baseSalary * shiftValue + allowanceTotal + overtimeValue + overtimeValue;
        return total.toFixed(0);
    };

    const handleShiftChange = (value) => {
        setFormData(prev => ({
            ...prev,
            shift: value,
            customShift: value === 'Custom' ? prev.customShift : ''
        }));
    };

    const handleAddAllowance = () => {
        setFormData(prev => ({
            ...prev,
            allowances: [...prev.allowances, { label: '', value: 0 }]
        }));
    };

    const handleDeleteAllowance = (index) => {
        setFormData(prev => ({
            ...prev,
            allowances: prev.allowances.filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        if (onSave) onSave(formData);
        onClose();
    };

    const handleDeleteConfirm = () => {
        if (onDelete) onDelete(party?.id);
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1300] p-2 sm:p-6 overflow-auto">
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
                                    {party?.party_name || 'Party Name'}
                                </h2>
                                <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-family)' }}>
                                    {party?.party_type || 'Site Staff'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <FiTrash2 size={20} />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 flex-1 overflow-y-auto rounded-b-xl">
                        <div className="space-y-6">
                            {/* Net Amount Display */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'var(--font-family)' }}>
                                    Net Amount = ₹ {calculateNetAmount()} ({party?.salary_amount || 0} × {formData.shift === 'Custom' ? formData.customShift : formData.shift} + {formData.allowances.reduce((sum, item) => sum + parseFloat(item.value || 0), 0)} + {formData.overtime} + {formData.overtime})
                                </p>
                            </div>

                            {/* Shift Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-family)' }}>
                                    Shift
                                </label>
                                <div className="flex gap-2">
                                    {shiftOptions.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleShiftChange(option)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.shift === option
                                                ? 'text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            style={{
                                                fontFamily: 'var(--font-family)',
                                                backgroundColor: formData.shift === option ? 'var(--primary-color)' : undefined
                                            }}
                                        >
                                            {option} Shift
                                        </button>
                                    ))}
                                </div>
                                {formData.shift === 'Custom' && (
                                    <input
                                        type="number"
                                        value={formData.customShift}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customShift: e.target.value }))}
                                        placeholder="Enter custom shift value"
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        style={{ fontFamily: 'var(--font-family)' }}
                                        step="0.5"
                                    />
                                )}
                            </div>

                            {/* Allowance/Deduction Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color)' }}>
                                        <span className="text-white text-sm">💰</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                                        Allowance/Deduction
                                    </h3>
                                </div>
                                {formData.allowances.map((allowance, index) => (
                                    <div key={index} className="flex items-center gap-3 mb-2">
                                        <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>
                                            {allowance.label} = + {allowance.value}
                                        </p>
                                        <div className="flex gap-2 ml-auto">
                                            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAllowance(index)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddAllowance}
                                    className="text-sm font-medium hover:opacity-80"
                                    style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                                >
                                    + add
                                </button>
                            </div>

                            {/* Overtime Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color)' }}>
                                        <span className="text-white text-sm">⏰</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                                        Overtime
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>
                                        Overtime = +{formData.overtime}
                                    </p>
                                    <div className="flex gap-2 ml-auto">
                                        <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div>
                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className="flex items-center justify-between w-full mb-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color)' }}>
                                            <span className="text-white text-sm">📝</span>
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                                            Notes
                                        </h3>
                                    </div>
                                    <FiChevronUp className={`w-5 h-5 text-gray-600 transition-transform ${showNotes ? '' : 'rotate-180'}`} />
                                </button>
                                {showNotes && (
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Description"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                )}
                            </div>

                            {/* Site Staff Photos Section */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color)' }}>
                                        <span className="text-white text-sm">📷</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                                        Site Staff Photos
                                    </h3>
                                </div>
                                <button
                                    className="text-sm font-medium hover:opacity-80"
                                    style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                                >
                                    + add
                                </button>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                                style={{ fontFamily: 'var(--font-family)', backgroundColor: 'var(--primary-color)' }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Popup */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1400] p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                        <p className="text-center text-lg font-medium text-red-600 mb-6" style={{ fontFamily: 'var(--font-family)' }}>
                            Are you sure you want to delete this attendance?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                OKAY
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
