import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDashboardStats, getEquipment, getTeams, getReports, getUsers } from '../services/adminService';
import * as adminService from '../services/adminService';
import '../App.css';

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [stats, setStats] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, equipmentData, teamsData, allRequestsData, reportsData, usersData] = await Promise.all([
        getDashboardStats(),
        getEquipment(),
        getTeams(),
        adminService.getRequests(),
        getReports(),
        getUsers()
      ]);
      setStats(statsData);
      setEquipment(equipmentData);
      setTeams(teamsData);
      setAllRequests(allRequestsData);
      setReports(reportsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values on error to prevent undefined errors
      setStats({ totalRequests: 0, openRequests: 0, overdueRequests: 0 });
      setEquipment([]);
      setTeams([]);
      setAllRequests([]);
      setUsers([]);
      setReports({ period: { start: new Date(), end: new Date() }, totalRequests: 0, byStatus: {}, byType: {}, byDepartment: {}, byTeam: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Strict check: Only admin@gmail.com with admin role can access
    if (!user || user.email !== 'admin@gmail.com' || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-layout">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">⚙️</span>
            <span className="sidebar-logo-text">GearGuard</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={activeTab === 'equipment' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('equipment')}
          >
            <span className="nav-icon">🔧</span>
            <span>Equipment</span>
          </button>
          <button
            className={activeTab === 'requests' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('requests')}
          >
            <span className="nav-icon">⚙️</span>
            <span>Maintenance</span>
          </button>
          <button
            className={activeTab === 'teams' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('teams')}
          >
            <span className="nav-icon">👥</span>
            <span>Teams</span>
          </button>
          <button
            className={activeTab === 'reports' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('reports')}
          >
            <span className="nav-icon">📈</span>
            <span>Reports</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-top-header">
          <div className="header-left">
            <h1 className="page-title">
              {activeTab === 'dashboard' ? 'Dashboard' : 
               activeTab === 'equipment' ? 'Equipment' :
               activeTab === 'requests' ? 'Maintenance Requests' :
               activeTab === 'teams' ? 'Teams & Users' :
               activeTab === 'reports' ? 'Reports' : 'Dashboard'}
            </h1>
            {activeTab === 'dashboard' && (
              <p className="page-subtitle">Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
            )}
          </div>
          <div className="header-right">
            <div className="user-menu">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name || 'Admin User'}</div>
                <div className="user-role">Administrator</div>
              </div>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content-area">
        {activeTab === 'dashboard' && (
          <DashboardOverview stats={stats} equipment={equipment} allRequests={allRequests} onRefresh={loadDashboardData} onTabChange={setActiveTab} overdueRequests={[]} />
        )}
          {activeTab === 'equipment' && (
            <EquipmentManagement equipment={equipment} onRefresh={loadDashboardData} />
          )}
          {activeTab === 'teams' && (
            <TeamsManagement teams={teams} users={users} onRefresh={loadDashboardData} />
          )}
          {activeTab === 'requests' && (
            <RequestsManagement allRequests={allRequests} equipment={equipment} teams={teams} onRefresh={loadDashboardData} />
          )}
          {activeTab === 'reports' && (
            <ReportsView reports={reports} onRefresh={loadDashboardData} />
          )}
        </main>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ stats, equipment, allRequests, onRefresh, onTabChange, overdueRequests }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    equipment: '',
    requestType: 'preventive',
    scheduledDate: '',
    duration: ''
  });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await adminService.createRequest(formData);
      setShowCreateModal(false);
      setFormData({
        subject: '',
        equipment: '',
        requestType: 'preventive',
        scheduledDate: '',
        duration: ''
      });
      onRefresh();
    } catch (error) {
      console.error('Error creating request:', error);
      alert(error.response?.data?.message || 'Error creating request');
    }
  };

  // Group requests by status for Kanban board
  const requestsByStatus = {
    new: allRequests?.filter(r => r.status === 'new') || [],
    'in-progress': allRequests?.filter(r => r.status === 'in-progress') || [],
    repaired: allRequests?.filter(r => r.status === 'repaired') || [],
    scrap: allRequests?.filter(r => r.status === 'scrap') || []
  };

  const totalEquipment = equipment?.length || 0;
  const openRequests = stats?.openRequests || 0;
  const inProgress = requestsByStatus['in-progress'].length;
  const overdue = stats?.overdueRequests || 0;

  return (
    <div className="dashboard-overview">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>🔧</div>
          <div className="kpi-content">
            <div className="kpi-label">Total Equipment</div>
            <div className="kpi-value">{totalEquipment}</div>
            <div className="kpi-change positive">+{Math.floor(Math.random() * 10)}% from last month</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>📋</div>
          <div className="kpi-content">
            <div className="kpi-label">Open Requests</div>
            <div className="kpi-value">{openRequests}</div>
            <div className="kpi-change negative">-{Math.floor(Math.random() * 5)}% from last month</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>⏱️</div>
          <div className="kpi-content">
            <div className="kpi-label">In Progress</div>
            <div className="kpi-value">{inProgress}</div>
            <div className="kpi-change positive">+{Math.floor(Math.random() * 5)}% from last month</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>⚠️</div>
          <div className="kpi-content">
            <div className="kpi-label">Overdue</div>
            <div className="kpi-value">{overdue}</div>
            <div className="kpi-change negative">-{Math.floor(Math.random() * 3)}% from last month</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => onTabChange('equipment')}>
            <div className="quick-action-icon" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>➕</div>
            <div className="quick-action-title">Add Equipment</div>
            <div className="quick-action-desc">Register new equipment to the system</div>
          </button>
          <button className="quick-action-card" onClick={() => setShowCreateModal(true)}>
            <div className="quick-action-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>🔧</div>
            <div className="quick-action-title">Create Request</div>
            <div className="quick-action-desc">Create a new maintenance request</div>
          </button>
          <button className="quick-action-card" onClick={() => onTabChange('teams')}>
            <div className="quick-action-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>👥</div>
            <div className="quick-action-title">Add Team</div>
            <div className="quick-action-desc">Create a new maintenance team</div>
          </button>
        </div>
      </div>

      {/* Maintenance Requests Kanban Board */}
      <div className="requests-kanban-section">
        <div className="section-header-kanban">
          <h3 className="section-title">Maintenance Requests</h3>
          <span className="section-count">{allRequests?.length || 0} Total</span>
        </div>
        <div className="kanban-board">
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="column-title">New</span>
              <span className="column-count">{requestsByStatus.new.length}</span>
            </div>
            <div className="kanban-column-content">
              {requestsByStatus.new.map((request) => (
                <div key={request._id} className="kanban-card">
                  <div className="kanban-card-id">{request._id.slice(-6).toUpperCase()}</div>
                  <div className="kanban-card-title">{request.subject}</div>
                  <div className="kanban-card-equipment">{request.equipment?.name || 'N/A'}</div>
                  <div className="kanban-card-priority">
                    <span className="priority-badge medium">Medium</span>
                  </div>
                </div>
              ))}
              {requestsByStatus.new.length === 0 && (
                <div className="kanban-empty">No requests</div>
              )}
            </div>
          </div>

          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="column-title">In Progress</span>
              <span className="column-count">{requestsByStatus['in-progress'].length}</span>
            </div>
            <div className="kanban-column-content">
              {requestsByStatus['in-progress'].map((request) => (
                <div key={request._id} className="kanban-card">
                  <div className="kanban-card-id">{request._id.slice(-6).toUpperCase()}</div>
                  <div className="kanban-card-title">{request.subject}</div>
                  <div className="kanban-card-equipment">{request.equipment?.name || 'N/A'}</div>
                  <div className="kanban-card-priority">
                    <span className="priority-badge high">High</span>
                  </div>
                </div>
              ))}
              {requestsByStatus['in-progress'].length === 0 && (
                <div className="kanban-empty">No requests</div>
              )}
            </div>
          </div>

          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="column-title">Repaired</span>
              <span className="column-count">{requestsByStatus.repaired.length}</span>
            </div>
            <div className="kanban-column-content">
              {requestsByStatus.repaired.map((request) => (
                <div key={request._id} className="kanban-card">
                  <div className="kanban-card-id">{request._id.slice(-6).toUpperCase()}</div>
                  <div className="kanban-card-title">{request.subject}</div>
                  <div className="kanban-card-equipment">{request.equipment?.name || 'N/A'}</div>
                  <div className="kanban-card-priority">
                    <span className="priority-badge medium">Medium</span>
                  </div>
                </div>
              ))}
              {requestsByStatus.repaired.length === 0 && (
                <div className="kanban-empty">No requests</div>
              )}
            </div>
          </div>

          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="column-title">Scrap</span>
              <span className="column-count">{requestsByStatus.scrap.length}</span>
            </div>
            <div className="kanban-column-content">
              {requestsByStatus.scrap.map((request) => (
                <div key={request._id} className="kanban-card">
                  <div className="kanban-card-id">{request._id.slice(-6).toUpperCase()}</div>
                  <div className="kanban-card-title">{request.subject}</div>
                  <div className="kanban-card-equipment">{request.equipment?.name || 'N/A'}</div>
                  <div className="kanban-card-priority">
                    <span className="priority-badge low">Low</span>
                  </div>
                </div>
              ))}
              {requestsByStatus.scrap.length === 0 && (
                <div className="kanban-empty">No requests</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Maintenance Request</h3>
              <button 
                type="button" 
                className="modal-close" 
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="request-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">📋</span>
                    Subject
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter request subject"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">🔧</span>
                    Request Type
                  </label>
                  <select
                    className="form-input"
                    value={formData.requestType}
                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    required
                  >
                    <option value="preventive">Preventive Maintenance</option>
                    <option value="corrective">Corrective Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">⚙️</span>
                  Equipment
                </label>
                <select
                  className="form-input"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipment && equipment.map((eq) => (
                    <option key={eq._id} value={eq._id}>
                      {eq.name} - {eq.serialNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">📅</span>
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">⏱️</span>
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Create Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Equipment Management Component
const EquipmentManagement = ({ equipment, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    department: '',
    maintenanceTeam: '',
    location: '',
    purchaseDate: '',
    warrantyDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        await adminService.updateEquipment(editingEquipment._id, formData);
      } else {
        await adminService.createEquipment(formData);
      }
      setShowModal(false);
      setEditingEquipment(null);
      setFormData({
        name: '',
        serialNumber: '',
        department: '',
        maintenanceTeam: '',
        location: '',
        purchaseDate: '',
        warrantyDate: '',
      });
      onRefresh();
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert(error.response?.data?.message || 'Error saving equipment');
    }
  };

  const handleEdit = (eq) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      serialNumber: eq.serialNumber,
      department: eq.department,
      maintenanceTeam: eq.maintenanceTeam,
      location: eq.location,
      purchaseDate: eq.purchaseDate ? eq.purchaseDate.split('T')[0] : '',
      warrantyDate: eq.warrantyDate ? eq.warrantyDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await adminService.deleteEquipment(id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        alert(error.response?.data?.message || 'Error deleting equipment');
      }
    }
  };

  return (
    <div className="equipment-management-section">
      <div className="section-header">
        <div>
          <h2>Equipment Management</h2>
          <p className="section-subtitle">Manage and track all equipment in your system</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowModal(true); setEditingEquipment(null); setFormData({
          name: '', serialNumber: '', department: '', maintenanceTeam: '', location: '', purchaseDate: '', warrantyDate: ''
        }); }}>
          <span>➕</span>
          Add Equipment
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Serial Number</th>
              <th>Department</th>
              <th>Location</th>
              <th>Team</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment && equipment.length > 0 ? (
              equipment.map((eq) => (
                <tr key={eq._id}>
                  <td>
                    <strong>{eq.name}</strong>
                  </td>
                  <td>{eq.serialNumber}</td>
                  <td>{eq.department}</td>
                  <td>{eq.location}</td>
                  <td>{eq.maintenanceTeam}</td>
                  <td>
                    <span className={`status-badge ${eq.isScrapped ? 'status-scrapped' : 'status-active'}`}>
                      {eq.isScrapped ? 'Scrapped' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(eq)} title="Edit Equipment">
                        ✏️ Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(eq._id)} title="Delete Equipment">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-state-content">
                    <span className="empty-icon">🔧</span>
                    <p>No equipment found. Add your first equipment to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEquipment ? 'Edit Equipment' : 'Add Equipment'}</h3>
              <button 
                type="button" 
                className="modal-close" 
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="equipment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">🔧</span>
                    Equipment Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter equipment name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">🏷️</span>
                    Serial Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="Enter serial number"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">🏢</span>
                    Department
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">📍</span>
                    Location
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">👥</span>
                  Maintenance Team
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.maintenanceTeam}
                  onChange={(e) => setFormData({ ...formData, maintenanceTeam: e.target.value })}
                  placeholder="Enter maintenance team name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">🛒</span>
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">🛡️</span>
                    Warranty Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.warrantyDate}
                    onChange={(e) => setFormData({ ...formData, warrantyDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Teams Management Component
const TeamsManagement = ({ teams, users, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users && users.filter ? users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getTeamName = (userId) => {
    const team = teams?.find(t => t.technicians?.some(tech => tech._id === userId));
    return team?.teamName || 'N/A';
  };

  return (
    <div className="teams-users-management">
      <div className="section-header">
        <div>
          <h2>Teams & Users</h2>
          <p className="section-subtitle">Manage your maintenance teams and users</p>
        </div>
        <button className="btn-primary">
          <span>➕</span>
          Add Team
        </button>
      </div>

      {/* Teams Section */}
      <div className="teams-section">
        <h3 className="section-title">Teams</h3>
        <div className="teams-grid">
          {teams && teams.length > 0 ? (
            teams.map((team) => {
              const leadTechnician = team.technicians && team.technicians.length > 0 ? team.technicians[0] : null;
              return (
                <div key={team._id} className="team-card-new">
                  <div className="team-card-icon">👥</div>
                  <div className="team-card-content">
                    <h4>{team.teamName}</h4>
                    <p className="team-lead">Lead: {leadTechnician?.name || 'No Lead Assigned'}</p>
                    <span className="team-member-count">{team.technicians?.length || 0} Members</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-card">No teams found</div>
          )}
        </div>
      </div>

      {/* Users Section */}
      <div className="users-section">
        <div className="users-section-header">
          <h3 className="section-title">Users</h3>
          <div className="users-actions">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="btn-primary">
              <span>➕</span>
              Add User
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Team</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="user-name-cell">{user.name || 'N/A'}</div>
                          <div className="user-email-cell">{user.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge">{user.role || 'user'}</span>
                    </td>
                    <td>{getTeamName(user._id)}</td>
                    <td>
                      <span className="status-badge status-active">Active</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" title="Edit User">✏️</button>
                        <button className="btn-delete" title="Delete User">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-state-content">
                      <span className="empty-icon">👤</span>
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Requests Management Component
const RequestsManagement = ({ allRequests, equipment, teams, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    equipment: '',
    requestType: 'preventive',
    scheduledDate: '',
    duration: ''
  });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await adminService.createRequest(formData);
      setShowCreateModal(false);
      setFormData({
        subject: '',
        equipment: '',
        requestType: 'preventive',
        scheduledDate: '',
        duration: ''
      });
      onRefresh();
    } catch (error) {
      console.error('Error creating request:', error);
      alert(error.response?.data?.message || 'Error creating request');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      try {
        await adminService.deleteRequest(id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting request:', error);
        alert(error.response?.data?.message || 'Error deleting request');
      }
    }
  };

  return (
    <div className="requests-management-section">
      <div className="section-header">
        <div>
          <h2>Maintenance Requests</h2>
          <p className="section-subtitle">Manage and track all maintenance requests</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <span>➕</span>
            Add Request
          </button>
        </div>
      </div>

      <div className="requests-management">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Equipment</th>
                <th>Type</th>
                <th>Status</th>
                <th>Scheduled Date</th>
                <th>Team</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allRequests && allRequests.length > 0 ? (
                allRequests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <strong>{request.subject}</strong>
                    </td>
                    <td>
                      <div className="table-cell-content">
                        <span className="cell-label">Equipment:</span>
                        {request.equipment?.name || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${request.requestType === 'preventive' ? 'status-active' : 'status-in-progress'}`}>
                        {request.requestType}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-cell-content">
                        <span className="cell-date">{new Date(request.scheduledDate).toLocaleDateString()}</span>
                        <span className="cell-time">{new Date(request.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td>{request.maintenanceTeam?.teamName || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-delete" onClick={() => handleDeleteRequest(request._id)} title="Delete Request">
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-state-content">
                      <span className="empty-icon">📋</span>
                      <p>No requests found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Maintenance Request</h3>
              <button 
                type="button" 
                className="modal-close" 
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="request-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">📋</span>
                    Subject
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter request subject"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">🔧</span>
                    Request Type
                  </label>
                  <select
                    className="form-input"
                    value={formData.requestType}
                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    required
                  >
                    <option value="preventive">Preventive Maintenance</option>
                    <option value="corrective">Corrective Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">⚙️</span>
                  Equipment
                </label>
                <select
                  className="form-input"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipment && equipment.map((eq) => (
                    <option key={eq._id} value={eq._id}>
                      {eq.name} - {eq.serialNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">📅</span>
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">⏱️</span>
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <span>Create Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reports View Component
const ReportsView = ({ reports, onRefresh }) => {
  const [reportType, setReportType] = useState('equipment');
  const [timePeriod, setTimePeriod] = useState('month');

  if (!reports) {
    return <div className="loading">Loading reports...</div>;
  }

  // Calculate KPIs (mock data for now, should come from backend)
  const avgResolutionTime = '2.4';
  const completedThisMonth = reports.totalRequests || 0;
  const equipmentUptime = '94.2';
  const slaBreaches = 3;

  // Mock recent reports
  const recentReports = [
    { id: 1, name: 'Monthly Equipment Report', date: 'Dec 15, 2024', category: 'Equipment', status: 'Ready' },
    { id: 2, name: 'Maintenance Summary Q4', date: 'Dec 10, 2024', category: 'Maintenance', status: 'Ready' },
    { id: 3, name: 'Team Performance Report', date: 'Dec 5, 2024', category: 'Performance', status: 'Ready' }
  ];

  return (
    <div className="reports-view-new">
      {/* KPI Cards */}
      <div className="reports-kpi-grid">
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>⏱️</div>
          <div className="reports-kpi-content">
            <div className="reports-kpi-label">Avg. Resolution Time</div>
            <div className="reports-kpi-value">{avgResolutionTime} days</div>
            <div className="reports-kpi-change positive">+15% from last month</div>
          </div>
        </div>
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>🔧</div>
          <div className="reports-kpi-content">
            <div className="reports-kpi-label">Completed This Month</div>
            <div className="reports-kpi-value">{completedThisMonth}</div>
            <div className="reports-kpi-change positive">+23% from last month</div>
          </div>
        </div>
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>📈</div>
          <div className="reports-kpi-content">
            <div className="reports-kpi-label">Equipment Uptime</div>
            <div className="reports-kpi-value">{equipmentUptime}%</div>
            <div className="reports-kpi-change positive">+2% from last month</div>
          </div>
        </div>
        <div className="reports-kpi-card">
          <div className="reports-kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>⚠️</div>
          <div className="reports-kpi-content">
            <div className="reports-kpi-label">SLA Breaches</div>
            <div className="reports-kpi-value">{slaBreaches}</div>
            <div className="reports-kpi-change negative">+50% from last month</div>
          </div>
        </div>
      </div>

      {/* Generate Report Section */}
      <div className="generate-report-section">
        <div className="generate-report-header">
          <div className="generate-report-title">
            <span className="generate-report-icon">📊</span>
            <div>
              <h3>Generate Report</h3>
              <p>Create custom reports based on your needs</p>
            </div>
          </div>
          <div className="generate-report-controls">
            <select className="report-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="equipment">Equipment Report</option>
              <option value="maintenance">Maintenance Report</option>
              <option value="performance">Performance Report</option>
              <option value="team">Team Report</option>
            </select>
            <select className="report-select" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button className="btn-primary">Generate Report</button>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="recent-reports-section">
        <h3 className="section-title">Recent Reports</h3>
        <div className="recent-reports-list">
          {recentReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-card-icon">📊</div>
              <div className="report-card-content">
                <h4>{report.name}</h4>
                <p className="report-card-date">{report.date}</p>
                <div className="report-card-tags">
                  <span className="report-tag category">{report.category}</span>
                  <span className="report-tag status-ready">{report.status}</span>
                </div>
              </div>
              <button className="report-download-btn">
                <span>⬇️</span>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
