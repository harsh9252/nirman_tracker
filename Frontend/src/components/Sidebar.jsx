import React from "react";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiShoppingCart,
  FiTruck,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiBell,
  FiSearch,
  FiPlus,
  FiFolder,
  FiUser,
  FiUserX,
  FiChevronRight,
  FiCheckSquare,
  FiLogOut,
  FiUserPlus,
  FiUserCheck
} from "react-icons/fi";
import logo from "../assets/logo-small.png";
import { useTranslation } from "../services/translationService.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

function SidebarSection({ title }) {
  return (
    <div className="px-4 pt-4 pb-1 text-[10px] font-semibold text-gray-400 tracking-[0.08em]">
      {title}
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        `group w-full flex items-center gap-2 px-4 py-2 text-left transition-all duration-200
         hover:bg-light-primary-bg
         ${active
          ? "bg-light-primary-bg text-primary font-medium"
          : "text-gray-600 hover:text-primary"
        }`
      }
    >
      {/* ICON */}
      <span
        className={
          active
            ? "text-primary"      // icon blue when active
            : "text-gray-500 group-hover:text-primary transition"
        }
      >
        {icon}
      </span>

      {/* TEXT */}
      <span
        className={
          active
            ? "text-primary"      // text blue when active
            : "group-hover:text-primary transition"
        }
      >
        {label}
      </span>
    </button>
  );
}

export default function Sidebar({ activeItem, onNavigate }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to login page or reload the app
    // Since there's no login page, we'll redirect to dashboard
    // In a real app, this would redirect to /login
    window.location.href = '/';
  };

  // Check if user is admin - admin sees all sections
  // Non-admin users see sections based on their permissions checkboxes
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Parse permissions from database for non-admin users
  let permissions;
  if (isAdmin) {
    // Admin sees everything
    permissions = { leads: true, clients: true, projects: true, tasks: true, users: true };
  } else {
    // Non-admin users: use their permissions from database
    // Default to all false - only show what's explicitly granted
    const defaultPermissions = { leads: false, clients: false, projects: false, tasks: false, users: false };

    const userPermissions = user?.permissions
      ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions)
      : defaultPermissions;

    permissions = { ...defaultPermissions, ...userPermissions };
  }

  return (
    <aside className="hidden md:flex w-56 bg-white border-r border-gray-300 flex-col">
      {/* Logo / Brand */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-300">
        <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm">
          <img
            src={logo}
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Nirmaan Tracker</div>
          <div className="text-[11px] text-gray-400 uppercase tracking-wide">
            Manage all Projects
          </div>
        </div>
      </div>

      {/* Sidebar scroll */}
      <div className="flex-1 overflow-auto text-[13px] pb-4 hover:text-primary">
        <SidebarItem
          icon={<FiHome size={15} />}
          label={t('Dashboard')}
          active={activeItem === "dashboard"}
          onClick={() => handleNavigate("dashboard")}
        />
        {permissions.leads && (
          <SidebarItem
            icon={<FiUserPlus size={15} />}
            label={t('Leads')}
            active={activeItem === "lead-management"}
            onClick={() => handleNavigate("lead-management")}
          />
        )}
        {permissions.clients && (
          <SidebarItem
            icon={<FiUsers size={15} />}
            label={t('Clients')}
            active={activeItem === "clients-management"}
            onClick={() => handleNavigate("clients-management")}
          />
        )}
        {permissions.projects && (
          <SidebarItem
            icon={<FiFolder size={15} />}
            label={t('Projects')}
            active={activeItem === "projects-management"}
            onClick={() => handleNavigate("projects-management")}
          />
        )}
        <SidebarItem
          icon={<FiUsers size={15} />}
          label={t('Employees')}
          active={activeItem === "employee-management"}
          onClick={() => handleNavigate("employee-management")}
        />
        <SidebarItem
          icon={<FiUser size={15} />}
          label="Users"
          active={activeItem === "users-management"}
          onClick={() => handleNavigate("users-management")}
        />
        {permissions.tasks && (
          <SidebarItem
            icon={<FiCheckSquare size={15} />}
            label={t('Tasks')}
            active={activeItem === "my-tasks"}
            onClick={() => handleNavigate("my-tasks")}
          />
        )}

        {/* <SidebarSection title={t('ACCOUNTING')} />
        <SidebarItem
          icon={<FiTruck size={15} />}
          label={t('Site Expenses')}
          active={activeItem === "site-expenses"}
          onClick={() => handleNavigate("site-expenses")}
        />
        <SidebarItem
          icon={<FiFileText size={15} />}
          label={t('Site Received')}
          active={activeItem === "site-received"}
          onClick={() => handleNavigate("site-received")}
        />

        <SidebarSection title={t('BUSINESS REVIEW')} />
        <SidebarItem
          icon={<FiBarChart2 size={15} />}
          label={t('Reports')}
          active={activeItem === "reports"}
          onClick={() => handleNavigate("reports")}
        />

        <SidebarSection title={t('SETTINGS')} />
        <SidebarItem
          icon={<FiSettings size={15} />}
          label={t('Settings')}
          active={activeItem === "settings"}
          onClick={() => handleNavigate("settings")}
        />
        <SidebarItem
          icon={<FiHelpCircle size={15} />}
          label={t('Help & Support')}
          active={activeItem === "help-support"}
          onClick={() => handleNavigate("help-support")}
        /> */}
      </div>

      {/* Footer small strip */}
      <div className="h-10 border-t border-gray-200 flex items-center justify-between px-4 text-[11px] text-gray-500">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 hover:text-red-600 transition-colors cursor-pointer"
        >
          <FiLogOut size={14} className="text-gray-500 hover:text-red-600" />
          {t('LOG OUT')}
        </button>
      </div>
    </aside>
  );
}
