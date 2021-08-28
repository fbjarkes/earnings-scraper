const puppeteer = require('puppeteer');

const sym = 'TSLA';

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
    const earnings = {};
	await page.goto(`https://seekingalpha.com/symbol/${sym}/earnings`);    
    try {                
        const elements = await page.$$('.earning-title');    
        for (element of elements) {
            const [period, eps, revenue] = await Promise.all([element.$('.title-period'),element.$('.eps'),element.$('.revenue')]);            
            const [{_remoteObject: {value: periodContent}}, {_remoteObject: {value: epsContent}}, {_remoteObject: {value: revContent}}] = await Promise.all([period.getProperty('textContent'), eps.getProperty('textContent'), revenue.getProperty('textContent')])            
            earnings[periodContent] = {
                'eps': epsContent,
                'rev': revContent
            };                        
        }
    } catch (error) {
        console.log("Error");
        console.log(error);
    }
    console.log(earnings);
	await browser.close();
})();
