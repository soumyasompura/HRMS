// Database Schema Compliant Default Store
const initialData = {
  currentUserId: 1,
  currentEmployeeId: "EMP-001",
  role: "employee",
  
  users: [
    { id: 1, employee_id: "EMP-001", name: "John Doe", email: "john@company.com", role: "employee", status: "active", department: "Engineering", designation: "Frontend Engineer" },
    { id: 2, employee_id: "EMP-002", name: "Sarah Jenkins", email: "sarah@company.com", role: "admin", status: "active", department: "Human Resources", designation: "HR Manager" }
  ],
  
  attendance: [
    { id: 1, employee_id: "EMP-001", date: "2026-08-22", check_in: "09:00:00", check_out: "17:00:00", total_hours: 8, status: "Present" }
  ],

  leave_balances: [
    { id: 1, employee_id: "EMP-001", year: 2026, paid_leave_total: 18, paid_leave_used: 4, sick_leave_total: 10, sick_leave_used: 1, unpaid_leave_used: 0 }
  ],

  leave_requests: [
    { id: 1, employee_id: "EMP-001", leave_type: "paid", start_date: "2026-09-01", end_date: "2026-09-03", reason: "Personal Vacation", status: "Pending", hr_comment: "" }
  ],

  payroll: [
    { id: 1, employee_id: "EMP-001", month: "August", year: 2026, basic_salary: 4500, allowances: 500, deductions: 200, net_salary: 4800, payment_status: "Paid" }
  ],

  work_updates: [
    { id: 1, employee_id: "EMP-001", project: "HRMS Portal", work_title: "Setup DB Frontend Schema", description: "Aligned local tables with backend structure.", work_date: "2026-08-22", status: "Completed", progress_percentage: 100, remarks: "Ready for review" }
  ],

  announcements: [
    { id: 1, created_by: 2, title: "Quarterly All-Hands Meeting", message: "All-hands scheduled for next Monday at 10 AM EST.", created_at: "2026-08-20" }
  ],

  notifications: [
    { id: 1, user_id: 1, title: "Welcome!", message: "Your HRMS profile is fully activated.", type: "system", is_read: false, created_at: "2026-08-22" }
  ],

  audit_logs: [
    { id: 1, user_id: 1, action: "LOGIN", target_type: "users", target_id: 1, description: "User logged into session", created_at: "2026-08-22 09:00:00" }
  ]
};

function getStore() {
  const data = localStorage.getItem('HRMS_DB');
  return data ? JSON.parse(data) : initialData;
}

function saveStore(data) {
  localStorage.setItem('HRMS_DB', JSON.stringify(data));
  renderAll();
}

function logAudit(action, target_type, target_id, description) {
  const store = getStore();
  store.audit_logs.unshift({
    id: Date.now(),
    user_id: store.currentUserId,
    action,
    target_type,
    target_id,
    description,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });
  localStorage.setItem('HRMS_DB', JSON.stringify(store));
}

function toggleRole(role) {
  const store = getStore();
  store.role = role;
  store.currentUserId = role === 'admin' ? 2 : 1;
  store.currentEmployeeId = role === 'admin' ? "EMP-002" : "EMP-001";
  
  localStorage.setItem('HRMS_DB', JSON.stringify(store));

  document.getElementById('userLabel').innerText = role === 'admin' ? 'Sarah Jenkins (admin)' : 'John Doe (employee)';
  
  document.querySelectorAll('.hr-only').forEach(el => el.style.display = role === 'admin' ? '' : 'none');

  // Guard against locking navigation on role downgrade
  const usersView = document.getElementById('view-users');
  const auditView = document.getElementById('view-audit_logs');
  if (role === 'employee' && ((usersView && usersView.style.display !== 'none') || (auditView && auditView.style.display !== 'none'))) {
    navigate('dashboard');
  }

  logAudit("SWITCH_ROLE", "users", store.currentUserId, `Switched preview role to ${role}`);
  renderAll();
}

function navigate(viewId) {
  document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.style.display = 'block';

  const clickedBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick')?.includes(viewId));
  if (clickedBtn) clickedBtn.classList.add('active');
}

function renderAll() {
  const store = getStore();
  const isHR = store.role === 'admin';
  const empId = store.currentEmployeeId;

  // Render Stats
  const today = new Date().toISOString().split('T')[0];
  const todayAtt = store.attendance.find(a => a.employee_id === empId && a.date === today);
  document.getElementById('statAttendance').innerText = todayAtt ? `${todayAtt.status} (${todayAtt.check_in})` : 'Not Checked In';
  
  const leaveBal = store.leave_balances.find(l => l.employee_id === empId);
  const remainingPaid = leaveBal ? (leaveBal.paid_leave_total - leaveBal.paid_leave_used) : 0;
  document.getElementById('statLeave').innerText = `${remainingPaid} Days Remaining`;

  const activeWork = store.work_updates.filter(w => (isHR || w.employee_id === empId) && w.status !== 'Completed').length;
  document.getElementById('statWork').innerText = `${activeWork} In Progress`;
  document.getElementById('statUsers').innerText = `${store.users.length} Active`;

  // CheckIn/CheckOut buttons toggle
  const checkInBtn = document.getElementById('btnCheckIn');
  const checkOutBtn = document.getElementById('btnCheckOut');
  if (todayAtt && !todayAtt.check_out) {
    checkInBtn.style.display = 'none';
    checkOutBtn.style.display = 'inline-block';
  } else {
    checkInBtn.style.display = 'inline-block';
    checkOutBtn.style.display = 'none';
  }

  // Attendance Table
  document.getElementById('attendanceTableBody').innerHTML = store.attendance
    .filter(a => isHR || a.employee_id === empId)
    .map(a => `<tr><td>${a.employee_id}</td><td>${a.date}</td><td>${a.check_in}</td><td>${a.check_out || '--'}</td><td>${a.total_hours || '--'} hrs</td><td><span class="badge badge-approved">${a.status}</span></td></tr>`)
    .join('');

  // Work Updates Table
  document.getElementById('workTableBody').innerHTML = store.work_updates
    .filter(w => isHR || w.employee_id === empId)
    .map(w => `<tr><td>${w.project}</td><td>${w.work_title}</td><td>${w.work_date}</td><td>${w.progress_percentage}%</td><td><span class="badge ${w.status==='Completed'?'badge-approved':'badge-pending'}">${w.status}</span></td><td>${w.remarks || '-'}</td></tr>`)
    .join('');

  // Leave Requests Table
  document.getElementById('leaveTableBody').innerHTML = store.leave_requests
    .filter(l => isHR || l.employee_id === empId)
    .map(l => `
      <tr>
        <td>${l.employee_id}</td>
        <td>${l.leave_type}</td>
        <td>${l.start_date}</td>
        <td>${l.end_date}</td>
        <td>${l.reason}</td>
        <td><span class="badge ${l.status==='Approved'?'badge-approved':l.status==='Rejected'?'badge-rejected':'badge-pending'}">${l.status}</span></td>
        <td>${l.hr_comment || '-'}</td>
        ${isHR ? `<td>
          <button class="btn-success" onclick="updateLeaveStatus(${l.id}, 'Approved')">Approve</button>
          <button class="btn-danger" onclick="updateLeaveStatus(${l.id}, 'Rejected')">Reject</button>
        </td>` : ''}
      </tr>
    `).join('');

  // Payroll Table
  document.getElementById('payrollTableBody').innerHTML = store.payroll
    .filter(p => isHR || p.employee_id === empId)
    .map(p => `<tr><td>${p.employee_id}</td><td>${p.month} ${p.year}</td><td>$${p.basic_salary}</td><td>$${p.allowances}</td><td>$${p.deductions}</td><td><strong>$${p.net_salary}</strong></td><td><span class="badge badge-approved">${p.payment_status}</span></td></tr>`)
    .join('');

  // Announcements
  document.getElementById('announcementContainer').innerHTML = store.announcements.map(a => `
    <div class="anc-card">
      <h4>${a.title}</h4>
      <small style="color: #64748b">${a.created_at}</small>
      <p style="margin-top: 6px; font-size: 0.9rem">${a.message}</p>
    </div>
  `).join('');

  // Users Table
  document.getElementById('usersTableBody').innerHTML = store.users.map(u => `
    <tr><td>${u.employee_id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.department}</td><td>${u.designation}</td><td><span class="badge badge-approved">${u.status}</span></td></tr>
  `).join('');

  // Audit Logs Table
  document.getElementById('auditTableBody').innerHTML = store.audit_logs.map(log => `
    <tr><td>${log.user_id}</td><td><strong>${log.action}</strong></td><td>${log.target_type}</td><td>${log.target_id}</td><td>${log.description}</td><td>${log.created_at}</td></tr>
  `).join('');

  // Notifications Badge & Dropdown
  const myNotifs = store.notifications.filter(n => n.user_id === store.currentUserId);
  const unread = myNotifs.filter(n => !n.is_read).length;
  document.getElementById('notifCount').innerText = unread;
  document.getElementById('notifContainer').innerHTML = myNotifs.length ? myNotifs.map(n => `
    <div class="notif-item ${n.is_read ? '' : 'unread'}">
      <strong>${n.title}</strong>
      <p style="font-size:0.8rem; color:#475569">${n.message}</p>
    </div>
  `).join('') : '<p style="padding:12px; font-size:0.85rem;">No notifications</p>';
}

// Attendance Logic
function handleCheckIn() {
  const store = getStore();
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0];
  
  store.attendance.unshift({
    id: Date.now(),
    employee_id: store.currentEmployeeId,
    date: today,
    check_in: time,
    check_out: null,
    total_hours: 0,
    status: "Present"
  });
  logAudit("CHECK_IN", "attendance", store.currentEmployeeId, `Checked in at ${time}`);
  saveStore(store);
}

function handleCheckOut() {
  const store = getStore();
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0];
  
  const record = store.attendance.find(a => a.employee_id === store.currentEmployeeId && a.date === today);
  if (record) {
    record.check_out = time;
    record.total_hours = 8; // Simplified calculated hours
    logAudit("CHECK_OUT", "attendance", store.currentEmployeeId, `Checked out at ${time}`);
    saveStore(store);
  }
}

// Submissions
function handleWorkSubmit(e) {
  e.preventDefault();
  const store = getStore();
  const newWork = {
    id: Date.now(),
    employee_id: store.currentEmployeeId,
    project: document.getElementById('workProject').value,
    work_title: document.getElementById('workTitle').value,
    description: document.getElementById('workDescription').value,
    work_date: new Date().toISOString().split('T')[0],
    status: document.getElementById('workStatus').value,
    progress_percentage: Number(document.getElementById('workProgress').value),
    remarks: "Logged via Portal"
  };
  store.work_updates.unshift(newWork);
  logAudit("CREATE", "work_updates", newWork.id, `Created work update for ${newWork.project}`);
  closeModal('workModal');
  saveStore(store);
}

function handleLeaveSubmit(e) {
  e.preventDefault();
  const store = getStore();
  const newLeave = {
    id: Date.now(),
    employee_id: store.currentEmployeeId,
    leave_type: document.getElementById('leaveType').value,
    start_date: document.getElementById('leaveStartDate').value,
    end_date: document.getElementById('leaveEndDate').value,
    reason: document.getElementById('leaveReason').value,
    status: "Pending",
    hr_comment: ""
  };
  store.leave_requests.unshift(newLeave);
  logAudit("CREATE", "leave_requests", newLeave.id, `Applied for ${newLeave.leave_type} leave`);
  closeModal('leaveModal');
  saveStore(store);
}

function updateLeaveStatus(id, status) {
  const store = getStore();
  const leave = store.leave_requests.find(l => l.id === id);
  if (leave) {
    leave.status = status;
    leave.hr_comment = `Reviewed by HR`;
    logAudit("UPDATE", "leave_requests", id, `Updated leave status to ${status}`);
    saveStore(store);
  }
}

function handlePayrollSubmit(e) {
  e.preventDefault();
  const store = getStore();
  const basic = Number(document.getElementById('payBasic').value);
  const allowances = Number(document.getElementById('payAllowances').value);
  const deductions = Number(document.getElementById('payDeductions').value);

  const newPay = {
    id: Date.now(),
    employee_id: document.getElementById('payEmpId').value,
    month: document.getElementById('payMonth').value,
    year: Number(document.getElementById('payYear').value),
    basic_salary: basic,
    allowances: allowances,
    deductions: deductions,
    net_salary: basic + allowances - deductions,
    payment_status: "Paid"
  };
  store.payroll.unshift(newPay);
  logAudit("CREATE", "payroll", newPay.id, `Issued payslip for ${newPay.employee_id}`);
  closeModal('payrollModal');
  saveStore(store);
}

function handleAnnouncementSubmit(e) {
  e.preventDefault();
  const store = getStore();
  const newAnc = {
    id: Date.now(),
    created_by: store.currentUserId,
    title: document.getElementById('ancTitle').value,
    message: document.getElementById('ancMessage').value,
    created_at: new Date().toISOString().split('T')[0]
  };
  store.announcements.unshift(newAnc);
  logAudit("CREATE", "announcements", newAnc.id, `Created notice: ${newAnc.title}`);
  closeModal('announcementModal');
  saveStore(store);
}

function handleUserSubmit(e) {
  e.preventDefault();
  const store = getStore();
  const newUser = {
    id: Date.now(),
    employee_id: document.getElementById('usrEmpId').value,
    name: document.getElementById('usrName').value,
    email: document.getElementById('usrEmail').value,
    role: document.getElementById('usrRole').value,
    status: "active",
    department: document.getElementById('usrDept').value,
    designation: document.getElementById('usrDesignation').value
  };
  store.users.push(newUser);
  logAudit("CREATE", "users", newUser.id, `Created user ${newUser.employee_id}`);
  closeModal('userModal');
  saveStore(store);
}

function toggleNotifDropdown() {
  const el = document.getElementById('notifDropdown');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { 
  document.getElementById(id).style.display = 'none';
  const form = document.querySelector(`#${id} form`);
  if (form) form.reset();
}

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('HRMS_DB')) {
    saveStore(initialData);
  }
  document.getElementById('roleSwitch').value = getStore().role;
  toggleRole(getStore().role);
});