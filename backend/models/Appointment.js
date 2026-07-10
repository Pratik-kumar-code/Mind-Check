const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: true
    },

    userEmail: {
        type: String,
        required: true
    },

    therapist: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    time: {
        type: String,
        required: true
    },

    reason: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
mongoose.model(
"Appointment",
appointmentSchema
);