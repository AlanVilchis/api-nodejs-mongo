const express = require("express");
const udemyPopularSchema = require("../models/udemyPopular")
const puppeteer = require('puppeteer');
const router = express.Router();

// need change to POST into database
router.get("/udemy/popular", async (req, res) => {
    const browser = await puppeteer.launch({
        headless: false,
        //userDataDir: "./tmp"
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en',
    });
    await page.goto('https://www.udemy.com/courses/development/?sort=popularity');
    const titleList = [];
    await page.waitForSelector('.course-list--container--FuG0T');
    const courseHandles = await page.$$('.course-list--container--FuG0T > .popper-module--popper--2BpLn');

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
    const stringsToRemove = ["Aprende", 'Completo', 'Creaci', 'Crea', 'Curso', 'Empresas', 'La', 'Lenguaje', 'Master', 'Maximice', 'Programacion', 'Temas', "Introducci", "Desarrollar", "Sistema", "Reservas", "Marcado", "Aplicaci", "Studio"]
    const filteredTitleList = titleList.filter(item => !stringsToRemove.includes(item));
    // POST into MongoDB using Mongoose, as a JSON, each string one object
    //console.log(filteredTitleList);

    //List to Json
    const jsonArray = filteredTitleList.map(item => {
        return { name: item };
    });

    const jsonString = JSON.stringify(jsonArray);

    console.log(jsonString);
    //await browser.close();
    res.send(jsonString)
});


//Only working with name marametr
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
    res.status(500).send('Error retrieving how many times a skill/name repeats');
    });
});

module.exports = router;