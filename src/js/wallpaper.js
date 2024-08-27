const subName = document.getElementById('subject-name');
const subYear = document.getElementById('subject-year');
const subClass = document.getElementById('subject-class');

const subjectsData = './data/subjects.json';

let periodSel = "";
let currentDay = 0;
let currentTime = "";

let timetable;

function updateTime() {
    // Define options for formatting
    const weekdayOptions = { weekday: 'long' };
    const dayOptions = { day: 'numeric' };
    const monthOptions = { month: 'long' };
    const yearOptions = { year: 'numeric' };

    const now = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[now.getDay()];

    let hours = now.getHours();

    const isPM = hours >= 12;

    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, '0');

    const minutes = String(now.getMinutes()).padStart(2, '0');
    //const seconds = String(now.getSeconds()).padStart(2, '0');
    const time = `${hours} <span style="font-weight: 400; color: #b939cc;">${minutes}</span>`;

    // Get the formatted parts
    const weekday = now.toLocaleDateString('en-GB', weekdayOptions);
    const day = now.toLocaleDateString('en-GB', dayOptions);
    const month = now.toLocaleDateString('en-GB', monthOptions);
    const year = now.toLocaleDateString('en-GB', yearOptions);

    // Construct the formatted date string
    const formattedDate = `${weekday} | ${day} ${month} ${year}`;

    document.querySelector('#time-widget h2').innerHTML = `${time}<span style="font-weight: 400; font-size: 22px;">${isPM ? 'PM' : 'AM'}</span>`;

    document.querySelector('#date-widget h2').innerText = formattedDate;

    currentDay = dayOfWeek;
    currentTime = `${hours}:${minutes}${isPM ? 'PM' : 'AM'}`;
}
updateTime();
setInterval(updateTime, 1000);

function timeToMinutes(time) {
    const [timePart, modifier] = time.split(/([AP]M)/);
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) {
        hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }
    return hours * 60 + minutes;
}

async function getNextSubject() {
    let message = "";

    await fetch(subjectsData)
        .then(response => response.json())
        .then(data => {
            timetable = data;
        })
        .catch(error => console.error('Error fetching timetable:', error));

    if (!timetable) {
        message = "Loading...";
        document.getElementById('next-subject').innerText = message;
        return;
    }
    const subjectsToday = timetable[currentDay];
    if (!subjectsToday) {
        message = `Unable to find subjects for ${currentDay}`;
        document.getElementById('next-subject').innerText = message;
        return;
    }
    let nextSubject = null;
    let currentMinutes = timeToMinutes(currentTime);
    let nextSubjectTime = Infinity;
    for (const sub of subjectsToday) {
        let subStartMinutes = timeToMinutes(sub.Start);
        if (subStartMinutes > currentMinutes && subStartMinutes < nextSubjectTime) {
            nextSubject = sub;
            nextSubjectTime = subStartMinutes;
        }
    }
    if (nextSubject) {
        message = `${nextSubject.SubjectName || "N/A"} at ${nextSubject.Start}`;
    } else {
        message = `All done for today!`;
    }
    document.getElementById('next-subject').innerText = message;
}
getNextSubject();
setInterval(getNextSubject, 60000);