import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import AddCategoryPopup from './AddCategoryPopup';

const AddMaterialFormPopup = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        materialName: '',
        unit: 'nos',
        gstPercent: '18',
        category: '',
        hsnSac: '',
        specifications: ''
    });

    const [categories, setCategories] = useState(['Cement', 'Steel', 'Bricks', 'Sand', 'Aggregate']);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const units = ['nos', 'kg', 'ltr', 'mtr', 'sq.ft', 'cu.ft', 'bag', 'ton', 'piece'];
    const gstOptions = ['0', '5', '12', '18', '28'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCategorySelect = (category) => {
        if (category === '+ New Category') {
            setShowCategoryDropdown(false);
            setShowCategoryPopup(true);
        } else {
            handleInputChange('category', category);
            setShowCategoryDropdown(false);
        }
    };

    const handleSaveCategory = (newCategory) => {
        setCategories(prev => [...prev, newCategory]);
        handleInputChange('category', newCategory);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.materialName.trim() && formData.category) {
            onSave(formData);
            // Reset form
            setFormData({
                materialName: '',
                unit: 'nos',
                gstPercent: '18',
                category: '',
                hsnSac: '',
                specifications: ''
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1050] p-4">
                <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                                <FiX size={20} />
                            </button>
                            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>ADD MATERIAL</h2>
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

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-3">
                        {/* Material Name */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                MATERIAL NAME
                            </label>
                            <input
                                type="text"
                                value={formData.materialName}
                                onChange={(e) => handleInputChange('materialName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder="Material Name"
                            />
                        </div>

                        {/* Unit and GST % */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Unit */}
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    UNIT
                                </label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => handleInputChange('unit', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                >
                                    {units.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* GST % */}
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    GST %
                                </label>
                                <select
                                    value={formData.gstPercent}
                                    onChange={(e) => handleInputChange('gstPercent', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                >
                                    {gstOptions.map(gst => (
                                        <option key={gst} value={gst}>{gst}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Discount and GST % (secondary) */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Discount */}
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    DISCOUNT
                                </label>
                                <select
                                    value={formData.discount || '₹'}
                                    onChange={(e) => handleInputChange('discount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                >
                                    <option value="₹">₹</option>
                                    <option value="%">%</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* GST % (additional) */}
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    GST %
                                </label>
                                <select
                                    value={formData.gstPercent}
                                    onChange={(e) => handleInputChange('gstPercent', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                >
                                    {gstOptions.map(gst => (
                                        <option key={gst} value={gst}>{gst}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                CATEGORY
                            </label>
                            <div
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between"
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                <span className={formData.category ? 'text-gray-900' : 'text-gray-400'}>
                                    {formData.category || 'Select Category'}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {showCategoryDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                                    {categories.map((category, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleCategorySelect(category)}
                                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        >
                                            {category}
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => handleCategorySelect('+ New Category')}
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium border-t border-gray-200"
                                        style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                                    >
                                        + New Category
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* HSN/SAC */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                HSN/SAC
                            </label>
                            <input
                                type="text"
                                value={formData.hsnSac}
                                onChange={(e) => handleInputChange('hsnSac', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder="HSN/SAC"
                            />
                        </div>

                        {/* Specifications */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                SPECIFICATIONS
                            </label>
                            <textarea
                                value={formData.specifications}
                                onChange={(e) => handleInputChange('specifications', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                rows="4"
                                placeholder=""
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Add Category Popup */}
            <AddCategoryPopup
                isOpen={showCategoryPopup}
                onClose={() => setShowCategoryPopup(false)}
                onSave={handleSaveCategory}
            />
        </>
    );
};

export default AddMaterialFormPopup;
