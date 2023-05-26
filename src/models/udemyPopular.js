const mongoose = require('mongoose');

// Define a schema for the objects
const udemyPopularSchema = mongoose.Schema({
  name: String
});

// Create a model based on the schema

module.exports = mongoose.model("UdemyPopular", udemyPopularSchema, "udemyPop")  // chage to udemyPop after testiing