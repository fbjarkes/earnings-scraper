const puppeteer = require('puppeteer');
const argv = require('yargs').argv;
const {SeekingAlphaScraper} = require('./scrapers/seeking-alpha');

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

const getSymbols = async (symbolsList, symbolsFile) => {
    if (symbolsList) {
        let symbols = symbolsList.split(',');
        return symbols;
    } else {
        const data = await fs.readFile(symbolsFile);
        return data.toString().split('\n').filter(s => (!(s === '' || s.includes('/') || s.startsWith('#'))));
    }
}

const printUsage = () => {
    console.log("Usage");   
}

(async () => {
    if (!(argv.symbols || argv.symbolsFile)) {
        printUsage();
        process.exit(1)
    }
    const symbols = await getSymbols(argv.symbols, argv.symbolsFile);
    
    const earnings = {};
    for (let symbol of symbols) {
        console.log('Getting for ', symbol);
        const scraper = new SeekingAlphaScraper();
        await scraper.init(puppeteer);
        const res = await scraper.getEarnings(symbol);        
        earnings[symbol] = res;
        scraper.finalize();
    }    
    console.log(earnings);
    console.log('Done');

})();
