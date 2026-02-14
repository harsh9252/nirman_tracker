import React, { useState, useEffect } from "react";
import { FiMail, FiPhone, FiDollarSign, FiCalendar, FiHome, FiMapPin, FiBriefcase, FiTrendingUp, FiBarChart, FiUser, FiFileText, FiEdit2, FiCheck, FiX, FiCheckCircle } from "react-icons/fi";
import apiService from "../services/api";
import { formatDateForDisplay } from "../utils/dateUtils";
import SuccessPopup from "./SuccessPopup";
import ProjectFormPopup from "./ProjectFormPopup";
import LeadConversionWizard from "./LeadConversionWizard";

const LeadInfo = ({ selectedLead, onClose }) => {
  if (!selectedLead) return null;



  // Inline editing state
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editedLeadData, setEditedLeadData] = useState({});
  const [savingLead, setSavingLead] = useState(false);
  const [users, setUsers] = useState([]);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '', clientId: null });

  // Conversion wizard state
  const [showConversionWizard, setShowConversionWizard] = useState(false);

  // Project form state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectClientId, setProjectClientId] = useState(null);
  const [prefilledClientName, setPrefilledClientName] = useState('');
  const [prefilledAddress, setPrefilledAddress] = useState('');



  // Fetch users for Lead Assignee dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await apiService.getUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);



  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const formatDate = (dateString) => formatDateForDisplay(dateString);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open - Not Converted": return "bg-green-100 text-green-700 border-green-200";
      case "Working": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Close - Convert": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Close - Lost": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Start editing lead
  const startEditingLead = () => {
    // Prevent editing if lead is converted or lost
    if (selectedLead.is_converted || selectedLead.is_lost) {
      return;
    }

    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    setEditedLeadData({
      contact_name: selectedLead.name,
      date: formatDateForInput(selectedLead.date),
      phone: selectedLead.phone,
      email: selectedLead.email,
      company_name: selectedLead.company,
      address: selectedLead.address,
      lead_type: selectedLead.leadType,
      source: selectedLead.source,
      lead_status: selectedLead.leadStatus,
      last_contacted_date: formatDateForInput(selectedLead.lastContactedDate),
      lead_assignee: selectedLead.leadAssignee,
      description: selectedLead.description
    });
    setIsEditingLead(true);
  };

  const cancelEditingLead = () => {
    setIsEditingLead(false);
    setEditedLeadData({});
  };

  const saveLead = async () => {
    setSavingLead(true);
    try {
      // Check if status is being changed to "Close - Convert"
      const isConverting = editedLeadData.lead_status === 'Close - Convert' &&
        selectedLead.leadStatus !== 'Close - Convert';

      if (isConverting) {
        // First update the lead data
        await apiService.updateLead(selectedLead.id, editedLeadData);

        // Then convert to client
        const conversionResult = await apiService.convertLeadToClient(selectedLead.id);

        // Update the selectedLead object with the new data and conversion status
        Object.assign(selectedLead, {
          name: editedLeadData.contact_name,
          date: editedLeadData.date,
          phone: editedLeadData.phone,
          email: editedLeadData.email,
          company: editedLeadData.company_name,
          address: editedLeadData.address,
          leadType: editedLeadData.lead_type,
          source: editedLeadData.source,
          leadStatus: editedLeadData.lead_status,
          status: editedLeadData.lead_status,
          lastContactedDate: editedLeadData.last_contacted_date,
          leadAssignee: editedLeadData.lead_assignee,
          description: editedLeadData.description,
          is_converted: true,
          client_id: conversionResult.clientId
        });

        setSuccessData({
          title: 'Lead Converted Successfully!',
          message: 'The lead has been successfully converted to a client.',
          clientId: conversionResult.clientId
        });
        setShowSuccessPopup(true);
      } else {
        // Normal update
        await apiService.updateLead(selectedLead.id, editedLeadData);

        // Update the selectedLead object with the new data
        Object.assign(selectedLead, {
          name: editedLeadData.contact_name,
          date: editedLeadData.date,
          phone: editedLeadData.phone,
          email: editedLeadData.email,
          company: editedLeadData.company_name,
          address: editedLeadData.address,
          leadType: editedLeadData.lead_type,
          source: editedLeadData.source,
          leadStatus: editedLeadData.lead_status,
          status: editedLeadData.lead_status,
          lastContactedDate: editedLeadData.last_contacted_date,
          leadAssignee: editedLeadData.lead_assignee,
          description: editedLeadData.description
        });
      }

      setIsEditingLead(false);
      // Stay in the LeadInfo view - don't close
    } catch (error) {
      console.error("Error updating lead:", error);
      alert(error.message || "Failed to save lead. Please try again.");
    } finally {
      setSavingLead(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedLeadData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-400 pb-4">
      <div className="flex items-center justify-between mb-0 px-4 sm:px-2 pt-2 pb-2 border-b border-gray-200">
        <div className="hidden sm:flex items-center gap-3 mb-3 sm:mb-0">
        </div>
        <div className="flex items-center justify-end gap-2 w-full sm:w-auto py-0">
          {isEditingLead ? (
            <>
              <button
                onClick={saveLead}
                disabled={savingLead}
                className="flex items-center gap-1 px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  minWidth: 'fit-content'
                }}
              >
                <FiCheck className="w-4 h-4" />
                <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>
                  {savingLead ? 'Saving...' : 'Save'}
                </span>
              </button>
              <button
                onClick={cancelEditingLead}
                disabled={savingLead}
                className="flex items-center gap-1 px-3 py-2 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm whitespace-nowrap border border-gray-300"
                style={{
                  minWidth: 'fit-content'
                }}
              >
                <FiX className="w-4 h-4" />
                <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>Cancel</span>
              </button>
            </>
          ) : (
            <>
              {/* Show status badges for converted/lost leads */}
              {selectedLead.is_converted && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg border border-green-200">
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Converted to Client</span>
                </div>
              )}
              {selectedLead.is_lost && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200">
                  <FiX className="w-4 h-4" />
                  <span>Lost Lead</span>
                </div>
              )}

              <button
                onClick={startEditingLead}
                disabled={selectedLead.is_converted || selectedLead.is_lost}
                className="flex items-center gap-1 px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  minWidth: 'fit-content'
                }}
                title={selectedLead.is_converted ? 'Cannot edit converted lead' : selectedLead.is_lost ? 'Cannot edit lost lead' : 'Edit lead'}
              >
                <FiEdit2 className="w-4 h-4" />
                <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>Edit</span>
              </button>

              {/* Convert to Client button - only show if not converted or lost */}
              {!selectedLead.is_converted && !selectedLead.is_lost && (
                <button
                  onClick={() => setShowConversionWizard(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-400 active:shadow-md transition-all shadow-sm whitespace-nowrap"
                  style={{ minWidth: 'fit-content' }}
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>Convert</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  minWidth: 'fit-content'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>Back</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lead Details */}
      <div className="p-6">
        {/* Lead Basic Info */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{isEditingLead ? editedLeadData.contact_name : selectedLead.name}</h3>
          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(isEditingLead ? editedLeadData.lead_status : selectedLead.leadStatus)}`}>
            {isEditingLead ? editedLeadData.lead_status : selectedLead.leadStatus}
          </span>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Contact Name */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">CONTACT NAME*</span>
                {isEditingLead ? (
                  <input
                    type="text"
                    value={editedLeadData.contact_name}
                    onChange={(e) => handleFieldChange('contact_name', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.name}</span>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">DATE</span>
                {isEditingLead ? (
                  <input
                    type="date"
                    value={editedLeadData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{formatDate(selectedLead.date)}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">EMAIL</span>
                {isEditingLead ? (
                  <input
                    type="email"
                    value={editedLeadData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.email}</span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">PHONE NO.*</span>
                {isEditingLead ? (
                  <input
                    type="tel"
                    value={editedLeadData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    maxLength={10}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.phone}</span>
                )}
              </div>
            </div>

            {/* Company Name */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">COMPANY NAME</span>
                {isEditingLead ? (
                  <input
                    type="text"
                    value={editedLeadData.company_name}
                    onChange={(e) => handleFieldChange('company_name', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.company || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">ADDRESS</span>
                {isEditingLead ? (
                  <input
                    type="text"
                    value={editedLeadData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.address || 'N/A'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Lead Type */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">LEAD TYPE</span>
                {isEditingLead ? (
                  <select
                    value={editedLeadData.lead_type}
                    onChange={(e) => handleFieldChange('lead_type', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  >
                    <option value="">Select</option>
                    <option value="Construction">Construction</option>
                    <option value="Interior">Interior</option>
                    <option value="Renovation">Renovation</option>
                  </select>
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.leadType || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Source */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">SOURCE</span>
                {isEditingLead ? (
                  <select
                    value={editedLeadData.source}
                    onChange={(e) => handleFieldChange('source', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  >
                    <option value="">Select</option>
                    <option value="Manual">Manual</option>
                    <option value="Email">Email</option>
                    <option value="Website">Website</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Whatsapp">Whatsapp</option>
                  </select>
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.source || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Lead Status */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">LEAD STATUS</span>
                {isEditingLead ? (
                  <select
                    value={editedLeadData.lead_status}
                    onChange={(e) => handleFieldChange('lead_status', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  >
                    <option value="">Select</option>
                    <option value="Open - Not Converted">Open - Not Converted</option>
                    <option value="Working">Working</option>
                    <option value="Close - Convert">Close - Convert</option>
                    <option value="Close - Lost">Close - Lost</option>
                  </select>
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.leadStatus || 'N/A'}</span>
                )}
              </div>
            </div>


            {/* Lead Assignee */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">LEAD ASSIGNEE</span>
                {isEditingLead ? (
                  <select
                    value={editedLeadData.lead_assignee}
                    onChange={(e) => handleFieldChange('lead_assignee', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  >
                    <option value="">Select</option>
                    {users.map(user => (
                      <option key={user.id} value={`${user.first_name} ${user.last_name}`}>
                        {user.first_name} {user.last_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm font-medium text-gray-900">{selectedLead.leadAssignee || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg py-2 px-4 border border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">DESCRIPTION</span>
                {isEditingLead ? (
                  <textarea
                    value={editedLeadData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full text-sm text-gray-900 border border-gray-300 rounded px-2 py-1"
                    style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--placeholder-font-size)' }}
                  />
                ) : (
                  <span className="text-sm text-gray-900">{selectedLead.description || 'N/A'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Conversion Wizard */}
      <LeadConversionWizard
        isOpen={showConversionWizard}
        onClose={() => setShowConversionWizard(false)}
        leadData={selectedLead}
        onConversionComplete={() => {
          setShowConversionWizard(false);
          selectedLead.is_converted = true;
          setIsEditingLead(false);
          // Refresh the lead data if needed
        }}
        onCreateProject={(clientId, leadData) => {
          setProjectClientId(clientId);
          setPrefilledClientName(leadData.contact_name || leadData.name || '');
          setPrefilledAddress(leadData.address || '');
          setShowProjectForm(true);
          setShowConversionWizard(false);
        }}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title={successData.title}
        message={successData.message}
        clientId={successData.clientId}
        leadData={selectedLead}
        onCreateProject={(clientId, leadData) => {
          setProjectClientId(clientId);
          setPrefilledClientName(leadData.contact_name || leadData.name || '');
          setPrefilledAddress(leadData.address || '');
          setShowProjectForm(true);
          setShowSuccessPopup(false);
        }}
      />

      {/* Project Form Popup */}
      <ProjectFormPopup
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setProjectClientId(null);
        }}
        onSubmit={() => {
          setShowProjectForm(false);
          setProjectClientId(null);
        }}
        preselectedClientId={projectClientId}
        prefilledClientName={prefilledClientName}
        prefilledAddress={prefilledAddress}
      />
    </div>
  );
};

export default LeadInfo;
