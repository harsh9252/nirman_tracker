import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiCalendar, FiHash, FiCheckCircle, FiLock, FiCamera, FiUpload, FiShield, FiClock } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import ChangePasswordPopup from "../components/ChangePasswordPopup";

const InputField = ({ label, required, type = "text", value, onChange, placeholder, error, disabled = false, ...rest }) => (
  <div className="relative group">
    <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 uppercase tracking-wider z-10">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200 outline-none
          ${disabled
            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
            : error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-300'
          }
        `}
        {...rest}
      />
      {!disabled && !error && (
        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-100 pointer-events-none"></div>
      )}
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <FiX size={12} />
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({ label, required, value, onChange, options, placeholder, error, disabled = false, ...rest }) => (
  <div className="relative group">
    <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-600 uppercase tracking-wider z-10">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200 outline-none appearance-none bg-white
          ${disabled
            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
            : error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-300'
          }
        `}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {!disabled && (
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
      {!disabled && !error && (
        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-100 pointer-events-none"></div>
      )}
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <FiX size={12} />
        {error}
      </p>
    )}
  </div>
);

const InfoCard = ({ label, value, icon: Icon, color = "blue", monospace = false }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700"
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Icon size={18} className={`${colorClasses[color].split(' ')[2]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-sm font-semibold text-gray-900 truncate ${monospace ? 'font-mono' : ''}`}>
            {value || 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // Fetch full profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.getProfile();
        setProfileData(response.user);
        if (response.user.profile_image) {
          setImagePreview(response.user.profile_image);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setFetchLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Populate form with profile data
  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.first_name || "");
      setLastName(profileData.last_name || "");
      setEmail(profileData.email || "");
      setUsername(profileData.username || "");
      setPhone(profileData.phone || "");
    }
  }, [profileData]);

  // Profile image handlers
  // Note: Images are stored as base64 data URLs in the database
  // Fixed: Previously corrupted due to VARCHAR(500) truncation, now uses LONGTEXT
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };



  const validateForm = () => {
    const errors = {};

    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    if (!username.trim()) errors.username = 'Username is required';
    if (!phone.trim()) errors.phone = 'Phone is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        first_name: firstName,
        last_name: lastName,
        email,
        username,
        phone,
        role: profileData.role,
        status: profileData.status,
        profile_image: imagePreview
      };

      console.log('Sending userData:', userData);
      console.log('profileData.role:', profileData.role);

      console.log('About to call api.updateUser');
      // Update user via API
      await api.updateUser(user.id, userData);
      console.log('API call successful');

      // Update local user data
      const updatedUser = {
        ...user,
        firstName: firstName,
        lastName: lastName,
        email,
        username,
        phone,
        profile_image: imagePreview
      };
      updateUser(updatedUser);

      // Refresh profile data
      const response = await api.getProfile();
      setProfileData(response.user);

      console.log('Setting success message');
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setFormErrors({});

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profileData) {
      setFirstName(profileData.first_name || "");
      setLastName(profileData.last_name || "");
      setEmail(profileData.email || "");
      setUsername(profileData.username || "");
      setPhone(profileData.phone || "");
    }
    setIsEditing(false);
  };

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

  const maskPassword = (password) => {
    if (!password || password.length <= 3) return '******';
    const maskedLength = password.length - 3;
    const asterisks = '*'.repeat(maskedLength);
    const lastThree = password.slice(-3);
    return asterisks + lastThree;
  };

  if (fetchLoading) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 pb-20 md:pb-4">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
        </main>
      </div>

      {/* Change Password Popup */}
      {isChangePasswordOpen && (
        <ChangePasswordPopup
          user={user}
          showCloseButton={true}
          onPasswordChanged={() => {
            setIsChangePasswordOpen(false);
            setSuccessMessage('Password changed successfully!');
            setTimeout(() => {
              setSuccessMessage("");
            }, 3000);
          }}
        />
      )}
    </div>
  );
}

  if (!profileData) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 pb-24 md:pb-4">
            <div className="text-center py-20">
              <p className="text-gray-600">Unable to load profile data.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-4">
          {/* Success Message Toast */}
          {successMessage && (
            <div className="fixed top-4 right-4 z-[1200] bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-family)' }}>
                {successMessage}
              </p>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            {/* Main Profile Layout */}
            <div className="flex flex-col xl:flex-row gap-4 md:gap-6 items-stretch">

              {/* LEFT COLUMN - Profile Picture & Basic Info */}
              <div className="xl:w-1/3 order-1 xl:order-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 lg:p-8 h-full flex flex-col items-center">

                  {/* Profile Picture Section */}
                  <div className="relative mb-4 md:mb-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 relative group cursor-pointer" onClick={isEditing ? () => fileInputRef.current?.click() : undefined}>
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover border-4 border-blue-100 shadow-xl transition-all duration-200 group-hover:opacity-75"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl md:text-3xl lg:text-4xl font-bold shadow-xl border-4 border-blue-100 transition-all duration-200 group-hover:opacity-75">
                          {getInitials(profileData.first_name, profileData.last_name)}
                        </div>
                      )}

                      {/* Hover Overlay for Edit Mode */}
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <div className="text-center text-white">
                            <FiCamera size={20} className="md:w-6 md:h-6 mx-auto mb-2" />
                            <p className="text-xs md:text-sm font-medium">Upload your image</p>
                          </div>
                        </div>
                      )}

                      {/* Upload Progress */}
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* User Info Section */}
                  <div className="text-center space-y-3 md:space-y-4 w-full">
                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {profileData.first_name} {profileData.last_name}
                      </h2>

                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                        <FiShield size={14} />
                        {profileData.role}
                      </div>

                      <p className="text-gray-600 font-medium text-sm md:text-base">@{profileData.username}</p>
                    </div>

                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Detailed Profile Information */}
              <div className="xl:w-2/3 order-2 xl:order-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 h-full pb-24 md:pb-6">

                  {/* Header with Edit and Change Password Buttons */}
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <div className="flex gap-2 flex-wrap md:flex-nowrap">
                        <button
                          onClick={() => setIsChangePasswordOpen(true)}
                          className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 text-xs md:text-base"
                        >
                          <FiLock size={12} className="md:w-4 md:h-4" />
                          <span className="hidden md:inline">Change Password</span>
                          <span className="md:hidden">Password</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 text-xs md:text-base"
                        >
                          <FiEdit2 size={12} className="md:w-4 md:h-4" />
                          <span className="hidden md:inline">Edit</span>
                          <span className="md:hidden hidden">Edit</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 text-xs md:text-base"
                        >
                          <FiSave size={12} className="md:w-4 md:h-4" />
                          <span className="hidden md:inline">{loading ? 'Saving...' : 'Save Changes'}</span>
                          <span className="md:hidden">{loading ? 'Save' : 'Save'}</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 text-xs md:text-base"
                        >
                          <FiX size={12} className="md:w-4 md:h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>



                  <div className="flex-1">
                    {isEditing ? (
                      // Edit Mode
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <InputField
                            label="FIRST NAME"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter first name"
                            error={formErrors.firstName}
                          />
                        </div>
                        <div>
                          <InputField
                            label="LAST NAME"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter last name"
                            error={formErrors.lastName}
                          />
                        </div>
                        <div>
                          <InputField
                            label="EMAIL"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            error={formErrors.email}
                          />
                        </div>
                        <div>
                          <InputField
                            label="USERNAME"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            error={formErrors.username}
                          />
                        </div>
                        <div>
                          <InputField
                            label="PHONE"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            error={formErrors.phone}
                          />
                        </div>
                      </div>
                    ) : (
                      // View Mode - Display all fields
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                          label="FIRST NAME"
                          value={profileData.first_name}
                          icon={FiUser}
                          color="green"
                        />
                        <InfoCard
                          label="LAST NAME"
                          value={profileData.last_name}
                          icon={FiUser}
                          color="green"
                        />
                        <InfoCard
                          label="EMAIL"
                          value={profileData.email}
                          icon={FiMail}
                          color="purple"
                        />
                        <InfoCard
                          label="PHONE"
                          value={profileData.phone}
                          icon={FiPhone}
                          color="orange"
                        />
                        <InfoCard
                          label="USERNAME"
                          value={profileData.username}
                          icon={FiUser}
                          color="blue"
                        />
                        <InfoCard
                          label="PASSWORD"
                          value={maskPassword(profileData.password)}
                          icon={FiLock}
                          color="gray"
                          monospace={true}
                        />
                        <InfoCard
                          label="ROLE"
                          value={profileData.role}
                          icon={FiCheckCircle}
                          color="green"
                        />
                        <InfoCard
                          label="STATUS"
                          value={profileData.status}
                          icon={FiCheckCircle}
                          color="blue"
                        />
                        <InfoCard
                          label="REGISTRATION DATE"
                          value={formatDate(profileData.created_at)}
                          icon={FiCalendar}
                          color="purple"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Change Password Popup */}
      {isChangePasswordOpen && (
        <ChangePasswordPopup
          user={user}
          showCloseButton={user?.isTempPassword === 0 || user?.is_temp_password === 0}
          onPasswordChanged={() => {
            setIsChangePasswordOpen(false);
            setSuccessMessage('Password changed successfully!');
            setTimeout(() => {
              setSuccessMessage("");
            }, 3000);
          }}
          onClose={() => {
            setIsChangePasswordOpen(false);
          }}
        />
      )}

      {/* Force Password Change Popup for Temp Password Users */}
      {user && (user.isTempPassword === 1 || user.is_temp_password === 1) && !isChangePasswordOpen && (
        <ChangePasswordPopup
          user={user}
          showCloseButton={false}
          onPasswordChanged={() => {
            setSuccessMessage('Password changed successfully! You can now use all features.');
            setTimeout(() => {
              setSuccessMessage("");
            }, 5000);
          }}
        />
      )}
    </div>
  );
}
