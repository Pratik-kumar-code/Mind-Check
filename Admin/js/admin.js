if(localStorage.getItem("adminLoggedIn") !== "true"){

    window.location.href =
        "admin-login.html";

}

async function loadDashboard(){

    try{

        const response =
            await fetch(
                "http://localhost:5000/admin/dashboard"
            );

        const data =
            await response.json();

        document.getElementById("users").innerText =
            data.totalUsers;

        document.getElementById("journals").innerText =
            data.totalJournals;

        document.getElementById("appointments").innerText =
            data.totalAppointments;

        document.getElementById("assessments").innerText =
            data.totalAssessments;

    }

    catch(error){

        console.log(error);

    }

}

function logout(){

    localStorage.removeItem(
        "adminLoggedIn"
    );

    window.location.href =
        "admin-login.html";

}


async function loadOverview(){

    const response =
        await fetch(
            "http://localhost:5000/admin/overview"
        );

    const data =
        await response.json();

    document.getElementById(
        "approvedAppointments"
    ).innerText = data.approved;

    document.getElementById(
        "pendingAppointments"
    ).innerText = data.pending;

    document.getElementById(
        "cancelledAppointments"
    ).innerText = data.cancelled;

}

loadDashboard();
loadOverview();