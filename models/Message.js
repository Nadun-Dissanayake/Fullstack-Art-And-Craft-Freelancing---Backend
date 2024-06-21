const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const MessageSchema = new Schema({
    name : String,
    email : String,
    subject : String,
    message : String,
});

const messageModel = model('Message' , MessageSchema);
module.exports = messageModel;
