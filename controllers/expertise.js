const appRoot = require("app-root-path")
const mongoose = require('mongoose');
const fs = require("fs")
const shortid = require("shortid");
const sharp = require("sharp");

const Expertise = require("../models/Expertise");
const { produceError } = require("../utils/error");

//!CRUD HANDLERS
exports.getAllExpertise = async(req ,res , next) =>{
    try{
        const expertises = await Expertise.find().select('-__v');
        if(expertises.length === 0){
            throw  produceError('there is not any expertise' , 404);
        }
        const expertisesWithPictureLink = expertises.map((item) =>{
            let itemWithPictureLink = {};
            itemWithPictureLink._id = item._id 
            itemWithPictureLink.name = item.name
            itemWithPictureLink.isHighLevel = item.isHighLevel
            itemWithPictureLink.expertisePictureLink = `http://116.203.220.194/uploads/expertises/${item.expertisePicture}`  
            return itemWithPictureLink
        })
        return res.status(200).json({expertisesWithPictureLink})
    }catch(err){
        next(err)
    }
}

exports.createExpertise = async(req , res ,next) =>{
    const expertisePicture = req.files ? req.files.expertisePicture : {}
    const fileName = `${shortid.generate()}_${expertisePicture.name}`;
    const uploadPath = `${appRoot}/public/uploads/expertises/${fileName}`
    try {

        await sharp(expertisePicture.data)
            .jpeg({quality:60})
            .toFile(uploadPath)
            .catch((err) => console.log(err))

        const expertise = await Expertise.create({
            name:req.body.name,
            isHighLevel : req.body.isHighLevel,
            expertisePicture:fileName
        })
        if(!expertise){
            throw produceError('expertise can not create' , 400);
        }
        res.status(201).json({message:"expertise created succussfully"})
    } catch (error) {
        next(error)
    }

}

exports.getExpertiseById = async(req , res , next) =>{
    try {
        if(!mongoose.isValidObjectId(req.params.id)){
            produceError('there isnot any expertise with this id' , 404)
        }
        const expertise = await Expertise.findOne({_id:req.params.id});
        if(!expertise){
            produceError('there is not any expertise with this id ' , 404);
        }
        return res.status(200).json({expertise , picture:`http://116.203.220.194/uploads/expertises/${expertise.expertisePicture}`})
    } catch (error) {
        next(error)
    }
}
exports.updateExpertise = async(req, res , next) =>{
    const expertisePicture = req.files ? req.files.expertisePicture : {}
    const fileName = `${shortid.generate()}_${expertisePicture.name}`;
    const uploadPath = `${appRoot}/public/uploads/expertises/${fileName}`
    try {
        if(!mongoose.isValidObjectId(req.params.id)){
            produceError('there isnot any expertise with this id' , 404)
        }
        const expertise = await Expertise.findById(req.params.id).select('_id name isHighLevel');
        if(!expertise){
            produceError('there is not any expertise with this id' , 404)
        }
        if(expertisePicture.name){
            fs.unlink(
                `${appRoot}/public/uploads/expertises/${expertise.expertisePicture}`,
                async (err) =>{
                    if(err) console.log(err)
                }
            )
            await sharp(expertisePicture.data)
            .jpeg({quality:60})
            .toFile(uploadPath)
            .catch((err) =>{console.log(err)})
        }
        const {name , isHighLevel} = req.body;
        expertise.name = name;
        expertise.isHighLevel = isHighLevel;
        expertise.expertisePicture = expertisePicture.name ? fileName:expertise.expertisePicture
        await expertise.save();
        return res.status(200).json({message:'expertise updated succussfully'})
    } catch (error) {
        next(error)
    }
}

exports.deleteExpertise = async(req ,res , next) =>{
    try {
        const expertise = await Expertise.findByIdAndRemove(req.params.id);
        return res.status(200).json({expertise})
    } catch (error) {
        next(error)
    }
}