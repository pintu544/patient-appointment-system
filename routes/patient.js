const {Router} = require("express");
const patientController = require("../controllers/patient");
const { authenticated } = require("../middlewares/auth");
const router = new Router();

//!CRUD
//* @desc Patient Register Handle
//* @route POST /patients/register
router.post("/register" , patientController.handlePatientRegister);

//* @desc Get All patients
//* @route GET /patients/
router.get('/' , patientController.getAllPatients);

//* @desc Get Patient By Id
//* @route GET /patients/:id
router.get('/:id' , patientController.getPatientById);

//* @desc Update patient By Id
//* @route PUT /patient/:id
router.put('/:id' , patientController.updatePatient);

//* @desc Delete patient By Id
//* @route DELETE /patient/:id
router.delete('/:id' , patientController.deletePatient);

//! OTHER CUSTOMISE APIS
//* @desc Patient Login Handle
//* @route POST /patients/login
router.post("/login" , patientController.handlePatientLogin);

//* @desc Patient See his appointment in funture in home page
//* @route Get /patients/appointmetns/undone
router.get("/appointments/undone" , authenticated ,patientController.getPatientUndoneAppointments);

//* @desc Patient get doctors who have or had appointment with him
//* @route Get /patients/my-doctors/
router.get("/doctors/reserved" , authenticated , patientController.getPatientDoctors)

//* @desc Patient get his treatment proccess contain of appointments and their result and prescription with one doctor
//* @route POST /patients/my-doctors/:id/treatment-proccess
router.get("/my-doctors/:id/treatment-proccess", authenticated , patientController.getPatientTreatmentProccessWithDoctor);

//* @desc Patient get his profile data 
//* @route GET /patients/profile
router.get("/profile/data" , authenticated ,patientController.getMyProfile)

//* @desc Patient Update his profile data (without password)
//* @route PUT /patients/profile/update
router.put("/profile/update" , authenticated ,patientController.updateMyProfile)

//* @desc patient delete his appointment 
//* @route PUT /patients/my-appointments/:id
router.put('/my-appointments/:id' , authenticated , patientController.deleteAppointment)

module.exports = router;