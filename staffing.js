// Temporary data
const events = [
  { id: 1, name: 'Conference 2026', date: '2026-03-15', location: 'Downtown Hall', attendees: 500 },
  { id: 2, name: 'Product Launch', date: '2026-03-20', location: 'Tech Center', attendees: 300 },
  { id: 3, name: 'Team Building', date: '2026-03-25', location: 'Outdoor Park', attendees: 150 },
  { id: 4, name: 'Workshop: Leadership', date: '2026-04-01', location: 'Training Room', attendees: 80 },
  { id: 5, name: 'Annual Gala', date: '2026-04-10', location: 'Grand Ballroom', attendees: 200 }
];

const staff = [
  { id: 1, name: 'John Anderson', role: 'Event Manager', availability: 'Full-time' },
  { id: 2, name: 'Sarah Martinez', role: 'Registration Staff', availability: 'Full-time' },
  { id: 3, name: 'Michael Chen', role: 'Security', availability: 'Part-time' },
  { id: 4, name: 'Emily Watson', role: 'Catering Lead', availability: 'Full-time' },
  { id: 5, name: 'David Brown', role: 'Setup Crew', availability: 'Part-time' },
  { id: 6, name: 'Jessica Lee', role: 'Event Coordinator', availability: 'Full-time' },
  { id: 7, name: 'Robert Smith', role: 'Transportation', availability: 'Part-time' },
  { id: 8, name: 'Amanda White', role: 'Communication', availability: 'Full-time' }
];

// State management
let selectedEvent = null;
let selectedStaff = [];
let assignments = {}; // { eventId: [staffIds] }
let roleFilter = '';

// Initialize assignments
events.forEach(event => {
  assignments[event.id] = [];
});

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  renderEvents();
  renderStaff();
  renderAssignments();
  initializeRoleFilter();
});

// Render events
function renderEvents() {
  const eventsList = document.getElementById('eventsList');
  eventsList.innerHTML = '';

  events.forEach(event => {
    const eventDiv = document.createElement('div');
    eventDiv.className = `event-item ${selectedEvent && selectedEvent.id === event.id ? 'selected' : ''}`;
    eventDiv.onclick = () => selectEvent(event);
    
    eventDiv.innerHTML = `
      <h3>${event.name}</h3>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Expected Attendees:</strong> ${event.attendees}</p>
      <p class="event-date">📅 ${formatDate(event.date)}</p>
    `;
    
    eventsList.appendChild(eventDiv);
  });
}

// Render staff
function renderStaff() {
  const staffList = document.getElementById('staffList');
  staffList.innerHTML = '';

  const filteredStaff = roleFilter 
    ? staff.filter(s => s.role === roleFilter)
    : staff;

  filteredStaff.forEach(staffMember => {
    const staffDiv = document.createElement('div');
    staffDiv.className = `staff-item ${selectedStaff.find(s => s.id === staffMember.id) ? 'selected' : ''}`;
    staffDiv.onclick = () => toggleStaffSelection(staffMember);
    
    staffDiv.innerHTML = `
      <h3>${staffMember.name}</h3>
      <p><strong>Role:</strong> ${staffMember.role}</p>
      <p class="staff-role">${staffMember.availability}</p>
    `;
    
    staffList.appendChild(staffDiv);
  });
}

// Render assignments
function renderAssignments() {
  const assignmentsContainer = document.getElementById('assignmentsContainer');
  assignmentsContainer.innerHTML = '';

  events.forEach(event => {
    const assignedStaffIds = assignments[event.id];
    const assignedStaffMembers = assignedStaffIds.map(id => staff.find(s => s.id === id));

    const assignmentCard = document.createElement('div');
    assignmentCard.className = 'assignment-card';
    
    let staffHTML = '';
    if (assignedStaffMembers.length > 0) {
      assignedStaffMembers.forEach(staffMember => {
        staffHTML += `
          <div class="staff-badge">
            <span>${staffMember.name} - ${staffMember.role}</span>
            <button class="remove-btn" onclick="removeAssignment(${event.id}, ${staffMember.id})">Remove</button>
          </div>
        `;
      });
    } else {
      staffHTML = '<p class="empty-message">No staff assigned</p>';
    }

    assignmentCard.innerHTML = `
      <h3>${event.name}</h3>
      <p style="font-size: 12px; color: #666; margin-bottom: 10px;">📅 ${formatDate(event.date)}</p>
      <div class="assigned-staff">
        ${staffHTML}
      </div>
    `;

    assignmentsContainer.appendChild(assignmentCard);
  });
}

// Select an event
function selectEvent(event) {
  selectedEvent = selectedEvent && selectedEvent.id === event.id ? null : event;
  renderEvents();
}

// Toggle staff selection
function toggleStaffSelection(staffMember) {
  const index = selectedStaff.findIndex(s => s.id === staffMember.id);
  if (index > -1) {
    selectedStaff.splice(index, 1);
  } else {
    selectedStaff.push(staffMember);
  }
  renderStaff();
}

// Assign selected staff to selected event
function assignStaffToEvent() {
  if (!selectedEvent) {
    alert('Please select an event first');
    return;
  }
  
  if (selectedStaff.length === 0) {
    alert('Please select at least one staff member');
    return;
  }

  // Add selected staff to the event
  selectedStaff.forEach(staffMember => {
    if (!assignments[selectedEvent.id].includes(staffMember.id)) {
      assignments[selectedEvent.id].push(staffMember.id);
    }
  });

  // Clear selections
  selectedEvent = null;
  selectedStaff = [];
  
  renderEvents();
  renderStaff();
  renderAssignments();
  
  alert('Staff assigned successfully!');
}

// Remove a staff member from an event
function removeAssignment(eventId, staffId) {
  const index = assignments[eventId].indexOf(staffId);
  if (index > -1) {
    assignments[eventId].splice(index, 1);
  }
  renderAssignments();
}

// Clear all selections
function clearSelections() {
  selectedEvent = null;
  selectedStaff = [];
  renderEvents();
  renderStaff();
}

// Format date for display
function formatDate(dateString) {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize role filter
function initializeRoleFilter() {
  const roleFilterSelect = document.getElementById('staffRoleFilter');
  const uniqueRoles = [...new Set(staff.map(s => s.role))];
  
  uniqueRoles.forEach(role => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    roleFilterSelect.appendChild(option);
  });
}

// Apply role filter
function applyRoleFilter() {
  roleFilter = document.getElementById('staffRoleFilter').value;
  renderStaff();
}

// Logout
function logout() {
  window.location.href = 'login.html';
}
