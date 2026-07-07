const mongoose = require("mongoose");

const productSchema =
new mongoose.Schema({

    invoiceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Invoice",
        required:true
    },

    product:{
        type:String,
        required:true
    },

    quantity:{
        type:Number,
        required:true
    },

    rate:{
        type:Number,
        required:true
    }
});

module.exports =
mongoose.model(
    "Product",
    productSchema
);