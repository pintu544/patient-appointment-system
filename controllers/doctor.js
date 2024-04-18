const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const shortId = require("shortid");
const appRoot = require("app-root-path")
const fs = require("fs")

const Doctor = require("../models/Doctor")
const Expertise = require("../models/Expertise")
const { produceError } = require("../utils/error");
const Appointment = require("../models/Appointment");
const sharp = require("sharp");
const Patient = require("../models/Patient");


//!CRUD HANDLRES
exports.handleDoctorRegister = async (req , res , next) => {
    const profilePicture = req.files ? req.files.profilePicture : {};
    const fileName = `${shortId.generate()}_${profilePicture.name}`;
    const uploadPath = `${appRoot}/public/uploads/doctors/profs/${fileName}`;
    // userName , phoneNumber , password , identifyId , experienceYear , bioText , insuranceSupport , expertise
    try {
        const {phoneNumber , expertise} = req.body;
        const doctor = await Doctor.findOne({phoneNumber});
        
        if(doctor){
            throw produceError('doctor already exists' , 422)
        }
        else{
            
            await Doctor.doctorValidation({...req.body , profilePicture});
            
            const exp = await Expertise.findById(expertise)
            if(!exp){
                throw produceError('expertise with that id doesnt exist' , 400);
            }
            
            await sharp(profilePicture.data)
                .jpeg({quality:60})
                .toFile(uploadPath)
                .catch((err) => console.log(err))

            await Doctor.create({...req.body , profilePicture:fileName});
            
            res.status(201).json({message:"Doctor registered succussfully"})
        }
    } catch (error) {
        next(error)
    }

}
exports.getAllDoctors = async (req , res , next) => {
    let filter = {}
    try {
        if(req.query.expertises){
            filter = {expertise: req.query.expertises.split(',')}
        }
        const doctorsList  = await Doctor.find(filter).select('userName expertise experienceYear profilePicture address').populate({path:'expertise' , select:['name' , 'isHighLevel']})
        const doctorsListWithProfileLinks = doctorsList.map((item) =>{
            let doctorWithProfileLink = {}
            doctorWithProfileLink._id = item._id
            doctorWithProfileLink.userName = item.userName
            doctorWithProfileLink.expertise = item.expertise
            doctorWithProfileLink.experienceYear = item.experienceYear
            doctorWithProfileLink.address = item.address
            doctorWithProfileLink.profilePicture = `http://116.203.220.194/uploads/doctors/profs/${item.profilePicture}`
            return doctorWithProfileLink
        })
        if(!doctorsList){
            throw produceError('there is not any doctor with this filter' , 404)
        }
        res.status(200).json({doctorsListWithProfileLinks , succuss:true})        
    } catch (error) {
        next(error)
    }
}

exports.getDoctorById = async(req , res , next) => {
    try {
        if(!mongoose.isValidObjectId(req.params.id)){
            throw produceError('doctor doesnt exist with id')
        }
        const doctor = await Doctor.findById(req.params.id).select('userName expertise experienceYear insuranceSupport appointmentNumber identifyId bioText profilePicture address').populate({path:'expertise' , select:['name' , 'isHighLevel']});
        if(!doctor){
            throw produceError('doctor doesnt exist with this id')
        }        
        res.status(200).json({doctor , success:true , profile:`http://116.203.220.194/uploads/doctors/profs/${doctor.profilePicture}`})
    } catch (error) {
        next(error)
    }

}
exports.updateDoctor = async(req , res , next) =>{
    const profilePicture = req.files ? req.files.profilePicture :{}
    const fileName = `${shortId.generate()}_${profilePicture.name}`
    const uploadPath = `${appRoot}/public/uploads/doctors/profs/${fileName}`;
    try {
        const doctor = await Doctor.findById({_id:req.params.id})
        if(profilePicture.name){
            await Doctor.doctorValidation({...req.body , profilePicture:profilePicture})
        }
        else{
            await Doctor.doctorValidation({
                ...req.body,
                profilePicture:{
                    name :"placeholder",
                    size:0,
                    mimtype:"image/jpeg"
                }
            })
        }
        if(!doctor){
            throw produceError('there is not any doctor with this id' , 404)
        }
        const exp = await Expertise.findById(req.body.expertise)
        if(!exp){
            throw produceError('there is not any expertise with this id'  , 404)
        }
        if(profilePicture.name){
            fs.unlink(
                `${appRoot}/public/uploads/doctors/profs/${doctor.profilePicture}`,
                async (err) =>{
                    if(err) console.log(err)
                }
            )
            await sharp(profilePicture.data)
            .jpeg({quality:60})
            .toFile(uploadPath)
            .catch((err) =>{console.log(err)})
        }
        const {userName , phoneNumber , password , identifyId , experienceYear , bioText , insuranceSupport , expertise , address} = req.body
        doctor.userName = userName 
        doctor.phoneNumber = phoneNumber
        doctor.password = password
        doctor.identifyId = identifyId
        doctor.experienceYear = experienceYear
        doctor.bioText = bioText
        doctor.insuranceSupport = insuranceSupport
        doctor.expertise = expertise
        doctor.profilePicture = profilePicture.name ? fileName:doctor.profilePicture
        doctor.address = address
        await doctor.save()
        return res.status(200).json({message:"doctor updated succussfully"})
    } catch (error) {
        next(error)
    }
}

exports.deleteDoctor = async(req , res , next) =>{
    try {
        const doctor = await Doctor.findByIdAndRemove(req.params.id).select('userName')
        if(!doctor){
            throw produceError('there is not any doctor with this id' , 404)
        }
        return res.status(200).json({message:'doctor deleted succussfully' , data:doctor})
    } catch (error) {
        next(error)
    }
}
//!================OTHER CUSTOMISE API HANDLERS====================//
exports.handleDoctorLogin = async(req , res , next) => {
    const {phoneNumber , password} = req.body;
    try {
        const doctor = await Doctor.findOne({phoneNumber});
        if(!doctor){
            throw produceError('there isnt any patient with this data' , 404);
        }
        const isEqual = await bcrypt.compare(password , doctor.password);
        if(isEqual){
            const token = jwt.sign({
                userId:doctor._id.toString() ,
                phoneNumber:doctor.phoneNumber,
                userName:doctor.userName
            },
            process.env.JWT_SECRET,
            {
                    expiresIn:"1h"
            })
            res.status(200).json({token})
        }
        else{
            throw produceError('phone number or password is wrong' , 422);
        }
    } catch (error) {
        next(error)
    }
}
exports.getDoctorReserveTimes = async (req , res , next) =>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            throw produceError('doctor doesnt exist with id' , 404)
        }
        const timePartNumbers  =  await Appointment.find({
            "startDateTime":{ $eq: req.body.startDateTime },
            doctor:req.params.id
        }).select('timePartNumber')
        res.status(200).json({timePartNumbers})
    }catch(err){
        next()
    }
}
exports.reserveAppointment =  async(req , res , next) =>{
    try {
        const {startDateTime , timePartNumber , problemText} = req.body
        //* check  appointment time is free 
        //timePartNumber:timePartNumber , "startDateTime":{ $eq: req.body.startDateTime }
        const reservedAppointment = await Appointment.find({doctor:req.params.id , timePartNumber:timePartNumber , "startDateTime":{ $eq: req.body.startDateTime }})
        if(reservedAppointment.length != 0){
            throw produceError('this time has been reserved by some patient' , 400)
        }
        //* reservation
        const appointment  = await Appointment.create({
            doctor:req.params.id , 
            patient:req.userId , 
            startDateTime:startDateTime,
            problemText:problemText,
            timePartNumber:timePartNumber
        }) 
        if(!appointment){
            throw produceError('can not save appointment' , 400)
        }
        //* increase doctor appointment number one unit
        const doctor = await Doctor.findById({ _id: req.params.id})
        doctor.appointmentNumber += 1
        doctor.save()

        res.status(201).json({message:"appointment reserved succussfully", success:true})

    } catch (error) {
        next(error)
    }
}

exports.getDoctorsPatients = async(req , res , next) => {
    try {
        let patients  = await Appointment.find({doctor:req.userId}).select('patient -_id').populate({path:'patient' , select:['userName', 'gender']})
        
        //* returning unique patients
        const uniquePatients = Array.from(new Set(patients.map(a => a.id)))
            .map(id => {
                return patients.find(a => a.id === id)
        })
        patients = [...uniquePatients];
    
        if(!patients){
            throw produceError('this doctor has not any patient' , 404)
        }
        res.status(200).json({patients})
    } catch (error) {
        next(error)
    }   
}
exports.getDoctorAppointments = async(req  , res , next) =>{
    try{
        const appointments = await Appointment.find({doctor:req.userId}).select('patient  startDateTime timePartNumber').populate({path:'patient' , select:['userName', 'gender']});
        if(!appointments){
            throw produceError('there isnt any  appointment with doctor' ,  404)
        }
        console.log(appointments)
        res.status(200).json({appointments})
    } catch(error){
        next(error)
    }

}

exports.getDoctorTreatmentProccessWithPatient = async (req , res , next) =>{
    try {
        //* return and validate patient with req.param id 
        if(!mongoose.isValidObjectId(req.params.id)){
            throw produceError('patient doesnt exist with id')
        }
        const patient = await Patient.findById(req.params.id).select('userName gender');
        if(!patient){
            throw produceError('patient doesnt exist with this id')
        }
        //* returning appointments with that patient 
        const medicalDocument = await Appointment.find({doctor:req.userId , patient:req.params.id}).select('startDateTime timePartNumber result , hasFinished')
        if(!medicalDocument){
            throw produceError('there is not any appointment with doctor and this patient  ' , 400)
        }
        res.status(200).json({ patient , medicalDocument})        
    } catch (error) {
        next(error)
    }


} 

exports.deleteAppointment = async (req , res , next) =>{
    try {
        if(!mongoose.isValidObjectId(req.params.id)){
            produceError('there is not any appointment with this id' , 404)
        }
        const appointment  = await Appointment.findById(req.params.id);
        if(!appointment){
            produceError('there is not any appointment with this id' , 404)
        }

        appointment.deletedAt = Date.now()
        await appointment.save();
        
        return res.status(200).json({success: true , appointment})
    } catch (error) {
        next(error)
    }
}
