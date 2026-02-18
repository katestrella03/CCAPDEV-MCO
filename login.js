function handleLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Please fill in all fields');
    return;
  }

  const dashboards = {
    'staff': 'staff/staff_dashboard.html',
    'manager': "manager/manager_dashboard.html",
    'admin': 'admin/admin_dashboard.html'
  };

  if (dashboards[username]) {
    window.location.href = dashboards[username];
  } else {
    alert('Invalid username');
  }
}
