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
import MobileBottomNavbar from './MobileBottomNavbar';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, ResponsiveContainer, Legend} from "recharts";
import {  PieChart, Pie, Cell } from "recharts";
import logo from "../assets/logo-small.png";
<style>
  {`              
    main::-webkit-scrollbar {
      display: none;
    }
  `}
</style>


export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavigate = (target) => {
    console.log('Navigate to', target);
    // Here you can add logic to navigate to different pages
  };

  return (
    <div className="min-h-screen bg-background text-gray-700">
      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              {/* MOBILE MENU ITEMS */}
              <div className="space-y-4">
                <div className="text-[10px] font-semibold text-gray-400 tracking-[0.08em] uppercase">Management</div>
                <MobileMenuItem icon={<FiHome size={20} />} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuItem icon={<FiUserPlus size={20} />} label="Lead Management" onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuItem icon={<FiUsers size={20} />} label="Clients Management" onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuItem icon={<FiFolder size={20} />} label="Projects Management" onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuItem icon={<FiUserCheck size={20} />} label="Employee Management" onClick={() => setMobileMenuOpen(false)} />

                <div className="text-[10px] font-semibold text-gray-400 tracking-[0.08em] uppercase pt-4">Accounting</div>
                <MobileMenuItem icon={<FiTruck size={20} />} label="Site Expenses" onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuItem icon={<FiFileText size={20} />} label="Site Received" onClick={() => setMobileMenuOpen(false)} />

                <div className="text-[10px] font-semibold text-gray-400 tracking-[0.08em] uppercase pt-4">Business Review</div>
                <MobileMenuItem icon={<FiBarChart2 size={20} />} label="Reports" onClick={() => setMobileMenuOpen(false)} />

                <div className="text-[10px] font-semibold text-gray-400 tracking-[0.08em] uppercase pt-4">Settings</div>
                <MobileMenuItem icon={<FiSettings size={20} />} label="Settings" onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuItem icon={<FiHelpCircle size={20} />} label="Help & Support" onClick={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen max-h-screen overflow-hidden">
        {/* LEFT SIDEBAR - HIDDEN ON MOBILE */}
        <aside className="hidden md:flex w-60 bg-white border-r border-gray-200 flex-col">
          {/* Logo / Brand */}
          <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-200">
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm">
    <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm">
      <img 
        src={logo}
        alt="Logo"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">DDC Developer</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                Manage all Projects
              </div>
            </div>
          </div>

          {/* Sidebar scroll */}
          <div className="flex-1 overflow-auto text-[13px] pb-4 hover:text-primary">
            <SidebarSection title="MANAGEMENT" />
            <SidebarItem icon={<FiHome size={15} />} label="Dashboard" active />
            <SidebarItem  icon={<FiUserPlus size={15} />} label="Lead Management" />
            <SidebarItem icon={<FiUsers size={15} />} label="Clients Management" />
            <SidebarItem  icon={<FiFolder size={15} />} label="Projects Management" />
             <SidebarItem  icon={<FiUserCheck size={15} />} label="Employee Management" />

            <SidebarSection title="ACCOUNTING"/>
            <SidebarItem icon={<FiTruck size={15} />} label="Site Expenses" />
            <SidebarItem  icon={<FiFileText size={15} />} label="Site Received" />

            <SidebarSection title="BUSINESS REVIEW"/>
            <SidebarItem  icon={<FiBarChart2 size={15} />} label="Reports" />

            <SidebarSection title="SETTINGS" />
            <SidebarItem  icon={<FiSettings size={15} />} label="Settings" />
            <SidebarItem icon={<FiHelpCircle size={15} />} label="Help & Support" />
          </div>

          {/* Footer small strip */}
       <div className="h-10 border-t border-gray-200 flex items-center justify-between px-4 text-[11px] text-gray-500">
  
  <span className="flex items-center gap-2">
    <FiLogOut size={14} className="text-gray-500" />
    LOG OUT
  </span>

</div>

        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* TOP BAR - DESKTOP */}
          <header className="hidden md:flex h-14 bg-white border-b border-gray-200 items-center justify-between px-4 sm:px-8">
              <div className="flex flex-col">
    <h1 className="text-[18px] font-semibold text-gray-700">Dashboard</h1>
    <h6 className="text-[12px] text-gray-500">Manage Everything from a single place</h6>
  </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-light-gray-bg text-[13px] text-gray-500">
                <FiSearch size={14} />
                <input
                  placeholder="Search"
                  className="bg-transparent outline-none text-xs w-32"
                />
              </div>
              <button className="relative">
                <FiBell size={17} className="text-gray-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary border-2 border-white" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                AS
              </div>
            </div>
          </header>

          {/* MOBILE HEADER - SIMPLIFIED */}
          <header className="md:hidden h-14 bg-white border-b border-gray-200 flex items-center justify-center px-4">
            <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>
          </header>

          {/* MOBILE BOTTOM NAVIGATION */}
          <MobileBottomNavbar onNavigate={handleNavigate} />

  

          {/* BODY: main left + right column */}
          <div className="flex-1 flex overflow-hidden">
            {/* MAIN CENTER CONTENT */}
         <main
  className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24"
  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
>

              {/* PAGE TITLE */}
             

              {/* BUSINESS OPERATIONS CARDS */}
  



           
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

  
<div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm h-[323px] overflow-y-auto overflow-x-auto md:overflow-x-visible">

    {/* TABLE HEADER */}
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-base sm:text-[18px] font-semibold text-gray-700">Pending Task</h2>
    </div>

    {/* TABLE */}
    <table className="w-full text-left text-xs sm:text-[13px] table-fixed">
      <thead>
        <tr className="border-b">
          <th className="py-2 w-1/3 text-center">Task Name</th>
          <th className="py-2 w-1/3 text-center">Due date</th>
          <th className="py-2 w-1/3 text-center">Status</th>
        </tr>
      </thead>

      <tbody className="text-gray-700">
        <tr className="border-b">
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">Nelsa web development</td>
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">May 25, 2023</td>
          <td className="py-2 sm:py-3 px-1 text-center"><span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-xs inline-block w-full text-center">Completed</span></td>
        </tr>

        <tr className="border-b">
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">Datascale AI app</td>
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">Jun 20, 2023</td>
          <td className="py-2 sm:py-3 px-1 text-center"><span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs inline-block w-full text-center">Delayed</span></td>
        </tr>

        <tr className="border-b">
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">Media channel branding</td>
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">July 13, 2023</td>
          <td className="py-2 sm:py-3 px-1 text-center"><span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-700 rounded-full text-xs inline-block w-full text-center">At risk</span></td>
        </tr>

        <tr className="border-b">
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">Corlax iOS app development</td>
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">Dec 20, 2023</td>
          <td className="py-2 sm:py-3 px-1 text-center"><span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-xs inline-block w-full text-center">Completed</span></td>
        </tr>

        <tr>
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">Website builder development</td>
          <td className="py-2 sm:py-3 px-1 text-center break-words whitespace-normal leading-tight text-xs sm:text-sm">Mar 15, 2024</td>
          <td className="py-2 sm:py-3 px-1 text-center"><span className="px-1 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-700 rounded-full text-xs inline-block w-full text-center">On going</span></td>
        </tr>
      </tbody>
    </table>

  </div>






  {/* RIGHT — PROJECT SUMMARY TABLE */}
  <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto md:overflow-visible">

    {/* TABLE HEADER */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[18px] font-semibold text-gray-700">Project summary</h2>
    </div>

    {/* TABLE */}
    <table className="w-full text-left text-[13px]">
      <thead>
        <tr className="border-b">
          <th className="py-2">Name</th>

          <th className="py-2">Due date</th>
       
          <th className="py-2">Progress</th>
        </tr>
      </thead>

      <tbody className="text-gray-700">

        <tr className="border-b">
          <td className="py-3">Nelsa web development</td>
          
          <td>May 25, 2023</td>
          
          <td><div className="w-9 h-9 rounded-full border-[2px] border-green-500 flex items-center justify-center text-[10px] font-semibold">100%</div></td>
        </tr>

        <tr className="border-b">
          <td className="py-3">Datascale AI app</td>
        
          <td>Jun 20, 2023</td>
         
          <td><div className="w-9 h-9 rounded-full border-[2px] border-yellow-500 flex items-center justify-center text-[10px] font-semibold">35%</div></td>
        </tr>

        <tr className="border-b">
          <td className="py-3">Media channel branding</td>
        
          <td>July 13, 2023</td>
          
          <td><div className="w-9 h-9 rounded-full border-[2px] border-red-500 flex items-center justify-center text-[10px] font-semibold">68%</div></td>
        </tr>

        <tr className="border-b">
          <td className="py-3">Corlax iOS app development</td>
        
          <td>Dec 20, 2023</td>
         
          <td><div className="w-9 h-9 rounded-full border-[2px] border-green-500 flex items-center justify-center text-[10px] font-semibold">100%</div></td>
        </tr>

        <tr>
          <td className="py-3">Website builder development</td>
         
          <td>Mar 15, 2024</td>
         
          <td><div className="w-9 h-9 rounded-full border-[2px] border-orange-500 flex items-center justify-center text-[10px] font-semibold">50%</div></td>
        </tr>

      </tbody>
    </table>

  </div>

</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

  {/* LEFT — TODAY TASK */}


    {/* Header */}


    {/* TASK LIST */}
<div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto md:overflow-visible">

  {/* TABLE HEADER */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[18px] font-semibold text-gray-700">Material Request</h2>
  </div>

  {/* TABLE */}
  <table className="w-full text-left text-[13px]">
    <thead>
      <tr className="border-b">
        <th className="py-2">Project Name</th>
        <th className="py-2">Material</th>
     
        <th className="py-2">Action</th>
      </tr>
    </thead>

    <tbody className="text-gray-700">

      {/* ROW 1 */}
      <tr className="border-b">
        <td className="py-3">Nelsa web development</td>
        <td>Cement Bags</td>
       

        <td className="flex items-center gap-2 py-3">

          {/* Approve Button */}
          <button className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs hover:bg-green-200">
            Approve
          </button>

          {/* Reject Button */}
          <button className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs hover:bg-red-200">
            Reject
          </button>

        </td>
      </tr>

      {/* ROW 2 */}
      <tr className="border-b">
        <td className="py-3">Datascale AI app</td>
        <td>Iron Rods</td>
    

        <td className="flex items-center gap-2 py-3">
          <button className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs hover:bg-green-200">
            Approve
          </button>

          <button className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs hover:bg-red-200">
            Reject
          </button>
        </td>
      </tr>

      {/* ROW 3 */}
      <tr className="border-b">
        <td className="py-3">Media channel branding</td>
        <td>Tiles</td>
      

        <td className="flex items-center gap-2 py-3">
          <button className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs hover:bg-green-200">
            Approve
          </button>

          <button className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs hover:bg-red-200">
            Reject
          </button>
        </td>
      </tr>

      {/* ROW 4 */}
      <tr className="border-b">
        <td className="py-3">Corlax iOS app development</td>
        <td>Wooden Sheets</td>
    

        <td className="flex items-center gap-2 py-3">
          <button className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs hover:bg-green-200">
            Approve
          </button>

          <button className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs hover:bg-red-200">
            Reject
          </button>
        </td>
      </tr>

      {/* ROW 5 */}
      <tr>
        <td className="py-3">Website builder development</td>
        <td>Wires & Switches</td>
      

        <td className="flex items-center gap-2 py-3">
          <button className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs hover:bg-green-200">
            Approve
          </button>

          <button className="px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs hover:bg-red-200">
            Reject
          </button>
        </td>
      </tr>

    </tbody>
  </table>

</div>







  {/* RIGHT — PROJECT SUMMARY TABLE */}
  <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto md:overflow-visible">

    {/* TABLE HEADER */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[18px] font-semibold text-gray-700">Recent Transaction</h2>
    </div>

    {/* TABLE */}
    <table className="w-full text-left text-[13px]">
      <thead>
        <tr className="border-b">
          <th className="py-2">Project Name</th>
          <th className="py-2">Date</th>
          <th className="py-2">Amount</th>
        
        </tr>
      </thead>

      <tbody className="text-gray-700">

        <tr className="border-b">
          <td className="py-3">Nelsa web development</td>
          
          <td>May 25, 2023</td>
          <td><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">1,00,000</span></td>
         
        </tr>

        <tr className="border-b">
          <td className="py-3">Datascale AI app</td>
          
          <td>Jun 20, 2023</td>
     
       <td><span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">50,000</span></td>
        </tr>

        <tr className="border-b">
          <td className="py-3">Media channel branding</td>
  
          <td>July 13, 2023</td>
          <td><span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">2,00,000</span></td>
          
        </tr>

        <tr className="border-b">
          <td className="py-3">Corlax iOS app development</td>
          
          <td>Dec 20, 2023</td>
          <td><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">4,00,000</span></td>
         </tr>

        <tr>
          <td className="py-3">Website builder development</td>
         
          <td>Mar 15, 2024</td>
            <td><span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">2,00,000</span></td>
        </tr>
          <tr className="border-b">
          <td className="py-3">Corlax iOS app development</td>
          
          <td>Dec 20, 2023</td>
          <td><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">4,00,000</span></td>
         </tr>

      </tbody>
    </table>

  </div>

</div>

             
              {/* REVENUE INFLOW + MANAGEMENT */}

              {/* PLACEHOLDER CHARTS ROW */}
           {/* SALES PROGRESS — SEMICIRCLE GAUGE (replace EmptyPanel block) */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-10">

  {/* SEMICIRCLE GAUGE */}
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-[320px]">
  <div className="flex items-center justify-between mt-1">
    <h2 className="text-[16px] font-semibold text-gray-700">Overall Progress</h2>
    <button className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-gray-200">All ▾</button>
  </div>

  {/* BIGGER GRAPH ONLY */}
  <div className="relative w-full h-40 flex items-center justify-center">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={[
            { value: 72 },
            { value: 15 },
            { value: 13 },
          ]}
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={70}   // bigger graph
          outerRadius={110}  // bigger graph
          paddingAngle={5}
        >
          <Cell fill="#16a34a" />
          <Cell fill="#facc15" />
          <Cell fill="#f87171" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

    {/* Center text - stays same */}
    <div className="absolute text-center  mt-[100px]">
      <div className="text-xl font-bold text-gray-800">72%</div>
      <div className="text-xs text-gray-500 -mt-1">Completed</div>
    </div>
  </div>

  {/* Bottom stats remain same */}
  <div className="grid grid-cols-3 gap-2 text-center mt-3 text-[11px]">

    <div><div className="font-bold text-[20px] text-green-600">26</div><div className="text-gray-500">Done</div></div>
    <div><div className="font-bold text-[20px] text-yellow-500">35</div><div className="text-gray-500">Delay</div></div>
    <div><div className="font-bold text-[20px] text-orange-500">35</div><div className="text-gray-500">Ongoing</div></div>
  </div>
</div>


  {/* SIMPLE BAR CHART (kept second column to match layout) */}
<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-[320px]">
  <h2 className="text-[16px] font-semibold text-gray-800 mb-2">
    Stacked Bar Chart
  </h2>

  {/* ↓ graph ko aur niche push kiya */}
  <div className="w-full h-[220px] mt-8">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[
          { name: "A", pv: 2400, uv: 4000 },
          { name: "B", pv: 1398, uv: 3000 },
          { name: "C", pv: 9800, uv: 2000 },
          { name: "D", pv: 3908, uv: 2780 },
          { name: "E", pv: 4800, uv: 1890 },
          { name: "F", pv: 3800, uv: 2390 },
          { name: "G", pv: 4300, uv: 3490 },
        ]}
        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 10 }} />

        <Bar dataKey="pv" stackId="a" fill="#8884d8" barSize={20} />
        <Bar dataKey="uv" stackId="a" fill="#82ca9d" barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

</div>

            </main>

          </div>
        </div>
      </div>
    </div>
  );
}
        
/* ================= SUB COMPONENTS ================= */

// Mobile Menu Item Component
function MobileMenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100 transition-colors"
    >
      <span className="text-primary">{icon}</span>
      <span className="text-gray-700 font-medium">{label}</span>
    </button>
  );
}

function SidebarSection({ title }) {
  return (
    <div className="px-4 pt-4 pb-1 text-[10px] font-semibold text-gray-400 tracking-[0.08em]">
      {title}
    </div>
  );
}



function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      
        <span className="font-semibold text-gray-700">{title}</span>
        
      
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatCard({ label, amount, icon, variant }) {
  const accent =
    variant === "danger" ? "text-secondary bg-secondary/10" : "text-primary bg-primary/10";
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3 bg-white hover:shadow-sm transition">
      <div>
        <div className="text-[11px] text-gray-500 mb-1">{label}</div>
        <div className="text-[15px] font-semibold text-gray-700">{amount}</div>
      </div>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs ${accent}`}>
        {icon}
      </div>
    </div>
  );
}

function SmallProjectionCard({ heading, value, change }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-light-blue-bg px-3 py-3 flex items-center justify-between">
      <div>
        <div className="text-[11px] text-gray-500 mb-1">{heading}</div>
        <div className="text-[14px] font-semibold text-gray-700">{value}</div>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-green-text font-medium">
        <span className="w-4 h-4 rounded-full bg-light-green-bg flex items-center justify-center text-[10px]">
          ↑
        </span>
        <span>{change}</span>
      </div>
    </div>
  );
}

function QuickAction({ label }) {
  return (
    <button className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 hover:bg-primary/10 hover:border-primary/20 transition text-center">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white text-xs">
        <FiPlus size={14} />
      </div>
      <span className="text-[11px] font-medium text-gray-700 leading-tight">
        {label}
      </span>
    </button>
  );
}

function SimpleInfo({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-[#fafafa] px-3 py-3 flex flex-col gap-1">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[14px] font-semibold text-gray-700">{value}</span>
    </div>
  );
}

function EmptyPanel({ title, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
      <div className="px-4 py-2 border-b border-gray-100 text-[12px] font-semibold text-gray-700">
        {title}
      </div>
      <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400 py-10">
        {subtitle}
      </div>
    </div>
  );
}

function ChecklistItem({ label, checked, index }) {
  return (
    <div className="flex items-start gap-2">
      <div
        className={`mt-[1px] w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
          checked
            ? "bg-primary border-primary text-white"
            : "border-gray-300 bg-white text-transparent"
        }`}
      >
        ✓
      </div>
      <div className="flex-1 flex justify-between">
        <span>{index}. {label}</span>
      </div>
    </div>
  );
}

function HelpTile({ label }) {
  return (
    <button className="flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-light-gray-bg px-3 py-3 text-center hover:bg-white hover:shadow-sm transition">
      <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs text-primary">
        ?
      </div>
      <span>{label}</span>
    </button>
  );
}
function SidebarItem({ icon, label, active }) {
  return (
    <button
      className={
        `group w-full flex items-center gap-2 px-4 py-2 text-left border-l-2 transition-all duration-200
         hover:bg-primary/5
         ${active
            ? "border-primary bg-primary/10 text-primary font-medium"
            : "border-transparent text-gray-600 hover:text-primary"
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
function TaskRow({ title, status, color, done }) {
  const colorMap = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700"
  };

  return (
    <div className="flex items-center justify-between">

      {/* Checkbox + Text */}
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            done ? "bg-orange-500 text-white border-orange-500" : "border-gray-400"
          }`}
        >
          {done && "✓"}
        </div>
        <span className="text-gray-700">{title}</span>
      </div>

      {/* Status badge */}
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorMap[color]}`}>
        {status}
      </span>
    </div>
  );
}
