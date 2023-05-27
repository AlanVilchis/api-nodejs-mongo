const express = require("express");
const puppeteer = require('puppeteer');
const router = express.Router();
const courseraCertificationSchema = require("../models/courseraCertification")



// UPDATE into database from coursera
router.get("/coursera/update/certification", async (req, res) => {
    //Update
    await courseraCertificationSchema.deleteMany({});

    const browser = await puppeteer.launch({
        headless: false,
        //userDataDir: "./tmp"
    });
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en',
    });
    
    const titleList = [];
    const fatherList = [".css-14m29r0"]
    //[#professional-certificates", "#mastertrack", "#university-certificates"] //fatherList all but last section
    const sonList = ["p.cds-33.css-13n3rak.cds-35","p.cds-119.css-13n3rak.cds-121"]
    const url = "https://www.coursera.org/certificates/computer-science-it"
    
    await page.goto(url);
     await page.waitForSelector('.rc-ExpandedCertsList');
     let existentElementPtr = 0;
     const elementExists = await page.$(sonList[existentElementPtr]);

     if(elementExists){
        //console.log("index: 0")
     }else{
        //console.log("index: 1")
        existentElementPtr = 1;
     }
    for (let i = 0; i < fatherList.length; i++) {
        let fatherRoute = fatherList[i] + " > .ProductOfferingCard"
        let sonRoute = "div > a > div > div > div.css-1wqb8ka > " + sonList[existentElementPtr]

        const courseHandles = await page.$$(fatherRoute);
        // #professional-certificates #mastertrack

        for (const coursehandle of courseHandles) {
            try {
                
                const title = await page.evaluate(
                    (el, route) => el.querySelector(route).textContent, coursehandle, sonRoute
                );
                //p.cds-33.css-13n3rak.cds-35 p.cds-119.css-13n3rak.cds-121
                titleList.push(title);
            } catch (error) { }
        }
    }


    //List to Json
     const nameDocuments = [];

    titleList.forEach((string) => {
        const newString = new courseraCertificationSchema({ certification: string });
        nameDocuments.push(newString);
    });

    courseraCertificationSchema.insertMany(nameDocuments)
        .then(() => {
            console.log('Items added to MongoDB');
        })
        .catch((error) => {
            console.error('Error adding items to MongoDB', error);
        }); 

    res.send(nameDocuments)
});

// get all certifications and all parameters
router.get("/coursera/raw/certification", (req,res) => {
    courseraCertificationSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error}))
})
// Retrive data all coursera certifications in one object / list
router.get('/coursera/list/certification', async (req, res) => {
    const parameterName = 'certification'; // Replace with the actual parameter name
  
    try {
      const documents = await courseraCertificationSchema.find({}, parameterName);
  
      if (!documents) {
        return res.status(404).json({ error: 'No documents found' });
      }
  
      // Extract the requested parameter value from each document
      const parameterValues = documents.map(document => document[parameterName]);
  
      res.json({ [parameterName]: parameterValues });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
// Retrive data all coursera certifications in separate objects
  router.get('/coursera/object/certification', async (req, res) => {
    const parameterName = 'certification'; // Replace with the actual parameter name
  
    try {
      const documents = await courseraCertificationSchema.find({}, parameterName);
  
      if (!documents) {
        return res.status(404).json({ error: 'No documents found' });
      }
  
      // Extract the requested parameter value from each document
      const result = documents.map(document => {
        return { [parameterName]: document[parameterName] };
      });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

module.exports = router;