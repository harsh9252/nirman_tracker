import React, { useState } from 'react';
import { FiX, FiCheck, FiDollarSign, FiCalendar, FiCreditCard, FiAlignLeft } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const SalaryPaymentPopup = ({ isOpen, onClose, slip, onSubmit }) => {
    const [formData, setFormData] = useState({
        amount: slip?.balance || slip?.net_amount || 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        transaction_reference: '',
        notes: ''
    });

    if (!isOpen || !slip) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <FiCreditCard size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight uppercase">Record Payment</h2>
                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest opacity-80">Salary Payout Workflow</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                        <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">Paying For</p>
                        <p className="text-lg font-black">{slip.employee_name}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <div>
                                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Net Amount</p>
                                <p className="text-sm font-bold">₹{slip.net_amount}</p>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div>
                                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Pending Balance</p>
                                <p className="text-sm font-bold text-yellow-300">₹{slip.balance || slip.net_amount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Amount Input */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Amount</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600">
                                <FaRupeeSign size={14} />
                            </div>
                            <input
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                max={slip.balance || slip.net_amount}
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date Input */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <FiCalendar size={14} />
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={formData.payment_date}
                                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Method</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    {/* Reference */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transaction Reference</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <FiDollarSign size={14} />
                            </div>
                            <input
                                type="text"
                                value={formData.transaction_reference}
                                onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="Ref ID, UPI ID, etc."
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes</label>
                        <div className="relative">
                            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none text-gray-400">
                                <FiAlignLeft size={14} />
                            </div>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="2"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-500 transition-all"
                                placeholder="Additional details..."
                            ></textarea>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest mt-4"
                    >
                        <FiCheck size={18} />
                        Confirm Payout
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SalaryPaymentPopup;
