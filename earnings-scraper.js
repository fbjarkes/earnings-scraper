#!/usr/bin/env node
const _ = require('lodash');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const argv = require('yargs').argv;
const log = console.log;

const {lastQuarterGrowthFilter, prettyString} = require('./utils/helper');
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

const download = async (symbol, scraper, verbose=0) => {
	if (verbose) {
		log('Getting data for symbol', symbol);
	}			
	const res = await scraper.getEarnings(symbol, verbose, true);
	return res;
}

const main = async () => {
	if (!(argv.symbols || argv.symbolsFile)) {
		printUsage();
		// eslint-disable-next-line
		process.exit(1);
	}
	let verbose = argv.v ? 1 : 0;
	let symbolsPerChunk = parseInt(argv.parallel) || 2;
	let nbrYears = parseInt(argv.years) || 2;
	let epsQQ = parseInt(argv.epsQQ) || null;
	let epsYY = parseInt(argv.epsYY) || null;
	let revQQ = parseInt(argv.revQQ) || null;
	let revYY = parseInt(argv.revYY) || null;
	let symbolEarningsHistoryList = [];
	let symbolEarningsHistoryErrorList = [];
	
	const symbols = await getSymbols(argv.symbols, argv.symbolsFile);	
	for (const chunk of _.chunk(symbols, symbolsPerChunk)) {
		const scraper = new SeekingAlphaScraper();
		await scraper.init(puppeteer);		
		//const res = await Promise.all(chunk.map(async sym => download(sym, scraper).then(() => statusbar(current++))));
		const res = await Promise.all(chunk.map(async sym => download(sym, scraper, verbose)));
		res.forEach(e => {
			if (e.isError()) {
				symbolEarningsHistoryErrorList.push(e);
			} else {
				symbolEarningsHistoryList.push(e);
			}
		});
		await scraper.finalize();		
		// eslint-disable-next-line no-undef
		await new Promise(resolve => setTimeout(resolve, _.random(10,20) * 1000));
	}	
	
	symbolEarningsHistoryList.forEach(symbolEarningsHistory => {		
		if (lastQuarterGrowthFilter({epsQQ, epsYY, revQQ, revYY}, symbolEarningsHistory.getEarnings())) {	
			if (epsQQ !== null || epsYY !== null | revQQ !== null | revYY !== null) { // Watchlist generation mode
				if (verbose) {
					const output = prettyString(nbrYears, {symbol: symbolEarningsHistory.getSymbol(), earnings: symbolEarningsHistory.getEarnings()});
					log(output);
				} else {
					log(symbolEarningsHistory.getSymbol());
				}			
			} else {
				const output = prettyString(nbrYears, {symbol: symbolEarningsHistory.getSymbol(), earnings: symbolEarningsHistory.getEarnings()});
				log(output);
			}			
		}
	});
	if (symbolEarningsHistoryErrorList.length > 0) {
		console.error('##Errors');
	}
	symbolEarningsHistoryErrorList.forEach(symbolEarningsHistory => console.error(symbolEarningsHistory.getSymbol()));
}

main();
