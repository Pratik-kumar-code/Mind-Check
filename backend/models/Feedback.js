const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({

    userEmail: {
        type: String,
        required: true
    },

    userName: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    message: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Feedback", feedbackSchema);