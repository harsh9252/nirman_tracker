import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmationPopup({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1300]">
            <div
                className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                style={{ fontFamily: 'var(--font-family)' }}
            >
                {/* Warning Icon Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-2">
                        <FiAlertTriangle className="w-7 h-7 text-orange-600" />
                    </div>
                    <h2
                        className="text-white font-semibold text-base"
                        style={{ fontFamily: 'var(--font-family)' }}
                    >
                        {title || 'Confirm Action'}
                    </h2>
                </div>

                {/* Message Content */}
                <div className="px-4 py-4">
                    <p
                        className="text-gray-700 text-center text-sm mb-4"
                        style={{
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--placeholder-font-size)'
                        }}
                    >
                        {message || 'Are you sure you want to proceed?'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm"
                            style={{
                                fontFamily: 'var(--font-family)',
                                fontSize: 'var(--placeholder-font-size)',
                                fontWeight: '500'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 text-white px-3 py-2 rounded-md hover:opacity-90 transition-all shadow-sm text-sm"
                            style={{
                                backgroundColor: 'var(--primary-color)',
                                fontFamily: 'var(--font-family)',
                                fontSize: 'var(--placeholder-font-size)',
                                fontWeight: '500'
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
