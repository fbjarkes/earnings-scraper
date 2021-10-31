const R = require('ramda');

const getLatestYear = (earnings) => earnings[Object.keys(earnings).pop()];
const getLatestQuarter = (quarter) => quarter[Object.keys(quarter).shift()];
const getLatestEarnings = R.pipe(getLatestYear, getLatestQuarter);

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
		getLatestEarnings
	);
	return filterQuarter(earningsData);
};

module.exports = {
	lastQuarterGrowthFilter
};
