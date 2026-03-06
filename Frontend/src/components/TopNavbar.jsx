import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useOnClickOutside from "../hooks/useOnClickOutside";
import { FiSearch, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import LanguageSelector from "./LanguageSelector";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "../contexts/AuthContext";
import "../assets/CSS/TopNavbar.css";

export default function TopNavbar({ title, subtitle, onMobileMenuToggle, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDesktopUserMenu, setShowDesktopUserMenu] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const desktopUserMenuRef = useRef(null);
  const mobileUserMenuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDesktopUserMenu(false);
    setShowMobileUserMenu(false);
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || 'U';
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle clicks outside the user menu to close it
  useOnClickOutside(desktopUserMenuRef, () => setShowDesktopUserMenu(false));
  useOnClickOutside(mobileUserMenuRef, () => setShowMobileUserMenu(false));

  return (
    <div className="top-navbar-container">
      {/* TOP BAR - DESKTOP */}
      <header className="top-navbar-desktop">
        <div className="flex flex-col">
          <h1 className="top-navbar-title">{title}</h1>
          <h6 className="top-navbar-subtitle">{subtitle}</h6>
        </div>

        <div className="flex items-center gap-3">
          {/* <div className="top-navbar-search">
            <FiSearch size={14} />
            <input
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div> */}
          <NotificationDropdown />

          {/* LANGUAGE SELECTOR COMPONENT */}
          {/* <LanguageSelector title={title} subtitle={subtitle} /> */}

          {/* USER MENU */}
          <div className="relative" ref={desktopUserMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDesktopUserMenu(!showDesktopUserMenu);
              }}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="top-navbar-avatar">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user?.firstName, user?.lastName)
                )}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.role}
                </span>
              </div>
              <FiChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${showDesktopUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* USER DROPDOWN MENU */}
            {showDesktopUserMenu && (
              <div className="user-dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="user-info px-4 py-3 border-b border-gray-200">
                  <p className="user-name">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="user-email">{user?.email}</p>
                  <p className="user-phone">{user?.phone}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to profile page using hash routing
                    navigate('/profile');
                    setShowDesktopUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiUser size={16} />
                  Profile
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE HEADER - SIMPLIFIED */}
      <header className="top-navbar-mobile">
        <div className="flex flex-col">
          <h1 className="top-navbar-title text-sm">{title}</h1>
          {/* Subtitle hidden on mobile for cleaner look */}
        </div>
        <div className="flex items-center gap-1">
          <NotificationDropdown size={16} />

          {/* LANGUAGE SELECTOR COMPONENT - MOBILE */}
          {/* <LanguageSelector title={title} subtitle={subtitle} /> */}

          {/* USER MENU - MOBILE */}
          <div className="relative" ref={mobileUserMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileUserMenu(!showMobileUserMenu);
              }}
              className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="top-navbar-avatar">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user?.firstName, user?.lastName)
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-gray-900 leading-tight truncate max-w-[120px]">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-gray-500 leading-tight truncate max-w-[120px]">
                  {user?.role}
                </span>
              </div>
              <FiChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${showMobileUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* USER DROPDOWN MENU - MOBILE */}
            {showMobileUserMenu && (
              <div className="user-dropdown-menu absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="user-info px-4 py-3 border-b border-gray-200">
                  <p className="user-name">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="user-email">{user?.username}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to profile page using hash routing
                    navigate('/profile');
                    setShowMobileUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiUser size={16} />
                  Profile
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
