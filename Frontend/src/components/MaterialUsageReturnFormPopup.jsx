import React, { useState, useEffect } from 'react';
import { FiX, FiRefreshCcw, FiAlertCircle } from 'react-icons/fi';
import apiService from '../services/api';
import { toast } from 'react-toastify';

const MaterialUsageReturnFormPopup = ({ isOpen, onClose, issueDetails, onSuccess }) => {
    const [formData, setFormData] = useState({
        quantity: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [maxReturnable, setMaxReturnable] = useState(0);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        if (isOpen && issueDetails) {
            fetchMaxReturnable();
        }
    }, [isOpen, issueDetails]);

    const fetchMaxReturnable = async () => {
        try {
            setVerifying(true);
            const inventory = await apiService.getProjectInventory(issueDetails.project_id);
            const returns = inventory.filter(item => item.related_id === issueDetails.id && item.type === 'Usage_Return');
            const alreadyReturned = returns.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
            setMaxReturnable(parseFloat(issueDetails.quantity) - alreadyReturned);
        } catch (error) {
            console.error('Error fetching return history:', error);
            toast.error('Failed to verify returnable quantity');
        } finally {
            setVerifying(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (parseFloat(formData.quantity) > maxReturnable) {
            toast.error(`Cannot return more than remaining issued quantity (${maxReturnable})`);
            return;
        }

        setLoading(true);
        try {
            await apiService.createUsageReturn({
                related_id: issueDetails.id,
                quantity: parseFloat(formData.quantity),
                transaction_date: formData.transaction_date,
                description: formData.description
            });
            toast.success('Material return recorded successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error recording usage return:', error);
            toast.error(error.message || 'Failed to record return');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 bg-gradient-to-r from-amber-500 to-amber-600 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <FiRefreshCcw className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Return to Stock</h2>
                            <p className="text-amber-100 text-xs font-medium uppercase tracking-wider">#{issueDetails?.id} {issueDetails?.material_name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {verifying ? (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm text-gray-500 italic">Verifying remaining quantity...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
                                <FiAlertCircle className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] text-amber-700 font-bold uppercase tracking-widest mb-1">Issue Details</p>
                                    <p className="text-sm text-amber-900 font-medium leading-tight">
                                        Originally issued {issueDetails.quantity} {issueDetails.unit}.
                                        <span className="block mt-1">Available to return: <span className="font-bold underline">{maxReturnable} {issueDetails.unit}</span></span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Return Quantity ({issueDetails.unit})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        max={maxReturnable}
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        placeholder={`Enter quantity (max ${maxReturnable})`}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold text-gray-800 placeholder:text-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Return Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.transaction_date}
                                        onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description / Reason</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g., Unused material returned from site"
                                        rows="3"
                                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-amber-500 transition-all font-bold text-gray-800 placeholder:text-gray-300 resize-none text-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || maxReturnable <= 0}
                                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${loading || maxReturnable <= 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200 hover:shadow-xl active:scale-95'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FiRefreshCcw className="w-5 h-5" />
                                            <span>RECORD RETURN</span>
                                        </>
                                    )}
                                </button>
                                {maxReturnable <= 0 && !verifying && (
                                    <p className="text-center text-rose-500 text-[10px] font-bold uppercase mt-3 tracking-wider animate-pulse">
                                        This issue has been fully returned
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default MaterialUsageReturnFormPopup;
