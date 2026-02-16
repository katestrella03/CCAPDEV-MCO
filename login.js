function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  // Validate that all fields are filled
  if (!username || !password || !role) {
    alert('Please fill in all fields');
    return;
  }

  // Redirect based on role
  const dashboards = {
    'admin': 'admin_dashboard.html',
    'manager': 'manager_dashboard.html',
    'staff': 'staff_dashboard.html'
  };

  if (dashboards[role]) {
    window.location.href = dashboards[role];
  } else {
    alert('Invalid role selected');
  }
}
