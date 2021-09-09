const { EarningsHistory } = require("./earnings-history");

class SeekingAlphaScraper {

    #browser;  

    async init(puppeteer, headless = false) {
        this.#browser = await puppeteer.launch({ headless });
    }

    async getEarnings(symbol) {
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
                earningsHistory.addEarningsData(periodContent, epsContent, revContent);
            }
            earningsHistory.calculateYearlyAndQuarterly()
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

module.exports = {
    SeekingAlphaScraper
};