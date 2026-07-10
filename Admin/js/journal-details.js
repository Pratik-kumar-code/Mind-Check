const journalId =
localStorage.getItem("journalId");

async function loadJournal(){

    const response =
    await fetch(

    "http://localhost:5000/admin/journal/" +
    journalId

    );

    const journal =
    await response.json();

    document.getElementById(
    "title"
    ).innerText =
    journal.title;

    document.getElementById(
    "mood"
    ).innerText =
    journal.mood;

    document.getElementById(
    "date"
    ).innerText =
    new Date(
    journal.createdAt
    ).toLocaleString();

    document.getElementById(
    "content"
    ).innerText =
    journal.content;

}

function editJournal(){

    window.location.href =
    "edit-journal.html";

}

async function deleteJournal(){

    if(!confirm(
    "Delete this journal?"
    )){

        return;

    }

    await fetch(

    "http://localhost:5000/journal/" +
    journalId,

    {

        method:"DELETE"

    }

    );

    alert(
    "Journal Deleted Successfully"
    );

    window.location.href =
    "user-journals.html";

}

loadJournal();