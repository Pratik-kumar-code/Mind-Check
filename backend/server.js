const multer = require("multer");
const path = require("path");
const express = require("express");
const cors = require("cors");
// const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Assessment = require("./models/Assessment");
const Appointment = require("./models/Appointment");
const Journal = require("./models/Journal");
const Admin = require("./models/Admin");
const Feedback = require("./models/Feedback");

// const Setting = require("./models/setting");

const app = express();

app.use(cors());
app.use(express.json());
//const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// Multer Configuration
// =======================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }

});

const upload = multer({ storage });

// MongoDB Connection
const mongoose = require("mongoose");
const Setting = require("./models/setting"); // Import model

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mindwell";

mongoose.connect(mongoUri)
.then(async () => {

    console.log("MongoDB Connected");

    // Create default settings if they don't exist
    const setting = await Setting.findOne();

    if (!setting) {

        await Setting.create({

            name: "Administrator",
            email: "admin@mindwell.com",
            phone: "9876543210",
            password: "admin123",
            websiteName: "MindWell",
            supportEmail: "support@mindwell.com",
            contactNumber: "9876543210",

            notifications: {
                emailNotifications: true,
                newUserAlerts: true,
                therapistRequests: true,
                feedbackAlerts: true
            },

            theme: "Light"

        });

        console.log("Default Settings Created");
    }

})
.catch((err) => {
    console.log(err);
});


async function createAdmin(){

    const admin =
        await Admin.findOne({
            email:"admin@mindwell.com"
        });

    if(!admin){

        const bcrypt =
            require("bcryptjs");

        const hashedPassword =
            await bcrypt.hash(
                "admin123",
                10
            );

        await Admin.create({

            email:
            "admin@mindwell.com",

            password:
            hashedPassword

        });

        console.log("✅ Default Admin Created");
    }

}

createAdmin();

// Home Route
app.get("/", (req, res) => {
    res.send("MindWell Backend Running 🚀");
});

// Register Route
app.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check if all fields exist
        if (!name || !email || !password) {
            return res.json({
                message: "Please fill all fields"
            });
        }

        // Check existing user
        const existingUser =
            await User.findOne({ email });

        if (existingUser) {
            return res.json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        // Save to MongoDB
        await user.save();

        res.json({
            message: "Registration Successful"
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

// Login Route
app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.json({
            message: "User not found"
        });
    }

    const isMatch =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!isMatch) {
        return res.json({
            message: "Invalid Password"
        });
    }

    res.json({
        message: "Login Successful",
        user: {
            name: user.name,
            email: user.email
        }
    });

});

// Appointment Save Route

app.post("/appointment", async (req, res) => {

    try {

        const {
            userName,
            userEmail,
            therapist,
            date,
            time
        } = req.body;

        const appointment =
            new Appointment({

                userName,
                userEmail,
                therapist,
                date,
                time
            });

        await appointment.save();

        res.json({
            message:
            "Appointment Booked Successfully"
        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

// Appointment History Route

app.get("/appointment/:email", async (req, res) => {

    try {

        const appointments =
            await Appointment.find({

                userEmail:
                req.params.email

            }).sort({
                createdAt: -1
            });

        res.json(appointments);
    }

    catch(error){

        res.status(500).json({
            message: "Server Error"
        });
    }
});

// Backend Delete Route

app.delete("/appointment/:id", async (req, res) => {

    try {

        await Appointment.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message:
            "Appointment Cancelled"
        });

    }

    catch(error){

        res.status(500).json({
            message:"Server Error"
        });
    }
});

// Backend Route

app.get("/appointment/check/:email", async (req, res) => {

    try {

        const appointment =
            await Appointment.findOne({
                userEmail: req.params.email
            });

        if (appointment) {

            return res.json({
                exists: true
            });
        }

        res.json({
            exists: false
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});

// Save Assessment Route

app.post("/assessment", async (req, res) => {

    try {

       const {
    userName,
    userEmail,
    stress,
    anxiety,
    sleep,
    happiness,
    focus,
    motivation
} = req.body;

        const assessment =
new Assessment({

    userName,
    userEmail,
    stress,
    anxiety,
    sleep,
    happiness,
    focus,
    motivation

});
        await assessment.save();

        res.json({
            message:
            "Assessment Saved Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

// Get Assessment History

app.get("/assessment/:email", async (req, res) => {

    try {

        const assessments =
            await Assessment.find({
                userEmail: req.params.email
            }).sort({ createdAt: -1 });

        res.json(assessments);

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});

//  Journal Route

app.post("/journal", async (req, res) => {

    try {

        const {
            userEmail,
            title,
            mood,
            content
        } = req.body;

        const journal =
            new Journal({

                userEmail,
                title,
                mood,
                content
            });

        await journal.save();

        res.json({
            message:
            "Journal Saved Successfully"
        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server Error"
        });
    }
});

// Delete Journal

app.delete("/journal/:id", async (req, res) => {

    try{

        await Journal.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message:"Journal Deleted Successfully"
        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server Error"
        });

    }

});

// Edit Journal

app.put("/journal/:id", async (req, res) => {

    await Journal.findByIdAndUpdate(

        req.params.id,

        req.body
    );

    res.json({
        message:
        "Journal Updated"
    });
});

// Get All Journals

app.get("/journal/:email", async (req, res) => {

    try {

        const journals =
            await Journal.find({

                userEmail:
                req.params.email

            }).sort({
                createdAt:-1
            });

        res.json(journals);

    }

    catch(error){

        res.status(500).json({
            message:"Server Error"
        });
    }
});

// Search Journal

app.get("/search/:keyword", async (req, res) => {

    const journals =
        await Journal.find({

            title: {
                $regex:
                req.params.keyword,

                $options:"i"
            }
        });

    res.json(journals);
});

// Admin Login Route

app.post("/admin/login", async (req,res)=>{

    try{

        const {email,password}=req.body;

        const admin =
            await Admin.findOne({email});

        if(!admin){

            return res.json({
                success:false,
                message:"Admin not found"
            });

        }

        const isMatch =
            await bcrypt.compare(
                password,
                admin.password
            );

        if(!isMatch){

            return res.json({

                success:false,

                message:"Incorrect Password"

            });

        }

        res.json({

            success:true,

            message:"Admin Login Successful"

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

});

// Admin Dashboard Route

app.get("/admin/dashboard", async (req, res) => {

    try {

        const totalUsers =
            await User.countDocuments();

        const totalJournals =
            await Journal.countDocuments();

        const totalAssessments =
            await Assessment.countDocuments();

        const totalAppointments =
            await Appointment.countDocuments();

        res.json({

            totalUsers,

            totalJournals,

            totalAssessments,

            totalAppointments

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            message:"Server Error"

        });

    }

});

// Get All Users

app.get("/admin/users", async (req, res) => {

    try {

        const users =
            await User.find()
            .sort({ createdAt: -1 });

        res.json(users);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

// Delete User

app.delete("/admin/users/:id", async (req, res) => {

    try {

        await User.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "User Deleted Successfully"
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/admin/user/:id", async (req,res)=>{

try{

const user =
await User.findById(
req.params.id
);

const journals =
await Journal.find({

userEmail:user.email

});

const assessments =
await Assessment.find({

userEmail:user.email

}).sort({

createdAt:-1

});

const appointments =
await Appointment.find({

userEmail:user.email

});

res.json({

user,

totalJournals:
journals.length,

totalAssessments:
assessments.length,

totalAppointments:
appointments.length,

latestAssessment:
assessments[0]

});

}

catch(error){

console.log(error);

res.status(500).json({

message:"Server Error"

});

}

});

// Admin journal route
app.get("/admin/user-journals/:id", async (req,res)=>{

try{

const user=
await User.findById(
req.params.id
);

const journals=

await Journal.find({

userEmail:user.email

}).sort({

createdAt:-1

});

res.json(journals);

}

catch(error){

console.log(error);

res.status(500).json({

message:"Server Error"

});

}

});

// Get Single Journal

app.get("/admin/journal/:id", async (req,res)=>{

    try{

        const journal =
        await Journal.findById(
        req.params.id
        );

        res.json(journal);

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            message:"Server Error"

        });

    }

});

// Get All Appointments

app.get("/admin/appointments", async(req,res)=>{

try{

const appointments=

await Appointment.find()

.sort({

date:-1

});

res.json(appointments);

}

catch(error){

res.status(500).json({

message:"Server Error"

});

}

});

app.put("/admin/appointment/:id", async(req,res)=>{

    try{

        await Appointment.findByIdAndUpdate(

            req.params.id,

            {
                status: req.body.status
            }

        );

        res.json({
            message:"Status Updated Successfully"
        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server Error"
        });

    }

});

// Get Single Appointment

app.get("/admin/appointment/:id", async(req,res)=>{

    try{

        const appointment =
        await Appointment.findById(
        req.params.id
        );

        res.json(
        appointment
        );

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            message:"Server Error"

        });

    }

});

// Delete Appointment

app.delete("/admin/appointment/:id", async (req, res) => {

    try {

        await Appointment.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "Appointment Deleted Successfully"
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/admin/overview", async (req, res) => {

    try {

        const approved =
            await Appointment.countDocuments({
                status: "Approved"
            });

        const pending =
            await Appointment.countDocuments({
                status: "Pending"
            });

        const cancelled =
            await Appointment.countDocuments({
                status: "Cancelled"
            });

        res.json({
            approved,
            pending,
            cancelled
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/admin/assessments", async (req, res) => {

    try {

        const assessments =
            await Assessment.find()
            .sort({ createdAt: -1 });

        res.json(assessments);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

// Get single assessmentroute
app.get("/admin/assessment/:id", async (req, res) => {

    try {

        const assessment =
            await Assessment.findById(
                req.params.id
            );

        res.json(assessment);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

// Delete assessment

app.delete("/admin/assessment/:id", async (req, res) => {

    try {

        await Assessment.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "Assessment Deleted"
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

app.get("/admin/assessment/:id", async(req,res)=>{

    try{

        const assessment =
        await Assessment.findById(req.params.id);

        res.json(assessment);

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            message:"Server Error"

        });

    }

});

// Delete Assessment

app.delete("/admin/assessment/:id", async(req,res)=>{

    try{

        await Assessment.findByIdAndDelete(
            req.params.id
        );

        res.json({

            message:"Assessment Deleted Successfully"

        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({

            message:"Server Error"

        });

    }

});

// Get Admin Settings
app.get("/api/admin/settings", async (req, res) => {

    try {

        const setting = await Setting.findOne();

        if (!setting) {
            return res.status(404).json({
                message: "Settings not found"
            });
        }

        res.json(setting);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});


// Update Admin Settings
app.put("/api/admin/settings", async (req, res) => {

    try {

        const setting = await Setting.findOne();

        if (!setting) {

            return res.status(404).json({
                message: "Settings not found"
            });

        }

    setting.name = req.body.name;
setting.email = req.body.email;
setting.phone = req.body.phone;

setting.websiteName = req.body.websiteName;
setting.supportEmail = req.body.supportEmail;
setting.contactNumber = req.body.contactNumber;

setting.theme = req.body.theme;

setting.notifications = req.body.notifications;

// Only update profile image if a new one was sent
if (req.body.profileImage && req.body.profileImage !== "") {

    setting.profileImage = req.body.profileImage;

}

        await setting.save();

        res.json({
            success: true,
            message: "Settings Updated",
            setting
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

// setting upload route
app.post("/api/admin/upload", upload.single("profileImage"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image selected"
            });
        }

        const setting = await Setting.findOne();

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: "Settings not found"
            });
        }

        setting.profileImage = "/uploads/" + req.file.filename;

        await setting.save();

        res.json({
            success: true,
            message: "Image uploaded successfully",
            image: setting.profileImage
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// Report route
app.get("/api/admin/report/:name", async (req, res) => {

    try {

        const user = await User.findOne({
            name: req.params.name
        });

        if (!user) {

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }

        const journals = await Journal.find({

            userEmail:user.email

        }).sort({

            createdAt:-1

        });

        const totalJournals = journals.length;

        let latestJournal = null;

        let latestMood = "-";

        let lastDate = "-";

        if(totalJournals > 0){

            latestJournal = journals[0];

            latestMood = latestJournal.mood;

            lastDate = latestJournal.createdAt;

        }

        const feedback = await Feedback.findOne({

    userEmail:user.email

}).sort({

    createdAt:-1

});

       res.json({

    success:true,

    user,

    totalJournals,

    latestMood,

    lastDate,

    latestJournal,

    feedback

});

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

// Feedback route
app.post("/api/feedback", async (req, res) => {

    try {

        const feedback = new Feedback(req.body);

        await feedback.save();

        res.json({

            success: true,

            message: "Thank you for your feedback!"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// Delete Assessment Route

app.delete("/assessment/:id", async (req, res) => {

    try {

        await Assessment.findByIdAndDelete(req.params.id);

        res.json({

            success: true,

            message: "Assessment deleted successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
