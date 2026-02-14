import React, { useState } from 'react';
import { FiArrowLeft, FiEdit2, FiCheck, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiFileText } from 'react-icons/fi';
import apiService from '../services/api';

export default function ClientInfo({ selectedClient, onClose }) {
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [savingClient, setSavingClient] = useState(false);
    const [editedClientData, setEditedClientData] = useState({});

    const startEditingClient = () => {
        setEditedClientData({
            client_name: selectedClient.name,
            phone: selectedClient.phone,
            email: selectedClient.email || '',
            company_name: selectedClient.company || '',
            address: selectedClient.address || '',
            description: selectedClient.description || ''
        });
        setIsEditingClient(true);
    };

    const cancelEditingClient = () => {
        setIsEditingClient(false);
        setEditedClientData({});
    };

    const handleFieldChange = (field, value) => {
        setEditedClientData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveClient = async () => {
        setSavingClient(true);
        try {
            await apiService.updateClient(selectedClient.id, editedClientData);

            // Update the selectedClient object with the new data
            Object.assign(selectedClient, {
                name: editedClientData.client_name,
                phone: editedClientData.phone,
                email: editedClientData.email,
                company: editedClientData.company_name,
                address: editedClientData.address,
                description: editedClientData.description
            });

            setIsEditingClient(false);
        } catch (error) {
            console.error("Error updating client:", error);
            alert(error.message || "Failed to save client. Please try again.");
        } finally {
            setSavingClient(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24">
                    {/* Header */}
                    <div className="bg-white rounded-xl border border-gray-400 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-0 px-4 sm:px-2 pt-2 pb-2 border-b border-gray-200">
                            <div className="hidden sm:flex items-center gap-3 mb-3 sm:mb-0">
                                <button
                                    onClick={onClose}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiArrowLeft className="w-4 h-4" />
                                    <span className="text-sm font-medium">Back</span>
                                </button>
                            </div>



                            <div className="flex items-center justify-end gap-2 w-full sm:w-auto py-0">
                                {isEditingClient ? (
                                    <>
                                        <button
                                            onClick={saveClient}
                                            disabled={savingClient}
                                            className="flex items-center gap-1 px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm whitespace-nowrap"
                                            style={{
                                                backgroundColor: 'var(--primary-color)',
                                                minWidth: 'fit-content'
                                            }}
                                        >
                                            <FiCheck className="w-4 h-4" />
                                            <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>
                                                {savingClient ? 'Saving...' : 'Save'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={cancelEditingClient}
                                            disabled={savingClient}
                                            className="flex items-center gap-1 px-3 py-2 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm whitespace-nowrap border border-gray-300"
                                            style={{
                                                minWidth: 'fit-content'
                                            }}
                                        >
                                            <FiX className="w-4 h-4" />
                                            <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>Cancel</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={startEditingClient}
                                            className="flex items-center gap-1 px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm whitespace-nowrap"
                                            style={{
                                                backgroundColor: 'var(--primary-color)',
                                                minWidth: 'fit-content'
                                            }}
                                            title="Edit client"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                            <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>Edit</span>
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="flex items-center gap-1 px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm whitespace-nowrap"
                                            style={{
                                                backgroundColor: 'var(--primary-color)',
                                                minWidth: 'fit-content'
                                            }}
                                        >
                                            <FiArrowLeft className="w-4 h-4" />
                                            <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>Back</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Client Name */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {isEditingClient ? (
                                            <input
                                                type="text"
                                                value={editedClientData.client_name}
                                                onChange={(e) => handleFieldChange('client_name', e.target.value)}
                                                className="w-full text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
                                                style={{ fontFamily: 'var(--font-family)' }}
                                            />
                                        ) : (
                                            selectedClient.name
                                        )}
                                    </h2>
                                    <p className="text-sm text-gray-500">Client ID: {selectedClient.id}</p>
                                </div>

                                {/* Client Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Phone */}
                                    <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">PHONE</span>
                                            {isEditingClient ? (
                                                <input
                                                    type="tel"
                                                    value={editedClientData.phone}
                                                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                                                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                                                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{selectedClient.phone}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">EMAIL</span>
                                            {isEditingClient ? (
                                                <input
                                                    type="email"
                                                    value={editedClientData.email}
                                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                                                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{selectedClient.email || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Company */}
                                    <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">COMPANY</span>
                                            {isEditingClient ? (
                                                <input
                                                    type="text"
                                                    value={editedClientData.company_name}
                                                    onChange={(e) => handleFieldChange('company_name', e.target.value)}
                                                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                                                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{selectedClient.company || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Conversion Date */}
                                    <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">CONVERSION DATE</span>
                                            <span className="text-sm font-medium text-gray-900">{formatDate(selectedClient.date)}</span>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200 md:col-span-2">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">ADDRESS</span>
                                            {isEditingClient ? (
                                                <input
                                                    type="text"
                                                    value={editedClientData.address}
                                                    onChange={(e) => handleFieldChange('address', e.target.value)}
                                                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                                                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{selectedClient.address || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200 md:col-span-2">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">DESCRIPTION</span>
                                            {isEditingClient ? (
                                                <textarea
                                                    value={editedClientData.description}
                                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 min-h-[80px]"
                                                    rows={3}
                                                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{selectedClient.description || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
