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

        const PORT =
            process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(
                `Server Running on Port ${PORT}`
            );
        });

    })
    .catch(err => {

        console.error(
            "MongoDB Connection Failed:",
            err
        );

    });

const Customer =
    require("./models/customer");
const Product =
    require("./models/product");
const Invoice =
    require("./models/invoice");

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

            const invoices =
                await Invoice.find({

                    customerId:
                        req.params.id
                });

            const invoiceIds =
                invoices.map(
                    invoice => invoice._id
                );

            await Product.deleteMany({

                invoiceId: {
                    $in: invoiceIds
                }
            });

            await Invoice.deleteMany({

                customerId:
                    req.params.id
            });

            await Customer.findByIdAndDelete(
                req.params.id
            );

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
            invoiceId,
            product,
            quantity,
            rate
        } = req.body;

        if (
            !invoiceId ||
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
app.get(
    "/products/:invoiceId",

    async (req, res) => {

        try {

            const products =
                await Product.find({
                    invoiceId:
                        req.params.invoiceId
                });

            res.json(products);

        } catch (error) {

            res.status(500).json({
                message: "Server Error"
            });
        }
    }
);
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
app.post(
    "/invoices",

    async (req, res) => {

        try {

            const invoiceCount =
                await Invoice.countDocuments();

            const invoice =
                new Invoice({

                    customerId:
                        req.body.customerId,

                    invoiceNumber:
                        `INV-${Date.now()}`
                }); f

            await invoice.save();

            res.json(invoice);

        }
        catch (error) {

            res.status(500).json({
                message: "Server Error"
            });
        }
    });
app.get(
    "/invoices/:customerId",

    async (req, res) => {

        try {

            const invoices =
                await Invoice.find({

                    customerId:
                        req.params.customerId
                });

            res.json(invoices);

        }
        catch (error) {

            res.status(500).json({
                message: "Server Error"
            });
        }
    });
app.get("/invoice-count", async (req, res) => {

    try {

        const invoiceCount =
            await Invoice.countDocuments();

        res.json({
            invoiceCount
        });

    }
    catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});
app.get("/recent-invoices", async (req, res) => {

    try {

        const invoices =
            await Invoice.find()
                .sort({ createdAt: -1 });

        res.json(invoices);

    }
    catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});