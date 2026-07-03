const addTaskBtn = document.getElementById("addtskbtn");
const addTaskPopup = document.getElementById("addtaskpopup");
const addTaskForm = document.getElementById("addTaskForm");
const cardContainer = document.getElementById("tasks-container");

const projectBtn = document.getElementById("addProjectBtn");
const projectInput = document.getElementById("newProjectInput");
const projectsContainer = document.getElementById("projects-container");
const taskCount = document.getElementById("task-count");
const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");
const calendarBtn = document.getElementById("calendarBtn");
const calendarDialog = document.getElementById("calendarDialog");
const closeCalendar = document.getElementById("closeCalendar");

let projects = [];
let activeProjectIndex = -1;
let currentDate = new Date();
let selectedDate = null;
let calendarEvents = [];

function saveProjects() {
    localStorage.setItem("projects", JSON.stringify(projects));
}

function loadProjects() {
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
        projects = JSON.parse(savedProjects);
        if (projects.length > 0) {
            activeProjectIndex = 0;
        } else {
            activeProjectIndex = -1;
        }
    }
    displayProjects();
    displayTasks();
}

function displayProjects() {
    projectsContainer.innerHTML = "";

    projects.forEach((project, index) => {
        const div = document.createElement("div");
        div.classList.add("project-item");
        if (index === activeProjectIndex) {
            div.classList.add("active");
        }

        div.innerHTML = `
            <span>${project.name}</span>
            <button class="project-delete-btn"><img src="delete.png" alt="Delete"></button>
        `;

        div.addEventListener("click", () => {
            activeProjectIndex = index;
            displayProjects();
            displayTasks();
        });
        const deleteBtn = div.querySelector(".project-delete-btn");
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const ans = confirm("Are you sure you want to delete this project?");
            if (ans) {
                projects.splice(index, 1);

                if (activeProjectIndex === index) {
                    activeProjectIndex = -1;
                    cardContainer.innerHTML = "";
                } else if (activeProjectIndex > index) {
                    activeProjectIndex--;
                }

                saveProjects();
                displayProjects();
                displayTasks(); 
            }
        });

        projectsContainer.appendChild(div);
    });
}

function displayTasks() {
    cardContainer.innerHTML = "";

    if (activeProjectIndex === -1) {
        taskCount.textContent = "0 Tasks Remaining";
        return;
    }
    const currentProject = projects[activeProjectIndex];
    
    const remainingTasks = currentProject.tasks.filter(task => !task.completed).length;

    taskCount.textContent = `${remainingTasks} Task${remainingTasks !== 1 ? "s" : ""} Remaining`;

    currentProject.tasks.forEach((task, index) => {
        const card = document.createElement("div");
        card.classList.add("task-card");
        
        if (task.completed) {
            card.classList.add("completed");
        }

        const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : "No deadline";

        const addedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric"
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isOverdue = task.dueDate && new Date(task.dueDate) < today && !task.completed;       
        
        card.innerHTML = `
            <button class="complete-btn" data-index="${index}" title="Mark as complete"></button>
            
            <div class="task-content">
                <h3>${task.title}</h3>
                <p>${task.description || ''}</p>
                <div class="task-tags">
                    <div class="task-tag ${isOverdue ? 'overdue-tag' : 'deadline-tag'}">
                        <span class="tag-dot"></span>
                         ${task.dueDate ? (isOverdue ? `Overdue ${formattedDate}` : `Due ${formattedDate}`) : "No deadline"}
                    </div>
                    <div class="task-tag added-tag">
                        <span class="tag-dot"></span>
                        Added ${addedDate}
                    </div>
                </div>
            </div>
            
            <div class="task-buttons">
                <button class="delete-btn close-btn" data-index="${index}">
                    <img src="delete.png" alt="Delete" style="width: 20px; height: 20px; pointer-events: none;">
                </button>
            </div>
        `;

        cardContainer.appendChild(card);
    });
}

function renderCalendar(){
    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric"
    });
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("calendar-day-cell", "empty-slot");
        calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.classList.add("calendar-day-cell");
        cell.textContent = day;

        const today = new Date();
        const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const hasEvent = calendarEvents.some(event => event.date === dateString);

        if (hasEvent) {
            const dot = document.createElement("div");
            dot.style.cssText = "width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-top: 4px;";
            cell.appendChild(dot);
        }

        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.style.borderColor = "#3b82f6";
            cell.style.color = "#3b82f6";
        }

        if (selectedDate === dateString) {
            cell.classList.add("selected-day");
        }

        cell.addEventListener("click", () => {
            document.querySelectorAll(".calendar-day-cell").forEach(d => d.classList.remove("selected-day"));
            cell.classList.add("selected-day");

            selectedDate = dateString;
            document.getElementById("selectedDate").textContent = selectedDate;
            renderEvents();
        });

        calendarGrid.appendChild(cell);
    }
}

function renderEvents() {
    const eventList = document.getElementById("eventList");
    eventList.innerHTML = "";

    if (!selectedDate) return;

    const events = calendarEvents.filter(event => event.date === selectedDate);

    events.forEach(event => {
        const div = document.createElement("div");
        div.classList.add("project-item");
        div.style.cursor = "default";
        div.innerHTML = `
            <span>${event.title}</span>
            <button class="project-delete-btn event-delete" data-id="${event.id}">
                <img src="delete.png" alt="Delete" style="width:16px; height:16px;">
            </button>
        `;
        eventList.appendChild(div);
    });
}

function loadEvents() {
    const saved = localStorage.getItem("calendarEvents");
    if (saved) {
        calendarEvents = JSON.parse(saved);
    }
}

function saveEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(calendarEvents));
}

cardContainer.addEventListener("click", (e) => {
    const completeBtn = e.target.closest(".complete-btn");
    if (completeBtn) {
        const taskIndex = Number(completeBtn.dataset.index);
        projects[activeProjectIndex].tasks[taskIndex].completed = !projects[activeProjectIndex].tasks[taskIndex].completed;
        saveProjects();
        displayTasks();
        return;
    }

    const deleteBtn = e.target.closest(".close-btn");
    if (deleteBtn) {
        const taskIndex = Number(deleteBtn.dataset.index);
        deltask(activeProjectIndex, taskIndex);
    }
});

function deltask(projectIndex, taskIndex) {
    projects[projectIndex].tasks.splice(taskIndex, 1);
    saveProjects();
    displayTasks();
}

addTaskBtn.addEventListener("click", () => {
    addTaskPopup.showModal();
});

addTaskPopup.addEventListener("click", (e) => {
    if (e.target === addTaskPopup) {
        addTaskPopup.close();
    }
});

addTaskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (activeProjectIndex === -1) {
        alert("Please select a project first.");
        return;
    }

    const taskName = document.getElementById("taskName").value;
    const taskDescription = document.getElementById("taskDescription").value;
    const dueDate = document.getElementById("duedate").value;

    projects[activeProjectIndex].tasks.push({
        title: taskName,
        description: taskDescription,
        dueDate: dueDate,
        createdAt: new Date().toISOString(),
        completed: false 
    });

    saveProjects();
    displayTasks();
    addTaskForm.reset();
    addTaskPopup.close();
});

projectBtn.addEventListener("click", () => {
    const projectName = projectInput.value.trim();
    if (projectName === "") return;

    projects.push({
        name: projectName,
        tasks: []
    });

    saveProjects();
    displayProjects();
    projectInput.value = "";
});

calendarBtn.addEventListener("click", () => {
    const today = new Date();
    selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    document.getElementById("selectedDate").textContent = selectedDate;
    renderCalendar();
    renderEvents();
    calendarDialog.showModal();
});

closeCalendar.addEventListener("click", () => {
    calendarDialog.close();
});

calendarDialog.addEventListener("click", (e) => {
    if (e.target === calendarDialog) {
        calendarDialog.close();
    }   
});

document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

const addEventBtn = document.getElementById("addEventBtn");
const eventTitle = document.getElementById("eventTitle");

addEventBtn.addEventListener("click", () => {
    if (!selectedDate) {
        alert("Select a date first.");
        return;
    }

    if (eventTitle.value.trim() === "") {
        alert("Enter an event name.");
        return;
    }

    calendarEvents.push({
        id: Date.now(),
        date: selectedDate,
        title: eventTitle.value.trim()
    });

    saveEvents();
    renderEvents();
    renderCalendar();

    eventTitle.value = "";
});

document.getElementById("eventList").addEventListener("click", (e) => {
    const delBtn = e.target.closest(".event-delete");
    if (delBtn) {
        const id = Number(delBtn.dataset.id);
        calendarEvents = calendarEvents.filter(event => event.id !== id);
        saveEvents();
        renderEvents();
        renderCalendar();
    }
});

loadEvents();
loadProjects();s
