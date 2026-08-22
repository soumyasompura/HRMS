document.addEventListener('DOMContentLoaded', function() {
  // Application State
  let isSignUp = false;
  let selectedRole = 'Employee';
  let isClockedIn = false;
  let taskCount = 1;

  // UI References
  const authView = document.getElementById('authView');
  const appView = document.getElementById('appView');
  const authForm = document.getElementById('authForm');
  const btnRoleEmp = document.getElementById('btnRoleEmp');
  const btnRoleAdmin = document.getElementById('btnRoleAdmin');
  const toggleLink = document.getElementById('toggleLink');
  const nameGroup = document.getElementById('nameGroup');
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const authSubtitle = document.getElementById('authSubtitle');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const toggleText = document.getElementById('toggleText');
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
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const taskCountText = document.getElementById('taskCountText');
  const openLeaveModalBtn = document.getElementById('openLeaveModalBtn');
  const closeLeaveModalBtn = document.getElementById('closeLeaveModalBtn');
  const leaveModal = document.getElementById('leaveModal');
  const leaveForm = document.getElementById('leaveForm');
  const leaveTableBody = document.getElementById('leaveTableBody');
  const leaveSearchInput = document.getElementById('leaveSearchInput');
  const announcementForm = document.getElementById('announcementForm');
  const announcementsContainer = document.getElementById('announcementsContainer');

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
    });
  });

  // Role Selection
  btnRoleEmp.addEventListener('click', () => setRole('Employee'));
  btnRoleAdmin.addEventListener('click', () => setRole('HR / Admin'));

  function setRole(role) {
    selectedRole = role;
    btnRoleEmp.classList.toggle('active', role === 'Employee');
    btnRoleAdmin.classList.toggle('active', role === 'HR / Admin');
  }

  // Auth Toggle Mode
  toggleLink.addEventListener('click', function() {
    isSignUp = !isSignUp;
    authSubtitle.innerText = isSignUp ? 'Fill in your details to register' : 'Select your role and enter credentials to continue';
    authSubmitBtn.innerText = isSignUp ? 'Sign Up' : 'Sign In';
    nameGroup.style.display = isSignUp ? 'block' : 'none';
    fullNameInput.required = isSignUp;
    toggleText.innerText = isSignUp ? 'Already have an account?' : "Don't have an account?";
    toggleLink.innerText = isSignUp ? 'Sign In' : 'Sign Up';
  });

  // Login Handler & Authority Display Toggle
  authForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    const name = isSignUp ? fullNameInput.value.trim() : email.split('@')[0];
    const empId = selectedRole === 'HR / Admin' ? 'ADM-001' : `EMP-${Math.floor(100 + Math.random() * 900)}`;

    displayUserName.innerText = name;
    displayUserRole.innerText = selectedRole;
    userAvatar.innerText = name.charAt(0).toUpperCase();
    userEmpIdElements.forEach(el => el.innerText = empId);

    // Apply HR Authority Access Levels across DOM
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
      el.style.display = (selectedRole === 'HR / Admin') ? '' : 'none';
    });

    authView.style.display = 'none';
    appView.style.display = 'flex';
  });

  btnLogout.addEventListener('click', function() {
    authView.style.display = 'flex';
    appView.style.display = 'none';
  });

  // Time Clock Logic
  function toggleClock() {
    isClockedIn = !isClockedIn;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date().toISOString().split('T')[0];

    if (isClockedIn) {
      clockStatusText.innerText = `Clocked In (${now})`;
      clockStatusText.className = 'stat-value badge-success';
      quickClockBtn.innerText = 'Clock Out';
      clockToggleBtn.innerText = 'Clock Out';

      const row = document.createElement('tr');
      row.id = 'activeClockRow';
      row.innerHTML = `<td>${today}</td><td>${now}</td><td>--</td><td>In Progress</td><td><span class="badge-success">Active</span></td>`;
      attendanceTableBody.prepend(row);
    } else {
      clockStatusText.innerText = 'Clocked Out';
      clockStatusText.className = 'stat-value text-warning';
      quickClockBtn.innerText = 'Clock In Now';
      clockToggleBtn.innerText = 'Clock In';

      const activeRow = document.getElementById('activeClockRow');
      if (activeRow) {
        activeRow.cells[2].innerText = now;
        activeRow.cells[3].innerText = '8.0 hrs';
        activeRow.cells[4].innerHTML = '<span class="badge-success">Completed</span>';
        activeRow.removeAttribute('id');
      }
    }
  }

  quickClockBtn.addEventListener('click', toggleClock);
  clockToggleBtn.addEventListener('click', toggleClock);

  // Work Updates
  taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const li = document.createElement('li');
    li.innerHTML = `<span>${taskText}</span><span class="badge-pending">In Progress</span>`;
    taskList.prepend(li);

    taskCount++;
    taskCountText.innerText = `${taskCount} Active`;
    taskInput.value = '';
  });

  // Leave Requests Modal & Submissions
  openLeaveModalBtn.addEventListener('click', () => leaveModal.classList.add('active'));
  closeLeaveModalBtn.addEventListener('click', () => leaveModal.classList.remove('active'));

  leaveForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('leaveType').value;
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const reason = document.getElementById('leaveReason').value;
    const empId = userEmpIdElements[0]?.innerText || 'EMP-001';

    const row = document.createElement('tr');
    const isAdmin = selectedRole === 'HR / Admin';
    row.innerHTML = `
      <td>${empId}</td>
      <td>${type}</td>
      <td>${start}</td>
      <td>${end}</td>
      <td>${reason}</td>
      <td class="status-cell"><span class="badge-pending">Pending</span></td>
      <td class="admin-only action-cell" style="display: ${isAdmin ? '' : 'none'};">
        <button class="btn-action approve" onclick="approveLeave(this)">Approve</button>
        <button class="btn-action reject" onclick="rejectLeave(this)">Reject</button>
      </td>
    `;
    leaveTableBody.prepend(row);

    leaveForm.reset();
    leaveModal.classList.remove('active');
  });

  // HR Post Announcements Authority
  announcementForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('announcementTitle').value.trim();
    const body = document.getElementById('announcementBody').value.trim();
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const item = document.createElement('div');
    item.className = 'announcement-item mt-2';
    item.innerHTML = `
      <div class="announcement-header">
        <h4>📢 ${title}</h4>
        <span class="text-muted">Posted on ${today}</span>
      </div>
      <p class="announcement-body">${body}</p>
    `;
    announcementsContainer.prepend(item);
    announcementForm.reset();
  });

  // Table Search Filter
  leaveSearchInput.addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const rows = leaveTableBody.querySelectorAll('tr');
    rows.forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(filter) ? '' : 'none';
    });
  });
});

// Admin Global Leave Actions
function approveLeave(btn) {
  const row = btn.closest('tr');
  row.querySelector('.status-cell').innerHTML = '<span class="badge-success">Approved</span>';
  row.querySelector('.action-cell').innerHTML = '<span class="text-muted">Done</span>';
}

function rejectLeave(btn) {
  const row = btn.closest('tr');
  row.querySelector('.status-cell').innerHTML = '<span class="badge-rejected">Rejected</span>';
  row.querySelector('.action-cell').innerHTML = '<span class="text-muted">Done</span>';
}