let assessments = [];

async function loadAssessments(){

    const response =
    await fetch(
    "http://localhost:5000/admin/assessments"
    );

    assessments =
    await response.json();

    displayAssessments(assessments);

}

function displayAssessments(list){

    const table =
    document.getElementById(
    "assessmentTable"
    );

    table.innerHTML = "";

    list.forEach(item => {

        // Calculate Total Score
        const score =

            Number(item.stress) +
            Number(item.anxiety) +
            Number(item.sleep) +
            Number(item.happiness) +
            Number(item.focus) +
            Number(item.motivation);

        // Calculate Risk
        let risk = "";

        if(score <= 10){

            risk = "🟢 Low";

        }
        else if(score <= 18){

            risk = "🟡 Moderate";

        }
        else if(score <= 24){

            risk = "🟠 High";

        }
        else{

            risk = "🔴 Severe";

        }

        table.innerHTML += `

<tr>

<td>${item.userName || "N/A"}</td>

<td>${item.userEmail}</td>

<td>${score}</td>

<td>${risk}</td>

<td>${new Date(item.createdAt).toLocaleDateString()}</td>

<td>

<button onclick="viewAssessment('${item._id}')">

View

</button>

</td>

</tr>

`;

    });

}

function viewAssessment(id){

    localStorage.setItem(

    "assessmentId",

    id

    );

    window.location.href =
    "assessment-details.html";

}

loadAssessments();

document.getElementById(

"search"

).addEventListener(

"keyup",

function(){

const keyword =
this.value.toLowerCase();

const filtered =
assessments.filter(item=>

item.userName
.toLowerCase()
.includes(keyword)

||

item.userEmail
.toLowerCase()
.includes(keyword)

);

displayAssessments(filtered);

}

);