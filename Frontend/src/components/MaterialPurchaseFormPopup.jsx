import React, { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import AddMaterialFormPopup from './AddMaterialFormPopup';
import apiService from '../services/api';

const MaterialPurchaseFormPopup = ({ isOpen, onClose, projectName, projectId, onSuccess }) => {
    const [formData, setFormData] = useState({
        purchaseInvoiceDate: new Date().toISOString().split('T')[0],
        partyName: '',
        materials: [],
        subTotal: '',
        additionalCharges: '',
        discount: '',
        totalAmount: '',
        deductions: [],
        netAmount: '',
        roundOff: false,
        paidAmount: '',
        costCode: '',
        purchaseInvoiceNo: '',
        billToShipTo: '',
        note: ''
    });

    const [showDeductions, setShowDeductions] = useState(false);
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form and set current date when popup opens
            setFormData({
                purchaseInvoiceDate: new Date().toISOString().split('T')[0],
                partyName: '',
                materials: [],
                subTotal: '',
                additionalCharges: '',
                discount: '',
                totalAmount: '',
                deductions: [],
                netAmount: '',
                roundOff: false,
                paidAmount: '',
                costCode: '',
                purchaseInvoiceNo: '',
                billToShipTo: '',
                note: ''
            });
        }
    }, [isOpen]);

    // Calculate totals
    useEffect(() => {
        const subTotal = parseFloat(formData.subTotal) || 0;
        const additionalCharges = parseFloat(formData.additionalCharges) || 0;
        const discount = parseFloat(formData.discount) || 0;

        const totalAmount = subTotal + additionalCharges - discount;

        // Calculate deductions total
        const deductionsTotal = formData.deductions.reduce((sum, ded) => sum + (parseFloat(ded.amount) || 0), 0);

        let netAmount = totalAmount - deductionsTotal;

        // Apply round off if checked
        if (formData.roundOff) {
            netAmount = Math.round(netAmount);
        }

        setFormData(prev => ({
            ...prev,
            totalAmount: totalAmount.toFixed(2),
            netAmount: netAmount.toFixed(2)
        }));
    }, [formData.subTotal, formData.additionalCharges, formData.discount, formData.deductions, formData.roundOff]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddDeduction = () => {
        setFormData(prev => ({
            ...prev,
            deductions: [...prev.deductions, { description: '', amount: '' }]
        }));
        setShowDeductions(true);
    };

    const handleDeductionChange = (index, field, value) => {
        const newDeductions = [...formData.deductions];
        newDeductions[index][field] = value;
        setFormData(prev => ({ ...prev, deductions: newDeductions }));
    };

    const handleRemoveDeduction = (index) => {
        const newDeductions = formData.deductions.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, deductions: newDeductions }));
        if (newDeductions.length === 0) {
            setShowDeductions(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.partyName || !formData.totalAmount || !formData.purchaseInvoiceDate) {
            alert('Please fill in all required fields (Party Name, Total Amount, Date)');
            return;
        }

        setSubmitting(true);
        try {
            await apiService.createTransaction({
                project_id: projectId,
                type: 'Material Purchase',
                party_name: formData.partyName,
                amount: parseFloat(formData.totalAmount),
                payment_method: 'credit', // Material purchase is often on credit
                date: formData.purchaseInvoiceDate,
                reference_no: formData.purchaseInvoiceNo,
                cost_code: formData.costCode,
                description: formData.note
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving material purchase:', error);
            alert(error.message || 'Failed to save material purchase');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                            <FiX size={20} />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>MATERIAL PURCHASE</h2>
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
                    {/* Purchase Invoice Date */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'var(--font-family)' }}>Purchase Invoice Date</p>
                            <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>
                                {new Date(formData.purchaseInvoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'date';
                                input.value = formData.purchaseInvoiceDate;
                                input.onchange = (e) => handleInputChange('purchaseInvoiceDate', e.target.value);
                                input.click();
                            }}
                            className="p-2 hover:bg-gray-200 rounded"
                        >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
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

                    {/* Additional Charges */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                            Additional Charges
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={formData.additionalCharges}
                                onChange={(e) => handleInputChange('additionalCharges', e.target.value)}
                                className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder=""
                                step="0.01"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs border border-gray-300 rounded"
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                GS %
                            </button>
                        </div>
                    </div>

                    {/* Discount */}
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

                    {/* Deduction */}
                    {!showDeductions && (
                        <button
                            type="button"
                            onClick={handleAddDeduction}
                            className="text-sm font-medium hover:opacity-80"
                            style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                        >
                            + Deduction
                        </button>
                    )}

                    {/* Deductions List */}
                    {showDeductions && formData.deductions.map((deduction, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>Deduction {index + 1}</p>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveDeduction(index)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                >
                                    Remove
                                </button>
                            </div>
                            <input
                                type="text"
                                value={deduction.description}
                                onChange={(e) => handleDeductionChange(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder="Description"
                            />
                            <input
                                type="number"
                                value={deduction.amount}
                                onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder="Amount"
                                step="0.01"
                            />
                        </div>
                    ))}

                    {showDeductions && (
                        <button
                            type="button"
                            onClick={handleAddDeduction}
                            className="text-sm font-medium hover:opacity-80"
                            style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                        >
                            + Add Another Deduction
                        </button>
                    )}

                    {/* Net Amount */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                            Net Amount
                        </label>
                        <input
                            type="text"
                            value={formData.netAmount}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                            style={{ fontFamily: 'var(--font-family)' }}
                        />
                        <label className="flex items-center gap-2 mt-2 text-xs text-gray-600" style={{ fontFamily: 'var(--font-family)' }}>
                            <input
                                type="checkbox"
                                checked={formData.roundOff}
                                onChange={(e) => handleInputChange('roundOff', e.target.checked)}
                                className="rounded"
                            />
                            Round Off
                        </label>
                    </div>

                    {/* Paid Amount */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                            Paid Amount
                        </label>
                        <input
                            type="number"
                            value={formData.paidAmount}
                            onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                            step="0.01"
                        />
                    </div>

                    {/* Cost Code */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                            ADD COST CODE
                        </label>
                        <select
                            value={formData.costCode}
                            onChange={(e) => handleInputChange('costCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            <option value="">Select Cost Code</option>
                            <option value="code1">Material</option>
                            <option value="code2">Labour</option>
                            <option value="code3">Equipment</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {/* Purchase Invoice No */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                            Purchase Invoice No.
                        </label>
                        <input
                            type="text"
                            value={formData.purchaseInvoiceNo}
                            onChange={(e) => handleInputChange('purchaseInvoiceNo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                        />
                    </div>

                    {/* Bill To/Ship To */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                            Bill To/Ship To
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.billToShipTo}
                                onChange={(e) => handleInputChange('billToShipTo', e.target.value)}
                                className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder=""
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium hover:opacity-80"
                                style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                            >
                                + Add
                            </button>
                        </div>
                    </div>

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

                    {/* Upload Files & Scan Bill */}
                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            type="button"
                            className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            Upload Files
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            Scan Bill
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </button>
                    </div>
                </form>
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
        </div>
    );
};

export default MaterialPurchaseFormPopup;
