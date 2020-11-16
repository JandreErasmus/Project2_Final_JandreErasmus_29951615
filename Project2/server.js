const express = require('express');
const fileUpload = require('express-fileupload');
const lineReader = require('line-reader'); 
const data = require('./data.json');
const mongoose = require("mongoose");
var fs = require('fs');
var natural = require('natural');
var classifier = new natural.BayesClassifier();
require("dotenv").config();
array = [Date.now()];
var contents = "";

// set up mongoose

//mongodb+srv://Jandre:OhCwg0mVTJCL6nUV@main.venbh.mongodb.net/files?retryWrites=true&w=majority

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}, (err) => {
    if (err) throw err;
    console.log("MongoDB connnection established");
});


var Schema = mongoose.Schema;
var fileSchema = new Schema({
  Metadata:{type: Array}
});
var File = mongoose.model("File", fileSchema);



data.forEach(item=>{
	classifier.addDocument(item.text,item.category);
})
classifier.train();

const app = express();

app.use(fileUpload());

// Upload Endpoint

app.post('/upload', (req,res) => {
    if(req.files == null) {
        return res.status(400).json ({msg: "No file uploaded"});
    }
    const file = req.files.file;

    file.mv(`${__dirname}/client/public/uploads/${file.name}`, err =>{
        if(err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json({fileName: file.name, filePath: `/uploads/${file.name}`});
        fs.writeFileSync(`savedFiles/${file.name}`,"")
        // Data classification
        lineReader.eachLine(`client/public/uploads/${file.name}`, (line, last) => { 
        if(line.length == 13)
        {
            line="ID";
            
        }
        if(line.length == 10)
        {
            line="Telephone Number";
        }
        if(line.text == "@gmail.com" || line.text == "@outlook.com")
        {
            line = "Email";
        }
        
        contents= classifier.classify(line);
        fs.appendFileSync(`savedFiles/${file.name}`,(classifier.classify(line))+"\n"); 
        array.push(contents);
    });
    console.log(array);
    var upload = new File({
        Metadata: array
    })
    upload.save(function(error){
        console.log("File has been saved")
    if(error){
      console.log(error);
    }
    });
    array = []
    })
    
})


//server port
const PORT = process.env.PORT ||5000 ;
app.listen(PORT, () => console.log(`The server has started on port: ${PORT}`));