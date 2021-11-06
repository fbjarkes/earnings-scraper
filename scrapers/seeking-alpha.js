const { getRandomHeaders } = require('../helper');
const {SymbolEarningsHistory} = require('../symbol-earnings-history');
const { EarningsHistory } = require("./earnings-history");

class SeekingAlphaScraper {

    #browser;  

    async init(puppeteer, headless = false) {
        this.#browser = await puppeteer.launch({ headless });
    }

    async getEarnings(symbol, verbose = 0, setHeader = false) {
        try {                           
            //const page = await this.#browser.newPage();             
            const context = await this.#browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            //await page.goto(`https://seekingalpha.com/`);
            if (setHeader) {                
                await page.setExtraHTTPHeaders(getRandomHeaders());
            }            
            const res = await page.goto(`https://seekingalpha.com/symbol/${symbol}/earnings`);
            
            if (res._status !== 200) {
                throw new Error(`Error ${res._status} for symbol ${symbol}`);
            }
            
            await page.waitForSelector('.earning-title');
            const elements = await page.$$('.earning-title');
            const earningsHistory = new EarningsHistory();
            for (let element of elements) {
                const [period, eps, revenue] = await Promise.all([element.$('.title-period'),element.$('.eps'),element.$('.revenue')]);                
                const [{_remoteObject: {value: periodContent}}, {_remoteObject: {value: epsContent}}, {_remoteObject: {value: revContent}}] = await Promise.all([period.getProperty('textContent'), eps.getProperty('textContent'), revenue.getProperty('textContent')])                                
                // console.log(symbol);
                // console.log("periodContent");
                // console.log(periodContent);
                // console.log('epsContent');
                // console.log(epsContent);
                // console.log('revContent');
                // console.log(revContent);        
                earningsHistory.addEarningsData(periodContent, epsContent, revContent);
            }
            earningsHistory.calculateYearlyAndQuarterly()
            return new SymbolEarningsHistory(symbol, earningsHistory.getEarnings());
        
        } catch (error) {
            if (verbose > 0) {
                console.log({error: {'error_msg': error}});
            }
            return new SymbolEarningsHistory(symbol, {}); // TODO: save error msg?
        }
    }

    async finalize() {
        await this.#browser.close();
    }

}

module.exports = {
    SeekingAlphaScraper
};