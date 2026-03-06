import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit2, FiCheck, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiFileText, FiTrendingUp, FiTarget, FiList, FiPlus } from 'react-icons/fi';
import apiService from '../services/api';
import TaskFormPopup from './TaskFormPopup';

export default function LeadInfo({ selectedLead, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await apiService.getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
    fetchTasks();
  }, [selectedLead.id]);

  const fetchTasks = async () => {
    try {
      const taskData = await apiService.getTasksByLead(selectedLead.id);
      setTasks(taskData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTaskSubmit = async (newTask) => {
    try {
      await apiService.createTask(newTask);
      fetchTasks(); // Refresh tasks after creation
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const startEditing = () => {
    setEditedData({
      contact_name: selectedLead.name,
      phone: selectedLead.phone,
      email: selectedLead.email || '',
      company_name: selectedLead.company || '',
      address: selectedLead.address || '',
      lead_type: selectedLead.leadType || '',
      source: selectedLead.source || '',
      lead_status: selectedLead.status || '',
      lead_assignee: selectedLead.leadAssignee || '',
      description: selectedLead.description || ''
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      await apiService.updateLead(selectedLead.id, editedData);

      // Update the selectedLead object with the new data
      // Note: In a real app with state management, this should update the parent state
      Object.assign(selectedLead, {
        name: editedData.contact_name,
        phone: editedData.phone,
        email: editedData.email,
        company: editedData.company_name,
        address: editedData.address,
        leadType: editedData.lead_type,
        source: editedData.source,
        status: editedData.lead_status,
        leadAssignee: editedData.lead_assignee,
        description: editedData.description
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating lead:", error);
      alert(error.message || "Failed to save lead. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <div className="flex-1 flex flex-col h-full bg-white rounded-xl border border-gray-400 overflow-hidden shadow-sm">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-3 sm:mb-0">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              title="Back to list"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {isEditing ? "Editing Lead" : "Lead Details"}
              </h2>
              <p className="text-sm text-gray-500 font-medium">Lead ID: #{selectedLead.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 text-gray-700 bg-white border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
                >
                  <FiX className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={startEditing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white custom-scrollbar">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Profile Info Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                    <FiUser className="w-12 h-12" />
                  </div>
                  <div className="w-full">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.contact_name}
                        onChange={(e) => handleFieldChange('contact_name', e.target.value)}
                        className="w-full text-center text-xl font-bold text-gray-900 border-b-2 border-blue-200 focus:border-blue-600 outline-none bg-transparent py-1 transition-all"
                        placeholder="Enter Name"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {selectedLead.name}
                      </h3>
                    )}
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedLead.status?.includes('Convert') ? 'bg-green-100 text-green-700' :
                      selectedLead.status?.includes('Lost') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {selectedLead.status}
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiPhone className="w-4 h-4 text-blue-500" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="text-sm font-medium outline-none border-b border-gray-300 focus:border-blue-500 w-full py-1 bg-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium">{selectedLead.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiMail className="w-4 h-4 text-amber-500" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="text-sm font-medium outline-none border-b border-gray-300 focus:border-blue-500 w-full py-1 bg-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium truncate">{selectedLead.email || 'No email provided'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FiCalendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Created: {formatDate(selectedLead.date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information Grid */}
            <div className="lg:col-span-8 space-y-8">
              {/* Business Context */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FiBriefcase /> Business Context
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Company', icon: FiBriefcase, field: 'company_name', val: selectedLead.company, color: 'text-indigo-500' },
                    { label: 'Address', icon: FiMapPin, field: 'address', val: selectedLead.address, color: 'text-red-500' },
                    { label: 'Lead Type', icon: FiTarget, field: 'lead_type', val: selectedLead.leadType, color: 'text-emerald-500' },
                    { label: 'Source', icon: FiTrendingUp, field: 'source', val: selectedLead.source, color: 'text-blue-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                      <div className="flex items-center gap-3 mb-1">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <label className="text-xs font-bold text-gray-500 uppercase">{item.label}</label>
                      </div>
                      {isEditing ? (
                        item.field === 'lead_type' ? (
                          <select
                            value={editedData.lead_type}
                            onChange={(e) => handleFieldChange('lead_type', e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none border-b border-gray-300 focus:border-blue-500 py-1"
                          >
                            <option value="">Select Type</option>
                            <option value="Construction">Construction</option>
                            <option value="Interior">Interior</option>
                            <option value="Renovation">Renovation</option>
                          </select>
                        ) : item.field === 'source' ? (
                          <select
                            value={editedData.source}
                            onChange={(e) => handleFieldChange('source', e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none border-b border-gray-300 focus:border-blue-500 py-1"
                          >
                            <option value="">Select Source</option>
                            <option value="Manual">Manual</option>
                            <option value="Email">Email</option>
                            <option value="Website">Website</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Whatsapp">Whatsapp</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editedData[item.field]}
                            onChange={(e) => handleFieldChange(item.field, e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none border-b border-gray-300 focus:border-blue-500 py-1"
                          />
                        )
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.val || 'Not specified'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Assignment */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FiCheck /> Status & Assignment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-1">
                      <FiTrendingUp className="w-4 h-4 text-blue-500" />
                      <label className="text-xs font-bold text-gray-500 uppercase">Current Status</label>
                    </div>
                    {isEditing ? (
                      <select
                        value={editedData.lead_status}
                        onChange={(e) => handleFieldChange('lead_status', e.target.value)}
                        className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none border-b border-gray-300 focus:border-blue-500 py-1"
                      >
                        <option value="Open - Not Converted">Open - Not Converted</option>
                        <option value="Working - Completed">Working - Completed</option>
                        <option value="Close - Convert">Close - Convert</option>
                        <option value="Close - Lost">Close - Lost</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{selectedLead.status}</p>
                    )}
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-1">
                      <FiUser className="w-4 h-4 text-indigo-500" />
                      <label className="text-xs font-bold text-gray-500 uppercase">Assigned To</label>
                    </div>
                    {isEditing ? (
                      <select
                        value={editedData.lead_assignee}
                        onChange={(e) => handleFieldChange('lead_assignee', e.target.value)}
                        className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none border-b border-gray-300 focus:border-blue-500 py-1"
                      >
                        <option value="">Select Assignee</option>
                        {users.map(user => (
                          <option key={user.id} value={`${user.first_name} ${user.last_name}`}>
                            {user.first_name} {user.last_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{selectedLead.leadAssignee || 'Unassigned'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FiFileText /> Additional Notes
                </h4>
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  {isEditing ? (
                    <textarea
                      value={editedData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={4}
                      className="w-full text-sm font-medium text-gray-900 bg-white rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none p-4 transition-all resize-none"
                      placeholder="Add notes about this lead..."
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                      {selectedLead.description || 'No additional notes provided for this lead.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Related Tasks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiList /> Related Tasks
                  </h4>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-all uppercase tracking-wide"
                  >
                    <FiPlus className="w-3 h-3" /> Add Task
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 border-dashed text-center">
                    <p className="text-gray-500 text-sm">No tasks related to this lead yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all flex items-center justify-between group">
                        <div>
                          <h5 className="text-sm font-bold text-gray-900 mb-1">{task.name}</h5>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                task.status === 'Working' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {task.status}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiUser className="w-3 h-3" /> {task.assignToName}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" /> Due: {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Future: Add edit/view task buttons here */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskFormPopup
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialData={{
          relatedTo: 'Lead',
          leadName: selectedLead.name,
          lead_id: selectedLead.id,
          project_id: null,
          projectName: ''
        }}
      />
    </div>
  );
}
