const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const {schema}  = require("./secure/doctorValidation")
const doctorSchema = new mongoose.Schema({
    userName:{
        type:String,
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
    identifyId:{
        type:String,
        required:true,
        minlength:6,
        maxlength:9
    },
    experienceYear:{
        type:Number,
        required:true
    },
    appointmentNumber:{
        type:Number,
        default:0
    },
    bioText:{
        type:String,
        maxlength:255
    },
    profilePicture:{
        type:String
    },
    insuranceSupport:{
        type:Boolean,
        required:true
    },
    degreePicture:{
        type:String
    },
    address:{
        type:String,
        required:true
    },
    expertise:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Expertise',
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})
doctorSchema.statics.doctorValidation = function (body){
    return schema.validate(body , {abortEarly: false})
}
doctorSchema.pre("save", function (next) {
    let user = this;

    if (!user.isModified("password")) return next();

    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return next(err);

        user.password = hash;
        next();
    });
});

module.exports = mongoose.model('Doctor' , doctorSchema)