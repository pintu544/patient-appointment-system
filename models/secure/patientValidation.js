const Yup = require('yup')
const correctPhoneNumberRegex = /^(\+98|0098|98|0)?9\d{9}$/

exports.schema = Yup.object().shape({
    userName: Yup.string()
        .required('user name should exist')
        .min(4 , "user name should not less than 4 characters")
        .max(31 , 'user name should not be more than 15 chracters'),
    phoneNumber: Yup.string()
        .required('phone number should exist')
        .matches(correctPhoneNumberRegex, 'Phone number is not  in valid form'),
    password: Yup.string()
        .min(6, "password should not less than 6 charachters")
        .max(255, "password should not more than 255 characters")
        .required("password should exist"),
    confirmPassword: Yup.string()
        .required("repeat password should exist")
        .oneOf([Yup.ref("password"), null], "password confirmation is not same as password"),
    profilePicture:Yup.object().shape({
        size: Yup.number().max(3000000, "picture should not be more than 3mg"),
        mimetype: Yup.mixed().oneOf(
            ["image/jpeg", "image/png"],
            "just jpg and png supported"
        ),
    })
})