import { useMemo, useState } from "react";
// add X and Plus to the import list
import {
  LayoutDashboard,
  FileText,
  Quote,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Boxes,
  ShoppingCart,
  ClipboardList,
  FileSignature,
  CloudUpload,
  IndianRupee,
  Undo2,
  FileBarChart2,
  Truck,
  RotateCw,
  FileMinus,
  FilePlus,
  Wallet,
  BarChart,
  Plus,   // <-- add
  X,      // <-- add
  UserCheck,
  Folder
} from 'lucide-react';

import sidebarConfig from "../Jsonfiles/sidebarjson.json";
import { useAuth } from "../contexts/AuthContext.jsx";

// Map JSON icon names -> lucide components
const ICON_MAP = {
  LayoutDashboard,
  FileText,
  Quote,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Boxes,
  ShoppingCart,
  ClipboardList,
  FileSignature,
  CloudUpload,
  IndianRupee,
  Undo2,
  FileBarChart2,
  Truck,
  RotateCw,
  FileMinus,
  FilePlus,
  Wallet,
  BarChart,
  Plus, // <-- add
  X,    // <-- add
  UserCheck,
  Folder
};


const BottomIcon = ({ label, icon, onClick, active = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-all duration-200 flex-1 max-w-[90px] ${
      active ? "text-primary" : "text-gray-500"
    } active:scale-95`}
  >
    <div className={`p-1.5 rounded-lg ${active ? "bg-primary/10" : ""}`}>
      {icon}
    </div>
    <span
      className={`text-[10px] mt-1 font-medium leading-tight text-center ${
        active ? "text-primary" : "text-gray-500"
      }`}
    >
      {label}
    </span>
  </button>
);

export default function MobileBottomNavbar({ activePage, onNavigate, onMenuToggle }) {
  const [isGridOpen, setIsGridOpen] = useState(false);
  const { user } = useAuth();

  const createIcon = (name, color) => {
    const C = ICON_MAP[name];
    return C ? (
      <C className={`h-6 w-6 ${color || "text-current"}`} />
    ) : (
      <div className="h-6 w-6 bg-gray-200 rounded" />
    );
  };

  // No translation, just return label
  const localize = (label) => label;

  const mainItems = useMemo(
    () =>
      (sidebarConfig.items || [])
        .filter((item) => {
          // Hide Users menu for non-admin users
          if (item.key === 'users' && user?.role !== 'Admin') {
            return false;
          }
          return true;
        })
        .map((it) => ({
          ...it,
          label: localize(it.label),
          _iconEl: createIcon(it.icon, it.color),
        })),
    [user?.role]
  );

  const footerItems = useMemo(
    () =>
      (sidebarConfig.footerItems || [])
        .filter((f) => f.key !== "logout") // Keep logout out of the quick grid
        .map((it) => ({
          ...it,
          label: localize(it.label),
          _iconEl: createIcon(it.icon, it.color),
        })),
    []
  );

  // Create custom order for grid menu: Dashboard, Leads, Clients, Projects, My Tasks, Settings, Inventory
  const customGridItems = [
    mainItems[0], // Dashboard
    { key: 'leads', label: 'Leads', path: 'lead-management', _iconEl: createIcon('Users') }, // Leads
    mainItems[1], // Clients
    mainItems[3], // Projects
    mainItems[2], // My Tasks
    mainItems[5], // Settings
    ...footerItems.filter(item => item.key !== 'reports' && item.key !== 'settings') // Inventory (exclude duplicate Reports and Settings)
  ];

  const GRID_ITEMS = customGridItems;

  // Centralized navigation -> parent
  const go = (itemOrKey) => {
    const target =
      typeof itemOrKey === "string"
        ? itemOrKey
        : itemOrKey?.path || itemOrKey?.key || "";
    setIsGridOpen(false);
    if (typeof onNavigate === "function") onNavigate(target);
  };

  return (
    <>
      {/* Full-screen two-column grid like your reference image */}
      {isGridOpen && (
        <div className="fixed inset-0 z-[1200] bg-white lg:hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <button
              type="button"
              onClick={() => setIsGridOpen(false)}
              className="p-1 -ml-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-base font-semibold">What are you offering?</h2>
          </div>

          {/* Scrollable grid area */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 divide-x divide-y">
              {GRID_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => go(item)}
                  className="flex flex-col items-center justify-center gap-2 py-6 px-4 active:bg-gray-50 hover:bg-gray-100"
                >
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                    {item._iconEl}
                  </div>
                  <span className="text-[13px] leading-tight text-gray-700 text-center">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Mobile App Style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Safe area padding for mobile devices */}
        <div className="pb-safe-area-inset-bottom">

          {/* Main navigation container */}
          <div className="relative bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] rounded-t-[50px]">

            {/* Navigation buttons container */}
            <div className="flex items-center justify-around px-2 py-1 relative">
              {/* Same navigation for all users: Dashboard, Leads, Clients, Tasks */}
              <div className="flex items-center justify-center flex-1">
                <BottomIcon
                  label="Dashboard"
                  icon={<LayoutDashboard className="h-6 w-6" />}
                  onClick={() => go('dashboard')}
                  active={activePage === 'dashboard'}
                />
              </div>

              <div className="flex items-center justify-center flex-1">
                <BottomIcon
                  label="Leads"
                  icon={<Users className="h-6 w-6" />}
                  onClick={() => go('lead-management')}
                  active={activePage === 'lead-management'}
                />
              </div>

              {/* Center floating button - positioned absolutely */}
              <div className="flex items-center justify-center flex-1 relative">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <button
                    type="button"
                    onClick={() => setIsGridOpen(true)}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-[0_4px_20px_rgba(34,137,255,0.4)] hover:shadow-[0_6px_24px_rgba(34,137,255,0.5)] transition-all duration-200 active:scale-95 border-4 border-white"
                    aria-label="Open quick menu"
                  >
                    <Plus className="h-7 w-7" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center flex-1">
                <BottomIcon
                  label="Clients"
                  icon={<UserCheck className="h-6 w-6" />}
                  onClick={() => go('clients-management')}
                  active={activePage === 'clients-management'}
                />
              </div>

              <div className="flex items-center justify-center flex-1">
                <BottomIcon
                  label={user?.role === 'Admin' ? "All Tasks" : "My Tasks"}
                  icon={<ClipboardList className="h-6 w-6" />}
                  onClick={() => go('my-tasks')}
                  active={activePage === 'my-tasks'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
