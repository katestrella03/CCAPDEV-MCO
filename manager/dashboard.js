document.addEventListener('DOMContentLoaded', function() {
    // temp data
    let events = [
        { name: 'Conference 2026', date: '2026-03-15', start: '09:00', end: '17:00', venue: 'Downtown Hall', staff: 5, status: 'Preparation' },
        { name: 'Product Launch', date: '2026-03-20', start: '10:00', end: '16:00', venue: 'Tech Center', staff: 3, status: 'Pre-planning' },
        { name: 'Team Building', date: '2026-03-25', start: '08:00', end: '15:00', venue: 'Outdoor Park', staff: 8, status: 'On-going' },
        { name: 'Workshop: Leadership', date: '2026-04-01', start: '13:00', end: '17:00', venue: 'Training Room', staff: 2, status: 'Finished' }
    ];
    let editIndex = null;
    // info boces
    document.getElementById('totalEvents').textContent = events.length;
    document.getElementById('activeEvents').textContent = events.filter(e => e.status === 'On-going' || e.status === 'Preparation').length;
    document.getElementById('staffAssigned').textContent = Math.round(events.reduce((a, b) => a + b.staff, 0) / (events.length * 10) * 100) + '%';
    document.getElementById('upcomingEvents').textContent = events.filter(e => {
        const now = new Date();
        const eventDate = new Date(e.date);
        const diff = (eventDate - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    }).length;
    function renderTable() {
        const table = document.getElementById('eventSummaryTable');
        table.innerHTML = '';
        events.forEach((e, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${e.name}</td>
                <td>${e.date} ${e.start}-${e.end}</td>
                <td>${e.venue}</td>
                <td>${e.staff}</td>
                <td>${e.status}</td>
                <td>
                    <button class="actions-btn edit-btn" data-idx="${idx}">Edit</button>
                    <button class="actions-btn delete-btn" data-idx="${idx}">Delete</button>
                </td>
            `;
            table.appendChild(tr);
        });
    }
    renderTable();
    const eventModalOverlay = document.getElementById('eventModalOverlay');
    const eventModal = document.getElementById('eventModal');
    const createEventBtn = document.getElementById('createEventBtn');
    const closeEventModal = document.getElementById('closeEventModal');
    const cancelEventBtn = document.getElementById('cancelEventBtn');
    const eventForm = document.getElementById('eventForm');

    const eventName = document.getElementById('eventName');
    const eventDate = document.getElementById('eventDate');
    const eventStartTime = document.getElementById('eventStartTime');
    const eventEndTime = document.getElementById('eventEndTime');
    const eventVenue = document.getElementById('eventVenue');
    const eventStatus = document.getElementById('eventStatus');

    function openModal(mode, idx = null) {
        eventModalOverlay.style.display = 'flex';
        const submitBtn = eventForm.querySelector('button[type="submit"]');
        if (mode === 'edit' && idx !== null) {
            const e = events[idx];
            eventName.value = e.name;
            eventDate.value = e.date;
            eventStartTime.value = e.start;
            eventEndTime.value = e.end;
            eventVenue.value = e.venue;
            eventStatus.value = e.status;
            editIndex = idx;
            if (submitBtn) submitBtn.textContent = 'Edit';
        } else {
            eventForm.reset();
            editIndex = null;
            if (submitBtn) submitBtn.textContent = 'Create';
        }
    }

    createEventBtn.onclick = () => openModal('create');
    closeEventModal.onclick = () => eventModalOverlay.style.display = 'none';
    cancelEventBtn.onclick = () => eventModalOverlay.style.display = 'none';
    eventModalOverlay.onclick = function(e) {
        if (e.target === eventModalOverlay) eventModalOverlay.style.display = 'none';
    };

    // Edit and Delete button
    document.getElementById('eventSummaryTable').onclick = function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            openModal('edit', idx);
        } else if (e.target.classList.contains('delete-btn')) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            if (confirm('Delete this event?')) {
                events.splice(idx, 1);
                renderTable();
            }
        }
    };

    eventForm.onsubmit = function(e) {
        e.preventDefault();
        const newEvent = {
            name: eventName.value,
            date: eventDate.value,
            start: eventStartTime.value,
            end: eventEndTime.value,
            venue: eventVenue.value,
            staff: 0,
            status: eventStatus.value
        };
        if (editIndex !== null) {
            // Update existing event
            events[editIndex] = { ...events[editIndex], ...newEvent };
        } else {
            // Add new event
            events.push(newEvent);
        }
        renderTable();
        eventModalOverlay.style.display = 'none';
    };
});
