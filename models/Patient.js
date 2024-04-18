const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {schema} = require("./secure/patientValidation")

const patientSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "username is require"],
        trim: true,
    },
    gender:{
        type:Boolean,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 255,
    },
    profilePicture:{
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

})
patientSchema.statics.patientValidation = function (body) {
    return schema.validate(body, { abortEarly: false });
};

patientSchema.pre("save", function (next) {
    let user = this;

    if (!user.isModified("password")) return next();

    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return next(err);

        user.password = hash;
        next();
    });
});
module.exports =  mongoose.model("Patient" , patientSchema)