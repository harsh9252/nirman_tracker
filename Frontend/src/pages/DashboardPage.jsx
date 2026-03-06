import React, { useState, useEffect } from "react";
import { useTranslation } from "../services/translationService.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import apiService from "../services/api.js";
import { formatDateForDisplay } from "../utils/dateUtils.jsx";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Function to get status badge styling - same as other tables
  const getStatusBadge = (status) => {
    const statusConfig = {
      'New': 'bg-orange-100 text-orange-700 border border-orange-200',
      'Working': 'bg-blue-100 text-blue-700 border border-blue-200',
      'Completed': 'bg-green-100 text-green-700 border border-green-200',
      'On Hold': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      'Cancelled': 'bg-red-100 text-red-700 border border-red-200',
      'Open - Not Converted': 'bg-green-100 text-green-700 border border-green-200',
      'Open': 'bg-blue-100 text-blue-700 border border-blue-200',
      'Close - Convert': 'bg-green-100 text-green-700 border border-green-200',
      'Close - Lost': 'bg-red-100 text-red-700 border border-red-200',
      'Planning': 'bg-purple-100 text-purple-700 border border-purple-200',
      'In Progress': 'bg-blue-100 text-blue-700 border border-blue-200',
      'On-Hold': 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    };

    return statusConfig[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  // Fetch tasks, leads, and projects on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Wait for user to be loaded with role
      if (!user?.id || !user?.role) {
        console.log('DASHBOARD DEBUG: Waiting for user data - id:', user?.id, 'role:', user?.role);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Admin can see all data, other users see only their related data
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        const params = isAdmin ? {} : { user_id: user.id };

        console.log('DASHBOARD DEBUG: User role:', user?.role, 'isAdmin:', isAdmin, 'params:', params);

        // Fetch all data in parallel
        const [taskData, leadData, projectData] = await Promise.all([
          apiService.getTasks(params),
          apiService.getLeads(),
          apiService.getProjects()
        ]);

        console.log('DASHBOARD DEBUG: Fetched tasks:', taskData);
        console.log('DASHBOARD DEBUG: Fetched leads:', leadData);
        console.log('DASHBOARD DEBUG: Fetched projects:', projectData);

        setTasks(taskData);

        // Show leads with status "Open", "Open - Not Converted" or "Working" (not converted/lost)
        if (Array.isArray(leadData)) {
          const openLeads = leadData.filter(lead => {
            const isNotConverted = !lead.is_converted;
            const isNotLost = !lead.is_lost;
            const hasValidStatus = lead.lead_status === 'Open' || lead.lead_status === 'Open - Not Converted' || lead.lead_status === 'Working';

            console.log(`Lead ${lead.id} (${lead.contact_name}):`, {
              lead_status: lead.lead_status,
              is_converted: lead.is_converted,
              is_lost: lead.is_lost,
              passes: isNotConverted && isNotLost && hasValidStatus
            });

            return isNotConverted && isNotLost && hasValidStatus;
          });
          console.log('DASHBOARD DEBUG: Filtered open leads:', openLeads);
          setLeads(openLeads);
        } else {
          console.error('DASHBOARD ERROR: leadData is not an array:', leadData);
          setLeads([]);
        }

        setProjects(projectData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchMyMaterialRequests();
  }, [user?.id, user?.role]);

  const fetchMyMaterialRequests = async () => {
    if (!user?.id) return;
    setLoadingRequests(true);
    try {
      const data = await apiService.getMyMaterialRequests();
      setMaterialRequests(data || []);
    } catch (error) {
      console.error('Error fetching material requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await apiService.updateMaterialRequestStatus(id, status);
      fetchMyMaterialRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24">

          {/* ===== SAME GRID – SIZE UNCHANGED ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">

            {/* ================= LEFT — OPEN LEADS ================= */}
            <div className="bg-white rounded-xl border border-gray-400 p-2 sm:p-3 shadow-sm hover:shadow-lg transition-shadow duration-300 h-96 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Open Leads</h2>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="overflow-y-auto max-h-80">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading leads...</span>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs sm:text-[13px] table-fixed">
                      <thead className="bg-white sticky top-0">
                        <tr className="border-b">
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Lead Name</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Company</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {leads.length > 0 ? leads.map((lead, index) => (
                          <tr key={lead.id} className={index < leads.length - 1 ? "border-b border-gray-100" : ""}>
                            <td className="py-1.5 px-0.5 text-center break-words whitespace-normal leading-tight text-xs" title={lead.contact_name}>
                              {lead.contact_name}
                            </td>
                            <td className="py-1.5 px-0.5 text-center break-words whitespace-normal leading-tight text-xs">
                              {lead.company_name || '-'}
                            </td>
                            <td className="py-1.5 px-0.5 text-center">
                              <span className={`px-0.5 py-0.5 rounded text-xs font-medium inline-block text-center min-w-full ${getStatusBadge(lead.lead_status)}`}>
                                {lead.lead_status === 'Open - Not Converted' ? 'Open' : lead.lead_status}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="3" className="py-8 px-1 text-center text-gray-500">
                              <div className="text-sm">No open leads</div>
                              <div className="text-xs mt-1">New leads will appear here</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* ================= MIDDLE — MY TASK (VISIBLE) ================= */}
            <div className="bg-white rounded-xl border border-gray-400 p-2 sm:p-3 shadow-sm hover:shadow-lg transition-shadow duration-300 h-96 flex flex-col overflow-hidden">

              {/* Error Message */}
              {error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">
                  {user?.role?.toLowerCase() === 'admin' ? 'All Tasks' : 'My Task'}
                </h2>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="overflow-y-auto max-h-80">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading tasks...</span>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs sm:text-[13px] table-fixed">
                      <thead className="bg-white sticky top-0">
                        <tr className="border-b">
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Task Name</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Due Date</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {tasks.length > 0 ? tasks.map((task, index) => (
                          <tr key={task.id} className={index < tasks.length - 1 ? "border-b border-gray-100" : ""}>
                            <td className="py-1.5 px-0.5 text-center break-words whitespace-normal leading-tight text-xs" title={task.name}>
                              {task.name}
                            </td>
                            <td className="py-1.5 px-0.5 text-center break-words whitespace-normal leading-tight text-xs">
                              {formatDateForDisplay(task.dueDate || task.due_date)}
                            </td>
                            <td className="py-1.5 px-0.5 text-center">
                              <span className={`px-0.5 py-0.5 rounded text-xs font-medium inline-block text-center min-w-full ${getStatusBadge(task.status)}`}>
                                {task.status}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          // Empty state when no tasks
                          <tr>
                            <td colSpan="3" className="py-8 px-1 text-center text-gray-500">
                              <div className="text-sm">No tasks found</div>
                              <div className="text-xs mt-1">Tasks from the database will appear here</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* ================= RIGHT — PROJECT SUMMARY ================= */}
            <div className="bg-white rounded-xl border border-gray-400 p-2 sm:p-3 shadow-sm hover:shadow-lg transition-shadow duration-300 h-96 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Recent Projects</h2>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="overflow-y-auto max-h-80">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading projects...</span>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs sm:text-[13px] table-fixed">
                      <thead className="bg-white sticky top-0">
                        <tr className="border-b">
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Project Name</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Type</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/3 text-center text-xs sm:text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {projects.length > 0 ? projects.slice(0, 10).map((project, index) => (
                          <tr key={project.id} className={index < Math.min(projects.length, 10) - 1 ? "border-b border-gray-100" : ""}>
                            <td className="py-1.5 px-0.5 text-center break-words whitespace-normal leading-tight text-xs" title={project.project_name}>
                              {project.project_name}
                            </td>
                            <td className="py-1.5 px-0.5 text-center break-words whitespace-normal leading-tight text-xs">
                              {project.project_type || '-'}
                            </td>
                            <td className="py-1.5 px-0.5 text-center">
                              <span className={`px-0.5 py-0.5 rounded text-xs font-medium inline-block text-center min-w-full ${getStatusBadge(project.status)}`}>
                                {project.status}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="3" className="py-8 px-1 text-center text-gray-500">
                              <div className="text-sm">No projects found</div>
                              <div className="text-xs mt-1">New projects will appear here</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ===== नीचे वाले grids भी SAME SIZE के साथ HIDDEN ===== */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
            {/* ================= MATERIAL REQUESTS ================= */}
            <div className="bg-white rounded-xl border border-gray-400 p-2 sm:p-3 shadow-sm hover:shadow-lg transition-shadow duration-300 h-96 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Material Requests</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="overflow-y-auto max-h-80">
                  {loadingRequests ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading requests...</span>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs sm:text-[13px] table-fixed">
                      <thead className="bg-white sticky top-0">
                        <tr className="border-b">
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/4 text-center text-xs">Project</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/4 text-center text-xs">Material</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/4 text-center text-xs">Qty</th>
                          <th className="py-1.5 px-0.5 font-medium text-gray-700 w-1/4 text-center text-xs">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {materialRequests.length > 0 ? materialRequests.map((request, index) => (
                          <tr key={request.id} className={index < materialRequests.length - 1 ? "border-b border-gray-100" : ""}>
                            <td className="py-2 px-0.5 text-center break-words text-[11px] font-medium" title={request.project_name}>
                              {request.project_name || 'N/A'}
                            </td>
                            <td className="py-2 px-0.5 text-center break-words text-[11px]">
                              {request.material_name}
                            </td>
                            <td className="py-2 px-0.5 text-center text-[11px]">
                              {request.quantity} <span className="text-[9px] text-gray-400">{request.unit}</span>
                            </td>
                            <td className="py-2 px-0.5 text-center">
                              {request.status === 'Pending' && (user?.id === request.assigned_to || user?.role?.toLowerCase() === 'admin') ? (
                                <div className="flex flex-col gap-1 items-center">
                                  <button
                                    onClick={() => handleStatusUpdate(request.id, 'Approved')}
                                    className="w-full py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[9px] font-bold hover:bg-green-100"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                                    className="w-full py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] font-bold hover:bg-rose-100"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className={`px-1 rounded text-[9px] font-bold uppercase ${request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                  request.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                  {String(request.status || 'Pending').toUpperCase()}
                                </span>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="py-12 text-center text-gray-400 italic text-xs">
                              No pending material requests
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* ================= RECENT TRANSACTIONS (PLACEHOLDER) ================= */}
            <div className="bg-white rounded-xl border border-gray-400 p-2 sm:p-3 shadow-sm hover:shadow-lg transition-shadow duration-300 h-96 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
              </div>
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic">
                Transaction history will appear here
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
