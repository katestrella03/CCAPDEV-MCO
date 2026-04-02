// State management
let events = [];
let staff = [];
let selectedEvent = null;
let selectedStaff = [];
let assignments = {}; // { eventId: [staffIds] }
let roleFilter = '';

// Fetch data from API
async function fetchData() {
    const [eventsRes, staffRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/staff')
    ]);
    events = await eventsRes.json();
    staff = await staffRes.json();

    // Initialize assignments
    events.forEach(event => {
        assignments[event._id] = event.assignedStaff.map(s => s._id);
    });

    renderEvents();
    renderStaff();
    renderAssignments();
    initializeRoleFilter();
}

// Initialize app
document.addEventListener('DOMContentLoaded', fetchData);

// Render events
function renderEvents() {
  const eventsList = document.getElementById('eventsList');
  eventsList.innerHTML = '';

  events.forEach(event => {
    const eventDiv = document.createElement('div');
    eventDiv.className = `event-item ${selectedEvent && selectedEvent._id === event._id ? 'selected' : ''}`;
    eventDiv.onclick = () => selectEvent(event);
    
    eventDiv.innerHTML = `
      <h3>${event.name}</h3>
      <p><strong>Venue:</strong> ${event.venue}</p>
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
    staffDiv.className = `staff-item ${selectedStaff.find(s => s._id === staffMember._id) ? 'selected' : ''}`;
    staffDiv.onclick = () => toggleStaffSelection(staffMember);
    
    staffDiv.innerHTML = `
      <h3>${staffMember.username}</h3>
      <p><strong>Role:</strong> ${staffMember.role}</p>
    `;
    
    staffList.appendChild(staffDiv);
  });
}

// Render assignments
function renderAssignments() {
  const assignmentsContainer = document.getElementById('assignmentsContainer');
  assignmentsContainer.innerHTML = '';

  events.forEach(event => {
    const assignedStaffIds = assignments[event._id];
    const assignedStaffMembers = assignedStaffIds.map(id => staff.find(s => s._id === id));

    const assignmentCard = document.createElement('div');
    assignmentCard.className = 'assignment-card';
    
    let staffHTML = '';
    if (assignedStaffMembers.length > 0) {
      assignedStaffMembers.forEach(staffMember => {
        staffHTML += `
          <div class="staff-badge">
            <span>${staffMember.username} - ${staffMember.role}</span>
            <button class="remove-btn" onclick="removeAssignment('${event._id}', '${staffMember._id}')">Remove</button>
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
  selectedEvent = selectedEvent && selectedEvent._id === event._id ? null : event;
  renderEvents();
}

// Toggle staff selection
function toggleStaffSelection(staffMember) {
  const index = selectedStaff.findIndex(s => s._id === staffMember._id);
  if (index > -1) {
    selectedStaff.splice(index, 1);
  } else {
    selectedStaff.push(staffMember);
  }
  renderStaff();
}

// Assign selected staff to selected event
async function assignStaffToEvent() {
  if (!selectedEvent) {
    alert('Please select an event first');
    return;
  }
  
  if (selectedStaff.length === 0) {
    alert('Please select at least one staff member');
    return;
  }

  // Add selected staff to the event
  const newAssignments = [...assignments[selectedEvent._id]];
  selectedStaff.forEach(staffMember => {
    if (!newAssignments.includes(staffMember._id)) {
      newAssignments.push(staffMember._id);
    }
  });

  try {
    // Update via API
    const response = await fetch('/api/assign-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: selectedEvent._id, staffIds: newAssignments })
    });

    if (!response.ok) {
      throw new Error('Failed to assign staff');
    }

    // Refetch events to confirm update
    const eventsRes = await fetch('/api/events');
    events = await eventsRes.json();
    // Reinitialize assignments from fresh data
    events.forEach(event => {
      assignments[event._id] = event.assignedStaff.map(s => s._id);
    });

    // Clear selections
    selectedEvent = null;
    selectedStaff = [];
    
    renderEvents();
    renderStaff();
    renderAssignments();
    
    alert('Staff assigned successfully!');
  } catch (error) {
    console.error('Error assigning staff:', error);
    alert('Failed to assign staff. Please try again.');
  }
}

// Remove a staff member from an event
async function removeAssignment(eventId, staffId) {
  const index = assignments[eventId].indexOf(staffId);
  if (index > -1) {
    assignments[eventId].splice(index, 1);
  }

  try {
    // Update via API
    const response = await fetch('/api/assign-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, staffIds: assignments[eventId] })
    });

    if (!response.ok) {
      throw new Error('Failed to remove staff');
    }

    // Refetch events to confirm update
    const eventsRes = await fetch('/api/events');
    events = await eventsRes.json();
    // Reinitialize assignments from fresh data
    events.forEach(event => {
      assignments[event._id] = event.assignedStaff.map(s => s._id);
    });

    renderAssignments();
  } catch (error) {
    console.error('Error removing staff:', error);
    alert('Failed to remove staff. Please try again.');
  }
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

