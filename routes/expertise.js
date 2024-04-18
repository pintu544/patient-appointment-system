const {Router} = require('express');
const expertiseController = require("../controllers/expertise")

const router = new Router();
//!CRUD
router.post('/' , expertiseController.createExpertise)
router.get('/' , expertiseController.getAllExpertise)
router.get('/:id' , expertiseController.getExpertiseById)
router.put('/:id' , expertiseController.updateExpertise)
router.delete('/:id' , expertiseController.deleteExpertise)


module.exports  = router