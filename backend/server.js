const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
// const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");    // above this all are node.js library
const User = require("./models/user"); // ./ means- all these are directory files
const Assessment = require("./models/Assessment");
const Appointment = require("./models/Appointment");
const Journal = require("./models/Journal");
const Admin = require("./models/Admin");
const Feedback = require("./models/Feedback");

// const Setting = require("./models/setting");

const app = express();
const allowedOrigins = [
    "https://majestic-buttercream-ebf9a3.netlify.app",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean) : [])
];

app.use(cors({
    origin(origin, callback) {
        // Requests from the static site and non-browser clients have no Origin header.
        // Netlify preview/production deploy URLs change, so accept HTTPS Netlify origins
        // in addition to the explicitly configured production URL(s).
        let isNetlifyOrigin = false;
        try {
            const url = new URL(origin);
            isNetlifyOrigin = url.protocol === "https:" && url.hostname.endsWith(".netlify.app");
        } catch (_) { /* origin is absent or malformed */ }
        if (!origin || allowedOrigins.includes(origin) || isNetlifyOrigin) return callback(null, true);
        return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
//const path = require("path");

const uploadsDirectory = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDirectory, { recursive: true });
app.use("/uploads", express.static(uploadsDirectory));

// =======================
// Multer Configuration
// =======================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadsDirectory);
    },

    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }

});

const upload = multer({ storage });

const authSecret = process.env.AUTH_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.AUTH_SECRET) console.warn("AUTH_SECRET is not configured; sessions will reset when the server restarts.");
const signToken = (payload) => {
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString("base64url");
    const signature = crypto.createHmac("sha256", authSecret).update(body).digest("base64url");
    return `${body}.${signature}`;
};
const authenticate = (role) => (req, res, next) => {
    const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ message: "Authentication is required" });
    const [body, signature] = token.split(".");
    const expected = crypto.createHmac("sha256", authSecret).update(body || "").digest("base64url");
    if (!body || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json({ message: "Invalid session" });
    try {
        const session = JSON.parse(Buffer.from(body, "base64url").toString());
        if (session.exp < Date.now() || session.role !== role) return res.status(401).json({ message: "Session expired or unauthorized" });
        req.session = session;
        next();
    } catch (_) { return res.status(401).json({ message: "Invalid session" }); }
};
const requireUser = authenticate("user");
const requireAdmin = authenticate("admin");
const ensureCurrentUser = (req, res, email) => {
    if (req.session.email !== String(email || "").trim().toLowerCase()) {
        res.status(403).json({ message: "You do not have access to this data" });
        return false;
    }
    return true;
};

// MongoDB Connection
const mongoose = require("mongoose");
const Setting = require("./models/setting"); // Import model

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mindwell";
let databaseReady = false;
let databaseError = null;

mongoose.connection.on("connected", () => {
    databaseReady = true;
    databaseError = null;
    console.log("MongoDB Connected");
});
mongoose.connection.on("disconnected", () => { databaseReady = false; });
mongoose.connection.on("error", (error) => {
    databaseReady = false;
    databaseError = error;
    console.error("MongoDB connection error:", error.message);
});

const databaseConnection = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10
});

databaseConnection
.then(async () => {

    console.log("MongoDB Connected");

    // Create default settings if they don't exist
    const setting = await Setting.findOne();

    if (!setting) {

        await Setting.create({

            name: "Administrator",
            email: "admin@mindwell.com",
            phone: "9876543210",
            password: process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!",
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
    console.error("MongoDB startup connection failed:", err.message);
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
                process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!",
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

databaseConnection.then(createAdmin).catch((error) => {
    console.error("Default admin setup skipped:", error.message);
});

app.get("/api/health", (req, res) => {
    res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? "ok" : "starting",
        database: databaseReady ? "connected" : "disconnected",
        error: databaseError ? databaseError.message : undefined
    });
});

// Fail fast while MongoDB is unavailable instead of buffering requests for minutes.
app.use((req, res, next) => {
    if (req.path === "/api/health" || req.path === "/") return next();
    if (!databaseReady) {
        return res.status(503).json({ message: "Service is starting. Please try again in a moment." });
    }
    next();
});

// Home Route
app.get("/", (req, res) => {
    res.send("MindWell Backend Running 🚀");
});

// Register Route
app.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;
        const normalizedEmail = email && email.trim().toLowerCase();

        // Check if all fields exist
        if (!name || !email || !password) {
            return res.json({
                message: "Please fill all fields"
            });
        }

        // Check existing user
        const existingUser =
            await User.findOne({ email: normalizedEmail });

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
            email: normalizedEmail,
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
 try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });

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
        token: signToken({ role: "user", email: user.email }),
        user: {
            name: user.name,
            email: user.email
        }
    });
 } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error" });
 }

});

// Appointment Save Route

app.post("/appointment", requireUser, async (req, res) => {

    try {

        const {
            userName,
            userEmail,
            therapist,
            date,
            time
        } = req.body;
        if (!ensureCurrentUser(req, res, userEmail)) return;
        if (!userName || !therapist || !date || !time) return res.status(400).json({ message: "Please complete all appointment fields" });

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

app.get("/appointment/:email", requireUser, async (req, res) => {

    try {

        if (!ensureCurrentUser(req, res, req.params.email)) return;

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

app.delete("/appointment/:id", requireUser, async (req, res) => {

    try {

        const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, userEmail: req.session.email });
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

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

app.get("/appointment/check/:email", requireUser, async (req, res) => {

    try {

        if (!ensureCurrentUser(req, res, req.params.email)) return;

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

app.post("/assessment", requireUser, async (req, res) => {

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
        if (!ensureCurrentUser(req, res, userEmail)) return;
        if (![stress, anxiety, sleep, happiness, focus, motivation].every((value) => Number.isFinite(Number(value)) && Number(value) >= 1 && Number(value) <= 10)) return res.status(400).json({ message: "Assessment scores must be between 1 and 10" });

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

app.get("/assessment/:email", requireUser, async (req, res) => {

    try {

        if (!ensureCurrentUser(req, res, req.params.email)) return;

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

app.post("/journal", requireUser, async (req, res) => {

    try {

        const {
            userEmail,
            title,
            mood,
            content
        } = req.body;
        if (!ensureCurrentUser(req, res, userEmail)) return;
        if (!title || !mood || !content) return res.status(400).json({ message: "Please complete all journal fields" });

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

app.delete("/journal/:id", requireUser, async (req, res) => {

    try{

        const journal = await Journal.findOneAndDelete({ _id: req.params.id, userEmail: req.session.email });
        if (!journal) return res.status(404).json({ message: "Journal entry not found" });

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

app.put("/journal/:id", requireUser, async (req, res) => {

    try {
        const journal = await Journal.findOneAndUpdate({ _id: req.params.id, userEmail: req.session.email }, req.body, { new: true, runValidators: true });
        if (!journal) return res.status(404).json({ message: "Journal entry not found" });
        res.json({ message: "Journal Updated", journal });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
});

// Get All Journals

app.get("/journal/:email", requireUser, async (req, res) => {

    try {

        if (!ensureCurrentUser(req, res, req.params.email)) return;

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

app.get("/search/:keyword", requireUser, async (req, res) => {

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

            message:"Admin Login Successful",
            token: signToken({ role: "admin", email: admin.email })

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

app.get("/admin/dashboard", requireAdmin, async (req, res) => {

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

app.get("/admin/users", requireAdmin, async (req, res) => {

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

app.delete("/admin/users/:id", requireAdmin, async (req, res) => {

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

app.get("/admin/user/:id", requireAdmin, async (req,res)=>{

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
app.get("/admin/user-journals/:id", requireAdmin, async (req,res)=>{

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

app.get("/admin/journal/:id", requireAdmin, async (req,res)=>{

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

app.get("/admin/appointments", requireAdmin, async(req,res)=>{

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

app.put("/admin/appointment/:id", requireAdmin, async(req,res)=>{

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

app.get("/admin/appointment/:id", requireAdmin, async(req,res)=>{

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

app.delete("/admin/appointment/:id", requireAdmin, async (req, res) => {

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

app.get("/admin/overview", requireAdmin, async (req, res) => {

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

app.get("/admin/assessments", requireAdmin, async (req, res) => {

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
app.get("/admin/assessment/:id", requireAdmin, async (req, res) => {

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

app.delete("/admin/assessment/:id", requireAdmin, async (req, res) => {

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

app.get("/admin/assessment/:id", requireAdmin, async(req,res)=>{

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

app.delete("/admin/assessment/:id", requireAdmin, async(req,res)=>{

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
app.get("/api/admin/settings", requireAdmin, async (req, res) => {

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
app.put("/api/admin/settings", requireAdmin, async (req, res) => {

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
app.post("/api/admin/upload", requireAdmin, upload.single("profileImage"), async (req, res) => {

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
app.get("/api/admin/report/:name", requireAdmin, async (req, res) => {

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
app.post("/api/feedback", requireUser, async (req, res) => {

    try {

        if (!ensureCurrentUser(req, res, req.body.userEmail)) return;
        if (!req.body.userName || !req.body.message || !Number.isInteger(Number(req.body.rating)) || Number(req.body.rating) < 1 || Number(req.body.rating) > 5) return res.status(400).json({ success: false, message: "Please provide a name, message, and rating from 1 to 5" });

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

app.delete("/assessment/:id", requireUser, async (req, res) => {

    try {

        const assessment = await Assessment.findOneAndDelete({ _id: req.params.id, userEmail: req.session.email });
        if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

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

app.use((error, req, res, next) => {
    if (error.message === "Origin not allowed by CORS") {
        return res.status(403).json({ message: "This website is not permitted to access the MindWell API" });
    }
    console.error("Unhandled server error:", error);
    res.status(500).json({ message: "Server Error" });
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
