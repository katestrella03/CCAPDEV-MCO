const staffUsername = window.currentStaffUsername || 'guest';
const todoStorageKey = `todoList_${staffUsername}`;
let staffEvents = [];
let todoTasks = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchStaffEvents();
    loadTodos();

    const todoForm = document.getElementById('todoForm');
    if (todoForm) {
        todoForm.addEventListener('submit', handleTodoSubmit);
    }
});

async function fetchStaffEvents() {
    try {
        const response = await fetch('/api/staff-events');
        if (!response.ok) {
            throw new Error('Unable to load assigned events');
        }
        staffEvents = await response.json();
        renderTodaySchedule();
        renderWeeklyShifts();
    } catch (error) {
        console.error(error);
        const todaySchedule = document.getElementById('todayScheduleContent');
        const weeklyShiftList = document.getElementById('weeklyShiftList');
        if (todaySchedule) {
            todaySchedule.innerHTML = '<div class="no-schedule">Unable to load your schedule right now.</div>';
        }
        if (weeklyShiftList) {
            weeklyShiftList.innerHTML = '<div class="no-schedule">Unable to load weekly shifts right now.</div>';
        }
    }
}

function renderTodaySchedule() {
    const content = document.getElementById('todayScheduleContent');
    if (!content) return;

    const todayIso = new Date().toISOString().split('T')[0];
    const todayEvents = staffEvents.filter(event => event.date === todayIso);

    if (todayEvents.length === 0) {
        content.innerHTML = '<div class="no-schedule">No assignments scheduled for today.</div>';
        return;
    }

    content.innerHTML = '';
    todayEvents.forEach(event => {
        const item = document.createElement('div');
        item.className = 'shift-item';
        item.innerHTML = `
            <div class="shift-time">${formatTimeRange(event.startTime, event.endTime)}</div>
            <div class="shift-event">${event.name}</div>
            <div class="shift-loc">${event.venue || 'No venue specified'}</div>
        `;
        content.appendChild(item);
    });
}

function renderWeeklyShifts() {
    const weeklyShiftList = document.getElementById('weeklyShiftList');
    if (!weeklyShiftList) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const upcomingEvents = staffEvents
        .map(event => ({ ...event, parsedDate: parseDate(event.date) }))
        .filter(event => event.parsedDate >= today && event.parsedDate <= endOfWeek)
        .sort((a, b) => a.parsedDate - b.parsedDate || compareTime(a.startTime, b.startTime));

    if (upcomingEvents.length === 0) {
        weeklyShiftList.innerHTML = '<div class="no-schedule">No assigned shifts for the coming week.</div>';
        return;
    }

    weeklyShiftList.innerHTML = '';
    upcomingEvents.forEach(event => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';

        const badge = document.createElement('div');
        badge.className = 'date-badge';
        badge.textContent = formatDayLabel(event.parsedDate);

        const text = document.createElement('div');
        text.className = 'item-text';
        text.textContent = `${formatTimeRange(event.startTime, event.endTime)} | ${event.name}`;

        listItem.appendChild(badge);
        listItem.appendChild(text);
        weeklyShiftList.appendChild(listItem);
    });
}

function parseDate(dateString) {
    return new Date(`${dateString}T00:00:00`);
}

function formatDayLabel(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatTimeRange(start, end) {
    if (!start && !end) return 'Time not set';
    return `${formatTime(start)} - ${formatTime(end)}`;
}

function formatTime(timeValue) {
    if (!timeValue) return 'TBD';
    const [hour, minute] = timeValue.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function compareTime(a, b) {
    if (!a) return -1;
    if (!b) return 1;
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return ah - bh || am - bm;
}

function loadTodos() {
    const saved = localStorage.getItem(todoStorageKey);
    todoTasks = saved ? JSON.parse(saved) : [];
    renderTodos();
}

function saveTodos() {
    localStorage.setItem(todoStorageKey, JSON.stringify(todoTasks));
}

function handleTodoSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('todoInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    todoTasks.push({ id: Date.now(), text, done: false });
    saveTodos();
    renderTodos();
    input.value = '';
}

function renderTodos() {
    const container = document.getElementById('todoList');
    if (!container) return;

    if (todoTasks.length === 0) {
        container.innerHTML = '<div class="no-schedule">Add tasks here to keep your daily work organized.</div>';
        return;
    }

    container.innerHTML = '';
    todoTasks.forEach(task => {
        const taskRow = document.createElement('div');
        taskRow.className = 'todo-item';

        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '12px';
        label.style.flex = '1';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.addEventListener('change', () => toggleTodo(task.id));

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.contentEditable = 'true';
        textSpan.spellcheck = false;
        textSpan.textContent = task.text;
        if (task.done) {
            textSpan.classList.add('task-done');
        }
        textSpan.addEventListener('blur', () => updateTodoText(task.id, textSpan.textContent));
        textSpan.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                textSpan.blur();
            }
        });

        label.appendChild(checkbox);
        label.appendChild(textSpan);

        const actions = document.createElement('div');
        actions.className = 'todo-actions';

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTodo(task.id));

        actions.appendChild(deleteButton);
        taskRow.appendChild(label);
        taskRow.appendChild(actions);
        container.appendChild(taskRow);
    });
}

function toggleTodo(id) {
    todoTasks = todoTasks.map(task => {
        if (task.id === id) {
            return { ...task, done: !task.done };
        }
        return task;
    });
    saveTodos();
    renderTodos();
}

function updateTodoText(id, text) {
    const trimmed = text.trim();
    if (!trimmed) {
        renderTodos();
        return;
    }

    todoTasks = todoTasks.map(task => {
        if (task.id === id) {
            return { ...task, text: trimmed };
        }
        return task;
    });
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todoTasks = todoTasks.filter(task => task.id !== id);
    saveTodos();
    renderTodos();
}
