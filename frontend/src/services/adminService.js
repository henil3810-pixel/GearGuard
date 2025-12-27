import API from './api';

// Dashboard Stats
export const getDashboardStats = async () => {
  const response = await API.get('/admin/dashboard-stats');
  return response.data;
};

// Users
export const getUsers = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await API.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// Equipment
export const getEquipment = async () => {
  const response = await API.get('/equipment');
  return response.data;
};

export const createEquipment = async (equipmentData) => {
  const response = await API.post('/equipment', equipmentData);
  return response.data;
};

export const updateEquipment = async (equipmentId, equipmentData) => {
  const response = await API.put(`/equipment/${equipmentId}`, equipmentData);
  return response.data;
};

export const deleteEquipment = async (equipmentId) => {
  const response = await API.delete(`/equipment/${equipmentId}`);
  return response.data;
};

// Teams
export const getTeams = async () => {
  const response = await API.get('/teams');
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await API.post('/teams', teamData);
  return response.data;
};

export const updateTeam = async (teamId, teamData) => {
  const response = await API.put(`/teams/${teamId}`, teamData);
  return response.data;
};

// Requests
export const getRequests = async () => {
  const response = await API.get('/requests');
  return response.data;
};

export const createRequest = async (requestData) => {
  const response = await API.post('/requests', requestData);
  return response.data;
};

export const deleteRequest = async (requestId) => {
  const response = await API.delete(`/requests/${requestId}`);
  return response.data;
};

// Overdue Requests
export const getOverdueRequests = async () => {
  const response = await API.get('/admin/overdue-requests');
  return response.data;
};

// Calendar Data
export const getCalendarData = async (start, end) => {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  const response = await API.get(`/admin/calendar?${params.toString()}`);
  return response.data;
};

// Reports
export const getReports = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const response = await API.get(`/admin/reports?${params.toString()}`);
  return response.data;
};

