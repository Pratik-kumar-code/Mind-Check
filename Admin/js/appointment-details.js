const appointmentId =
localStorage.getItem(
"appointmentId"
);

async function loadAppointment(){

    const response = await fetch(
        "http://localhost:5000/admin/appointment/" + appointmentId
    );

    const data = await response.json();

    console.log(data);   // 👈 Add this line

    document.getElementById("patient").innerText = data.userName;
    document.getElementById("email").innerText = data.userEmail;
    document.getElementById("therapist").innerText = data.therapist;
    document.getElementById("date").innerText = data.date;
    document.getElementById("time").innerText = data.time;
    document.getElementById("reason").innerText = data.reason;
    document.getElementById("status").innerText = data.status;
}

async function updateStatus(status){

    await fetch(

    "http://localhost:5000/admin/appointment/"+appointmentId,

    {

        method:"PUT",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            status:status

        })

    }

    );

    alert(

    "Appointment Updated"

    );

    loadAppointment();

}

async function deleteAppointment(){

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this appointment?"
        );

    if(!confirmDelete){

        return;

    }

    try{

        const response =
            await fetch(

                "http://localhost:5000/admin/appointment/" +
                appointmentId,

                {

                    method:"DELETE"

                }

            );

        const data =
            await response.json();

        alert(data.message);

        localStorage.removeItem(
            "appointmentId"
        );

        window.location.href =
            "appointments.html";

    }

    catch(error){

        console.log(error);

        alert("Unable to delete appointment.");

    }

}

loadAppointment();