document.addEventListener('DOMContentLoaded', function() {
  const API_BASE_URL = 'http://localhost:5000/api';

  // Application State
  let selectedRole = 'Employee';
  let isClockedIn = false;

  // UI References
  const authView = document.getElementById('authView');
  const appView = document.getElementById('appView');
  const authForm = document.getElementById('authForm');
  const btnRoleEmp = document.getElementById('btnRoleEmp');
  const btnRoleAdmin = document.getElementById('btnRoleAdmin');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const displayUserName = document.getElementById('displayUserName');
  const displayUserRole = document.getElementById('displayUserRole');
  const userAvatar = document.getElementById('userAvatar');
  const userEmpIdElements = document.querySelectorAll('.userEmpId');
  const btnLogout = document.getElementById('btnLogout');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const currentTabTitle = document.getElementById('currentTabTitle');

  // Navigation Panels
  const navItems = document.querySelectorAll('.nav-item');
  const pagePanels = document.querySelectorAll('.page-panel');

  // Interactive Features
  const clockStatusText = document.getElementById('clockStatusText');
  const quickClockBtn = document.getElementById('quickClockBtn');
  const clockToggleBtn = document.getElementById('clockToggleBtn');
  const attendanceTableBody = document.getElementById('attendanceTableBody');
  const openLeaveModalBtn = document.getElementById('openLeaveModalBtn');
  const closeLeaveModalBtn = document.getElementById('closeLeaveModalBtn');
  const leaveModal = document.getElementById('leaveModal');
  const leaveForm = document.getElementById('leaveForm');
  const leaveTableBody = document.getElementById('leaveTableBody');
  const leaveSearchInput = document.getElementById('leaveSearchInput');

  // Utility Functions
  function showToast(message, type = 'error') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function setButtonLoading(button, isLoading, loadingText = 'Processing...') {
    if (isLoading) {
      button.dataset.originalText = button.innerText;
      button.innerText = loadingText;
      button.classList.add('btn-loading');
      button.disabled = true;
    } else {
      button.innerText = button.dataset.originalText || button.innerText;
      button.classList.remove('btn-loading');
      button.disabled = false;
    }
  }

  function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Theme Toggle
  themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    themeToggleBtn.innerText = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
  });

  // Sidebar Page Switching
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const pageId = this.getAttribute('data-page');
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');

      pagePanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `page-${pageId}`);
      });

      currentTabTitle.innerText = this.innerText.trim();

      // Load API data on page tab click
      if (pageId === 'attendance') fetchAttendanceLogs();
      if (pageId === 'leave') fetchLeaveRequests();
      if (pageId === 'payroll') fetchPayrollData();
    });
  });

  // Role Selection Toggle (Login View)
  btnRoleEmp.addEventListener('click', () => setRole('Employee'));
  btnRoleAdmin.addEventListener('click', () => setRole('HR / Admin'));

  function setRole(role) {
    selectedRole = role;
    btnRoleEmp.classList.toggle('active', role === 'Employee');
    btnRoleAdmin.classList.toggle('active', role === 'HR / Admin');
  }

  // Authentication API Integration
  authForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    setButtonLoading(authSubmitBtn, true, 'Signing in...');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed');

      // Save session credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setupUserSession(data.user);
      showToast('Login successful!', 'success');
    } catch (err) {
      showToast(err.message);
    } finally {
      setButtonLoading(authSubmitBtn, false);
    }
  });

  function setupUserSession(user) {
    displayUserName.innerText = user.name || user.email.split('@')[0];
    const isAdminUser = user.role === 'admin' || user.role === 'HR / Admin';
    displayUserRole.innerText = isAdminUser ? 'HR / Admin' : 'Employee';
    userAvatar.innerText = (user.name || user.email).charAt(0).toUpperCase();
    userEmpIdElements.forEach(el => el.innerText = user.employee_id || user.id || 'EMP-001');

    // Toggle RBAC Elements
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
      el.style.display = isAdminUser ? '' : 'none';
    });

    authView.style.display = 'none';
    appView.style.display = 'flex';

    // Initial Data Fetches
    fetchAttendanceLogs();
  }

  btnLogout.addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authView.style.display = 'flex';
    appView.style.display = 'none';
    showToast('Logged out successfully', 'success');
  });

  // Check Token Session on Page Refresh
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  if (savedToken && savedUser) {
    setupUserSession(JSON.parse(savedUser));
  }

  // Attendance Clock-In / Clock-Out API Integration
  async function handleClockAction() {
    const action = isClockedIn ? 'checkout' : 'checkin';
    const activeBtn = quickClockBtn.offsetParent !== null ? quickClockBtn : clockToggleBtn;
    setButtonLoading(activeBtn, true);

    try {
      const response = await fetch(`${API_BASE_URL}/attendance/${action}`, {
        method: 'POST',
        headers: getAuthHeader()
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${action}`);

      isClockedIn = !isClockedIn;
      clockStatusText.innerText = isClockedIn ? 'Clocked In' : 'Clocked Out';
      clockStatusText.className = isClockedIn ? 'stat-value badge-success' : 'stat-value text-warning';
      quickClockBtn.innerText = isClockedIn ? 'Clock Out' : 'Clock In Now';
      clockToggleBtn.innerText = isClockedIn ? 'Clock Out' : 'Clock In';

      showToast(`Successfully ${isClockedIn ? 'clocked in' : 'clocked out'}!`, 'success');
      fetchAttendanceLogs();
    } catch (err) {
      showToast(err.message);
    } finally {
      setButtonLoading(activeBtn, false);
    }
  }

  quickClockBtn.addEventListener('click', handleClockAction);
  clockToggleBtn.addEventListener('click', handleClockAction);

  async function fetchAttendanceLogs() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user.role === 'admin' || user.role === 'HR / Admin';
      const endpoint = isAdmin ? '/attendance/all' : '/attendance/my';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getAuthHeader()
      });
      const logs = await response.json();
      if (!response.ok) throw new Error(logs.message || 'Failed to fetch attendance');

      attendanceTableBody.innerHTML = '';
      if (Array.isArray(logs) && logs.length > 0) {
        logs.forEach(log => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${log.date || new Date(log.createdAt).toISOString().split('T')[0]}</td>
            <td>${log.checkIn || '--'}</td>
            <td>${log.checkOut || '--'}</td>
            <td>${log.totalHours ? log.totalHours + ' hrs' : 'In Progress'}</td>
            <td><span class="${log.checkOut ? 'badge-success' : 'badge-pending'}">${log.status || (log.checkOut ? 'Completed' : 'Active')}</span></td>
          `;
          attendanceTableBody.appendChild(row);
        });
      } else {
        attendanceTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No records found</td></tr>';
      }
    } catch (err) {
      showToast(err.message);
    }
  }

  // Leave Requests API Integration
  openLeaveModalBtn.addEventListener('click', () => leaveModal.classList.add('active'));
  closeLeaveModalBtn.addEventListener('click', () => leaveModal.classList.remove('active'));

  leaveForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = leaveForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true, 'Submitting...');

    const payload = {
      leaveType: document.getElementById('leaveType').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      reason: document.getElementById('leaveReason').value
    };

    try {
      const response = await fetch(`${API_BASE_URL}/leave/apply`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit leave');

      showToast('Leave request submitted!', 'success');
      leaveForm.reset();
      leaveModal.classList.remove('active');
      fetchLeaveRequests();
    } catch (err) {
      showToast(err.message);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  async function fetchLeaveRequests() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user.role === 'admin' || user.role === 'HR / Admin';
      const endpoint = isAdmin ? '/leave/all' : '/leave/my';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getAuthHeader()
      });
      const leaves = await response.json();
      if (!response.ok) throw new Error(leaves.message || 'Failed to fetch leave requests');

      leaveTableBody.innerHTML = '';
      if (Array.isArray(leaves) && leaves.length > 0) {
        leaves.forEach(leave => {
          const row = document.createElement('tr');
          const badgeClass = leave.status === 'Approved' ? 'badge-success' : leave.status === 'Rejected' ? 'badge-rejected' : 'badge-pending';
          row.innerHTML = `
            <td>${leave.employee_id || leave.userId || 'EMP-001'}</td>
            <td>${leave.leaveType || 'Paid Leave'}</td>
            <td>${leave.startDate}</td>
            <td>${leave.endDate}</td>
            <td>${leave.reason}</td>
            <td class="status-cell"><span class="${badgeClass}">${leave.status || 'Pending'}</span></td>
            <td class="admin-only action-cell" style="display: ${isAdmin ? '' : 'none'};">
              ${leave.status === 'Pending' ? `
                <button class="btn-action approve" onclick="updateLeaveStatus('${leave._id || leave.id}', 'approve')">Approve</button>
                <button class="btn-action reject" onclick="updateLeaveStatus('${leave._id || leave.id}', 'reject')">Reject</button>
              ` : `<span class="text-muted">Done</span>`}
            </td>
          `;
          leaveTableBody.appendChild(row);
        });
      } else {
        leaveTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No leave applications found</td></tr>';
      }
    } catch (err) {
      showToast(err.message);
    }
  }

  // Global Admin Approve / Reject Handler
  window.updateLeaveStatus = async function(leaveId, action) {
    try {
      const response = await fetch(`${API_BASE_URL}/leave/${leaveId}/${action}`, {
        method: 'PUT',
        headers: getAuthHeader()
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${action} leave`);

      showToast(`Leave request ${action}d successfully`, 'success');
      fetchLeaveRequests();
    } catch (err) {
      showToast(err.message);
    }
  };

  // Payroll API Fetch
  async function fetchPayrollData() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user.role === 'admin' || user.role === 'HR / Admin';
      const endpoint = isAdmin ? '/payroll/all' : '/payroll/my';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getAuthHeader()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch payroll information');
      // Render payroll UI according to requirements
    } catch (err) {
      showToast(err.message);
    }
  }

  // Leave Table Search Filter
  leaveSearchInput.addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const rows = leaveTableBody.querySelectorAll('tr');
    rows.forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(filter) ? '' : 'none';
    });
  });
});