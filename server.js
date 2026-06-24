require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
    process.env.MONGO_URI
)
    .then(() => {

        console.log("MongoDB Atlas Connected");

        app.listen(3000, () => {
            console.log("Server Running");
        });

    })
    .catch(err => {

        console.error(
            "MongoDB Connection Failed:",
            err
        );

    });

const Customer =
    require("./models/Customer");
const Product =
    require("./models/Product");

app.post("/customers", async (req, res) => {

    try {

        const customer =
            new Customer(req.body);

        await customer.save();

        res.json(customer);

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});
app.get("/customers", async (req, res) => {

    try {

        const customers =
            await Customer.find();

        res.json(customers);

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});
app.delete("/customers/:id",
    async (req, res) => {

        try {

            await Customer.findByIdAndDelete(
                req.params.id
            );

            await Product.deleteMany({
                customerId: req.params.id
            });

            res.json({
                message: "Customer Deleted"
            });

        } catch (error) {

            res.status(500).json({
                message: "Server Error"
            });
        }
    });
app.put(
    "/customers/:id",

    async (req, res) => {

        try {

            const updatedCustomer =
                await Customer.findByIdAndUpdate(

                    req.params.id,

                    req.body,

                    {
                        new: true
                    }
                );

            res.json(updatedCustomer);

        }
        catch (error) {

            res.status(500).json({
                message: "Server Error"
            });
        }
    }
);

app.post("/products", async (req, res) => {

    try {

        const {
            customerId,
            product,
            quantity,
            rate
        } = req.body;

        if (
            !customerId ||
            !product ||
            quantity <= 0 ||
            rate <= 0
        ) {
            return res.status(400).json({
                message: "Invalid Data"
            });
        }

        const newProduct =
            new Product(req.body);

        await newProduct.save();

        res.json(newProduct);

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});
app.get("/dashboard", async (req, res) => {

    try {

        const customerCount =
            await Customer.countDocuments();

        const productCount =
            await Product.countDocuments();

        res.json({

            customerCount,

            productCount
        });

    } catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});
app.get("/products/:customerId",

    async (req, res) => {

        try {

            const products =
                await Product.find({

                    customerId:
                        req.params.customerId
                });

            res.json(products);

        } catch (error) {

            res.status(500).json({
                message: "Server Error"
            });
        }
    });
app.delete(
    "/products/:id",

    async (req, res) => {

        try {

            await Product.findByIdAndDelete(
                req.params.id
            );

            res.json({
                message: "Product Deleted"
            });

        } catch (error) {

            res.status(500).json({
                message: "Server Error"
            });
        }
    }
);
app.put(
    "/products/:id",

    async (req, res) => {

        try {

            const updatedProduct =
                await Product.findByIdAndUpdate(

                    req.params.id,

                    req.body,

                    {
                        new: true
                    }
                );

            res.json(
                updatedProduct
            );

        }
        catch (error) {

            res.status(500).json({
                message: "Server Error"
            });
        }
    }
);
