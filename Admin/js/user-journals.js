const userId =
localStorage.getItem(
"selectedUser"
);

let journals=[];

async function loadJournals(){

const response=
await fetch(

"http://localhost:5000/admin/user-journals/"+userId

);

journals=
await response.json();

displayJournals(journals);

}

function displayJournals(list){

const table=
document.getElementById(
"journalTable"
);

table.innerHTML="";

list.forEach(journal=>{

table.innerHTML+=`

<tr>

<td>

${journal.title}

</td>

<td>

${journal.mood}

</td>

<td>

${new Date(
journal.createdAt
).toLocaleDateString()}

</td>

<td>

<button
onclick="viewJournal('${journal._id}')">

View

</button>

<button
onclick="deleteJournal('${journal._id}')">

Delete

</button>

</td>

</tr>

`;

});

}

document.getElementById(
"search"
).addEventListener(

"keyup",

function(){

const keyword=
this.value.toLowerCase();

const filtered=

journals.filter(j=>

j.title.toLowerCase().includes(keyword)

||

j.content.toLowerCase().includes(keyword)

);

displayJournals(filtered);

});

async function deleteJournal(id){

if(!confirm(
"Delete Journal?"
)){

return;

}

await fetch(

"http://localhost:5000/journal/"+id,

{

method:"DELETE"

}

);

loadJournals();

}

function viewJournal(id){

localStorage.setItem(

"journalId",

id

);

window.location.href=
"journal-details.html";

}

loadJournals();