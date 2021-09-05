//  Example input:
//   'FQ2 2022 (Jul 2021)': {
//     eps: ' EPS of $1.29\n          beat by $1.11\n        ',
//     rev: '\n' +
//       '        Revenue  of $5.65B\n' +
//       '          \n' +
//       '            (58.67% YoY)\n' +
//       '          \n' +
//       '          beat by $643.28M\n' +
//       '        '
//   },
//  
//  Output:
// {
//     '2022': {
//         'FQ2': {
//              'date': 'Jul 2021'
//              'eps: 1.29
//              'eps_beat': 1.11
//              'rev': 5650000000
//              'rev_beat': 643280000
//              'yoy': '58.67%'
//         }, 
//         'FQ1': ...
//     },
//     '2021': ...
// }


class EarningsHistory {

    numberPattern = /\-?\d+\.\d+/g
    numberPatternBillion = /\-?\d+\.\d+(B)/g
    numberPatternMillion = /\-?\d+\.\d+(M)/g
    numberPatternThousand = /\-?\d+\.\d+(K)/g

    earnings = {}
    
    parseRevenue(revStr) {
        let rev;        
        const revenueLine = revStr.split('\n').filter(line => line.includes('Revenue')).pop();        
        rev = revenueLine?.match(this.numberPatternMillion);
        if (rev) return parseFloat(rev) * 1000000
        rev = revenueLine?.match(this.numberPatternBillion);
        if (rev) return parseFloat(rev) * 1000000000;
        rev = revenueLine?.match(this.numberPatternThousand);
        return parseFloat(rev) * 1000;
    }

    addEarningsData(period, eps, rev) {
        const {0: quarter, 1: year} = period.split(' ');
        const date = period.split('(')[1].slice(0, -1);
        const {0: epsStr, 1: beatOrMissStr} = eps.match(this.numberPattern);
        let epsVal, beatOrMissVal
        if (epsStr) epsVal = parseFloat(epsStr);
        if (beatOrMissStr) beatOrMissVal = parseFloat(beatOrMissStr);        
        const beat = eps.match(/beat/)?.length == 1;
        const estimate = epsVal + (beat ? -beatOrMissVal : beatOrMissVal);
        const surprisePercent = ((epsVal/estimate - 1.0) * 100).toFixed(1);
                
        const q = {
            date,
            'eps': epsVal,
            'eps surprise': beat ? beatOrMissVal : -beatOrMissVal,
            'eps': estimate,
            'eps surprise (%)': surprisePercent,            
            'revenue': this.parseRevenue(rev),            
        }        
        if (this.earnings[year] === undefined) {
            this.earnings[year] = {}
        }   
        this.earnings[year][quarter] = q;                    
    }
}

module.exports = {
    EarningsHistory
};