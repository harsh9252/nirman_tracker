import React, { useState } from 'react';
import { FiMapPin, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { formatDateForDisplay } from '../utils/dateUtils';

export default function CheckInActionPopup({ isOpen, onClose, onConfirm }) {
    const [action, setAction] = useState('start'); // 'start' or 'reschedule'
    const [rescheduleDate, setRescheduleDate] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (action === 'reschedule' && !rescheduleDate) {
            alert("Please select a date for the follow-up.");
            return;
        }
        onConfirm({ action, date: rescheduleDate });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1300]">
            <div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all"
                style={{ fontFamily: 'var(--font-family)' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FiMapPin className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-family)' }}>
                                You have reached the location!
                            </h2>
                            <p className="text-blue-100 text-xs mt-0.5">
                                What would you like to do?
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">

                    {/* Option: Start Work */}
                    <div
                        onClick={() => setAction('start')}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 flex items-start gap-4 ${action === 'start'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`mt-1 p-2 rounded-full ${action === 'start' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <FiCheckCircle size={20} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${action === 'start' ? 'text-blue-800' : 'text-gray-700'}`}>
                                Start Work Now
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Check in and mark the task status as "Working".
                            </p>
                        </div>
                    </div>

                    {/* Option: Reschedule */}
                    <div
                        onClick={() => setAction('reschedule')}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 flex items-start gap-4 ${action === 'reschedule'
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-100 hover:border-orange-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`mt-1 p-2 rounded-full ${action === 'reschedule' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <FiClock size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold ${action === 'reschedule' ? 'text-orange-800' : 'text-gray-700'}`}>
                                Reschedule / Follow-up
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Client asked to come later. Create a new task for another date.
                            </p>

                            {/* Date Picker (Collapsible) */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${action === 'reschedule' ? 'max-h-24 opacity-100 mt-3' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <label className="block text-xs font-semibold text-orange-700 uppercase mb-1">
                                    Select New Date
                                </label>
                                <input
                                    type="date"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    onClick={(e) => e.stopPropagation()} // Prevent parent click
                                    className="w-full text-sm border border-orange-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 flex gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={action === 'reschedule' && !rescheduleDate}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all transform active:scale-95 ${action === 'start'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : (action === 'reschedule' && !rescheduleDate)
                                    ? 'bg-orange-300 cursor-not-allowed'
                                    : 'bg-orange-600 hover:bg-orange-700'
                            }`}
                    >
                        {action === 'start' ? 'Check In' : 'Reschedule Task'}
                    </button>
                </div>
            </div>
        </div>
    );
}
