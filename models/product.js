const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    customerId: String,

    product: String,

    quantity: Number,

    rate: Number
});

module.exports =
    mongoose.model(
        "Product",
        productSchema
    );