import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const AddCategoryPopup = ({ isOpen, onClose, onSave }) => {
    const [categoryName, setCategoryName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (categoryName.trim()) {
            onSave(categoryName.trim());
            setCategoryName('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
                {/* Header */}
                <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <FiX size={20} />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>ADD CATEGORY</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-sm font-medium hover:opacity-80"
                            style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90"
                            style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                        >
                            Save
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                            CATEGORY NAME
                        </label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder="Enter category name"
                            autoFocus
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryPopup;
