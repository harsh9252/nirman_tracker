import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import apiService from '../services/api';
import logo from '../assets/logo-big.png';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setIsValidToken(false);
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (password.includes(' ')) {
      return 'Password cannot contain spaces';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await apiService.resetPassword(token, newPassword);
      setMessage('Password reset successfully! Redirecting to login...');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex">
        {/* Construction Building Background */}
        <div className="fixed inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/70 to-yellow-50/80"></div>
        </div>

        <div className="relative z-10 flex w-full min-h-screen">
          <div className="w-full lg:w-1/2 flex items-center justify-center p-4 ml-auto">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                    <img src={logo} alt="Nirmaan Tracker Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-3">
                    Invalid Link
                  </h2>
                  <p className="text-gray-700 font-medium">
                    This password reset link is invalid or has expired.
                  </p>
                </div>

                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-amber-700 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-amber-800 hover:to-orange-700 focus:ring-4 focus:ring-amber-200 focus:ring-offset-2 transition-all duration-300 font-semibold"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Construction Building Background */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/70 to-yellow-50/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full min-h-screen">
        {/* Left Section - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img src={logo} alt="Nirmaan Tracker Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-2">Nirmaan Tracker</h1>
              <p className="text-gray-700 font-medium text-base">Construction Management Platform</p>
              <p className="text-gray-600 text-sm mt-2">Reset your password securely</p>
            </div>
          </div>
        </div>

        {/* Right Section - Reset Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors group"
                >
                  <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </button>

                {/* Mobile Logo */}
                <div className="lg:hidden mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                    <img src={logo} alt="Nirmaan Tracker Logo" className="w-full h-full object-cover" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">Nirmaan Tracker</h1>
                </div>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-3">
                  Reset Password
                </h2>
                <p className="text-gray-700 font-medium">
                  Enter your new password below
                </p>
              </div>

              {/* Success Message */}
              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" size={16} />
                    <p className="text-green-800 text-sm">{message}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Reset Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-transparent transition-all duration-300"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-transparent transition-all duration-300"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-700 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-amber-800 hover:to-orange-700 focus:ring-4 focus:ring-amber-200 focus:ring-offset-2 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <FiLock size={20} />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Password must be at least 6 characters long
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
