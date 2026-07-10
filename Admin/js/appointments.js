let appointments = [];

async function loadAppointments(){

    const response =
    await fetch(
    "http://localhost:5000/admin/appointments"
    );

    appointments =
    await response.json();

    displayAppointments(appointments);

}

function displayAppointments(list){

    const table =
    document.getElementById(
    "appointmentTable"
    );

    table.innerHTML="";

    list.forEach(item=>{

        table.innerHTML+=`

<tr>

<td>

${item.userName}

</td>

<td>

${item.therapist}

</td>

<td>

${item.date}

</td>

<td>

${item.status}

</td>

<td>

<button
onclick="approve('${item._id}')">

Approve

</button>

<button
onclick="reject('${item._id}')">

Reject

</button>

<button
onclick="viewAppointment('${item._id}')">

View

</button>

</td>

</tr>

`;

    });

}

async function approve(id){

await fetch(

"http://localhost:5000/admin/appointment/"+id,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

status:"Approved"

})

}

);

loadAppointments();

}

async function reject(id){

await fetch(

"http://localhost:5000/admin/appointment/"+id,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

status:"Cancelled"

})

}

);

loadAppointments();

}

function viewAppointment(id){

    console.log("View button clicked");
    console.log("Appointment ID:", id);

    localStorage.setItem("appointmentId", id);

    console.log(
        "Stored ID:",
        localStorage.getItem("appointmentId")
    );

    window.location.href = "appointment-details.html";

}

loadAppointments();