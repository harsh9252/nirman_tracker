import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiLock, FiEye, FiEyeOff, FiShield, FiCheckCircle, FiX } from "react-icons/fi";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function ChangePasswordPopup({ user, onPasswordChanged, onClose, showCloseButton = false }) {
  // Prevent closing if it's a temporary password (showCloseButton = false)
  const handleCloseAttempt = () => {
    if (showCloseButton && onClose) {
      onClose();
    }
    // If showCloseButton is false, don't allow closing
  };

  // Prevent Escape key from closing when it's a temporary password
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !showCloseButton) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (!showCloseButton) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showCloseButton]);
    const { updateUser } = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const validatePassword = (password) => {
        if (!password) {
            return "Password is required";
        }
        if (password.length < 6) {
            return "Password must be at least 6 characters long";
        }
        if (password.includes(' ')) {
            return "Password cannot contain spaces";
        }
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleChangePassword();
    };

    const handleChangePassword = async () => {
        setError("");
        setSuccess("");

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (!confirmPassword) {
            setError("Please confirm your password");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const data = await apiService.changePassword({
                userId: user.id,
                newPassword: newPassword
            });

            // Update user in localStorage and auth context to remove temp password flag
            const updatedUser = { ...user, isTempPassword: false };
            updateUser(updatedUser);

            // Close popup - user is already on profile page
            if (onPasswordChanged) {
                onPasswordChanged();
            }
        } catch (err) {
            console.error("Error changing password:", err);
            setError(err.message || "Failed to change password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <>
            {/* Blur backdrop */}
            <div
                className={`fixed inset-0 z-[9999] ${showCloseButton ? 'cursor-pointer' : 'pointer-events-none'}`}
                style={{
                    backdropFilter: 'blur(6px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)'
                }}
                onClick={showCloseButton ? handleCloseAttempt : undefined}
            />

            {/* Password Change Card - positioned at center */}
            <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4">
                <div
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                        border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-5 py-4 flex items-center justify-between"
                        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <FiShield className="text-white" size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'var(--font-family)' }}>
                                    Change Your Password
                                </h3>
                                <p className="text-white/80 text-sm" style={{ fontFamily: 'var(--font-family)' }}>
                                    Update your account password
                                </p>
                            </div>
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={() => {
                                    if (onClose) {
                                        onClose();
                                    }
                                }}
                                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                title="Close"
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-5 sm:p-6">
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800" style={{ fontFamily: 'var(--font-family)' }}>
                                <strong>Hello, {user?.firstName || 'User'}!</strong> Enter your new password below to update your account security.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700" style={{ fontFamily: 'var(--font-family)' }}>{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FiCheckCircle className="text-green-600" size={16} />
                                    <p className="text-sm text-green-700" style={{ fontFamily: 'var(--font-family)' }}>{success}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* New Password Field */}
                            <div className="mb-4">
                                <label className="block text-xs text-gray-500 uppercase font-medium mb-2 tracking-wide" style={{ fontFamily: 'var(--font-family)' }}>
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <FiLock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 transition-colors text-sm"
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="mb-6">
                                <label className="block text-xs text-gray-500 uppercase font-medium mb-2 tracking-wide" style={{ fontFamily: 'var(--font-family)' }}>
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <FiLock size={16} />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 transition-colors text-sm"
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 text-white rounded-xl transition-all hover:opacity-90 font-medium text-sm sm:text-base disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--primary-color)',
                                    fontFamily: 'var(--font-family)'
                                }}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>

                        <p className="text-xs text-gray-500 text-center mt-4" style={{ fontFamily: 'var(--font-family)' }}>
                            Password must be at least 6 characters long
                        </p>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
