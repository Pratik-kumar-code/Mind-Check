const assessmentId =
localStorage.getItem(
"assessmentId"
);

if(!assessmentId){

    alert("Assessment not found.");

    window.location.href =
    "assessments.html";

}

async function loadAssessment(){

    try{

        const response =
        await fetch(

        "http://localhost:5000/admin/assessment/" +
        assessmentId

        );

        const data =
        await response.json();

        document.getElementById("patient").innerText =
        data.userName || "Not Available";

        document.getElementById("email").innerText =
        data.userEmail;

        document.getElementById("stress").innerText =
        data.stress;

        document.getElementById("anxiety").innerText =
        data.anxiety;

        document.getElementById("sleep").innerText =
        data.sleep;

        document.getElementById("happiness").innerText =
        data.happiness;

        document.getElementById("focus").innerText =
        data.focus;

        document.getElementById("motivation").innerText =
        data.motivation;

        const average = (

            Number(data.stress) +
            Number(data.anxiety) +
            Number(data.sleep) +
            Number(data.happiness) +
            Number(data.focus) +
            Number(data.motivation)

        ) / 6;

        document.getElementById("average").innerText =
        average.toFixed(2);

        let risk = "";

        if(average >= 8){

            risk = "😊 Low Risk";

        }

        else if(average >=5){

            risk = "🟡 Moderate Risk";

        }

        else{

            risk = "🔴 High Risk";

        }

        document.getElementById("risk").innerText =
        risk;

        document.getElementById("date").innerText =
        new Date(data.createdAt).toLocaleString();

    }

    catch(error){

        console.log(error);

        alert("Unable to load assessment.");

    }

}

async function deleteAssessment(){

    const confirmDelete =
    confirm(
        "Are you sure you want to delete this assessment?"
    );

    if(!confirmDelete){

        return;

    }

    try{

        const response =
        await fetch(

        "http://localhost:5000/admin/assessment/" +
        assessmentId,

        {

            method:"DELETE"

        }

        );

        const data =
        await response.json();

        alert(data.message);

        localStorage.removeItem(
            "assessmentId"
        );

        window.location.href =
        "assessments.html";

    }

    catch(error){

        console.log(error);

        alert("Unable to delete assessment.");

    }

}

loadAssessment();