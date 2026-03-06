import React, { useState, useEffect } from 'react';
import { FiX, FiLoader, FiCalendar, FiUser, FiCreditCard, FiAlignLeft, FiHash, FiFileText, FiUpload, FiCheck } from 'react-icons/fi';
import apiService from '../services/api';

const PaymentInFormPopup = ({ isOpen, onClose, projectName, projectId, clientName, onSuccess }) => {
    const [formData, setFormData] = useState({
        partyName: '',
        amount: '',
        paymentMethod: 'cash',
        referenceNo: '',
        moreDetails: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                partyName: clientName || '',
                amount: '',
                paymentMethod: 'cash',
                referenceNo: '',
                moreDetails: '',
                date: new Date().toISOString().split('T')[0]
            });
            setSelectedFile(null);
        }
    }, [isOpen]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.warning('File size too large. Maximum 5MB allowed.');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.partyName || !formData.amount || !formData.date) {
            toast.warning('Please fill in all required fields (Party Name, Amount, Date)');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('project_id', projectId);
            data.append('type', 'Payment In');
            data.append('party_name', formData.partyName);
            data.append('amount', parseFloat(formData.amount));
            data.append('payment_method', formData.paymentMethod);
            data.append('reference_no', formData.referenceNo);
            data.append('date', formData.date);
            data.append('description', formData.moreDetails);

            if (selectedFile) {
                data.append('attachment', selectedFile);
            }

            await apiService.createTransaction(data);

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving payment in:', error);
            toast.error(error.message || 'Failed to save payment in');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputStyle = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all";
    const labelStyle = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5";

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-family)' }}>Receive Payment (In)</h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-0.5 ml-4" style={{ fontFamily: 'var(--font-family)' }}>{projectName}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* Section 1: Transaction Basics */}
                        <div>
                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiAlignLeft /> Transaction Info
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelStyle}>Party Name <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiUser />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.partyName}
                                            readOnly
                                            className={`${inputStyle} pl-10 bg-gray-100 cursor-not-allowed`}
                                            placeholder="Client Name"
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelStyle}>Transaction Date <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiCalendar />
                                        </div>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                            className={`${inputStyle} pl-10`}
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelStyle}>Amount <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500 font-bold">
                                            ₹
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.amount}
                                            onChange={(e) => handleInputChange('amount', e.target.value)}
                                            className={`${inputStyle} pl-8 text-lg font-bold text-emerald-600`}
                                            placeholder="0.00"
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Payment Details */}
                        <div>
                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiCreditCard /> Payment Details
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <label className={labelStyle}>Payment Method</label>
                                    <div className="flex gap-4 mt-2">
                                        {['cash', 'bank', 'cheque'].map((method) => (
                                            <label key={method} className={`
                                                flex-1 cursor-pointer relative
                                                ${formData.paymentMethod === method ? '' : 'hover:bg-gray-100'}
                                                transition-all rounded-lg
                                            `}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method}
                                                    checked={formData.paymentMethod === method}
                                                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                                    className="peer sr-only"
                                                />
                                                <div className={`
                                                    text-center py-2.5 rounded-lg border text-sm font-bold uppercase tracking-wide transition-all
                                                    ${formData.paymentMethod === method
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm ring-1 ring-emerald-100'
                                                        : 'bg-white text-gray-500 border-gray-200'}
                                                `}>
                                                    {method === 'bank' ? 'Bank Transfer' : method}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                {(formData.paymentMethod === 'bank' || formData.paymentMethod === 'cheque') && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                        <div className="md:col-span-2">
                                            <label className={labelStyle}>Reference No.</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                    <FiHash />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.referenceNo}
                                                    onChange={(e) => handleInputChange('referenceNo', e.target.value)}
                                                    className={`${inputStyle} pl-10`}
                                                    placeholder="Cheque/Ref No."
                                                    style={{ fontFamily: 'var(--font-family)' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Additional Info */}
                        <div>
                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FiFileText /> Additional Info
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelStyle}>Remarks / Notes</label>
                                    <textarea
                                        value={formData.moreDetails}
                                        onChange={(e) => handleInputChange('moreDetails', e.target.value)}
                                        className={`${inputStyle} resize-none min-h-[80px]`}
                                        placeholder="Add any relevant details about this payment..."
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                </div>

                                <div>
                                    <label className={labelStyle}>Attachments</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,.pdf"
                                    />
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="px-4 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-all flex items-center gap-2"
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        >
                                            <FiUpload />
                                            {selectedFile ? 'Change File' : 'Upload Receipt/Invoice'}
                                        </button>
                                        {selectedFile && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                                <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                                                <button onClick={() => setSelectedFile(null)} className="hover:text-rose-600"><FiX /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            {submitting ? <FiLoader className="animate-spin" /> : <><FiCheck /> CONFIRM RECEIPT</>}
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
};

export default PaymentInFormPopup;
