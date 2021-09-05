class SeekingAlphaScraper {

    #browser;  

    async init(puppeteer, headless = false) {
        this.#browser = await puppeteer.launch({ headless });
    }

    async getEarnings(symbol) {        
        const earnings = {};        

        try {                           
            //const page = await this.#browser.newPage();             
            const context = await this.#browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            //await page.goto(`https://seekingalpha.com/`);
            const res = await page.goto(`https://seekingalpha.com/symbol/${symbol}/earnings`);
            if (res._status === 403) {
                console.log("ERROR 403 for ", symbol );
            }
            //await page.waitForNavigation()
            const elements = await page.$$('.earning-title');
            const earningsHistory = new EarningsHistory();
            for (let element of elements) {
                const [period, eps, revenue] = await Promise.all([element.$('.title-period'),element.$('.eps'),element.$('.revenue')]);            
                const [{_remoteObject: {value: periodContent}}, {_remoteObject: {value: epsContent}}, {_remoteObject: {value: revContent}}] = await Promise.all([period.getProperty('textContent'), eps.getProperty('textContent'), revenue.getProperty('textContent')])
                // earnings[periodContent] = {
                //     'eps': epsContent,
                //     'rev': revContent
                // };                       
                earningsHistory.addEarningsData(period, eps, revenue);
            }
            return earningsHistory;
        
        } catch (error) {
            console.log('Error for', symbol);
            console.log(error);
            return new EarningsHistory();
        }
    }

    async finalize() {
        await this.#browser.close();
    }

}


// (async () => {
// 	const browser = await puppeteer.launch();
// 	const page = await browser.newPage();
//     const earnings = {};
// 	await page.goto(`https://seekingalpha.com/symbol/${sym}/earnings`);    
//     try {                
//         const elements = await page.$$('.earning-title');    
//         for (element of elements) {
//             const [period, eps, revenue] = await Promise.all([element.$('.title-period'),element.$('.eps'),element.$('.revenue')]);            
//             const [{_remoteObject: {value: periodContent}}, {_remoteObject: {value: epsContent}}, {_remoteObject: {value: revContent}}] = await Promise.all([period.getProperty('textContent'), eps.getProperty('textContent'), revenue.getProperty('textContent')])            
//             earnings[periodContent] = {
//                 'eps': epsContent,
//                 'rev': revContent
//             };                        
//         }
//     } catch (error) {
//         console.log("Error");
//         console.log(error);
//     }
//     console.log(earnings);
// 	await browser.close();
// })();


module.exports = {
    SeekingAlphaScraper
};