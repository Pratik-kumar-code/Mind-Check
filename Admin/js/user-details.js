const userId =
localStorage.getItem(
"selectedUser"
);

async function loadUser(){

const response =
await fetch(

"http://localhost:5000/admin/user/"+userId

);

const data =
await response.json();

document.getElementById(
"name"
).innerText =
data.user.name;

document.getElementById(
"email"
).innerText =
data.user.email;

document.getElementById(
"journalCount"
).innerText =
data.totalJournals;

document.getElementById(
"assessmentCount"
).innerText =
data.totalAssessments;

document.getElementById(
"appointmentCount"
).innerText =
data.totalAppointments;

document.getElementById(
"latestAssessment"
).innerHTML=`

Stress : ${data.latestAssessment?.stress ?? "-"}

<br><br>

Anxiety : ${data.latestAssessment?.anxiety ?? "-"}

<br><br>

Sleep : ${data.latestAssessment?.sleep ?? "-"}

<br><br>

Focus : ${data.latestAssessment?.focus ?? "-"}

<br><br>

Motivation : ${data.latestAssessment?.motivation ?? "-"}

`;

}

function viewJournal(){

window.location.href=
"user-journals.html";

}

function viewAssessment(){

window.location.href=
"user-assessments.html";

}

function viewAppointment(){

window.location.href=
"user-appointments.html";

}

loadUser();