const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    doctor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required:true
    },
    patient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required:true
    },
    startDateTime:{
        type: Date,
        required:true
    },
    timePartNumber:{
        type:Number,
        required:true
    },
    result:{
        type:String,
    },
    prescription:{
        type:String
    },
    hasFinished:{
        type:Boolean,
        default:false
    },
    problemText:{
        type:String
    },
    deletedAt:{
        type: Date,
    },
})

module.exports = mongoose.model('Appointment' , appointmentSchema)