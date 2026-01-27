const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true,
        minlength : 3
    },

    pinNo : {
        type : String,
        required : true,
        minlength: 10,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique : true
    },
    password:{
        type: String,
        required: true,
        default: '12345'
    },
    branch:{
        type: String,
        required: true,
        minlength: 3
    },
    yearOfStudy:{
        type: Number,
        required : true,
    },
    role:{
        type: String,
        default : 'student'
    }
}, { timestamps : true})


const hodSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true,
        minlength : 3
    },

    hodId : {
        type : String,
        required : true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique : true
    },
    password:{
        type: String,
        required: true,
    },
    branch:{
        type: String,
        required: true,
        minlength: 3
    },
    role:{
        type: String,
        default : 'hod'
    }
}, {timestamps : true})

const adminSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true,
        minlength : 3
    },

    adminId : {
        type : String,
        required : true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique : true
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        default : 'admin'
    }
}, {timestamps : true})

const studentModel = mongoose.model('Students', studentSchema);
const hodModel = mongoose.model('Hod', hodSchema);
const adminModel = mongoose.model('Admins', adminSchema);


module.exports = {studentModel, hodModel, adminModel}