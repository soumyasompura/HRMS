let currentRole = 'employee';

function toggleRole(role) {
  currentRole = role;
  document.getElementById('userLabel').innerText = role === 'admin' ? 'Sarah Jenkins (HR / Admin)' : 'John Doe (Employee)';
  
  const hrElements = document.querySelectorAll('.hr-only');
  const empElements = document.querySelectorAll('.emp-only');

  hrElements.forEach(el => el.style.display = role === 'admin' ? '' : 'none');
  empElements.forEach(el => el.style.display = role === 'employee' ? '' : 'none');

  const currentActiveSection = document.querySelector('.view-section:not([style*="display: none"])');
  if (role === 'employee' && currentActiveSection && currentActiveSection.classList.contains('hr-only')) {
    navigate('dashboard');
  }
}

function navigate(viewId) {
  document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.style.display = 'block';
  }

  if (event && event.target) {
    event.target.classList.add('active');
  }
}

// Initial setup on page load
toggleRole('employee');