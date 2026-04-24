const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter your event Product name!"],
    },
     description:{
        type:String,
        required:[true, "Please enter your event Product description!"],
    },
    category:{
        type:String,
        required:[true, "Please enter your event Product category!"],
    },
    Start_Date: {
        type: Date,
        required: true
    },
    Finish_Date:{
        type: Date,
        required: true
    },
    status: {
     type: String,
     default:"Running"
    },
     tags:{
        type:String,
        required:[true, "Please enter your event Product tags!"],
    },
    originalPrice:{
        type:Number,
    },
    discountPrice:{
        type:Number,
        required:[true,"Please enter your event Product Price!"]
    },
    stock:{
        type:Number,
        required:[true,"Please enter your event Product stock!"]
    },
    images:[
        {
            type:String,
        },
    ],
      shopId:{
            type:String,
            required:true
        },
        shop:{
            type:Object,
            required:true
        },
        sold_out:{
            type:Number,
            default:0
        },
        createdAt:{
            type:Date,
            default: Date.now()
        }

})


module.exports = mongoose.model("Event", eventSchema);
