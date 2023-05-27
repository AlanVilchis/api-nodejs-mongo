const express = require("express");
const udemyPopularSchema = require("../models/udemyPopular")
const puppeteer = require('puppeteer');
const router = express.Router();

// need change to POST into database
router.get("/udemy/popular/:pag", async (req, res) => {
    const {pag} = req.params;
    if (pag === "1"){
        await udemyPopularSchema.deleteMany({});
    }
    const browser = await puppeteer.launch({
        headless: false,
        //userDataDir: "./tmp"
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en',
    });
    const titleList = [];
    const url = "https://www.udemy.com/courses/development/?p=" + pag + "&sort=highest-rated"
    console.log(url)
    await page.goto(url);
    await page.waitForSelector('.course-list--container--FuG0T');
    const courseHandles = await page.$$('.course-list--container--FuG0T > .popper-module--popper--2BpLn');
    //console.log(courseHandles)

    for (const coursehandle of courseHandles) {
        try {
            const titleExtra = await page.evaluate(
                (el) => el.querySelector("a > .ud-sr-only").textContent, coursehandle
            );
            const title = await page.evaluate(
                (el) => el.querySelector("a").textContent, coursehandle
            );
            const onlyTitle = title.replace(titleExtra, "");
            const cleanedStringArray = onlyTitle.match(/\b[A-Z][a-zA-Z]*\b/g);

            for (let i = 0; i < cleanedStringArray.length; i++) {
                const currentString = cleanedStringArray[i];
                //console.log(currentString)
                titleList.push(currentString);
            }

            //console.log(titleList);
        } catch (error) { }
    }
    // "AI supervised learning classification algorithm" to detect unwanted characters
    const lowercaseList = titleList.map(str => str.toLowerCase());
    const stringsToRemove = ['a', 'advanced', 'all', 'app', 'application', 'applications', 'apps', 'assess', 'based', 'basics', 'beginners', 
                             'begginner', 'bible', 'boring', 'bootcamp', 'build', 'building', 'budget', 'business', 'challenging', 'challenges', 'code', 'coding',
                             'complete', 'competitive', 'course', 'creating', 'data', 'developer', 'developers', 'development', 'detection', 'dive', 'ds', 'enterprise',
                             'essential', 'estate', 'exercises', 'face', 'flow', 'for', 'free', 'from', 'guide', 'hero', 'integrate', 'intelligent', 'job', 'kit', 
                              'knowledge', 'learn', 'learning', 'level', 'life', 'live', 'making', 'masterclass', 'mastering', 'need', 'online', 'option', 'personal',
                            'practical', 'product', 'programming', 'project', 'promo', 'quick', 'real', 'role', 'scratch', 'specification', 'start', 'the', 'theory',
                            'vol', 'weather', 'what', 'with', 'you', 'zero'] 
    //Filter    
    const lowerFilteredTitleList = lowercaseList.filter(item => !stringsToRemove.includes(item));

    //Exceptions
    let updatedStrings = lowerFilteredTitleList.map(str => str.replace('website', 'web'));
    updatedStrings = updatedStrings.map(str => str.replace('game', 'gamedev'));
    updatedStrings = updatedStrings.map(str => str.replace('machine', 'machine learning'));
    updatedStrings = updatedStrings.map(str => str.replace('science', 'data science'));

    const filteredTitleList = updatedStrings.map(str => str.charAt(0).toUpperCase() + str.slice(1));
    // POST into MongoDB using Mongoose, as a JSON, each string one object
    //console.log(filteredTitleList);

    //List to Json
    const nameDocuments = [];

    filteredTitleList.forEach((string) => {
        const newString = new udemyPopularSchema({ name: string });
        nameDocuments.push(newString);
    });

    udemyPopularSchema.insertMany(nameDocuments)
        .then(() => {
            console.log('Items added to MongoDB');
        })
        .catch((error) => {
            console.error('Error adding items to MongoDB', error);
        });

   
    
    

    console.log(filteredTitleList);
    //await browser.close();
    res.send(filteredTitleList)
});


//Only working with name parametr
router.get("/udemy/popular/count/:parametr", (req, res) => {
    const { parametr } = req.params;
    udemyPopularSchema.aggregate([
        { $group: { _id: "$" + parametr, count: { $sum: 1 } } },
        { $project: { group: "$_id", value: "$count", _id: 0 } }, //modify json fields
        { $sort: { value: -1 } },                                 // sort descending
        //{ $limit: 10 }                                          // choose the number of groups
    ])
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving how many times a skill/name repeats (Udemy)');
        });
});

module.exports = router;