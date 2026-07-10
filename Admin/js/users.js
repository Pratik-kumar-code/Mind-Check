if(localStorage.getItem("adminLoggedIn") !== "true"){

    window.location.href =
    "admin-login.html";

}

let allUsers = [];

async function loadUsers(){

    const response =
    await fetch(

    "http://localhost:5000/admin/users"

    );

    const users =
    await response.json();

    allUsers = users;

    displayUsers(users);

}

function displayUsers(users){

    const table =
    document.getElementById(
    "userTable"
    );

    table.innerHTML = "";

    users.forEach(user=>{

        table.innerHTML += `

<tr>

<td>

${user.name}

</td>

<td>

${user.email}

</td>

<td>

<button
onclick="viewUser('${user._id}')">

View

</button>

<button
onclick="deleteUser('${user._id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

async function deleteUser(id){

    if(!confirm("Delete User?")){

        return;

    }

    await fetch(

    "http://localhost:5000/admin/users/"+id,

    {

        method:"DELETE"

    }

    );

    loadUsers();

}

function viewUser(id){

    localStorage.setItem(

    "selectedUser",

    id

    );

    window.location.href =
    "user-details.html";

}

document.getElementById(

"search"

).addEventListener(

"keyup",

function(){

const keyword =
this.value.toLowerCase();

const filtered =

allUsers.filter(user=>

user.name.toLowerCase().includes(keyword)

||

user.email.toLowerCase().includes(keyword)

);

displayUsers(filtered);

});

loadUsers();