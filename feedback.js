let rating = 0;

const stars = document.querySelectorAll(".star");

stars.forEach(star => {

    star.addEventListener("click", () => {

        rating = Number(star.dataset.value);

        stars.forEach(s => {

            if(Number(s.dataset.value) <= rating){

                s.classList.remove("fa-regular");

                s.classList.add("fa-solid");

                s.style.color = "#fbbf24";

            }

            else{

                s.classList.remove("fa-solid");

                s.classList.add("fa-regular");

                s.style.color = "#999";

            }

        });

    });

});

document.getElementById("submitBtn")

.addEventListener("click", async () => {

    const data = {

        userName:

        document.getElementById("name").value,

        userEmail:

        document.getElementById("email").value,

        rating,

        message:

        document.getElementById("message").value

    };

    if(data.userName === ""){

        alert("Enter your name");

        return;

    }

    if(data.userEmail === ""){

        alert("Enter your email");

        return;

    }

    if(rating === 0){

        alert("Select rating");

        return;

    }

    if(data.message === ""){

        alert("Enter feedback");

        return;

    }

    try{

        const response = await fetch(

        "http://localhost:5000/api/feedback",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(data)

        });

        const result = await response.json();

        alert(result.message);

        document.getElementById("message").value="";

        rating=0;

        stars.forEach(s=>{

            s.classList.remove("fa-solid");

            s.classList.add("fa-regular");

            s.style.color="#999";

        });

    }

    catch(err){

        console.log(err);

        alert("Server Error");

    }

});