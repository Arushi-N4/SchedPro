document.getElementById('configForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const weekDays = document.getElementById('weekDays').value;
    const numLectures = parseInt(document.getElementById('numLectures').value);
    const numBreaks = parseInt(document.getElementById('numBreaks').value);
    const title = document.getElementById('timetableTitle').value || "Timetable";


    document.getElementById('timetable-title').textContent = title;
    const days = weekDays === 'mon-fri' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] :
        weekDays === 'mon-sat' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] :
            prompt('Enter custom days separated by commas:').split(',');

    generateTimetable(days, numLectures, numBreaks);
});


function createCell(content, isHeader = false) {
    const cell = document.createElement('div');
    cell.className = 'timetable-cell';
    if (isHeader) {
        cell.textContent = content;
        return cell;
    }
    cell.addEventListener('dblclick', () => openModal(cell));
    cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        cell.innerHTML = '';
        cell.style.backgroundColor = '';
    });
    return cell;
}


let dragged;

function handleDragStart(event) {
    dragged = event.target;
    event.dataTransfer.effectAllowed = 'move';
}

function handleDrop(event) {
    event.preventDefault();
    if (event.target.classList.contains('timetable-cell') && event.target !== dragged) {
        event.target.textContent = dragged.textContent;
        event.target.style.backgroundColor = dragged.style.backgroundColor;
    }
}

function handleDragOver(event) {
    event.preventDefault();
}



function generateTimetable(days, numLectures, numBreaks) {
    const timetable = document.getElementById('timetable');
    timetable.innerHTML = '';

    timetable.style.gridTemplateColumns = `repeat(${days.length + 1}, 1fr)`;

    timetable.appendChild(createCell('Duration/Day', true));
    days.forEach(day => timetable.appendChild(createCell(day, true)));
    for (let i = 0; i < numLectures + numBreaks; i++) {

        const timeCell = createCell(`Slot ${i + 1}`, true);
        timeCell.contentEditable = true;
        timeCell.textContent = i < numLectures ? `(Click to Edit)` : 'Break';
        timeCell.addEventListener('focus', () => {
            if (timeCell.textContent.includes('Click to Edit')) {
                timeCell.textContent = '';
            }
        });
        timetable.appendChild(timeCell);


        days.forEach(() => {
            const cell = createCell('');
            cell.contentEditable = true;
            cell.draggable = true;

            cell.addEventListener('dragstart', handleDragStart);
            cell.addEventListener('drop', handleDrop);
            cell.addEventListener('dragover', handleDragOver);

            timetable.appendChild(cell);
        });
    }
}



const modal = document.getElementById('detailsModal');
const subjectInput = document.getElementById('subjectInput');
const roomInput = document.getElementById('roomInput');
const teacherInput = document.getElementById('teacherInput');
const contentInput = document.getElementById('contentInput');
const colorPicker = document.getElementById('colorPicker');
let activeCell = null;


document.getElementById('eventType').addEventListener('change', (event) => {
    const isEvent = event.target.value === 'event';
    subjectInput.style.display = isEvent ? 'none' : 'block';
    roomInput.style.display = isEvent ? 'none' : 'block';
    teacherInput.style.display = isEvent ? 'none' : 'block';
    contentInput.style.display = isEvent ? 'block' : 'none';
    document.getElementById('modalTitle').textContent = isEvent ? 'Edit Event Cell' : 'Edit Cell';
});

function openModal(cell) {
    activeCell = cell;
    modal.classList.add('active');
}

document.getElementById('saveDetails').addEventListener('click', () => {
    const isEvent = document.getElementById('eventType').value === 'event';
    if (isEvent) {
        activeCell.innerHTML = `<div>${contentInput.value}</div>`;
    } else {
        const subject = subjectInput.value;
        const room = roomInput.value;
        const teacher = teacherInput.value;
        activeCell.innerHTML = `
                    <div>${subject}</div>
                    <div>Room: ${room}</div>
                    <div>Teacher: ${teacher}</div>
                `;
    }
    activeCell.style.backgroundColor = colorPicker.value;
    modal.classList.remove('active');
});

document.getElementById('cancelDetails').addEventListener('click', () => {
    modal.classList.remove('active');
});



document.getElementById('downloadImage').addEventListener('click', () => {
    const timetableContainer = document.getElementById('timetableContainer');
    const timetable = document.getElementById('timetable');

    html2canvas(timetableContainer).then(containerCanvas => {
        html2canvas(timetable).then(timetableCanvas => {
            const combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = Math.max(containerCanvas.width, timetableCanvas.width);
            combinedCanvas.height = containerCanvas.height + timetableCanvas.height;

            const ctx = combinedCanvas.getContext('2d');
            ctx.drawImage(containerCanvas, 0, 0);
            ctx.drawImage(timetableCanvas, 0, containerCanvas.height);

            const link = document.createElement('a');
            link.download = 'timetable.png';
            link.href = combinedCanvas.toDataURL();
            link.click();
        });
    });
})