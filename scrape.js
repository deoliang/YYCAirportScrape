const puppeteer = require('puppeteer');
const url = 'https://www.yyc.com/en-us/travellerinfo/flightinformation/flightschedule.aspx';
const $ = require('cheerio');
const fs = require('fs');
const earlierFlightsSelector = '#btn_EarlierFlights'
const tomorrowSelector = '#btn_Tomorrow'
const destinationSelector = '.airportDetail'
const YYCDestinations = {
    "Cities": []
}

const uniqueSet = new Set();
puppeteer.launch().then(async browser => {
    const page = await browser.newPage();
    await page.goto(url);
    if (await page.$(earlierFlightsSelector) !== null) {
        await page.click(earlierFlightsSelector)
        await page.waitForSelector('.btn-hide-earlierFlights')
    }
    let html = await page.content();
    await addToSet(destinationSelector,uniqueSet,html)
    
    await page.click(tomorrowSelector);
    html = await page.content();
    await addToSet(destinationSelector,uniqueSet,html)
    
    YYCDestinations.Cities = await [...uniqueSet].sort()
            
    await fs.writeFile('YYCDestinations.json', JSON.stringify(YYCDestinations), function(err){
        if (err) throw err;
        console.log("Successfully Written to File.");
    });
    await browser.close();
});
const addToSet = async (selector,set,html)=>{
    await $(selector,html).each(function(i, elem) {
        if(set.has($(this).text()))return true;
         set.add($(this).text());
    })
}
