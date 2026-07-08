const mongoose = require("mongoose");

const invoiceSchema =
    new mongoose.Schema({

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        invoiceNumber: {
            type: String,
            required: true
        },

        invoiceDate: {
            type: Date,
            default: Date.now
        },

        grandTotal: {
            type: Number,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ["Paid", "Unpaid"],
            default: "Unpaid"
        }
    },
        {
            timestamps: true
        });

module.exports =
    mongoose.model(
        "Invoice",
        invoiceSchema
    );