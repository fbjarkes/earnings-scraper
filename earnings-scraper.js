/* eslint-disable no-console */
const _ = require('lodash');
const {printf} = require('fast-printf');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const argv = require('yargs').argv;
const chalk = require('chalk');
const log = console.log;

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
	console.log('Usage');
};

const printEarnings = (earnings, years) => {		
	const _formatNumber = (n) => {
		if (typeof n === 'number') {
			return Math.round(n, 1);
		}
		return n; // Could be 'Neg' or 'Pos'
	}
	const _formatRev = (n) => {
		if (Math.abs(n) <= 1_000_000) { 
			return `${(n/1000).toFixed(1)}K`;
		}
		if (Math.abs(n) <= 1_000_000_000) {
			return `${(n/1_000_000).toFixed(1)}M`;
		}
		if (Math.abs(n) <= 1_000_000_000_000) {
			return `${(n/1_000_000_000).toFixed(1)}B`;
		}
		return `${(n/1_000_000_000_000).toFixed(1)}T`;
	}

	Object.keys(earnings).forEach(key => {
		const years = earnings[key]['earnings'];
		log(chalk.bold('\n'+earnings[key]['symbol']));
		log(printf('%15s%14s%13s%10s%14s%13s','EPS', 'EPS Q/Q (%)', 'EPS Y/Y (%)', 'Rev', 'Rev Q/Q (%)', 'Rev Y/Y (%)'));
		Object.keys(years).slice(-years).reverse().forEach(key => {			
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

const download = async (symbol, scraper) => {		
	console.log('Getting for data for symbol', symbol);
	const res = await scraper.getEarnings(symbol);
	return {symbol, earnings: res.earnings};		
}

const main = async () => {
	if (!(argv.symbols || argv.symbolsFile)) {
		printUsage();
		// eslint-disable-next-line
		process.exit(1);
	}
	let nbrChunks = parseInt(argv.parallel) || 3;
	let nbrYears = parseInt(argv.years) || 2;
	let results = [];
	const symbols = await getSymbols(argv.symbols, argv.symbolsFile);	

	for (const chunk of _.chunk(symbols, nbrChunks)) {
		const scraper = new SeekingAlphaScraper();
		await scraper.init(puppeteer);		
		const res = await Promise.all(chunk.map(async sym => download(sym, scraper)));
		results = results.concat(res);
		await scraper.finalize();
		// TODO: wait randomly for 1-5s?
	}	
	const res = _.flatten(results);	
	printEarnings(res, nbrYears);
}

main();
