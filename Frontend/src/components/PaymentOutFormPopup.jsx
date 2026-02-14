import React, { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import AddBankAccountPopup from './AddBankAccountPopup';
import apiService from '../services/api';

const PaymentOutFormPopup = ({ isOpen, onClose, projectName, projectId, onSuccess }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        partyName: '',
        amount: '',
        paymentMethod: 'cash',
        bankAccount: '',
        costCode: '',
        referenceNo: '',
        moreDetails: ''
    });

    const [showBankAccountPopup, setShowBankAccountPopup] = useState(false);
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form and set current date when popup opens
            setFormData({
                date: new Date().toISOString().split('T')[0],
                partyName: '',
                amount: '',
                paymentMethod: 'cash',
                bankAccount: '',
                costCode: '',
                referenceNo: '',
                moreDetails: ''
            });
        }
    }, [isOpen]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.partyName || !formData.amount || !formData.date) {
            alert('Please fill in all required fields (Party Name, Amount, Date)');
            return;
        }

        setSubmitting(true);
        try {
            await apiService.createTransaction({
                project_id: projectId,
                type: 'Payment Out',
                party_name: formData.partyName,
                amount: parseFloat(formData.amount),
                payment_method: formData.paymentMethod,
                bank_account: formData.bankAccount,
                cost_code: formData.costCode,
                reference_no: formData.referenceNo,
                date: formData.date,
                description: formData.moreDetails
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving payment out:', error);
            alert(error.message || 'Failed to save payment out');
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
                            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>PAYMENT</h2>
                            {projectName && (
                                <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-family)' }}>{projectName}</p>
                            )}
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
                        {/* Payment Out Header with Date */}
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>Payment Out</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-700" style={{ fontFamily: 'var(--font-family)' }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="border-0 text-sm"
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                AMOUNT
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder=""
                                step="0.01"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="border border-gray-300 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700 mb-3" style={{ fontFamily: 'var(--font-family)' }}>Payment Method:</p>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={formData.paymentMethod === 'cash'}
                                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm" style={{ fontFamily: 'var(--font-family)' }}>Cash</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="bank"
                                        checked={formData.paymentMethod === 'bank'}
                                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm" style={{ fontFamily: 'var(--font-family)' }}>Bank Transfer</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cheque"
                                        checked={formData.paymentMethod === 'cheque'}
                                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm" style={{ fontFamily: 'var(--font-family)' }}>Cheque</span>
                                </label>
                            </div>

                            {/* Bank Account Dropdown (shown when Bank Transfer or Cheque is selected) */}
                            {(formData.paymentMethod === 'bank' || formData.paymentMethod === 'cheque') && (
                                <div className="mt-2.5 space-y-2">
                                    <div className="relative">
                                        <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                            BANK ACCOUNT
                                        </label>
                                        <select
                                            value={formData.bankAccount}
                                            onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white"
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        >
                                            <option value="">Select Bank Account</option>
                                            <option value="account1">HDFC Bank - ****1234</option>
                                            <option value="account2">ICICI Bank - ****5678</option>
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowBankAccountPopup(true)}
                                        className="w-full py-2 text-white text-sm font-medium rounded-lg hover:opacity-90"
                                        style={{ backgroundColor: 'var(--primary-color)', fontFamily: 'var(--font-family)' }}
                                    >
                                        + New Account
                                    </button>
                                </div>
                            )}
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

                        {/* Reference No */}
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-gray-500 uppercase tracking-wider z-10" style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--label-font-size)', fontWeight: 'var(--label-font-weight)' }}>
                                REFERENCE NO.
                            </label>
                            <input
                                type="text"
                                value={formData.referenceNo}
                                onChange={(e) => handleInputChange('referenceNo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder=""
                            />
                        </div>

                        {/* More Details (Optional) - Collapsible */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowMoreDetails(!showMoreDetails)}
                                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                <span>More Details (Optional)</span>
                                <svg className={`w-4 h-4 transition-transform ${showMoreDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showMoreDetails && (
                                <div className="mt-2.5">
                                    <textarea
                                        value={formData.moreDetails}
                                        onChange={(e) => handleInputChange('moreDetails', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none bg-white"
                                        style={{ fontFamily: 'var(--font-family)' }}
                                        rows="3"
                                        placeholder="Enter additional details..."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Upload Files */}
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
                    </form>
                </div>
            </div>

            {/* Add Bank Account Popup */}
            <AddBankAccountPopup
                isOpen={showBankAccountPopup}
                onClose={() => setShowBankAccountPopup(false)}
            />
        </>
    );
};

export default PaymentOutFormPopup;
