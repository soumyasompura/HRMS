// LocalStorage Initialization Defaults
const defaultData = {
  role: 'employee',
  leaveBalance: 14,
  todos: [
    { id: 1, text: "Submit Q3 Performance Review", assignee: "John Doe", completed: false },
    { id: 2, text: "Review pending Q3 payroll approvals", assignee: "Jane Smith", completed: true }
  ],
  leaves: [
    { id: 1, employee: "John Doe", type: "Annual Leave", dates: "2026-09-01 to 2026-09-05", reason: "Vacation", status: "Pending" }
  ],
  announcements: [
    { id: 1, title: "Office Maintenance", body: "Main office network will undergo maintenance this weekend.", date: "2026-08-22" }
  ],
  employees: [
    { id: "EMP-001", name: "John Doe", dept: "Engineering", role: "Frontend Developer", status: "Active" },
    { id: "EMP-002", name: "Jane Smith", dept: "Human Resources", role: "HR Specialist", status: "Active" }
  ],
  payrolls: [
    { id: 1, employee: "John Doe", month: "October 2026", amount: "$4,500", status: "Paid" },
    { id: 2, employee: "Jane Smith", month: "October 2026", amount: "$5,200", status: "Paid" }
  ]
};

function getStore() {
  const store = localStorage.getItem('HRMS_DATA');
  return store ? JSON.parse(store) : defaultData;
}

function saveStore(data) {
  localStorage.setItem('HRMS_DATA', JSON.stringify(data));
  renderAll();
}

let currentRole = getStore().role;

function toggleRole(role) {
  currentRole = role;
  const store = getStore();
  store.role = role;
  localStorage.setItem('HRMS_DATA', JSON.stringify(store));

  document.getElementById('userLabel').innerText = role === 'admin' ? 'Sarah Jenkins (HR / Admin)' : 'John Doe (Employee)';
  
  document.querySelectorAll('.hr-only').forEach(el => el.style.display = role === 'admin' ? '' : 'none');
  document.querySelectorAll('.emp-only').forEach(el => el.style.display = role === 'employee' ? '' : 'none');

  // Fix: Reset navigation to dashboard if switching to employee while on HR-only page
  const employeeView = document.getElementById('view-employees');
  if (role === 'employee' && employeeView && employeeView.style.display !== 'none') {
    navigate('dashboard');
  }
  
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
  
  const activeTasks = store.todos.filter(t => !t.completed && (currentRole === 'admin' || t.assignee === 'John Doe')).length;
  document.getElementById('statTasks').innerText = `${activeTasks} Tasks`;
  document.getElementById('statLeave').innerText = `${store.leaveBalance} Days`;
  document.getElementById('statStaff').innerText = `${store.employees.length} Active`;

  document.getElementById('todoList').innerHTML = store.todos
    .filter(t => currentRole === 'admin' || t.assignee === 'John Doe')
    .map(t => `
      <li class="todo-item ${t.completed ? 'completed' : ''}">
        <span><input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTodo(${t.id})"> ${t.text} <small style="color: #64748b">(${t.assignee})</small></span>
        <button class="btn-danger" onclick="deleteTodo(${t.id})">Delete</button>
      </li>
    `).join('');

  document.getElementById('payrollTableBody').innerHTML = store.payrolls
    .filter(p => currentRole === 'admin' || p.employee.includes('John Doe'))
    .map(p => `
      <tr>
        <td>${p.employee}</td>
        <td>${p.month}</td>
        <td>${p.amount}</td>
        <td><span class="badge badge-approved">${p.status}</span></td>
        <td><button onclick="alert('Downloading slip for ${p.employee}')">Download Slip</button></td>
      </tr>
    `).join('');

  document.getElementById('leaveTableBody').innerHTML = store.leaves
    .filter(l => currentRole === 'admin' || l.employee === 'John Doe')
    .map(l => `
      <tr>
        <td>${l.employee}</td>
        <td>${l.type}</td>
        <td>${l.dates}</td>
        <td>${l.reason}</td>
        <td><span class="badge ${l.status === 'Approved' ? 'badge-approved' : l.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}">${l.status}</span></td>
        <td class="hr-only">
          <button class="btn-success" onclick="updateLeave(${l.id}, 'Approved')">Approve</button>
          <button class="btn-danger" onclick="updateLeave(${l.id}, 'Rejected')">Reject</button>
        </td>
      </tr>
    `).join('');

  document.getElementById('announcementContainer').innerHTML = store.announcements.map(a => `
    <div class="anc-card">
      ${currentRole === 'admin' ? `<span class="delete-anc" onclick="deleteAnnouncement(${a.id})">&times;</span>` : ''}
      <h4>${a.title}</h4>
      <small style="color: #64748b">${a.date}</small>
      <p style="margin-top: 6px; font-size: 0.9rem">${a.body}</p>
    </div>
  `).join('');

  filterEmployees();
  
  const payEmpSelect = document.getElementById('payEmp');
  if (payEmpSelect) {
    payEmpSelect.innerHTML = store.employees.map(e => `<option value="${e.name}">${e.name}</option>`).join('');
  }
}

function addTodo() {
  const input = document.getElementById('todoInput');
  const assignee = document.getElementById('todoAssignee').value;
  if (!input.value.trim()) return;

  const store = getStore();
  store.todos.push({
    id: Date.now(),
    text: input.value,
    assignee: currentRole === 'admin' ? assignee : 'John Doe',
    completed: false
  });
  input.value = '';
  saveStore(store);
}

function toggleTodo(id) {
  const store = getStore();
  store.todos = store.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveStore(store);
}

function deleteTodo(id) {
  const store = getStore();
  store.todos = store.todos.filter(t => t.id !== id);
  saveStore(store);
}

function handleLeaveSubmit(e) {
  e.preventDefault();
  const store = getStore();
  store.leaves.push({
    id: Date.now(),
    employee: currentRole === 'admin' ? 'Sarah Jenkins' : 'John Doe',
    type: document.getElementById('leaveType').value,
    dates: `${document.getElementById('startDate').value} to ${document.getElementById('endDate').value}`,
    reason: document.getElementById('leaveReason').value,
    status: 'Pending'
  });
  closeModal('leaveModal');
  saveStore(store);
}

function updateLeave(id, status) {
  const store = getStore();
  store.leaves = store.leaves.map(l => {
    if (l.id === id) {
      if (status === 'Approved' && l.status !== 'Approved' && l.employee === 'John Doe') {
        store.leaveBalance = Math.max(0, store.leaveBalance - 1);
      }
      return { ...l, status };
    }
    return l;
  });
  saveStore(store);
}

function handleAnnouncementSubmit(e) {
  e.preventDefault();
  const store = getStore();
  store.announcements.unshift({
    id: Date.now(),
    title: document.getElementById('ancTitle').value,
    body: document.getElementById('ancBody').value,
    date: new Date().toISOString().split('T')[0]
  });
  closeModal('announcementModal');
  saveStore(store);
}

function deleteAnnouncement(id) {
  const store = getStore();
  store.announcements = store.announcements.filter(a => a.id !== id);
  saveStore(store);
}

function handleEmployeeSubmit(e) {
  e.preventDefault();
  const store = getStore();
  store.employees.push({
    id: `EMP-00${store.employees.length + 1}`,
    name: document.getElementById('empName').value,
    dept: document.getElementById('empDept').value,
    role: document.getElementById('empRole').value,
    status: 'Active'
  });
  closeModal('employeeModal');
  saveStore(store);
}

function deleteEmployee(id) {
  const store = getStore();
  store.employees = store.employees.filter(e => e.id !== id);
  saveStore(store);
}

function filterEmployees() {
  const query = (document.getElementById('empSearch')?.value || '').toLowerCase();
  const dept = document.getElementById('empDeptFilter')?.value || '';
  const store = getStore();

  const filtered = store.employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(query) || e.id.toLowerCase().includes(query);
    const matchesDept = !dept || e.dept === dept;
    return matchesSearch && matchesDept;
  });

  const body = document.getElementById('employeeTableBody');
  if (body) {
    body.innerHTML = filtered.map(e => `
      <tr>
        <td>${e.id}</td>
        <td>${e.name}</td>
        <td>${e.dept}</td>
        <td>${e.role}</td>
        <td><span class="badge badge-approved">${e.status}</span></td>
        <td><button class="btn-danger" onclick="deleteEmployee('${e.id}')">Remove</button></td>
      </tr>
    `).join('');
  }
}

function handlePayrollSubmit(e) {
  e.preventDefault();
  const store = getStore();
  store.payrolls.push({
    id: Date.now(),
    employee: document.getElementById('payEmp').value,
    month: document.getElementById('payMonth').value,
    amount: `$${Number(document.getElementById('payAmount').value).toLocaleString()}`,
    status: 'Paid'
  });
  closeModal('payrollModal');
  saveStore(store);
}

function openLeaveModal() { openModal('leaveModal'); }
function openAnnouncementModal() { openModal('announcementModal'); }
function openEmployeeModal() { openModal('employeeModal'); }
function openPayrollModal() { openModal('payrollModal'); }

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { 
  document.getElementById(id).style.display = 'none';
  const form = document.querySelector(`#${id} form`);
  if (form) form.reset();
}

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('HRMS_DATA')) {
    saveStore(defaultData);
  }
  document.getElementById('roleSwitch').value = getStore().role;
  toggleRole(getStore().role);
});