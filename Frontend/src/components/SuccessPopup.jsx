import React, { useState } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';

export default function SuccessPopup({ isOpen, onClose, title, message, clientId, leadData, onCreateProject, shouldCloseParent = true }) {
    const [createProject, setCreateProject] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        if (createProject && onCreateProject) {
            onCreateProject(clientId, leadData);
        } else if (shouldCloseParent) {
            // Only call onClose if we're not creating a project AND shouldCloseParent is true
            onClose();
        }
        setCreateProject(false);
        if (!createProject) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200]">
            <div
                className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
                style={{ fontFamily: 'var(--font-family)' }}
            >
                {/* Success Icon Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mb-2">
                        <FiCheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <h2
                        className="text-white font-semibold text-base"
                        style={{ fontFamily: 'var(--font-family)' }}
                    >
                        {title || 'Success!'}
                    </h2>
                </div>

                {/* Message Content */}
                <div className="px-4 py-4">
                    <p
                        className="text-gray-700 text-center text-sm mb-3"
                        style={{
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--placeholder-font-size)'
                        }}
                    >
                        {message || 'Lead successfully converted to client!'}
                    </p>

                    {clientId && (
                        <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-3">
                            <p
                                className="text-green-800 text-xs text-center"
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                <span className="font-semibold">Client ID:</span> {clientId}
                            </p>
                        </div>
                    )}

                    {/* Create Project Checkbox */}
                    {clientId && onCreateProject && (
                        <div className="mb-3 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                            <input
                                type="checkbox"
                                id="createProject"
                                checked={createProject}
                                onChange={(e) => setCreateProject(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                                htmlFor="createProject"
                                className="text-sm text-gray-700 cursor-pointer select-none"
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                Also create project for this client
                            </label>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="w-full text-white px-3 py-2 rounded-md hover:opacity-90 transition-all shadow-sm text-sm"
                        style={{
                            backgroundColor: 'var(--primary-color)',
                            fontFamily: 'var(--font-family)',
                            fontSize: 'var(--placeholder-font-size)',
                            fontWeight: '500'
                        }}
                    >
                        {createProject ? 'Continue to Project' : 'Got it!'}
                    </button>
                </div>
            </div>
        </div>
    );
}
