import config from '../config/config';

// API Service with centralized configuration
class ApiService {
  constructor() {
    this.timeout = config.api.timeout;
  }

  // Dynamic baseUrl method for runtime evaluation
  getBaseUrl() {
    const apiUrl = config.api.baseUrl;
    console.log('API URL:', apiUrl);
    return apiUrl;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic fetch method with error handling
  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    console.log('API Request URL:', url); // Debug logging

    const isFormData = options.body instanceof FormData;
    const authHeaders = this.getAuthHeaders();

    if (isFormData) {
      delete authHeaders['Content-Type'];
    }

    const defaultOptions = {
      headers: authHeaders,
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        // Try to get error data from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorData = null;

        try {
          errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse the error response, use status-based messages
          switch (response.status) {
            case 400:
              errorMessage = 'Invalid request. Please check your input.';
              break;
            case 401:
              errorMessage = 'Invalid credentials. Please check your username and password.';
              break;
            case 403:
              errorMessage = 'Access denied. You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'The requested resource was not found.';
              break;
            case 409:
              errorMessage = 'This action conflicts with existing data.';
              break;
            case 422:
              errorMessage = 'Validation failed. Please check your input.';
              break;
            case 429:
              errorMessage = 'Too many requests. Please try again later.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = 'An unexpected error occurred. Please try again.';
          }
        }

        // Create error with response data attached
        const error = new Error(errorMessage);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async forgotPassword(emailData) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  }

  async changePassword(passwordData) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Task endpoints
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/tasks?${queryString}` : '/api/tasks';
    return this.request(endpoint);
  }

  async getTaskById(id) {
    return this.request(`/api/tasks/${id}`);
  }

  async getTasksByLead(leadId) {
    return this.request(`/api/tasks/lead/${leadId}`);
  }

  async createTask(taskData) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  }

  async deleteTask(id) {
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
  }

  async getNextTaskNumber() {
    return this.request('/api/tasks/next-number');
  }

  // Comment endpoints
  async getCommentsByTask(taskId) {
    return this.request(`/api/comments/task/${taskId}`);
  }

  async createComment(commentData) {
    return this.request('/api/comments', {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  }

  async updateComment(id, commentData) {
    return this.request(`/api/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(commentData)
    });
  }

  async deleteComment(id) {
    return this.request(`/api/comments/${id}`, {
      method: 'DELETE'
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/api/users');
  }

  async checkUserDeletion(id) {
    return this.request(`/api/users/${id}/check-deletion`);
  }

  async createUser(userData) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Lead endpoints
  async getLeads() {
    return this.request('/api/leads');
  }

  async createLead(leadData) {
    return this.request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  async updateLead(id, leadData) {
    return this.request(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData)
    });
  }


  async deleteLead(id) {
    return this.request(`/api/leads/${id}`, {
      method: 'DELETE'
    });
  }

  // Convert lead to client
  async convertLeadToClient(id) {
    return this.request(`/api/leads/${id}/convert`, {
      method: 'POST'
    });
  }

  // Client endpoints
  async getClients() {
    return this.request('/api/clients');
  }

  async getClientById(id) {
    return this.request(`/api/clients/${id}`);
  }

  async createClient(clientData) {
    return this.request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData)
    });
  }

  async updateClient(id, clientData) {
    return this.request(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData)
    });
  }

  async deleteClient(id) {
    return this.request(`/api/clients/${id}`, {
      method: 'DELETE'
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/api/notifications');
  }

  async getUnreadNotificationCount() {
    return this.request('/api/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PUT'
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/api/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  async deleteNotificationsByRelatedId(relatedId, type) {
    return this.request(`/api/notifications/by-related/${relatedId}/${type}`, {
      method: 'DELETE'
    });
  }

  // Project endpoints
  async getProjects() {
    return this.request('/api/projects');
  }

  async getProjectById(id) {
    return this.request(`/api/projects/${id}`);
  }

  async getProjectsByClient(clientId) {
    return this.request(`/api/projects/client/${clientId}`);
  }

  async createProject(projectData) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  async deleteProject(id) {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE'
    });
  }

  async getProjectStats() {
    return this.request('/api/projects/stats');
  }

  // Transaction endpoints
  async getProjectTransactions(projectId) {
    return this.request(`/api/transactions/project/${projectId}`);
  }

  async getProjectFinancialSummary(projectId) {
    return this.request(`/api/transactions/project/${projectId}/summary`);
  }

  async createTransaction(transactionData) {
    const body = transactionData instanceof FormData
      ? transactionData
      : JSON.stringify(transactionData);

    return this.request('/api/transactions', {
      method: 'POST',
      body
    });
  }

  async updateTransaction(id, transactionData) {
    const body = transactionData instanceof FormData
      ? transactionData
      : JSON.stringify(transactionData);

    return this.request(`/api/transactions/${id}`, {
      method: 'PUT',
      body
    });
  }

  async deleteTransaction(id) {
    return this.request(`/api/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  // Employee endpoints
  async getEmployees() {
    return this.request('/api/employees');
  }

  async getEmployeeById(id) {
    return this.request(`/api/employees/${id}`);
  }

  async getEmployeesByProject(projectId) {
    return this.request(`/api/employees/project/${projectId}`);
  }

  async createEmployee(employeeData) {
    return this.request('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  }

  async updateEmployee(id, employeeData) {
    return this.request(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData)
    });
  }

  async deleteEmployee(id) {
    return this.request(`/api/employees/${id}`, {
      method: 'DELETE'
    });
  }

  // Attendance endpoints
  async recordAttendance(data) {
    return this.request('/api/attendance/record', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAttendanceByDate(projectId, date) {
    return this.request(`/api/attendance/project/${projectId}/date/${date}`);
  }

  async getAttendanceByRange(projectId, startDate, endDate) {
    return this.request(`/api/attendance/project/${projectId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getAttendanceSummary(projectId, startDate, endDate) {
    return this.request(`/api/attendance/project/${projectId}/summary?startDate=${startDate}&endDate=${endDate}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Material Request endpoints
  async createMaterialRequest(data) {
    return this.request('/api/material-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMaterialRequestsByProject(projectId) {
    return this.request(`/api/material-requests/project/${projectId}`);
  }

  async getMyMaterialRequests() {
    return this.request('/api/material-requests/my-requests');
  }

  async updateMaterialRequestStatus(id, status) {
    return this.request(`/api/material-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async deleteMaterialRequest(id) {
    return this.request(`/api/material-requests/${id}`, {
      method: 'DELETE'
    });
  }

  // Inventory endpoints
  async createInventoryEntry(data) {
    return this.request('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getProjectInventory(projectId) {
    return this.request(`/api/inventory/project/${projectId}`);
  }

  async getStockSummary(projectId) {
    return this.request(`/api/inventory/project/${projectId}/summary`);
  }

  async createUsageReturn(data) {
    return this.request('/api/inventory/usage-return', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- Salary & Payroll Endpoints ---

  async getSalaryTypes() {
    return this.request('/api/employees/salary-types');
  }

  // Project Rates
  async upsertProjectRate(rateData) {
    return this.request('/api/project-rates', {
      method: 'POST',
      body: JSON.stringify(rateData)
    });
  }

  async getProjectRatesByEmployee(employeeId) {
    return this.request(`/api/project-rates/employee/${employeeId}`);
  }

  async deleteProjectRate(id) {
    return this.request(`/api/project-rates/${id}`, {
      method: 'DELETE'
    });
  }

  // Payroll
  async generateSalarySlip(slipData) {
    return this.request('/api/payroll/generate-slip', {
      method: 'POST',
      body: JSON.stringify(slipData)
    });
  }

  async getSalarySlipsByEmployee(employeeId) {
    return this.request(`/api/payroll/slips/employee/${employeeId}`);
  }

  async getSalarySlipsByProject(projectId, month, year) {
    return this.request(`/api/payroll/slips/project/${projectId}?month=${month}&year=${year}`);
  }

  async recordSalaryPayment(paymentData) {
    return this.request('/api/payroll/record-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getSalaryPaymentsBySlip(slipId) {
    return this.request(`/api/payroll/payments/slip/${slipId}`);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
