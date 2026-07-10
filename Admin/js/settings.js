// ===========================
// MindWell Admin Settings
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    const saveBtn = document.getElementById("saveBtn");

    const themeSelect = document.querySelector("select");

    const fileInput = document.querySelector('input[type="file"]');

    const adminImage = document.querySelector(".admin img");

    const inputs = document.querySelectorAll("input, select");

    let changesMade = false;

    loadSettings();
    // ===========================
    // Detect Changes
    // ===========================

    inputs.forEach(input => {

        input.addEventListener("input", () => {

            changesMade = true;

        });

        input.addEventListener("change", () => {

            changesMade = true;

        });

    });

    // ===========================
    // Save Button
    // ===========================

   saveBtn.addEventListener("click", async () => {

    
    const imageFile = document.getElementById("profileImage").files[0];

let profileImage = "";

if (imageFile) {

    const formData = new FormData();

    formData.append("profileImage", imageFile);

    const uploadResponse = await fetch("http://localhost:5000/api/admin/upload", {

        method: "POST",

        body: formData

    });

    const uploadResult = await uploadResponse.json();

    if (uploadResult.success) {
        profileImage = uploadResult.image;
    }

}
    const data = {

        name: document.getElementById("name").value,

        email: document.getElementById("email").value,

        phone: document.getElementById("phone").value,

        websiteName: document.getElementById("websiteName").value,

        supportEmail: document.getElementById("supportEmail").value,

        contactNumber: document.getElementById("contactNumber").value,

        theme: document.getElementById("theme").value,
      profileImage: profileImage || document.getElementById("adminImage").getAttribute("src"),

        notifications: {

            emailNotifications: document.getElementById("emailNotifications").checked,

            newUserAlerts: document.getElementById("newUserAlerts").checked,

            therapistRequests: document.getElementById("therapistRequests").checked,

            feedbackAlerts: document.getElementById("feedbackAlerts").checked

        }

    };
  

    try {

        const response = await fetch("http://localhost:5000/api/admin/settings", {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        alert(result.message);

    } catch (err) {

        console.log(err);

    }

});
    // ===========================
    // Theme Switching
    // ===========================

    themeSelect.addEventListener("change", () => {

        const value = themeSelect.value;

        if (value === "Dark") {

            document.body.classList.add("dark-mode");

        }

        else if (value === "Light") {

            document.body.classList.remove("dark-mode");

        }

    });

    // ===========================
    // Profile Image Preview
    // ===========================

    fileInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {

            adminImage.src = e.target.result;

        };

        reader.readAsDataURL(file);

    });

    // ===========================
    // Warn Before Leaving
    // ===========================

    window.addEventListener("beforeunload", function (e) {

        if (changesMade) {

            e.preventDefault();

            e.returnValue = "";

        }

    });

});
async function loadSettings() {

    try {

        const response = await fetch("http://localhost:5000/api/admin/settings");

        const data = await response.json();

        document.getElementById("name").value = data.name || "";
        document.getElementById("email").value = data.email || "";
        document.getElementById("phone").value = data.phone || "";

        document.getElementById("websiteName").value = data.websiteName || "";
        document.getElementById("supportEmail").value = data.supportEmail || "";
        document.getElementById("contactNumber").value = data.contactNumber || "";

        document.getElementById("theme").value = data.theme;
        if (data.theme === "Dark") {

    document.body.classList.add("dark-mode");

}
else {

    document.body.classList.remove("dark-mode");

}
if (data.profileImage && data.profileImage !== "") {

    document.getElementById("adminImage").src =
        "http://localhost:5000" + data.profileImage;

}

        document.getElementById("emailNotifications").checked = data.notifications.emailNotifications;
        document.getElementById("newUserAlerts").checked = data.notifications.newUserAlerts;
        document.getElementById("therapistRequests").checked = data.notifications.therapistRequests;
        document.getElementById("feedbackAlerts").checked = data.notifications.feedbackAlerts;

    } catch (err) {

        console.log(err);

    }

}