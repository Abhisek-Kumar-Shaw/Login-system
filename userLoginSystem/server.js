
const express = require('express');
const mongoose = require('mongoose');
const DbConnect = require("./config/database.config");


const app = express();
const PORT =  5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("",require("./routes/route"))







app.listen(PORT,()=>{
    console.log(`server started at http://localhost:${PORT}`);
})