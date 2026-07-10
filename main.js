// script.js
const $ = (id) => document.getElementById(id);
const addTaskBtn = $("addtskbtn");
const addTaskPopup = $("addtaskpopup");
const addTaskForm = $("addTaskForm");
const cardContainer = $("tasks-container");
const projectBtn = $("addProjectBtn");
const projectInput = $("newProjectInput");
const projectsContainer = $("projects-container");
const taskCount = $("task-count");
const calendarGrid = $("calendarGrid");
const monthYear = $("monthYear");
const calendarBtn = $("calendarBtn");
const calendarDialog = $("calendarDialog");
const closeCalendar = $("closeCalendar");
const loginOverlay = $("loginOverlay");
const loginUserList = $("loginUserList");
const loginNewUserName = $("loginNewUserName");
const loginAddUserBtn = $("loginAddUserBtn");
const loginAsNewUserBtn = $("loginAsNewUserBtn");
const profileNameEl = $("profile-name");
const profileAvatarEl = $("profile-avatar");
const profileRoleBadge = $("profile-role-badge");
const profileClickArea = $("profileClickArea");
const editProfileDialog = $("editProfileDialog");
const editProfileForm = $("editProfileForm");
const editProfileName = $("editProfileName");
const switchUserBtn = $("switchUserBtn");
const employeeListContainer = $("employeeListContainer");
const employeeListSection = $("employeeListSection");
const taskListTitle = $("taskListTitle");
const taskAssignee = $("taskAssignee");
const assigneeFieldGroup = $("assigneeFieldGroup");
const taskProject = $("taskProject");
const taskProjectAssign = $("taskProjectAssign");
const projectAssignGroup = $("projectAssignGroup");
const projectSelectGroup = $("projectSelectGroup");
const statProjects = $("stat-projects");
const statTotalTasks = $("stat-total-tasks");
const statCompleted = $("stat-completed-tasks");
const statProgress = $("stat-progress");
const statEmployees = $("stat-employees");

let users = [];
let currentUserId = null;
let projects = [];
let activeProjectIndex = -1;
let selectedEmployeeId = null;
let currentDate = new Date();
let selectedDate = null;
let calendarEvents = [];

function generateId() { return Date.now() + Math.random() * 1000; }
function getCurrentUser() { return users.find(u => u.id === currentUserId) || null; }
function isManager() { const u = getCurrentUser(); return u ? u.role === 'manager' : false; }
function getEmployeeList() { return users.filter(u => u.role === 'employee'); }
function getEmployeesForSelect() { return getEmployeeList(); }

function saveAll() {
  localStorage.setItem('taskflow_users', JSON.stringify(users));
  localStorage.setItem('taskflow_projects', JSON.stringify(projects));
  localStorage.setItem('taskflow_currentUser', JSON.stringify(currentUserId));
  localStorage.setItem('taskflow_calendarEvents', JSON.stringify(calendarEvents));
  updateDashboard();
}

function loadAll() {
  const savedUsers = localStorage.getItem('taskflow_users');
  const savedProjects = localStorage.getItem('taskflow_projects');
  const savedCurrent = localStorage.getItem('taskflow_currentUser');
  const savedEvents = localStorage.getItem('taskflow_calendarEvents');
  if (savedUsers) users = JSON.parse(savedUsers);
  if (savedProjects) projects = JSON.parse(savedProjects);
  if (savedCurrent) currentUserId = JSON.parse(savedCurrent);
  if (savedEvents) calendarEvents = JSON.parse(savedEvents);
  if (users.length === 0) {
    users = [
      { id: generateId(), name: 'Manager', role: 'manager', avatar: 'https://ui-avatars.com/api/?name=Manager&background=3b82f6&color=fff' },
      { id: generateId(), name: 'Alice', role: 'employee', avatar: 'https://ui-avatars.com/api/?name=Alice&background=10b981&color=fff' },
      { id: generateId(), name: 'Bob', role: 'employee', avatar: 'https://ui-avatars.com/api/?name=Bob&background=f59e0b&color=fff' }
    ];
    const mgr = users[0];
    const alice = users[1];
    const bob = users[2];
    projects = [{
      id: generateId(),
      name: 'Website Redesign',
      assignedTo: alice.id,
      tasks: [{
        id: generateId(),
        title: 'Design Homepage',
        description: 'Create a new responsive homepage design.',
        dueDate: '2026-07-25',
        createdAt: new Date().toISOString(),
        completed: false,
        assignedTo: alice.id
      }, {
        id: generateId(),
        title: 'Set up CI/CD',
        description: 'Configure deployment pipeline.',
        dueDate: '2026-08-01',
        createdAt: new Date().toISOString(),
        completed: false,
        assignedTo: alice.id
      }]
    }, {
      id: generateId(),
      name: 'Mobile App',
      assignedTo: bob.id,
      tasks: [{
        id: generateId(),
        title: 'Build Login Screen',
        description: 'UI and validation for login.',
        dueDate: '2026-07-20',
        createdAt: new Date().toISOString(),
        completed: false,
        assignedTo: bob.id
      }]
    }, {
      id: generateId(),
      name: 'Marketing Campaign',
      assignedTo: null,
      tasks: [{
        id: generateId(),
        title: 'Draft Social Posts',
        description: 'Create content calendar.',
        dueDate: '2026-07-30',
        createdAt: new Date().toISOString(),
        completed: false,
        assignedTo: null
      }]
    }];
    currentUserId = mgr.id;
    saveAll();
  }
  if (!users.find(u => u.id === currentUserId)) {
    currentUserId = users[0]?.id || null;
  }
  if (projects.length > 0 && activeProjectIndex === -1) {
    activeProjectIndex = 0;
  }
  if (activeProjectIndex >= projects.length) {
    activeProjectIndex = projects.length - 1;
  }
}

function updateDashboard() {
  const user = getCurrentUser();
  if (!user) return;
  let totalTasks = 0;
  let completedTasks = 0;
  if (isManager()) {
    projects.forEach(p => {
      totalTasks += p.tasks.length;
      completedTasks += p.tasks.filter(t => t.completed).length;
    });
    statProjects.textContent = projects.length;
    statEmployees.textContent = getEmployeeList().length;
  } else {
    projects.forEach(p => {
      p.tasks.forEach(t => {
        if (t.assignedTo === user.id) {
          totalTasks++;
          if (t.completed) completedTasks++;
        }
      });
    });
    statProjects.textContent = projects.filter(p => p.assignedTo === user.id || p.tasks.some(t => t.assignedTo === user.id)).length;
    statEmployees.textContent = '—';
  }
  statTotalTasks.textContent = totalTasks;
  statCompleted.textContent = completedTasks;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  statProgress.textContent = `${progress}%`;
}

function renderProjects() {
  projectsContainer.innerHTML = '';
  const user = getCurrentUser();
  let visibleProjects = projects;
  if (user && !isManager()) {
    visibleProjects = projects.filter(p =>
      p.tasks.some(t => t.assignedTo === user.id) || p.assignedTo === user.id
    );
  }
  if (visibleProjects.length === 0) {
    projectsContainer.innerHTML = `<div style="color:#9ca3af; font-size:14px; padding:12px 0;">No projects available</div>`;
    return;
  }
  visibleProjects.forEach((project, idx) => {
    const realIndex = projects.findIndex(p => p.id === project.id);
    const div = document.createElement('div');
    div.classList.add('project-item');
    if (realIndex === activeProjectIndex) div.classList.add('active');
    const assignee = project.assignedTo ? users.find(u => u.id === project.assignedTo) : null;
    const assigneeName = assignee ? assignee.name : 'Unassigned';
    div.innerHTML = `
      <span>${project.name}</span>
      <span style="display:flex; align-items:center; gap:6px;">
        <span class="assignee-badge">${assigneeName}</span>
        <button class="project-delete-btn"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 6h18'/%3E%3Cpath d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/%3E%3C/svg%3E" alt="Delete" /></button>
      </span>
    `;
    div.addEventListener('click', () => {
      activeProjectIndex = realIndex;
      selectedEmployeeId = null;
      renderProjects();
      renderTasks();
      renderEmployeeList();
    });
    const deleteBtn = div.querySelector('.project-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isManager()) { alert('Only managers can delete projects.'); return; }
      if (confirm(`Delete "${project.name}"?`)) {
        projects.splice(realIndex, 1);
        if (activeProjectIndex === realIndex) activeProjectIndex = -1;
        else if (activeProjectIndex > realIndex) activeProjectIndex--;
        saveAll();
        renderProjects();
        renderTasks();
        renderEmployeeList();
      }
    });
    projectsContainer.appendChild(div);
  });
}

function renderEmployeeList() {
  const isMgr = isManager();
  employeeListSection.style.display = isMgr ? 'block' : 'none';
  if (!isMgr) return;
  employeeListContainer.innerHTML = '';
  const employees = getEmployeeList();
  if (employees.length === 0) {
    employeeListContainer.innerHTML = `<div style="color:#9ca3af; font-size:13px; padding:8px 0;">No employees yet</div>`;
    return;
  }
  const allDiv = document.createElement('div');
  allDiv.classList.add('employee-list-item');
  if (selectedEmployeeId === null) allDiv.classList.add('active');
  allDiv.innerHTML = `
    <img src="https://ui-avatars.com/api/?name=All&background=6b7280&color=fff" alt="All" />
    <div class="emp-info">
      <div class="emp-name">📊 All Tasks</div>
      <div class="emp-task-count">View everyone</div>
    </div>
  `;
  allDiv.addEventListener('click', () => {
    selectedEmployeeId = null;
    renderEmployeeList();
    renderTasks();
    renderProjects();
  });
  employeeListContainer.appendChild(allDiv);
  employees.forEach(emp => {
    const div = document.createElement('div');
    div.classList.add('employee-list-item');
    if (selectedEmployeeId === emp.id) div.classList.add('active');
    const taskCount = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.assignedTo === emp.id).length, 0);
    const completedCount = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.assignedTo === emp.id && t.completed).length, 0);
    div.innerHTML = `
      <img src="${emp.avatar || 'https://ui-avatars.com/api/?name='+encodeURIComponent(emp.name)+'&background=10b981&color=fff'}" alt="${emp.name}" />
      <div class="emp-info">
        <div class="emp-name">${emp.name}</div>
        <div class="emp-task-count">${completedCount}/${taskCount} done</div>
      </div>
      <span class="emp-role-tag">employee</span>
    `;
    div.addEventListener('click', () => {
      selectedEmployeeId = emp.id;
      activeProjectIndex = -1;
      renderEmployeeList();
      renderTasks();
      renderProjects();
    });
    employeeListContainer.appendChild(div);
  });
}

function renderTasks() {
  cardContainer.innerHTML = '';
  const user = getCurrentUser();
  if (!user) return;
  let tasks = [];
  if (isManager()) {
    if (selectedEmployeeId) {
      projects.forEach(p => {
        p.tasks.forEach(t => {
          if (t.assignedTo === selectedEmployeeId) {
            const assignee = users.find(u => u.id === t.assignedTo);
            tasks.push({ ...t, projectName: p.name, projectId: p.id, assigneeName: assignee ? assignee.name : 'Unassigned' });
          }
        });
      });
      taskListTitle.textContent = `👤 ${users.find(u=>u.id===selectedEmployeeId)?.name || 'Employee'}'s Tasks`;
    } else {
      projects.forEach(p => {
        p.tasks.forEach(t => {
          const assignee = users.find(u => u.id === t.assignedTo);
          tasks.push({ ...t, projectName: p.name, projectId: p.id, assigneeName: assignee ? assignee.name : 'Unassigned' });
        });
      });
      taskListTitle.textContent = '📌 All Tasks';
    }
  } else {
    projects.forEach(p => {
      p.tasks.forEach(t => {
        if (t.assignedTo === user.id) {
          const assignee = users.find(u => u.id === t.assignedTo);
          tasks.push({ ...t, projectName: p.name, projectId: p.id, assigneeName: assignee ? assignee.name : 'Unassigned' });
        }
      });
    });
    taskListTitle.textContent = `📌 My Tasks`;
  }
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });
  const remaining = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${remaining} Task${remaining !== 1 ? 's' : ''} Remaining`;
  if (tasks.length === 0) {
    cardContainer.innerHTML = `
      <div class="empty-state">
        <p>📭 No tasks here</p>
        <span class="sub">${isManager() ? 'Assign tasks to employees or create new ones.' : 'Ask your manager to assign you some tasks.'}</span>
      </div>
    `;
    return;
  }
  tasks.forEach((task, idx) => {
    const card = document.createElement('div');
    card.classList.add('task-card');
    if (task.completed) card.classList.add('completed');
    const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'No deadline';
    const addedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = task.dueDate && new Date(task.dueDate) < today && !task.completed;
    const assigneeName = task.assigneeName || 'Unassigned';
    card.innerHTML = `
      <button class="complete-btn" data-task-id="${task.id}" title="Mark complete"></button>
      <div class="task-content">
        <h3>${task.title}</h3>
        <div class="task-meta">
          📁 ${task.projectName || 'No project'} &middot; 👤 <span class="assigned-to">${assigneeName}</span>
        </div>
        ${task.description ? `<p>${task.description}</p>` : ''}
        <div class="task-tags">
          <div class="task-tag ${isOverdue ? 'overdue-tag' : 'deadline-tag'}">
            <span class="tag-dot"></span>
            ${task.dueDate ? (isOverdue ? `⚠️ Overdue ${formattedDate}` : `📅 Due ${formattedDate}`) : '📅 No deadline'}
          </div>
          <div class="task-tag added-tag">
            <span class="tag-dot"></span>
            Added ${addedDate}
          </div>
          ${task.assignedTo ? `<div class="task-tag assigned-tag"><span class="tag-dot"></span>Assigned</div>` : ''}
        </div>
      </div>
      <div class="task-buttons">
        ${isManager() ? `<button class="delete-btn task-delete-btn" data-task-id="${task.id}" title="Delete"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 6h18'/%3E%3Cpath d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/%3E%3C/svg%3E" alt="Delete" /></button>` : ''}
      </div>
    `;
    cardContainer.appendChild(card);
  });
}

cardContainer.addEventListener('click', (e) => {
  const completeBtn = e.target.closest('.complete-btn');
  if (completeBtn) {
    const taskId = Number(completeBtn.dataset.taskId);
    toggleTaskComplete(taskId);
    return;
  }
  const deleteBtn = e.target.closest('.task-delete-btn');
  if (deleteBtn) {
    if (!isManager()) return;
    const taskId = Number(deleteBtn.dataset.taskId);
    if (confirm('Delete this task?')) {
      deleteTaskById(taskId);
    }
  }
});

function toggleTaskComplete(taskId) {
  for (const p of projects) {
    const task = p.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      saveAll();
      renderTasks();
      renderProjects();
      renderEmployeeList();
      return;
    }
  }
}

function deleteTaskById(taskId) {
  for (const p of projects) {
    const idx = p.tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      p.tasks.splice(idx, 1);
      saveAll();
      renderTasks();
      renderProjects();
      renderEmployeeList();
      return;
    }
  }
}

function populateProjectSelect() {
  taskProject.innerHTML = '';
  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = '— Select Project —';
  taskProject.appendChild(opt0);
  projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    taskProject.appendChild(opt);
  });
  if (activeProjectIndex >= 0 && activeProjectIndex < projects.length) {
    taskProject.value = projects[activeProjectIndex].id;
  }
  taskProject.dispatchEvent(new Event('change'));
}

function populateTaskAssignee() {
  taskAssignee.innerHTML = '';
  const employees = getEmployeesForSelect();
  const opt1 = document.createElement('option');
  opt1.value = '';
  opt1.textContent = '— Unassigned —';
  taskAssignee.appendChild(opt1);
  employees.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = `${emp.name} (${emp.role})`;
    taskAssignee.appendChild(opt);
  });
  if (!isManager() && getCurrentUser()) {
    taskAssignee.value = getCurrentUser().id;
    taskAssignee.disabled = true;
  } else {
    taskAssignee.disabled = false;
  }
}

function populateProjectAssign() {
  taskProjectAssign.innerHTML = '';
  const employees = getEmployeesForSelect();
  const opt1 = document.createElement('option');
  opt1.value = '';
  opt1.textContent = '— Unassigned —';
  taskProjectAssign.appendChild(opt1);
  employees.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = emp.name;
    taskProjectAssign.appendChild(opt);
  });
  const selectedProjectId = Number(taskProject.value);
  if (selectedProjectId) {
    const p = projects.find(pr => pr.id === selectedProjectId);
    if (p && p.assignedTo) {
      taskProjectAssign.value = p.assignedTo;
    } else {
      taskProjectAssign.value = '';
    }
  }
  projectAssignGroup.style.display = isManager() && taskProject.value ? 'block' : 'none';
}

taskProject.addEventListener('change', () => {
  populateProjectAssign();
});

addTaskBtn.addEventListener('click', () => {
  const user = getCurrentUser();
  if (!user) return;
  if (!isManager()) {
    const myProjects = projects.filter(p =>
      p.assignedTo === user.id || p.tasks.some(t => t.assignedTo === user.id)
    );
    if (myProjects.length === 0) {
      alert('You have no projects to add tasks to. Ask your manager to assign you to a project.');
      return;
    }
  }
  populateProjectSelect();
  populateTaskAssignee();
  populateProjectAssign();
  addTaskPopup.showModal();
});

addTaskPopup.addEventListener('click', (e) => {
  if (e.target === addTaskPopup) addTaskPopup.close();
});

addTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  const taskName = $('taskName').value.trim();
  const taskDescription = $('taskDescription').value.trim();
  const dueDate = $('duedate').value;
  const projectId = taskProject.value ? Number(taskProject.value) : null;
  let assigneeId = taskAssignee.value ? Number(taskAssignee.value) : null;
  if (!isManager()) {
    assigneeId = user.id;
  }
  let targetProject = null;
  if (projectId) {
    targetProject = projects.find(p => p.id === projectId);
  } else if (activeProjectIndex >= 0 && activeProjectIndex < projects.length) {
    targetProject = projects[activeProjectIndex];
  } else if (isManager() && projects.length > 0) {
    targetProject = projects[0];
  } else if (!isManager()) {
    targetProject = projects.find(p =>
      p.assignedTo === user.id || p.tasks.some(t => t.assignedTo === user.id)
    ) || null;
  }
  if (!targetProject) {
    alert('No project available. Create a project first.');
    return;
  }
  const projectAssignVal = taskProjectAssign.value ? Number(taskProjectAssign.value) : null;
  if (isManager() && projectAssignVal !== null && projectAssignVal !== targetProject.assignedTo) {
    targetProject.assignedTo = projectAssignVal;
  }
  if (!assigneeId && targetProject.assignedTo) {
    assigneeId = targetProject.assignedTo;
  }
  targetProject.tasks.push({
    id: generateId(),
    title: taskName,
    description: taskDescription,
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
    completed: false,
    assignedTo: assigneeId
  });
  saveAll();
  addTaskForm.reset();
  addTaskPopup.close();
  renderTasks();
  renderProjects();
  renderEmployeeList();
});

projectBtn.addEventListener('click', () => {
  const name = projectInput.value.trim();
  if (!name) return;
  if (!isManager()) {
    alert('Only managers can create projects.');
    return;
  }
  projects.push({
    id: generateId(),
    name: name,
    assignedTo: null,
    tasks: []
  });
  saveAll();
  projectInput.value = '';
  activeProjectIndex = projects.length - 1;
  renderProjects();
  renderTasks();
  renderEmployeeList();
});

projectInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') projectBtn.click();
});

function renderCalendar() {
  calendarGrid.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  monthYear.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.classList.add('calendar-day-cell', 'empty-slot');
    calendarGrid.appendChild(empty);
  }
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-day-cell');
    cell.textContent = day;
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasEvent = calendarEvents.some(e => e.date === dateString);
    if (hasEvent) {
      const dot = document.createElement('div');
      dot.className = 'event-dot';
      cell.appendChild(dot);
    }
    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      cell.style.borderColor = '#3b82f6';
      cell.style.color = '#3b82f6';
    }
    if (selectedDate === dateString) {
      cell.classList.add('selected-day');
    }
    cell.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day-cell').forEach(d => d.classList.remove('selected-day'));
      cell.classList.add('selected-day');
      selectedDate = dateString;
      $('selectedDate').textContent = selectedDate;
      renderEvents();
    });
    calendarGrid.appendChild(cell);
  }
}

function renderEvents() {
  const eventList = $('eventList');
  eventList.innerHTML = '';
  if (!selectedDate) return;
  const events = calendarEvents.filter(e => e.date === selectedDate);
  if (events.length === 0) {
    eventList.innerHTML = `<div style="color:#9ca3af; font-size:14px; padding:8px 0;">No events</div>`;
    return;
  }
  events.forEach(event => {
    const div = document.createElement('div');
    div.classList.add('project-item');
    div.style.cursor = 'default';
    div.innerHTML = `
      <span>${event.title}</span>
      <button class="event-delete" data-event-id="${event.id}">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 6h18'/%3E%3Cpath d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/%3E%3C/svg%3E" alt="Delete" />
      </button>
    `;
    eventList.appendChild(div);
  });
}

$('eventList').addEventListener('click', (e) => {
  const btn = e.target.closest('.event-delete');
  if (btn) {
    const id = Number(btn.dataset.eventId);
    calendarEvents = calendarEvents.filter(ev => ev.id !== id);
    saveAll();
    renderEvents();
    renderCalendar();
  }
});

$('addEventBtn').addEventListener('click', () => {
  if (!selectedDate) { alert('Select a date first.'); return; }
  const title = $('eventTitle').value.trim();
  if (!title) { alert('Enter an event name.'); return; }
  calendarEvents.push({ id: generateId(), date: selectedDate, title });
  saveAll();
  $('eventTitle').value = '';
  renderEvents();
  renderCalendar();
});

$('prevMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
$('nextMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

calendarBtn.addEventListener('click', () => {
  const today = new Date();
  selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  $('selectedDate').textContent = selectedDate;
  renderCalendar();
  renderEvents();
  calendarDialog.showModal();
});

closeCalendar.addEventListener('click', () => calendarDialog.close());
calendarDialog.addEventListener('click', (e) => { if (e.target === calendarDialog) calendarDialog.close(); });

function renderLoginUsers() {
  loginUserList.innerHTML = '';
  users.forEach(u => {
    const div = document.createElement('div');
    div.classList.add('user-option');
    div.innerHTML = `
      <img src="${u.avatar || 'https://ui-avatars.com/api/?name='+encodeURIComponent(u.name)+'&background=3b82f6&color=fff'}" alt="${u.name}" />
      <div>
        <div class="uo-name">${u.name}</div>
        <div class="uo-role">${u.role}</div>
      </div>
    `;
    div.addEventListener('click', () => {
      currentUserId = u.id;
      loginOverlay.classList.add('hidden');
      afterLogin();
    });
    loginUserList.appendChild(div);
  });
}

loginAddUserBtn.addEventListener('click', () => {
  const name = loginNewUserName.value.trim();
  if (!name) return;
  const role = document.querySelector('input[name="loginRole"]:checked').value;
  users.push({
    id: generateId(),
    name: name,
    role: role,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${role === 'manager' ? '3b82f6' : '10b981'}&color=fff`
  });
  saveAll();
  loginNewUserName.value = '';
  renderLoginUsers();
});

loginNewUserName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginAddUserBtn.click();
});

loginAsNewUserBtn.addEventListener('click', () => {
  const name = loginNewUserName.value.trim();
  if (!name) { alert('Enter a name first.'); return; }
  const role = document.querySelector('input[name="loginRole"]:checked').value;
  users.push({
    id: generateId(),
    name: name,
    role: role,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${role === 'manager' ? '3b82f6' : '10b981'}&color=fff`
  });
  currentUserId = users[users.length - 1].id;
  saveAll();
  loginNewUserName.value = '';
  loginOverlay.classList.add('hidden');
  afterLogin();
});

function afterLogin() {
  const user = getCurrentUser();
  if (!user) return;
  updateProfileUI(user.name, user.role);
  selectedEmployeeId = null;
  if (projects.length > 0 && activeProjectIndex === -1) activeProjectIndex = 0;
  renderAll();
  assigneeFieldGroup.style.display = isManager() ? 'block' : 'none';
  employeeListSection.style.display = isManager() ? 'block' : 'none';
  projectSelectGroup.style.display = 'block';
  projectAssignGroup.style.display = isManager() ? 'block' : 'none';
  $('stat-employees-card').style.display = isManager() ? 'block' : 'none';
  saveAll();
}

function updateProfileUI(name, role) {
  profileNameEl.textContent = name;
  profileRoleBadge.textContent = role.charAt(0).toUpperCase() + role.slice(1);
  profileRoleBadge.className = `role-badge ${role === 'employee' ? 'employee' : ''}`;
  profileAvatarEl.src =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${role === 'manager' ? '3b82f6' : '10b981'}&color=fff`;
}

function renderAll() {
  renderProjects();
  renderTasks();
  renderEmployeeList();
  updateDashboard();
  populateProjectSelect();
  populateTaskAssignee();
  populateProjectAssign();
  assigneeFieldGroup.style.display = isManager() ? 'block' : 'none';
  employeeListSection.style.display = isManager() ? 'block' : 'none';
  projectAssignGroup.style.display = isManager() ? 'block' : 'none';
  $('stat-employees-card').style.display = isManager() ? 'block' : 'none';
}

profileClickArea.addEventListener('click', () => {
  const user = getCurrentUser();
  if (!user) return;
  editProfileName.value = user.name;
  editProfileDialog.showModal();
});

editProfileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = editProfileName.value.trim();
  if (!name) return;
  const user = getCurrentUser();
  if (!user) return;
  user.name = name;
  user.avatar =
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${user.role === 'manager' ? '3b82f6' : '10b981'}&color=fff`;
  saveAll();
  updateProfileUI(user.name, user.role);
  editProfileDialog.close();
  renderAll();
});

editProfileDialog.addEventListener('click', (e) => {
  if (e.target === editProfileDialog) editProfileDialog.close();
});

switchUserBtn.addEventListener('click', () => {
  loginOverlay.classList.remove('hidden');
  renderLoginUsers();
});

function init() {
  loadAll();
  renderLoginUsers();
  if (currentUserId && users.find(u => u.id === currentUserId)) {
    loginOverlay.classList.add('hidden');
    afterLogin();
  } else {
    loginOverlay.classList.remove('hidden');
  }
  populateProjectSelect();
  populateTaskAssignee();
  populateProjectAssign();
}

init();

document.querySelectorAll('dialog').forEach(d => {
  d.addEventListener('click', (e) => {
    if (e.target === d) d.close();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
  }
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    addTaskBtn.click();
  }
});