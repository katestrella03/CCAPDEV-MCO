const calendarBody = document.getElementById('calendarBody');
const monthYear = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// Store events in localStorage
function getEvents() {
    return JSON.parse(localStorage.getItem('calendarEvents') || '{}');
}
function saveEvents(events) {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function renderCalendar(month, year) {
    monthYear.textContent = `${today.toLocaleString('default', { month: 'long' })} ${year}`;
    calendarBody.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let date = 1;
    let events = getEvents();
    for (let i = 0; i < 6; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            let cell = document.createElement('td');
            if (i === 0 && j < firstDay) {
                cell.innerHTML = '';
            } else if (date > daysInMonth) {
                cell.innerHTML = '';
            } else {
                let mm = (month + 1).toString().padStart(2, '0');
                let dd = date.toString().padStart(2, '0');
                let dayKey = `${year}-${mm}-${dd}`;
                cell.innerHTML = `<div class="calendar-day-number">${date}</div>`;
                let eventList = document.createElement('ul');
                eventList.className = 'event-list';
                    if (events[dayKey]) {
                        // Sort events 
                        let sortedEvents = events[dayKey].map((e, i) => ({...e, _idx: i}));
                        sortedEvents.sort((a, b) => {
                            function getMinutes(ev) {
                                if (ev.time && ev.time.includes('-')) {
                                    let t = ev.time.split('-')[0].trim();
                                    let [h, m] = t.split(':');
                                    return parseInt(h, 10) * 60 + parseInt(m, 10);
                                }
                                return 0;
                            }
                            return getMinutes(a) - getMinutes(b);
                        });
                        sortedEvents.forEach((event, idx) => {
                            let li = document.createElement('li');
                            li.className = 'event-item';
                            let startTime = '';
                            if (event.time && event.time.includes('-')) {
                                startTime = event.time.split('-')[0].trim();
                            }
                            li.innerHTML = `
                                <input type="checkbox" class="event-checkbox" ${event.checked ? 'checked' : ''} data-day="${dayKey}" data-idx="${event._idx}">
                                <span class="event-label${event.checked ? ' event-done' : ''}" style="background:${event.color};cursor:pointer;">
                                    <strong>${startTime ? startTime + ' ' : ''}${event.name}</strong>
                                </span>
                            `;
                            li.querySelector('.event-label').addEventListener('click', function(ev) {
                                ev.stopPropagation();
                                showEventDetailsModal(dayKey, event._idx);
                            });
                            eventList.appendChild(li);
                        });
                    }
                cell.appendChild(eventList);
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', function(e) {
                    if (e.target === cell || e.target.classList.contains('calendar-day-number')) {
                        openEventModal(year, month + 1, date);
                    }
                });
                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
        if (date > daysInMonth) break;
    }
}
const eventDetailsModalOverlay = document.getElementById('eventDetailsModalOverlay');
const eventDetailsModal = document.getElementById('eventDetailsModal');
const closeEventDetailsModalBtn = document.getElementById('closeEventDetailsModal');
const eventDetailsContent = document.getElementById('eventDetailsContent');

function showEventDetailsModal(dayKey, idx) {
    const events = getEvents();
    const event = events[dayKey][idx];
    let dateObj = new Date(dayKey);
    let dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    let timeStr = event.time || '';
    eventDetailsContent.innerHTML = `
        <div style="font-size:1.08rem;margin-bottom:8px;"><b>Title:</b> ${event.name}</div>
        <div style="font-size:1.08rem;margin-bottom:8px;"><b>When:</b> ${dateStr}${timeStr ? ', ' + timeStr : ''}</div>
        <hr style="margin:10px 0;">
        <div style="font-size:1.08rem;margin-bottom:8px;"><b>Location:</b> ${event.location ? event.location : '<span style=\"color:#aaa\">(none)</span>'}</div>
    `;
    eventDetailsModalOverlay.style.display = 'flex';
    const actions = document.getElementById('eventDetailsActions');
    if (actions) actions.style.display = 'flex';
    const deleteBtn = document.getElementById('deleteEventBtn');
    if (deleteBtn) {
        deleteBtn.onclick = function() {
            if (confirm('Delete this event?')) {
                events[dayKey].splice(idx, 1);
                if (events[dayKey].length === 0) delete events[dayKey];
                saveEvents(events);
                closeEventDetailsModal();
                renderCalendar(currentMonth, currentYear);
            }
        };
    }
}

function closeEventDetailsModal() {
    eventDetailsModalOverlay.style.display = 'none';
    const actions = document.getElementById('eventDetailsActions');
    if (actions) actions.style.display = 'none';
}

if (closeEventDetailsModalBtn) closeEventDetailsModalBtn.onclick = closeEventDetailsModal;
if (eventDetailsModalOverlay) eventDetailsModalOverlay.onclick = function(e) {
    if (e.target === eventDetailsModalOverlay) closeEventDetailsModal();
};


const eventModalOverlay = document.getElementById('eventModalOverlay');
const eventModal = document.getElementById('eventModal');
const closeEventModalBtn = document.getElementById('closeEventModal');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const eventForm = document.getElementById('eventForm');
const eventTitle = document.getElementById('eventTitle');
const eventDate = document.getElementById('eventDate');
const eventStartTime = document.getElementById('eventStartTime');
const eventEndTime = document.getElementById('eventEndTime');
const eventLocation = document.getElementById('eventLocation');
const eventColor = document.getElementById('eventColor');

function openEventModal(year, month, day) {
    eventModalOverlay.style.display = 'flex';
    let mm = month.toString().padStart(2, '0');
    let dd = day.toString().padStart(2, '0');
    eventDate.value = `${year}-${mm}-${dd}`;
    eventTitle.value = '';
    eventStartTime.value = '';
    eventEndTime.value = '';
    eventLocation.value = '';
    eventColor.value = '#3bb18a';
}

function closeEventModal() {
    eventModalOverlay.style.display = 'none';
}

closeEventModalBtn.onclick = closeEventModal;
cancelEventBtn.onclick = closeEventModal;
eventModalOverlay.onclick = function(e) {
    if (e.target === eventModalOverlay) closeEventModal();
};

eventForm.onsubmit = function(e) {
    e.preventDefault();
    let title = eventTitle.value.trim();
    let date = eventDate.value;
    let startTime = eventStartTime.value;
    let endTime = eventEndTime.value;
    let location = eventLocation.value.trim();
    let color = eventColor.value;
    if (!title || !date || !startTime || !endTime) return;
    let events = getEvents();
    if (!events[date]) events[date] = [];
    let timeStr = `${startTime} - ${endTime}`;
    events[date].push({ name: title, time: timeStr, color, location, checked: false });
    saveEvents(events);
    closeEventModal();
    renderCalendar(currentMonth, currentYear);
};

calendarBody.addEventListener('change', function(e) {
    let events = getEvents();
    if (e.target.classList.contains('event-checkbox')) {
        let day = e.target.getAttribute('data-day');
        let idx = e.target.getAttribute('data-idx');
        events[day][idx].checked = e.target.checked;
        saveEvents(events);
        // strikethrough
        const label = e.target.parentElement.querySelector('.event-label');
        if (e.target.checked) {
            label.classList.add('event-done');
        } else {
            label.classList.remove('event-done');
        }
    }
});

prevMonthBtn.onclick = function() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    today = new Date(currentYear, currentMonth, 1);
    renderCalendar(currentMonth, currentYear);
};
nextMonthBtn.onclick = function() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    today = new Date(currentYear, currentMonth, 1);
    renderCalendar(currentMonth, currentYear);
};

renderCalendar(currentMonth, currentYear);
