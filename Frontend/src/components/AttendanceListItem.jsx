import React, { useState } from 'react';
import { FiChevronUp, FiClock, FiUsers, FiUser } from 'react-icons/fi';

export default function AttendanceListItem({
    party,
    onStatusChange,
    onUpdate,
    onDelete,
    currentStatus = 'Not Recorded',
    isRangeMode = false,
    rangeStats = null,
    absentDates = []
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Internal status is used for immediate UI feedback before refresh
    const [localStatus, setLocalStatus] = useState(currentStatus);

    // Sync local status when prop changes
    React.useEffect(() => {
        setLocalStatus(currentStatus);
    }, [currentStatus]);

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        const colors = [
            '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1',
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'
        ];
        const index = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    const handleStatusChange = (newStatus) => {
        setLocalStatus(newStatus);
        if (onStatusChange) {
            onStatusChange(party.id, newStatus);
        }
    };


    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-3 overflow-hidden hover:shadow-md transition-all duration-200">
            {/* Main Row */}
            <div className="p-4">
                <div className="flex items-center gap-4">
                    {/* Avatar with Ring */}
                    <div className="relative">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-white ring-1 ring-gray-100 overflow-hidden"
                            style={{ backgroundColor: party.profile_image ? 'transparent' : getAvatarColor(party.party_name) }}
                        >
                            {party.profile_image ? (
                                <img src={party.profile_image} alt={party.party_name} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(party.party_name)
                            )}
                        </div>
                        {!isRangeMode && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${localStatus === 'Present' ? 'bg-green-500' :
                                localStatus === 'Not Recorded' ? 'bg-gray-300' : 'bg-red-500'
                                }`}></div>
                        )}
                    </div>

                    {/* Name and Designation */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors text-left"
                                style={{ fontFamily: 'var(--font-family)' }}
                            >
                                {party.party_name}
                            </button>
                            <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">
                                {party.party_type}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-0.5" style={{ fontFamily: 'var(--font-family)' }}>
                            {party.designation || 'No designation'}
                        </p>
                    </div>

                    {/* Shift & Stats */}
                    <div className="hidden sm:flex flex-col items-end gap-1 px-4 border-l border-r border-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shift Hours</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                            <span className="flex items-center gap-1">
                                <FiClock size={12} className="text-blue-500" />
                                {party.shift_hours || 0}h
                            </span>
                            {party.overtime_hours > 0 && (
                                <span className="text-green-600">+{party.overtime_hours}h OT</span>
                            )}
                        </div>
                    </div>

                    {/* Status Controls / Range Stats */}
                    {isRangeMode && rangeStats ? (
                        <div className="flex items-center gap-4 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100">
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Present</span>
                                <span className="text-sm font-bold text-green-700">{rangeStats.present}</span>
                            </div>
                            <div className="w-[1px] h-6 bg-gray-200"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Absent</span>
                                <span className="text-sm font-bold text-rose-700">{rangeStats.absent}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Present Button */}
                            <button
                                onClick={() => handleStatusChange('Present')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${localStatus === 'Present'
                                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                PRESENT
                            </button>

                            {/* Absent Button */}
                            <button
                                onClick={() => handleStatusChange('Absent')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${localStatus === 'Absent'
                                    ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                ABSENT
                            </button>
                        </div>
                    )}

                    {/* Expand/More Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <FiChevronUp size={18} className={`transition-transform duration-300 ${!isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Expanded Details */}
                <div className={`grid gap-0 overflow-hidden transition-all duration-300 ${isExpanded ? 'mt-4 pt-4 border-t border-gray-50 opacity-100 max-h-[800px]' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                            <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'var(--font-family)' }}>
                                {party.country_code} {party.phone_number || party.phone}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                            <p className="text-sm font-semibold text-gray-800 truncate" style={{ fontFamily: 'var(--font-family)' }}>
                                {party.email || 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Salary Details</label>
                            <p className="text-sm font-bold text-blue-600" style={{ fontFamily: 'var(--font-family)' }}>
                                ₹{party.salary_amount || party.salary || '0'} <span className="text-[10px] text-gray-400 uppercase tracking-tighter">/ {party.salary_period || 'Month'}</span>
                            </p>
                        </div>
                    </div>

                    {party.assigned_projects && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Assigned Projects</label>
                            <p className="text-xs font-medium text-gray-600">
                                {party.assigned_projects}
                            </p>
                        </div>
                    )}

                    {(isRangeMode || absentDates.length > 0) && (
                        <div className="mt-4 p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block">Absence Tracking</label>
                                <span className="text-[10px] font-bold text-rose-500">{absentDates.length} Days Total</span>
                            </div>
                            {absentDates.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {absentDates.map((date, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-white border border-rose-100 text-[10px] font-bold text-rose-700 rounded-lg shadow-sm">
                                            {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] font-medium text-gray-400 italic">No absences recorded in this period</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
