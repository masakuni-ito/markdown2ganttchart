document.getElementById('generateChart').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput').value;
    const tasks = parseTasks(taskInput);
    generateGanttChart(tasks);
});

function parseTasks(input) {
    const lines = input.split('\n');
    const tasks = [];

    lines.forEach(line => {
        const task = parseTaskLine(line);
        if (task) {
            tasks.push(task);
        }
    });

    return tasks;
}

function parseTaskLine(line) {
    const matches = line.match(/(\d{4}\/\d{2}\/\d{2}).*?(\d{4}\/\d{2}\/\d{2})?：(.+)/);
    if (!matches) return null;

    const start = matches[1];
    const end = matches[2] || start; // Use start date as end date if end date is missing
    const description = matches[3].trim();
    const indent = calculateIndentLevel(line);

    return { start, end, description, indent };
}

function calculateIndentLevel(line) {
    const INDENT_SPACE_COUNT = 2;
    const match = line.match(/^(\s+)/);
    return match ? match[0].length / INDENT_SPACE_COUNT : 0;
}

function generateGanttChart(tasks) {
    const ganttChart = document.getElementById('ganttChart');
    ganttChart.innerHTML = '';

    const dateArray = getDateArrayFromTasks(tasks);
    const table = createTableElement();

    const dateRow = createDateRow(dateArray);
    table.appendChild(dateRow);

    tasks.forEach(task => {
        const taskRow = createTaskRow(task, dateArray);
        table.appendChild(taskRow);
    });

    ganttChart.appendChild(table);
}

function getDateArrayFromTasks(tasks) {
    const startDate = new Date(Math.min(...tasks.map(task => new Date(task.start))));
    const endDate = new Date(Math.max(...tasks.map(task => new Date(task.end))));
    return getDatesArray(startDate, endDate);
}

function getDatesArray(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

function createTableElement() {
    const table = document.createElement('div');
    table.className = 'table';
    return table;
}

function createDateRow(dateArray) {
    const dateRow = document.createElement('div');
    dateRow.className = 'row';
    dateArray.forEach(date => {
        const dateCell = createDateCell(date);
        dateRow.appendChild(dateCell);
    });
    return dateRow;
}

function createDateCell(date) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    if (date.getDay() === 1) { // Highlight Mondays
        cell.classList.add('monday-cell');
        cell.textContent = formatDate(date);
    }
    return cell;
}

function createTaskRow(task, dateArray) {
    const taskRow = document.createElement('div');
    taskRow.className = 'row';

    const taskNameCell = createTaskNameCell(task);
    taskRow.appendChild(taskNameCell);

    dateArray.forEach(date => {
        const cell = createTaskDateCell(task, date);
        taskRow.appendChild(cell);
    });

    return taskRow;
}

function createTaskNameCell(task) {
    const cell = document.createElement('div');
    cell.className = `cell task-name indent-${task.indent}`;
    if (task.indent === 0) {
        cell.classList.add('top-level');
    }
    cell.textContent = task.description;
    return cell;
}

function createTaskDateCell(task, date) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    if (task.indent === 0) {
        cell.classList.add('top-level');
    }
    if (date >= new Date(task.start) && date <= new Date(task.end)) {
        cell.classList.add('highlight');
        if (task.indent === 0) {
            cell.classList.add('top-level-highlight');
        }
    }
    if (date.getDay() === 0) { // Highlight Mondays
        cell.classList.add('monday-cell');
    }
    return cell;
}

function formatDate(date) {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

