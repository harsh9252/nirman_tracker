import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const AddBankAccountPopup = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        bankAddress: '',
        ibanNumber: '',
        upiNumber: '',
        openingBalance: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Bank Account Data:', formData);
        if (onSave) onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-family)' }}>ADD NEW ACCOUNT</h2>
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
                    {/* Account Holder Name */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500 uppercase" style={{ fontFamily: 'var(--font-family)' }}>
                            ACCOUNT HOLDER NAME:
                        </label>
                        <input
                            type="text"
                            value={formData.accountHolderName}
                            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                        />
                    </div>

                    {/* Account Number */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500 uppercase" style={{ fontFamily: 'var(--font-family)' }}>
                            ACCOUNT NUMBER:
                        </label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                        />
                    </div>

                    {/* IFSC Code */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500 uppercase" style={{ fontFamily: 'var(--font-family)' }}>
                            IFSC CODE:
                        </label>
                        <input
                            type="text"
                            value={formData.ifscCode}
                            onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                        />
                    </div>

                    {/* Bank Name */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500 uppercase" style={{ fontFamily: 'var(--font-family)' }}>
                            BANK NAME:
                        </label>
                        <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                        />
                    </div>

                    {/* Bank Address */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500 uppercase" style={{ fontFamily: 'var(--font-family)' }}>
                            BANK ADDRESS:
                        </label>
                        <input
                            type="text"
                            value={formData.bankAddress}
                            onChange={(e) => handleInputChange('bankAddress', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                        />
                    </div>

                    {/* IBAN Number */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500 uppercase" style={{ fontFamily: 'var(--font-family)' }}>
                            IBAN NUMBER:
                        </label>
                        <input
                            type="text"
                            value={formData.ibanNumber}
                            onChange={(e) => handleInputChange('ibanNumber', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                        />
                    </div>

                    {/* UPI Number */}
                    <div className="relative">
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500 uppercase" style={{ fontFamily: 'var(--font-family)' }}>
                            UPI NUMBER:
                        </label>
                        <input
                            type="text"
                            value={formData.upiNumber}
                            onChange={(e) => handleInputChange('upiNumber', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                            style={{ fontFamily: 'var(--font-family)' }}
                            placeholder=""
                        />
                    </div>

                    {/* Opening Balance */}
                    <div>
                        <p className="text-sm font-medium text-gray-900 mb-2" style={{ fontFamily: 'var(--font-family)' }}>Opening Balance:</p>
                        <div className="relative">
                            <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500 uppercase" style={{ fontFamily: 'var(--font-family)' }}>
                                AMOUNT
                            </label>
                            <input
                                type="number"
                                value={formData.openingBalance}
                                onChange={(e) => handleInputChange('openingBalance', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                                style={{ fontFamily: 'var(--font-family)' }}
                                placeholder=""
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBankAccountPopup;
