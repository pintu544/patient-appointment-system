const {Router} = require('express');
const doctorController = require("../controllers/doctor");

const { authenticated } = require('../middlewares/auth');

const router = new Router();

//! CRUDS
//* @desc Doctor Register Handle
//* @route POST /doctors/register
router.post("/register" , doctorController.handleDoctorRegister);

//* @desc Get All Doctors
//* @route /doctors/all
router.get('/' , doctorController.getAllDoctors);

//* @desc   Get Doctor By Id
//* @route  GET /doctors/:id
router.get('/:id' , doctorController.getDoctorById);

//* @desc Update Doctor By Id
//* @route UPDATE /doctors/:id
router.put('/:id' , doctorController.updateDoctor);

//* @desc Delete Doctor by Id
//* @route DELETE /doctors/:id
router.delete('/:id' , doctorController.deleteDoctor)

//! OTHER CUSTOMISE APIS
//* @desc Doctor Login Handle
//* @route POST /doctors/login
router.post("/login" , doctorController.handleDoctorLogin);


//* @desc Get all times of doctor full and empty both of them
//* @route GET /doctors/:id/reserve-time
router.post('/:id/reserve/times' ,authenticated , doctorController.getDoctorReserveTimes);

//* @desc patient post his selected date time of appointment and if it was empty he can reserve by this api
//* @route POST /doctors/:id/reserve.
router.post('/:id/reserve' ,authenticated ,  doctorController.reserveAppointment);

//* @desc doctor see his future and undone appointments
//* @route GET /doctors/my-appoitments/undone 
router.get('/my-appointments/list' ,authenticated ,  doctorController.getDoctorAppointments);

//* @desc doctor see the list of his patients
//* @route GET /doctors/my-patients
router.get('/my-patients/all' ,authenticated ,  doctorController.getDoctorsPatients);

//* @desc doctor see one patient treatment proccess include appointments and their result and documents
//* @route GET /doctors/my-patients/:id/treatment-proccess
router.get('/my-patients/:id/treatment-proccess' ,authenticated ,  doctorController.getDoctorTreatmentProccessWithPatient);

//* @desc doctor delete his appointment 
//* @route PUT /doctors/my-appointments/:id
router.put('/my-appointments/:id' , authenticated , doctorController.deleteAppointment)



module.exports = router;