#!/usr/bin/env node
const R = require('ramda');
const _ = require('lodash');
const {printf} = require('fast-printf');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const argv = require('yargs').argv;
const chalk = require('chalk');
const log = console.log;

const {lastQuarterGrowthFilter, prettyString} = require('./helper');
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
		console.log('Getting for data for symbol', symbol);
	}			
	const res = await scraper.getEarnings(symbol);
	return {symbol, earnings: res.earnings};		
}

const main = async () => {
	if (!(argv.symbols || argv.symbolsFile)) {
		printUsage();
		// eslint-disable-next-line
		process.exit(1);
	}
	let verbose = argv.v ? 1 : 0;
	let nbrChunks = parseInt(argv.parallel) || 3;
	let nbrYears = parseInt(argv.years) || 2;
	let epsQQ = parseInt(argv.epsQQ) || null;
	let epsYY = parseInt(argv.epsYY) || null;
	let revQQ = parseInt(argv.revQQ) || null;
	let revYY = parseInt(argv.revYY) || null;
	let earningsHistoryForSymbols = [];
	
	const symbols = await getSymbols(argv.symbols, argv.symbolsFile);	

	for (const chunk of _.chunk(symbols, nbrChunks)) {
		const scraper = new SeekingAlphaScraper();
		await scraper.init(puppeteer);		
		//const res = await Promise.all(chunk.map(async sym => download(sym, scraper).then(() => statusbar(current++))));
		const res = await Promise.all(chunk.map(async sym => download(sym, scraper, verbose)));
		earningsHistoryForSymbols = earningsHistoryForSymbols.concat(res);
		await scraper.finalize();
		// TODO: wait randomly for 1-5s?
	}	
	
	earningsHistoryForSymbols.forEach(({symbol, earnings}) => {		
		if (lastQuarterGrowthFilter({epsQQ, epsYY, revQQ, revYY}, earnings)) {	
			if (epsQQ !== null || epsYY !== null | revQQ !== null | revYY !== null) { // Watchlist generation mode
				if (verbose) {
					const output = prettyString(nbrYears, {symbol, earnings});
					log(output);
				} else {
					log(symbol);
				}			
			} else {
				const output = prettyString(nbrYears, {symbol, earnings});
				log(output);
			}			
		}
	});
}

main();
