const mongoose = require("mongoose");

const assessmentSchema =
    new mongoose.Schema({

        userName:{
        type:String,
        required:true
        },

        userEmail: {
            type: String,
            required: true
        },

        stress: {
            type: Number,
            required: true
        },

        anxiety: {
            type: Number,
            required: true
        },

        sleep: {
            type: Number,
            required: true
        },

        happiness: {
            type: Number,
            required: true
        },

        focus: {
            type: Number,
            required: true
        },

        motivation: {
            type: Number,
            required: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    });

module.exports =
    mongoose.model(
        "Assessment",
        assessmentSchema
    );