const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema(
    {},
    {
        strict: false,
        _id: false
    }
);

const cartSchema = new mongoose.Schema({

    user: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },

    product: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Product",

        required: true

    },

    quantity: {

        type: Number,

        default: 1

    },

    customization: customizationSchema,

    finalSvg: {

        type: String,

        default: ""

    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Cart", cartSchema);