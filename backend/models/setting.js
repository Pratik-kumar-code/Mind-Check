const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        default: ""
    },

    password: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
        default: ""
    },

    websiteName: {
        type: String,
        default: "MindWell"
    },

    supportEmail: {
        type: String,
        default: ""
    },

    contactNumber: {
        type: String,
        default: ""
    },

    notifications: {

        emailNotifications: {
            type: Boolean,
            default: true
        },

        newUserAlerts: {
            type: Boolean,
            default: true
        },

        therapistRequests: {
            type: Boolean,
            default: true
        },

        feedbackAlerts: {
            type: Boolean,
            default: true
        }

    },

    theme: {

        type: String,

        enum: ["Light", "Dark", "System Default"],

        default: "Light"

    }

}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);