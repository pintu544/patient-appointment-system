const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const appRoot = require('app-root-path')
const fs = require("fs")
const mongoose = require('mongoose')
const shortid = require("shortid");

const { produceError } = require("../utils/error");
const Appointment = require("../models/Appointment");
const sharp = require("sharp");



//!CRUD HANDLERS
exports.handlePatientRegister = async (req ,res , next) =>{
    try {
        await Patient.patientValidation(req.body)
        const {userName , phoneNumber , password , gender} = req.body;
        const patient = await Patient.findOne({phoneNumber});
        if(patient){
            throw produceError('patient already exists' , 422)
        }
        else{
            await Patient.create({userName , gender , phoneNumber , password })
            res.status(201).json({message:"patient registered succussfully"})
        }        
    } catch (error) {
        next(error)
    }
}

exports.getAllPatients = async (req, res , next) =>{
    try {
        const patients = await Patient.find({}).select('userName gender phoneNumber');
        if(patients.length === 0){
            throw produceError('there is not any patient' , 404)
        }
        return res.status(200).json({patients}) 
    } catch (error) {
        next(error)
    }
}
exports.getPatientById = async (req , res , next) =>{
    try {
        const patient = await Patient.findById(req.params.id).select('userName phoneNumber gender profilePicture')
        if(!patient || !mongoose.isValidObjectId(req.params.id)){
            throw produceError('there is not any patient with this id' , 404)
        }
        return res.status(200).json({patient , profile:`http://116.203.220.194/uploads/patients/profs/${patient.profilePicture}`})
    } catch (error) {
        next(error)
    }
}

exports.deletePatient  = async (req, res , next) =>{
    try {
        const patient = await Patient.findByIdAndRemove(req.params.id).select('userName phoneNumber , profilePicture') 
        const filePath = `${appRoot}/public/uploads/patients/profs/${patient.profilePicture}`;
        fs.unlink(filePath , async(err) =>{
            if(err){
                 console.log(err)
            }
        })
        return res.status(200).json({message:'patient deleted succussfully' , data:patient})

    } catch (error) {
        next(error)
    }
}
exports.updatePatient = async (req , res , next) =>{
    const profilePicture = req.files ? req.files.profilePicture :{}
    const fileName = `${shortid.generate()}_${profilePicture.name}`
    const uploadPath = `${appRoot}/public/uploads/patients/profs/${fileName}`;
    try {
        const patient = await Patient.findById({_id: req.params.id});
        if(profilePicture.name){
            await Patient.patientValidation({...req.body , profilePicture})
        }
        else{
            await Patient.patientValidation({
                ...req.body,
                profilePicture:{
                    name :"placeholder",
                    size:0,
                    mimtype:"image/jpeg"
                }
            })
        }
        if(!patient){
            throw produceError('ther is not any patient with this id' , 404)
        }
        if(profilePicture.name){
            fs.unlink(
                `${appRoot}/public/uploads/patients/profs/${patient.profilePicture}`,
                async (err) =>{
                    if(err) console.log(err)
                }
            )
            await sharp(profilePicture.data)
            .jpeg({quality:60})
            .toFile(uploadPath)
            .catch((err) =>{console.log(err)})
        }
        const {userName , phoneNumber , password  , gender} = req.body;
        patient.userName =userName
        patient.phoneNumber = phoneNumber
        patient.password = password;
        patient.gender = gender;
        patient.profilePicture = profilePicture.name ? fileName:patient.profilePicture
        await patient.save();
        return res.status(200).json({message:'patient updated succussfully' , data:patient})
    } catch (error) {
        next(error)
    }
}
//! CUSTOMISE API HANDLERS
exports.handlePatientLogin = async(req ,res ,next) =>{
    const {phoneNumber , password} = req.body;
    try {
        const patient = await Patient.findOne({phoneNumber});
        if(!patient){
            throw produceError('there isnt any patient with this data' , 404);
        }
        const isEqual = await bcrypt.compare(password , patient.password);
        if(isEqual){
            const token = jwt.sign({
                userId:patient._id.toString() ,
                phoneNumber:patient.phoneNumber,
                userName:patient.userName
            },
            process.env.JWT_SECRET,
            {
                    expiresIn:"12h"
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

exports.getPatientUndoneAppointments = async (req ,res , next) =>{
    try {
        const appointments = await Appointment.find({patient:req.userId , hasFinished:false}).select('doctor startDateTime timePartNumber problemText -_id').populate({path:'doctor' , select:['userName' , 'profilePicture'] , populate:{path:'expertise' , select:['name' , 'isHighLevel'] }})
        if(appointments.length === 0){
            throw produceError('there is not any  unfinished appointment ', 404)
        }
        const appointmentsWithPictureLink = appointments.map((item) =>{
            return{
                profile : `http://116.203.220.194/uploads/doctors/profs/${item.doctor.profilePicture}`,
                doctor : item.doctor ,
                startDateTime:item.startDateTime,
                timePartNumber:item.timePartNumber,
                problemText:item.problemText
            }

        })
        res.status(200).json({appointmentsWithPictureLink , success:true})        
    } catch (error) {
        next(error)
    }

}

exports.getPatientDoctors = async (req ,res ,next) =>{
    try {
        const doctors =  await Appointment.find({patient:req.userId}).select('doctor -_id').populate({path:'doctor' , select:['userName'] , populate:{path:'expertise' , select:['name' , 'isHighLevel']}})
        if(doctors.length === 0){
            throw produceError('this patient doesnt have any doctor ', 404)
        }
        res.status(200).json({doctors})        
    } catch (error) {
        next(error)
    }

}

exports.getPatientTreatmentProccessWithDoctor = async (req , res , next) =>{
    try {
        const appointments = await Appointment.find({doctor:req.params.id , patient: req.userId}).select('startDateTime timePartNumber hasFinished result problemText')
        if(appointments.length === 0){
            throw produceError('this patient doesnt have any appointment with this doctor ', 404)
        } 
        res.status(200).json({appointments , success:true})        
    } catch (error) {
        next(error)
    }

}

exports.getMyProfile = async (req, res , next) =>{
    try {
        const patientProfile = await Patient.findById(req.userId).select('userName gender phoneNumber profilePicture')
        if(!patientProfile){
            throw produceError('patient doesnt exist anymore' , 404)
        }
        let picture = `http://116.203.220.194/uploads/patients/profs/${patientProfile.profilePicture}`
        if(patientProfile.profilePicture == undefined){
            picture = `null`
        }
        return res.status(200).json({patientProfile , profilePicture:picture})
    } catch (error) {
        next(error)
    }
}

exports.updateMyProfile = async (req , res , next) =>{
    const profilePicture = req.files ? req.files.profilePicture :{}
    const fileName = `${shortid.generate()}_${profilePicture.name}`
    const uploadPath = `${appRoot}/public/uploads/patients/profs/${fileName}`;
    try {
        const patient = await Patient.findById(req.userId).select('userName phoneNumber gender profilePicture');
        // if(profilePicture.name){
        //     await Patient.updatePatientValidation({...req.body , profilePicture})
        // }
        // else{
        //     await Patient.updatePatientValidation({
        //         ...req.body,
        //         profilePicture:{
        //             name :"placeholder",
        //             size:0,
        //             mimtype:"image/jpeg"
        //         }
        //     })
        // }
        if(!patient){
            throw produceError('ther is not any patient with this id' , 404)
        }
        if(profilePicture.name){
            fs.unlink(
                `${appRoot}/public/uploads/patients/profs/${patient.profilePicture}`,
                async (err) =>{
                    if(err) console.log(err)
                }
            )
            await sharp(profilePicture.data)
            .jpeg({quality:60})
            .toFile(uploadPath)
            .catch((err) =>{console.log(err)})
        }
        const {userName , phoneNumber , gender} = req.body;
        patient.userName =userName
        patient.phoneNumber = phoneNumber
        patient.gender = gender;
        patient.profilePicture = profilePicture.name ? fileName:patient.profilePicture
        await patient.save();
        return res.status(200).json({message:'patient  profile updated succussfully' , data:patient , profile:`http://116.203.220.194/uploads/patients/profs/${patient.profilePicture}`})
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