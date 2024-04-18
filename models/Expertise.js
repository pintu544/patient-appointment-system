const mongoose = require("mongoose");
const { string } = require("yup/lib/locale");

const expertiseSchema = new mongoose.Schema({
    name:{
        type:String  , 
        required:true
    },
    isHighLevel:{
        type:Boolean,
        required:true,
        default:false
    },
    expertisePicture:{
        type:String , 
        required:true
    }
})

module.exports = mongoose.model('Expertise' , expertiseSchema)