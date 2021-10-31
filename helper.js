const R = require('ramda');
const chalk = require('chalk');
const {printf} = require('fast-printf');

const prettyString = (nbrYears, earningsForSymbol) => {    
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
    let out = '';
	const years = earningsForSymbol['earnings'];
    
	out += chalk.bold('\n'+earningsForSymbol['symbol']) + '\n';
	out += printf('%15s%14s%13s%10s%14s%13s','EPS', 'EPS Q/Q (%)', 'EPS Y/Y (%)', 'Rev', 'Rev Q/Q (%)', 'Rev Y/Y (%)') + '\n';
	Object.keys(years).slice(-nbrYears).reverse().forEach(key => {
		Object.entries(years[key]).forEach(([q, val]) => {
			out += printf('%s%8s%14s%13s%10s%14s%13s', `${q} ${key}`,val['eps'], _formatNumber(val['eps Q/Q (%)']), _formatNumber(val['eps Y/Y (%)']), _formatRev(val['revenue']),_formatNumber(val['rev Q/Q (%)']), _formatNumber(val['rev Y/Y (%)'])) + '\n';
		});			
	});		
    return out;
}

const getLatestYear = (earnings) => earnings[Object.keys(earnings).pop()];
const getLatestQuarter = (quarter) => quarter[Object.keys(quarter).shift()];
const getLastQuarterEarnings = R.pipe(getLatestYear, getLatestQuarter);

const lastQuarterGrowthFilter = ({ epsQQ, revQQ, epsYY, revYY }, earningsData) => {
	const lastQuarterEpsQtrByQtrFilter = R.propSatisfies(
		R.anyPass([
            R.always(epsQQ === null | epsQQ === undefined), // Filter disabled
			R.allPass([ R.is(Number), (n) => n > epsQQ ]), // Value strictly higher
			R.allPass([ R.equals('Pos'), R.always(epsQQ === 0)]) // Special case: from loss to profit
		]),
		'eps Q/Q (%)'
	);
	const lastQuarterEpsYearByYearFilter = R.propSatisfies(
		R.anyPass([
            R.always(epsYY === null | epsYY === undefined),
			R.allPass([ R.is(Number), (n) => n > epsYY ]),
			R.allPass([ R.equals('Pos'), R.always(epsYY === 0) ])
		]),
		'eps Y/Y (%)'
	);
	const lastQuarterRevQtrByQtrFilter = R.propSatisfies(
		R.anyPass([
            R.always(revQQ === null | revQQ === undefined),
			R.allPass([ R.is(Number), (n) => n > revQQ ]),
			R.allPass([ R.equals('Pos'), R.always(revQQ === 0) ]),
		]),
		'rev Q/Q (%)'
	);
	const lastQuarterRevYearByYearFilter = R.propSatisfies(
		R.anyPass([
            R.always(revYY === null | revYY === undefined),
			R.allPass([ R.is(Number), (n) => n > revYY ]),
			R.allPass([ R.equals('Pos'), R.always(revYY === 0) ]),
		]),
		'rev Y/Y (%)'
	);

	const filterQuarter = R.compose(
		R.allPass([
			lastQuarterEpsQtrByQtrFilter,
			lastQuarterEpsYearByYearFilter,
			lastQuarterRevYearByYearFilter,
			lastQuarterRevQtrByQtrFilter
		]),
		getLastQuarterEarnings
	);
	return filterQuarter(earningsData);
};

module.exports = {
	lastQuarterGrowthFilter,
    prettyString
};
