const R = require('ramda');

const filterEpsQQ = (quarter, epsQQ) => { return quarter['eps Q/Q (%)'] >= epsQQ };
const getLatestYear = (earnings) => earnings[Object.keys(earnings).pop()];
const firstYear = (earnings) => earnings[Object.keys(earnings).shift()];
const getLatestQuarter = (quarter) => quarter[Object.keys(quarter).shift()];
const firstQuarter = (quarter) => quarter[Object.keys(quarter).pop()];

const getLatestEarnings = R.pipe(getLatestYear, getLatestQuarter);
const isLatestQuarterEpsQQValid = R.pipe(getLatestEarnings, (q, threshold) => filterEpsQQ(q, threshold));


const filterByGrowthParameters = (earningsData, {epsQQ = null, epsYY, revQQ, revYY, includePos = true}) => {
	const earnings = getLatestEarnings(earningsData);
    return filterEpsQQ(earnings, epsQQ);
}

const printEarnings = (earningsData) => {
    // TODO:
}

module.exports = {
    filterByGrowthParameters,
    printEarnings
}