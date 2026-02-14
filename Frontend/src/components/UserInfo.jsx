import React, { useState } from "react";
import { FiFileText, FiUser, FiMail, FiPhone, FiLock, FiShield, FiActivity, FiCalendar, FiEdit, FiTrash2 } from "react-icons/fi";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import TableActionButton from "./TableActionButton";

// Add wave animation for back button
const waveStyles = `
  @keyframes wave {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    50% { transform: translateX(3px); }
    75% { transform: translateX(-3px); }
  }
`;

// Inject wave animation styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = waveStyles;
    document.head.appendChild(styleSheet);
}

// DisplayField component for consistent styling
const DisplayField = ({ label, value, icon: Icon, fullWidth = false }) => {
    console.log(`DisplayField rendering: ${label} = ${value}`);
    return (
        <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${fullWidth ? 'md:col-span-2' : ''}`}>
            {Icon && <Icon size={16} className="text-gray-500" />}
            <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {label}
                </label>
                <p className="text-sm text-gray-900 font-medium">{value || 'N/A'}</p>
            </div>
        </div>
    );
};

const UserInfo = ({ selectedUser, onClose, onEdit, onDelete }) => {
    if (!selectedUser) return null;

    console.log('UserInfo received selectedUser:', selectedUser);
    console.log('Username value:', selectedUser.username);

    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last || 'U';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "Admin": return "bg-purple-100 text-purple-700 border-purple-200";
            case "HR": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Site Head": return "bg-orange-100 text-orange-700 border-orange-200";
            case "Field": return "bg-green-100 text-green-700 border-green-200";
            case "Office Staff": return "bg-indigo-100 text-indigo-700 border-indigo-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Active": return "bg-light-green-bg text-green-text border-green-200";
            case "Inactive": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-light-gray-bg text-gray-700 border-gray-200";
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: FiFileText },
    ];

    return (
        <div className="bg-white rounded-xl overflow-hidden h-full flex flex-col relative">
            {/* Tab Navigation - Top */}
            <div className="border-b-[2px] border-primary bg-white">
                <nav className="flex justify-between items-center">
                    <div className="flex">
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center px-2 sm:px-3 py-1 text-sm font-medium text-white hover:text-gray-100 bg-gray-400 hover:bg-gray-450 transition-all duration-300"
                            title="Go back"
                        >
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{
                                    animation: 'wave 2.5s ease-in-out infinite'
                                }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1 text-xs sm:text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                            ? "text-white bg-primary"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <Icon size={14} className="sm:w-4 sm:h-4" />
                                    <span className="text-xs sm:text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Header with Profile Picture */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-light-gray-bg gap-2 sm:gap-0">
                <div className="flex items-center gap-4">
                    {/* Profile Picture */}
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                        {getInitials(selectedUser.first_name, selectedUser.last_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {selectedUser.first_name} {selectedUser.last_name}
                        </h2>
                        <p className="text-sm text-gray-600">{selectedUser.role}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <TableActionButton
                            icon={FaPencilAlt}
                            type="edit"
                            title="Edit"
                            onClick={() => onEdit?.(selectedUser.id)}
                        />
                        <TableActionButton
                            icon={FaTrash}
                            type="delete"
                            title="Delete"
                            onClick={() => onDelete?.(selectedUser.id)}
                        />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === "overview" && (
                    <div className="p-4 sm:p-5 md:p-6 overflow-auto h-full">
                        {/* User Information Grid - Compact and Well Organized */}
                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DisplayField
                                    label="FIRST NAME"
                                    value={selectedUser.first_name}
                                    icon={FiUser}
                                />
                                <DisplayField
                                    label="LAST NAME"
                                    value={selectedUser.last_name}
                                    icon={FiUser}
                                />
                                <DisplayField
                                    label="USERNAME"
                                    value={selectedUser.username}
                                    icon={FiUser}
                                />
                                <DisplayField
                                    label="EMAIL"
                                    value={selectedUser.email}
                                    icon={FiMail}
                                />
                                <DisplayField
                                    label="PHONE NUMBER"
                                    value={selectedUser.phone || "Not Available"}
                                    icon={FiPhone}
                                />
                                {currentUser?.role?.toLowerCase() === 'admin' && (
                                    <DisplayField
                                        label="PASSWORD"
                                        value={selectedUser.is_temp_password === 1 ? selectedUser.password : "*****"}
                                        icon={FiLock}
                                    />
                                )}
                                <DisplayField
                                    label="ROLE"
                                    value={
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                                                selectedUser.role
                                            )}`}
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        >
                                            {selectedUser.role}
                                        </span>
                                    }
                                    icon={FiShield}
                                />
                                <DisplayField
                                    label="STATUS"
                                    value={
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                                selectedUser.status
                                            )}`}
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        >
                                            {selectedUser.status}
                                        </span>
                                    }
                                    icon={FiActivity}
                                />
                                <DisplayField
                                    label="REGISTRATION DATE"
                                    value={formatDate(selectedUser.created_at)}
                                    icon={FiCalendar}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInfo;
