/* eslint-disable no-console */
const _ = require('lodash');
const {printf} = require('fast-printf');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const argv = require('yargs').argv;
const chalk = require('chalk');
const log = console.log;

const { data } = require('./data');
const { SeekingAlphaScraper } = require('./scrapers/seeking-alpha');

const getSymbols = async (symbolsList, symbolsFile) => {
	if (symbolsList) {
		let symbols = symbolsList.split(',');
		return symbols;
	} else {
		const data = await fs.readFile(symbolsFile);
		return data.toString().split('\n').filter((s) => !(s === '' || s.includes('/') || s.startsWith('#')));
	}
};

const printUsage = () => {
	// eslint-disable-next-line
	console.log('Usage');
};

const printEarnings = (earnings) => {		
	const _formatNumber = (n) => {
		if (typeof n === 'number') {
			return Math.round(n, 1);
		}
		return n; // Could be 'Neg' or 'Pos'
	}
	const _formatRev = (n) => {
		if (Math.abs(n) <= 1_000_000) { 
			return `${(n/100).toFixed(1)}K`;
		}
		if (Math.abs(n) <= 100_000_000) {
			return `${(n/100_000).toFixed(1)}M`;
		}
		if (Math.abs(n) <= 100_000_000_000) {
			return `${(n/100_000_000).toFixed(1)}B`;
		}
		return `${(n/100_000_000_000).toFixed(1)}T`;
	}

	Object.keys(earnings).forEach(key => {
		const years = earnings[key]['earnings'];
		log(chalk.bold('\n'+earnings[key]['symbol']));
		log(printf('%15s%14s%13s%10s%14s%13s','EPS', 'EPS Q/Q (%)', 'EPS Y/Y (%)', 'Rev', 'Rev Q/Q (%)', 'Rev Y/Y (%)'));
		Object.keys(years).slice(-2).reverse().forEach(key => {			
			Object.entries(years[key]).forEach(([q, val]) => {
				log(printf('%s%8s%14s%13s%10s%14s%13s', `${q} ${key}`,val['eps'], _formatNumber(val['eps Q/Q (%)']), _formatNumber(val['eps Y/Y (%)']), _formatRev(val['revenue']),_formatNumber(val['rev Q/Q (%)']), _formatNumber(val['rev Y/Y (%)'])));
			});
  
			//log(printf('%s%14s%14s%18s%13s', `${key}: ${q['date']}`, q['eps Q/Q (%)'], q['eps Y/Y (%)'], q['rev Q/Q (%)'], q['rev Y/Y (%)']));
			//log(printf('%s%14s%14s%18s%13s', '2021 Q3:', '24%', '120%', '-12%', '45%'));
		});
				
		// log(printf('%s%14s%14s%18s%13s', '2021 Q3:', '24%', '120%', '-12%', '45%'));
		// log(printf('%s%14s%14s%18s%13s', '2021 Q2:', 'Neg', '-2%', '1240%', '1000%'));
		
	})
}

const download = async (symbols) => {		
	const results = [];
	const scraper = new SeekingAlphaScraper();
	await scraper.init(puppeteer);
	await Promise.all(symbols.map(async symbol => {		
		// await sleep(500);
		// results.push({symbol: sym, earnings: {foo: 1}});
		// eslint-disable-next-line
		console.log('Getting for data for symbol', symbol);
		const res = await scraper.getEarnings(symbol);			
		results.push({symbol, earnings: res.earnings});
	}));
	await scraper.finalize();
	// TODO: wait randomly for 1-5s?
	return results;
}

const main = async () => {
	if (!(argv.symbols || argv.symbolsFile)) {
		printUsage();
		// eslint-disable-next-line
		process.exit(1);
	}
	const symbols = await getSymbols(argv.symbols, argv.symbolsFile);	
	//TODO: handle chunks in a series of promises or concurrency 1?
	const results = await Promise.all(_.chunk(symbols, 2).map(async chunk => download(chunk)));
	//console.log("========");
	const res = _.flatten(results);
	console.log(res);
	//printEarnings(res);
}

main();
