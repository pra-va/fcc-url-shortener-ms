const {Schema, model} = require("mongoose");

const urlSchema = new Schema({
    url: {type: String, required: true},
    shortenedUrl: {type: Number, default: 0, required: true},
});

const Url = model("URL", urlSchema);

model.exports = Url;