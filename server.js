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
                        new: true,
                        runValidators: true
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

        const products =
            await Product.find({
                invoiceId
            });

        const grandTotal =
            products.reduce(

                (sum, product) =>

                    sum +
                    (product.quantity * product.rate),

                0
            );

        await Invoice.findByIdAndUpdate(

            invoiceId,

            {
                grandTotal
            }
        );

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

            const product =
                await Product.findById(
                    req.params.id
                );

            if (!product) {

                return res.status(404)
                    .json({
                        message:
                            "Product Not Found"
                    });
            }

            const invoiceId =
                product.invoiceId;

            await Product.findByIdAndDelete(
                req.params.id
            );

            const products =
                await Product.find({
                    invoiceId
                });

            const grandTotal =
                products.reduce(

                    (sum, product) =>

                        sum +
                        (product.quantity *
                            product.rate),

                    0
                );

            await Invoice.findByIdAndUpdate(

                invoiceId,

                {
                    grandTotal
                }
            );

            res.json({
                message:
                    "Product Deleted"
            });

        }
        catch (error) {

            res.status(500).json({
                message:
                    "Server Error"
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
                        new: true,
                        runValidators: true
                    }
                );
            if (!updatedProduct) {

                return res.status(404).json({
                    message: "Product Not Found"
                });
            }
            const products =
                await Product.find({

                    invoiceId:
                        updatedProduct.invoiceId
                });

            const grandTotal =
                products.reduce(

                    (sum, product) =>

                        sum +
                        (product.quantity *
                            product.rate),

                    0
                );

            await Invoice.findByIdAndUpdate(

                updatedProduct.invoiceId,

                {
                    grandTotal
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

            const lastInvoice =
                await Invoice.findOne()
                    .sort({
                        createdAt: -1
                    });

            let nextNumber = 1;

            if (lastInvoice) {

                const last =
                    parseInt(

                        lastInvoice
                            .invoiceNumber
                            .split("-")[2]

                    );

                nextNumber =
                    last + 1;
            }

            const invoiceNumber =
                `INV-${new Date().getFullYear()
                }-${String(
                    nextNumber
                ).padStart(
                    4,
                    "0"
                )
                }`;

            const invoice =
                new Invoice({

                    customerId:
                        req.body.customerId,

                    invoiceNumber
                });

            await invoice.save();

            res.json(invoice);

        }
        catch (error) {

            console.log(error);

            res.status(500).json({
                message: error.message
            });
        }
    }
);
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

                .populate(
                    "customerId",
                    "name"
                )

                .sort({
                    createdAt: -1
                });

        res.json(invoices);

    }
    catch (error) {

        res.status(500).json({
            message: "Server Error"
        });
    }
});