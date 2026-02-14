import React, { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import AddMaterialFormPopup from './AddMaterialFormPopup';
import apiService from '../services/api';

const MaterialReturnFormPopup = ({ isOpen, onClose, projectName, projectId, onSuccess }) => {
    const [formData, setFormData] = useState({
        returnDate: new Date().toISOString().split('T')[0],
        partyName: '',
        materials: [],
        subTotal: '',
        discount: '',
        additionalCharges: '',
        gst: '',
        totalAmount: '',
        reference: '',
        note: ''
    });

    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [showDiscountField, setShowDiscountField] = useState(false);
    const [showAdditionalChargesField, setShowAdditionalChargesField] = useState(false);
    const [showGSTField, setShowGSTField] = useState(false);
    const [showReferenceField, setShowReferenceField] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                returnDate: new Date().toISOString().split('T')[0],
                partyName: '',
                materials: [],
                subTotal: '',
                discount: '',
                additionalCharges: '',
                gst: '',
                totalAmount: '',
                reference: '',
                note: ''
            });
        }
    }, [isOpen]);

    // Calculate totals
    useEffect(() => {
        const subTotal = parseFloat(formData.subTotal) || 0;
        const discount = parseFloat(formData.discount) || 0;
        const additionalCharges = parseFloat(formData.additionalCharges) || 0;
        const gst = parseFloat(formData.gst) || 0;

        const totalAmount = subTotal - discount + additionalCharges + gst;

        setFormData(prev => ({
            ...prev,
            totalAmount: totalAmount.toFixed(2)
        }));
    }, [formData.subTotal, formData.discount, formData.additionalCharges, formData.gst]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.partyName || !formData.totalAmount || !formData.returnDate) {
            alert('Please fill in all required fields (Party Name, Total Amount, Date)');
            return;
        }

        setSubmitting(true);
        try {
            await apiService.createTransaction({
                project_id: projectId,
                type: 'Material Return',
                party_name: formData.partyName,
                amount: parseFloat(formData.totalAmount),
                payment_method: 'credit', // Material return is often a credit to the project
                date: formData.returnDate,
                reference_no: formData.reference,
                description: formData.note
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving material return:', error);
            alert(error.message || 'Failed to save material return');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                                <FiX size={20} />
                            </button>
                            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>MATERIAL RETURN</h2>
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
                                disabled={submitting}
                                className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 flex items-center gap-2 min-w-[80px] justify-center"
                                style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                            >
                                {submitting ? <FiLoader className="animate-spin" /> : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-3 space-y-2.5">
                        {/* Return Date */}
                        <div className="flex items-center justify-end">
                            <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-family)' }}>
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="date"
                                    value={formData.returnDate}
                                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                                    className="border-0 text-sm font-medium"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                />
                            </div>
                        </div>

                        {/* Party Name */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                PARTY NAME
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.partyName}
                                    onChange={(e) => handleInputChange('partyName', e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                    placeholder=""
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Add Materials Button */}
                        <button
                            type="button"
                            onClick={() => setShowMaterialForm(true)}
                            className="w-full py-2.5 border-2 border-dashed rounded-lg text-sm font-medium hover:opacity-80"
                            style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                        >
                            + Add Materials
                        </button>

                        {/* Materials List */}
                        {formData.materials.length > 0 && (
                            <div className="space-y-2">
                                {formData.materials.map((material, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>{material.materialName}</p>
                                                <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-family)' }}>Unit: {material.unit} | GST: {material.gstPercent}% | Category: {material.category}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newMaterials = formData.materials.filter((_, i) => i !== index);
                                                    handleInputChange('materials', newMaterials);
                                                }}
                                                className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Sub Total */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                Sub Total
                            </label>
                            <input
                                type="number"
                                value={formData.subTotal}
                                onChange={(e) => handleInputChange('subTotal', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder=""
                                step="0.01"
                            />
                        </div>

                        {/* Add Discount, Add Additional Charges, Add GST Buttons */}
                        <div className="flex gap-3 text-sm">
                            {!showDiscountField && (
                                <button
                                    type="button"
                                    onClick={() => setShowDiscountField(true)}
                                    className="font-medium hover:opacity-80"
                                    style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                                >
                                    + Add Discount
                                </button>
                            )}
                            {!showAdditionalChargesField && (
                                <button
                                    type="button"
                                    onClick={() => setShowAdditionalChargesField(true)}
                                    className="font-medium hover:opacity-80"
                                    style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                                >
                                    + Add Additional Charges
                                </button>
                            )}
                            {!showGSTField && (
                                <button
                                    type="button"
                                    onClick={() => setShowGSTField(true)}
                                    className="font-medium hover:opacity-80"
                                    style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                                >
                                    + Add GST
                                </button>
                            )}
                        </div>

                        {/* Discount Field */}
                        {showDiscountField && (
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    Discount
                                </label>
                                <input
                                    type="number"
                                    value={formData.discount}
                                    onChange={(e) => handleInputChange('discount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                    placeholder=""
                                    step="0.01"
                                />
                            </div>
                        )}

                        {/* Additional Charges Field */}
                        {showAdditionalChargesField && (
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    Additional Charges
                                </label>
                                <input
                                    type="number"
                                    value={formData.additionalCharges}
                                    onChange={(e) => handleInputChange('additionalCharges', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                    placeholder=""
                                    step="0.01"
                                />
                            </div>
                        )}

                        {/* GST Field */}
                        {showGSTField && (
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    GST
                                </label>
                                <input
                                    type="number"
                                    value={formData.gst}
                                    onChange={(e) => handleInputChange('gst', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                    placeholder=""
                                    step="0.01"
                                />
                            </div>
                        )}

                        {/* Total Amount */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                Total Amount
                            </label>
                            <input
                                type="text"
                                value={formData.totalAmount}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                                style={{ fontFamily: 'var(--font-family)' }}
                            />
                        </div>

                        {/* Add Reference Button */}
                        {!showReferenceField && (
                            <button
                                type="button"
                                onClick={() => setShowReferenceField(true)}
                                className="text-sm font-medium hover:opacity-80"
                                style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                            >
                                + Reference
                            </button>
                        )}

                        {/* Reference Field */}
                        {showReferenceField && (
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                    Reference
                                </label>
                                <input
                                    type="text"
                                    value={formData.reference}
                                    onChange={(e) => handleInputChange('reference', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    style={{ fontFamily: 'var(--font-family)' }}
                                    placeholder=""
                                />
                            </div>
                        )}

                        {/* Note (Optional) */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                Note(Optional)
                            </label>
                            <textarea
                                value={formData.note}
                                onChange={(e) => handleInputChange('note', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                rows="3"
                                placeholder=""
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Add Material Form Popup */}
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

export default MaterialReturnFormPopup;
