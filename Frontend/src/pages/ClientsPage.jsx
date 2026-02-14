import React, { useState, useEffect } from "react";
import { FiUserPlus, FiMail, FiPhone, FiCalendar, FiDollarSign, FiEdit, FiTrash2, FiSearch, FiFilter, FiPlus, FiSliders, FiList, FiCheck } from "react-icons/fi";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import TableActionButton from "../components/TableActionButton";
import Table from "../components/Table";
import ClientFormPopup from "../components/ClientFormPopup";
import ClientInfo from "../components/ClientInfo";
import ProjectFormPopup from "../components/ProjectFormPopup";
import apiService from "../services/api";

export default function ClientsPage({ searchTerm = '' }) {
  const [clientsData, setClientsData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectClientId, setProjectClientId] = useState(null);
  const [prefilledClientName, setPrefilledClientName] = useState('');
  const [prefilledAddress, setPrefilledAddress] = useState('');
  const filterDropdownRef = React.useRef(null);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      const clients = await apiService.getClients();
      // Map API response to match the expected format
      const formattedClients = clients.map(client => ({
        id: client.id,
        name: client.client_name,
        email: client.email || 'N/A',
        phone: client.phone,
        company: client.company_name || 'N/A',
        address: client.address || 'N/A',
        description: client.description || '',
        status: 'Active', // Default status since it's not in the database
        date: client.conversion_date || client.created_at
      }));
      setClientsData(formattedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Handle clicks outside the filter dropdown to close it
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterPopupOpen(false);
      }
    };

    if (isFilterPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPopupOpen]);

  const filteredClients = clientsData.filter(client => {
    const matchesSearch = searchTerm === '' ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || client.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteClient = (id) => {
    setClientsData(clientsData.filter(client => client.id !== id));
  };

  const handleEditRow = (id) => {
    const client = clientsData.find(c => c.id === id);
    if (client) {
      setClientToEdit(client);
      setIsEditMode(true);
      setIsClientFormOpen(true);
    }
  };

  const handleDeleteRow = (id) => {
    handleDeleteClient(id);
  };

  const handleCreateClient = async (newClient) => {
    try {
      const response = await apiService.createClient(newClient);
      fetchClients(); // Refresh the list
      setIsClientFormOpen(false);

      // Open project form with client details
      setProjectClientId(response.clientId);
      setPrefilledClientName(newClient.client_name);
      setPrefilledAddress(newClient.address || '');
      setShowProjectForm(true);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const handleUpdateClient = async (updatedClient) => {
    try {
      await apiService.updateClient(clientToEdit.id, updatedClient);
      fetchClients(); // Refresh the list
      setIsClientFormOpen(false);
      setIsEditMode(false);
      setClientToEdit(null);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700 border-green-200";
      case "Inactive": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  // Table configuration
  const clientColumns = [
    { key: 'name', title: 'Name', width: '20%' },
    { key: 'company', title: 'Company', width: '25%' },
    { key: 'email', title: 'Email', width: '25%' },
    { key: 'phone', title: 'Phone', width: '15%' },
    { key: 'status', title: 'Status', width: '10%' },
    { key: 'date', title: 'Date Added', width: '15%' },
    { key: 'actions', title: 'Actions', align: 'center', width: '0%' }
  ];

  const renderClientCell = (key, client) => {
    switch (key) {
      case 'name':
        return (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors truncate max-w-[200px]"
            onClick={() => setSelectedClient(client)}
            title={client.name}
          >
            {client.name}
          </div>
        );
      case 'company':
        return (
          <div className="truncate max-w-[200px]" title={client.company}>
            {client.company}
          </div>
        );
      case 'email':
        return (
          <div className="truncate max-w-[200px]" title={client.email}>
            {client.email}
          </div>
        );
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-normal rounded-full ${getStatusColor(client.status)}`}>
            {client.status}
          </span>
        );
      case 'date':
        return formatDate(client.date);
      case 'actions':
        return (
          <div className="flex justify-center gap-1 sm:gap-2">
            <TableActionButton
              icon={FaPencilAlt}
              type="edit"
              title="Edit"
              onClick={() => handleEditRow(client.id)}
              mobileSize={false}
              extraSmall={true}
            />
            <TableActionButton
              icon={FaTrash}
              type="delete"
              title="Delete"
              onClick={() => handleDeleteRow(client.id)}
              mobileSize={false}
              extraSmall={true}
            />
          </div>
        );
      default:
        return client[key];
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 space-y-4 md:pb-4 pb-24 ">
          {selectedClient ? (
            <ClientInfo
              selectedClient={selectedClient}
              onClose={() => setSelectedClient(null)}
            />
          ) : (
            <>
              {/* IMPROVED CLIENTS TABLE */}
              <div className="bg-white rounded-xl border border-gray-400 pb-4 sm:h-[calc(100vh-90px)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-0 px-4 sm:px-2 pt-2 pb-2 border-b border-gray-200">
                  <div className="hidden sm:flex items-center gap-3 mb-3 sm:mb-0">
                  </div>
                  <div className="flex items-center justify-end gap-2 w-full sm:w-auto py-0">
                    <div className="relative">
                      <button
                        onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
                        className="flex items-center gap-0 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 active:shadow-md transition-all shadow-sm"
                        style={{ height: '30px' }}
                        title="Filter by status"
                      >
                        <div className="flex items-center justify-center w-7 h-full bg-gray-100 rounded-l-lg border-r border-gray-300">
                          <FiFilter size={14} />
                        </div>
                        <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px', padding: '0 8px' }}>
                          {selectedStatus === "All" ? "All Status" :
                            selectedStatus === "Active" ? "Active" :
                              selectedStatus === "Inactive" ? "Inactive" : "All Status"}
                        </span>
                      </button>
                      {isFilterPopupOpen && (
                        <div ref={filterDropdownRef} className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-32 py-1">
                          {[
                            { value: "All", label: "All Status" },
                            { value: "Active", label: "Active" },
                            { value: "Inactive", label: "Inactive" }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSelectedStatus(option.value);
                                setIsFilterPopupOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-gray-50 transition-colors ${selectedStatus === option.value
                                ? "text-blue-600 font-medium"
                                : "text-gray-700"
                                }`}
                            >
                              <span>{option.label}</span>
                              {selectedStatus === option.value && (
                                <FiCheck className="text-blue-600" size={14} />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setIsClientFormOpen(true)}
                      className="flex items-center gap-1 pl-2 pr-2 pt-1.5 pb-1.5 text-white text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-gray-400 active:shadow-md transition-all shadow-sm"
                      style={{
                        backgroundColor: 'var(--primary-color)'
                      }}
                    >
                      <FiPlus size={17} color="#ffffff" />
                      <span style={{ fontWeight: '400', fontSize: '12px', lineHeight: '18px' }}>New</span>
                    </button>
                  </div>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="block sm:hidden mt-4">
                  {filteredClients.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <FiUserPlus className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding a new client.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 px-2">
                      {filteredClients.map((client) => (
                        <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                          {/* Row 1: Name and Status with Actions */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{client.name}</h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.status)}`}>
                                {client.status}
                              </span>
                            </div>
                            <div className="flex gap-2 ml-3">
                              <TableActionButton
                                icon={FaPencilAlt}
                                type="edit"
                                title="Edit"
                                onClick={() => handleEditRow(client.id)}
                                mobileSize={true}
                              />
                              <TableActionButton
                                icon={FaTrash}
                                type="delete"
                                title="Delete"
                                onClick={() => handleDeleteRow(client.id)}
                                mobileSize={true}
                              />
                            </div>
                          </div>

                          {/* Row 2: Company and Email */}
                          <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-medium text-gray-900">{client.company}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-3">
                              <FiMail size={12} className="text-blue-500 flex-shrink-0" />
                              <span className="truncate">{client.email}</span>
                            </div>
                          </div>

                          {/* Row 3: Phone and Date */}
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <FiPhone size={12} className="text-green-500 flex-shrink-0" />
                              <span>{client.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCalendar size={12} className="text-gray-500 flex-shrink-0" />
                              <span>{formatDate(client.date)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DESKTOP TABLE VIEW */}
                <Table
                  data={filteredClients}
                  columns={clientColumns}
                  loading={false}
                  emptyMessage="No clients found"
                  emptyDescription="Get started by adding a new client."
                  onEdit={handleEditRow}
                  onDelete={handleDeleteRow}
                  renderCell={renderClientCell}
                  formatDate={formatDate}
                  keyField="id"
                />
              </div>
            </>
          )}
        </main>
      </div>

      <ClientFormPopup
        isOpen={isClientFormOpen}
        onClose={() => {
          setIsClientFormOpen(false);
          setIsEditMode(false);
          setClientToEdit(null);
        }}
        onSubmit={isEditMode ? handleUpdateClient : handleCreateClient}
        editClient={clientToEdit}
      />

      <ProjectFormPopup
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSubmit={() => setShowProjectForm(false)}
        preselectedClientId={projectClientId}
        prefilledClientName={prefilledClientName}
        prefilledAddress={prefilledAddress}
      />
    </div>
  );
}
