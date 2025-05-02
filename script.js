document.getElementById('streams').addEventListener('input', function () {
    const streams = this.value.split(',').map(s => s.trim()).filter(s => s);
    const container = document.getElementById('streamCountsContainer');
    container.innerHTML = ''; 
    streams.forEach((stream, index) => {
        container.innerHTML += `
            <label>${stream} Count:</label>
            <input type="number" id="streamCount_${index}" class="stream-count-input" placeholder="Number of students for ${stream}">
        `;
    });
});

function toggleSeatType() {
    const isSingleSeat = document.getElementById('singleSeat').checked;
    const isBench = document.getElementById('benchSeat').checked;
    
    if (isSingleSeat) {
        document.getElementById('benchSeat').checked = false;
        document.getElementById('benchInput').style.display = 'none';
    } else if (isBench) {
        document.getElementById('singleSeat').checked = false;
        document.getElementById('benchInput').style.display = 'block';
    }
}

function generateSeating() {
    const seatingTitle = document.getElementById('seatingTitle').value; 
    const studentCount = parseInt(document.getElementById('studentCount').value);
    const columns = parseInt(document.getElementById('columns').value);
    const rows = parseInt(document.getElementById('rows').value);
    const streamInput = document.getElementById('streams').value;
    const streams = streamInput.split(',').map(s => s.trim()).filter(s => s);
    const isBench = document.getElementById('benchSeat').checked;
    const perBench = isBench ? parseInt(document.getElementById('studentsPerBench').value) : 1;

    let streamCounts = [];
    let totalStreamStudents = 0;

    streams.forEach((stream, index) => {
        const count = parseInt(document.getElementById(`streamCount_${index}`).value);
        if (isNaN(count)) return;
        streamCounts.push({ stream, count });
        totalStreamStudents += count;
    });

    if (studentCount !== totalStreamStudents) {
        alert("Total stream students must match total number of students.");
        return;
    }

    const totalUnits = columns * rows;
    const totalSeatsAvailable = totalUnits * perBench;
    if (studentCount > totalSeatsAvailable) {
        alert("Not enough seats for all students.");
        return;
    }

    let students = [];
    streamCounts.forEach(({ stream, count }) => {
        for (let i = 0; i < count; i++) {
            students.push({ id: students.length + 1, stream });
        }
    });

   
    students.sort(() => 0.5 - Math.random());

    
    let seating = Array.from({ length: rows }, () => Array(columns).fill(null));
    let studentIndex = 0;

    for (let r = 0; r < rows && studentIndex < students.length; r++) {
        for (let c = 0; c < columns && studentIndex < students.length; c++) {
            let bench = [];
            let usedStreams = new Set();

            while (bench.length < perBench && studentIndex < students.length) {
                let candidate = students[studentIndex];
                if (!usedStreams.has(candidate.stream)) {
                    bench.push(candidate);
                    usedStreams.add(candidate.stream);
                    studentIndex++;
                } else {
                   
                    let swapIndex = students.findIndex((s, i) => i > studentIndex && !usedStreams.has(s.stream));
                    if (swapIndex !== -1) {
                        [students[studentIndex], students[swapIndex]] =
                            [students[swapIndex], students[studentIndex]];
                    } else {
                        bench.push(candidate);
                        studentIndex++;
                    }
                }
            }

            seating[r][c] = bench;
        }
    }

   
    let outputHTML = `<h2>${seatingTitle}</h2><h3>Seating Arrangement</h3><table id="seatingTable">`;

    seating.forEach(row => {
        outputHTML += '<tr>';
        row.forEach(bench => {
            if (!bench || bench.length === 0) {
                outputHTML += `<td>Empty</td>`;
            } else {
                let cell = bench.map(s => `${s.id}<small>(${s.stream})</small>`).join('<br>');
                outputHTML += `<td>${cell}</td>`;
            }
        });
        outputHTML += '</tr>';
    });
    
    outputHTML += '</table>';

    document.getElementById('output').innerHTML = outputHTML;
}


function downloadSeating() {
    const element = document.getElementById('output'); 
    
 
    const options = {
        margin:       10,
        filename:     'seating-arrangement.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 4 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

   
    html2pdf().from(element).set(options).save();
}


