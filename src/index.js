const express = require("express");
const mongoose = require("mongoose")
require("dotenv").config();
const certificationRoutes = require("./routes/certification")
const udemyPopularRoutes = require("./routes/udemyPopular")
const courseraRoutes = require("./routes/courseraCertification")
const importRoutes = require("./routes/import")

const app = express();
const port = process.env.PORT;

//Database connection
mongoose.connect(process.env.DB_URI)
.then(()=> console.log("Connected to database"))
.catch((error) =>console.error(error))

//midleware
app.use(express.json())
app.use("/api", certificationRoutes)
app.use("/api", udemyPopularRoutes)
app.use("/api", courseraRoutes)
app.use("/api", importRoutes)


//routes 
app.get("/", (req, res) => {
    res.send("Welcome Welcome!!")
});

app.listen(port, () => console.log("server listening on port", port));
