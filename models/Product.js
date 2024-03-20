const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const ProductSchema = new Schema({
    product_name : String,
    price : Number,
    product_description : String,
    cover : String,
    author : {type:Schema.Types.ObjectId, ref:'User'},
},{
    timestamps: true,
});

const productModel = model('Product' , ProductSchema);
module.exports = productModel;