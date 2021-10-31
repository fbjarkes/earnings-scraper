const R = require('ramda');

const getLatestYear = (earnings) => earnings[Object.keys(earnings).pop()];
const getLatestQuarter = (quarter) => quarter[Object.keys(quarter).shift()];
const getLatestEarnings = R.pipe(getLatestYear, getLatestQuarter);


const lastQuarterGrowthFilter = ({epsQQ, revQQ, epsYY, revYY}, earningsData) => {    
    const lastQuarterEpsQtrByQtrFilter = R.propSatisfies(eps => epsQQ ? eps > epsQQ : true, 'eps Q/Q (%)');      
    const lastQuarterEpsYearByYearFilter = R.propSatisfies(eps => epsYY ? eps > epsYY : true, 'eps Y/Y (%)');
    const lastQuarterRevYearByYearFilter = R.propSatisfies(eps => revYY ? eps > revYY : true, 'rev Y/Y (%)');
    const lastQuarterRevQtrByQtr = R.propSatisfies(eps => revQQ ? eps > revQQ : true, 'rev Q/Q (%)');
    const filterQuarter = R.compose(
        R.allPass([
            lastQuarterEpsQtrByQtrFilter, 
            lastQuarterEpsYearByYearFilter, 
            lastQuarterRevYearByYearFilter, 
            lastQuarterRevQtrByQtr]), 
        getLatestEarnings);
    return filterQuarter(earningsData);
};

module.exports = {
    lastQuarterGrowthFilter
}