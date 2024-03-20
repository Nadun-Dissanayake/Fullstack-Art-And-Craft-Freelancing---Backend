const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const MessageSchema = new Schema({
    name : String,
    email : String,
    subject : String,
    message : String,
    author : {type:Schema.Types.ObjectId, ref:'User'},
},{
    timestamps: true,
});

const messageModel = model('Message' , MessageSchema);
module.exports = messageModel;
