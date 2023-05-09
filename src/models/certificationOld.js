const mongoose = require("mongoose");

const certificationSchema = mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    org: {
        type: String,
        required: true,
    },
    certification: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("Certification", certificationSchema, "certificationTest")