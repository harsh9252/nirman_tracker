import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';


const AddMaterialFormPopup = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        materialName: '',
        discountType: 'percentage',
        discountValue: '',
        gstPercent: '18',
        specifications: '',
        quantity: '',
        rate: '',
        amount: '' // This will now hold the Final Total Amount
    });


    const gstOptions = ['0', '5', '12', '18', '28'];

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Calculate Amount
            const qty = parseFloat(field === 'quantity' ? value : prev.quantity) || 0;
            const rate = parseFloat(field === 'rate' ? value : prev.rate) || 0;
            const baseAmount = qty * rate;

            // Discount
            const discountVal = parseFloat(field === 'discountValue' ? value : prev.discountValue) || 0;
            const discountType = field === 'discountType' ? value : prev.discountType;
            let discountAmount = 0;
            if (discountType === 'percentage') {
                discountAmount = (baseAmount * discountVal) / 100;
            } else {
                discountAmount = discountVal;
            }

            // GST
            const gstPercent = parseFloat(field === 'gstPercent' ? value : prev.gstPercent) || 0;
            const taxableAmount = baseAmount - discountAmount;
            const gstAmount = (taxableAmount * gstPercent) / 100;

            const totalAmount = taxableAmount + gstAmount;

            updated.amount = totalAmount > 0 ? totalAmount.toFixed(2) : '';
            return updated;
        });
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.materialName.trim()) {
            // Create the object expected by the parent component (MaterialPurchaseFormPopup)
            const materialData = {
                ...formData,
                totalAmount: formData.amount // Parent expects totalAmount
            };
            onSave(materialData);

            // Reset form
            setFormData({
                materialName: '',
                gstPercent: '18',
                specifications: '',
                quantity: '',
                rate: '',
                amount: ''
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
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

                        {/* Quantity */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                QUANTITY
                            </label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange('quantity', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder="0"
                            />
                        </div>

                        {/* Rate */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                RATE
                            </label>
                            <input
                                type="number"
                                value={formData.rate}
                                onChange={(e) => handleInputChange('rate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder="0.00"
                            />
                        </div>

                        {/* Discount and GST % */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Discount */}
                            <div className="relative flex">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    DISCOUNT
                                </label>
                                <input
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={(e) => handleInputChange('discountValue', e.target.value)}
                                    className="w-full px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg text-sm bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                    placeholder="0"
                                />
                                <select
                                    value={formData.discountType}
                                    onChange={(e) => handleInputChange('discountType', e.target.value)}
                                    className="w-20 px-2 py-2 border border-l-0 border-gray-300 rounded-r-lg text-sm bg-gray-50 focus:outline-none"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                >
                                    <option value="percentage">%</option>
                                    <option value="flat">₹</option>
                                </select>
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
                                rows="3"
                                placeholder=""
                            />
                        </div>

                        {/* Amount - Now at the last */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                TOTAL AMOUNT
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-blue-50 text-blue-900 font-bold text-lg" // Highlighted
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder="0.00"
                            />
                        </div>
                    </form>
                </div>
            </div>


        </>
    );
};

export default AddMaterialFormPopup;
