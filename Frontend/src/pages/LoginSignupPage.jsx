import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft, FiLogIn, FiKey, FiSettings, FiTool, FiBarChart2, FiShield, FiClock, FiUsers } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import logo from '../assets/logo-big.png';

const LoginSignupPage = () => {
  const { login, isAuthenticated, requiresPasswordChange } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const [formType, setFormType] = useState('login'); // 'login', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');
  const [formData, setFormData] = useState({
    // Login
    identifier: '',
    password: '',
    // Forgot Password
    resetEmail: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formType === 'login') {
      if (!formData.identifier.trim()) {
        newErrors.identifier = 'Email or Phone is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else if (formType === 'forgot') {
      if (!formData.resetEmail.trim()) {
        newErrors.resetEmail = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.resetEmail)) {
        newErrors.resetEmail = 'Email is invalid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Add 2 second delay before processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      if (formType === 'login') {
        console.log('Attempting login with:', {
          identifier: formData.identifier,
          password: formData.password
        });

        const data = await apiService.login({
          identifier: formData.identifier,
          password: formData.password
        });

        console.log('Login response:', data);

        // Use auth context to handle login
        login(data.token, data.user);

        setMessage('Login successful! Redirecting...');
        // Hard redirect to dashboard to clear router memory
        setTimeout(() => {
          window.location.href = '/#/dashboard';
        }, 1500);
      } else if (formType === 'forgot') {
        const data = await apiService.forgotPassword({
          email: formData.resetEmail
        });

        setMessage('Password reset link sent to your email!');
        console.log('Password reset request successful');
      }
    } catch (error) {
      // Handle different types of errors with user-friendly messages
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.message) {
        // Use the message from apiService which should be user-friendly
        errorMessage = error.message;
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network and try again.';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      identifier: '',
      password: '',
      resetEmail: ''
    });
    setErrors({});
    setMessage('');
  };

  // Progressive dots animation effect
  useEffect(() => {
    if (loading) {
      setDots('.');
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          if (prev === '...') return '....';
          return '.';
        });
      }, 300); // Slower animation - 300ms intervals

      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [loading]);

  return (
    <div className="min-h-screen flex">
      {/* Construction Building Background Image */}
      <div className="fixed inset-0">
        {/* Construction Building Background with Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
          }}
        ></div>
        {/* Light Creamy Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/70 to-yellow-50/80"></div>
        {/* Subtle Construction Theme Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 via-orange-100/15 to-yellow-200/20"></div>
        {/* Subtle Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%)
            `,
            backgroundSize: '20px 20px'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full min-h-screen">
        {/* Left Section - Modern Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12">
          <div className="max-w-md text-center">
            {/* Modern Logo with Animation */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img src={logo} alt="Nirmaan Tracker Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-2">Nirmaan Tracker</h1>
              <p className="text-gray-700 font-medium text-base">Construction Management Platform</p>
              <p className="text-gray-600 text-sm mt-2">Streamline your construction projects</p>
            </div>

            {/* Construction Feature Cards */}
            <div className="grid grid-cols-3 gap-3 max-w-sm">
              <div className="bg-amber-100/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-2xl hover:bg-amber-200/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-amber-300/50">
                <FiSettings className="mx-auto mb-2 text-amber-700 group-hover:text-amber-800 transition-colors" size={24} />
                <p className="text-xs font-medium text-gray-700">Safety First</p>
              </div>
              <div className="bg-orange-100/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-2xl hover:bg-orange-200/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-orange-300/50">
                <FiTool className="mx-auto mb-2 text-orange-700 group-hover:text-orange-800 transition-colors" size={24} />
                <p className="text-xs font-medium text-gray-700">Equipment</p>
              </div>
              <div className="bg-amber-100/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-2xl hover:bg-amber-200/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-amber-300/50">
                <FiBarChart2 className="mx-auto mb-2 text-amber-700 group-hover:text-amber-800 transition-colors" size={24} />
                <p className="text-xs font-medium text-gray-700">Analytics</p>
              </div>
              <div className="bg-orange-100/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-2xl hover:bg-orange-200/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-orange-300/50">
                <FiShield className="mx-auto mb-2 text-orange-700 group-hover:text-orange-800 transition-colors" size={24} />
                <p className="text-xs font-medium text-gray-700">Security</p>
              </div>
              <div className="bg-amber-100/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-2xl hover:bg-amber-200/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-amber-300/50">
                <FiClock className="mx-auto mb-2 text-amber-700 group-hover:text-amber-800 transition-colors" size={24} />
                <p className="text-xs font-medium text-gray-700">Timeline</p>
              </div>
              <div className="bg-orange-100/60 backdrop-blur-sm rounded-xl p-4 text-center hover:shadow-2xl hover:bg-orange-200/70 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-orange-300/50">
                <FiUsers className="mx-auto mb-2 text-orange-700 group-hover:text-orange-800 transition-colors" size={24} />
                <p className="text-xs font-medium text-gray-700">Team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Modern Scrollable Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-6">
            <div className="text-center mb-6">
              {formType === 'forgot' && (
                <button
                  onClick={() => {
                    setFormType('login');
                    resetForm();
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors group"
                >
                  <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </button>
              )}

              {/* Mobile Logo - shown only on smaller screens */}
              <div className="lg:hidden mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                  <img src={logo} alt="Nirmaan Tracker Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">Nirmaan Tracker</h1>
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-3">
                {formType === 'login' && 'Welcome'}
                {formType === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-gray-700 font-medium">
                {formType === 'login' && 'Sign in to your Nirmaan Tracker account'}
                {formType === 'forgot' && 'Enter your email to reset password'}
              </p>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{message}</p>
              </div>
            )}

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Forms */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {formType === 'login' && (
                <>
                  {/* Modern Login Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email / Phone
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-transparent transition-all duration-300 ${
                          errors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Enter email or phone"
                      />
                    </div>
                    {errors.identifier && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.identifier}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-transparent transition-all duration-300 ${
                          errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('forgot');
                        resetForm();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </>
              )}


              {formType === 'forgot' && (
                <>
                  {/* Forgot Password Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="resetEmail"
                        value={formData.resetEmail}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.resetEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.resetEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.resetEmail}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FiKey className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Password Reset</p>
                        <p>Enter your email address and we'll send you a link to reset your password.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modern Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-700 to-orange-600 text-white py-4 px-6 rounded-xl hover:from-amber-800 hover:to-orange-700 focus:ring-4 focus:ring-amber-200 focus:ring-offset-2 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <FiLogIn size={20} />
                    <span>Signing in<span className="text-sm font-light">{dots}</span></span>
                  </>
                ) : (
                  <>
                    {formType === 'login' && <><FiLogIn size={20} /> <span>Sign in</span></>}
                    {formType === 'forgot' && <><FiKey size={20} /> <span>Send Reset Link</span></>}
                  </>
                )}
              </button>
            </form>


          </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupPage;
