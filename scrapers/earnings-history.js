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

    numberPattern = /-?\d+\.\d+/g
    numberPatternBillion = /-?\d+\.\d+(B)/g
    numberPatternMillion = /-?\d+\.\d+(M)/g
    numberPatternThousand = /-?\d+\.\d+(K)/g

    earnings = {}
    
    getEarnings() {
        return this.earnings;
    }

    parseRevenue(revStr) {
        let rev;        
        const revenueLine = revStr.split('\n').filter(line => line.includes('Revenue')).pop();        
        rev = revenueLine?.match(this.numberPatternMillion);
        if (rev) return parseFloat(rev) * 1_000_000
        rev = revenueLine?.match(this.numberPatternBillion);
        if (rev) return parseFloat(rev) * 1_000_000_000;
        rev = revenueLine?.match(this.numberPatternThousand);
        return parseFloat(rev) * 1000;
    }

    parseEps(epsStr) {
        const epsLine = epsStr.split('\n').filter(line => line.includes('EPS')).pop();
        return parseFloat(epsLine.replace('$','').match(this.numberPattern)?.pop());
    }

    parseBeatOrMiss(epsStr) {
        const epsLine = epsStr.split('\n').filter(line => line.includes('by')).pop();
        return parseFloat(epsLine?.replace('$','').match(this.numberPattern)?.pop());
    }

    addEarningsData(period, eps, rev) {
        const {0: quarter, 1: year} = period.split(' ');
        const date = period.split('(')[1].slice(0, -1);
        const epsVal = this.parseEps(eps);
        const beatOrMissVal = this.parseBeatOrMiss(eps);    
        const beat = eps.match(/beat/)?.length == 1;
        const estimate = (epsVal + (beat ? -beatOrMissVal : beatOrMissVal)).toFixed(2);
        const surprisePercent = ((epsVal/estimate - 1.0) * 100).toFixed(2);
        
        const q = {
            date,
            'eps': epsVal,
            'eps estimate': estimate,
            'eps surprise': (beat ? beatOrMissVal : -beatOrMissVal).toFixed(2),
            'eps surprise (%)': surprisePercent,            
            'revenue': this.parseRevenue(rev),            
        }        

        if (this.earnings[year] === undefined) {
            this.earnings[year] = {}
        }   
        this.earnings[year][quarter.replace('F','')] = q;
    }

    calculateYearlyAndQuarterly() {       
        const _quarterlyGrowth = (currQuarter, metric, prevQuarter, year) => {
            const offset = (currQuarter === 'Q1' ? 1 : 0 );
            if (this.earnings[year][currQuarter][metric] > 0 && this.earnings[year - offset][prevQuarter][metric] > 0) {                    
                return ((this.earnings[year][currQuarter][metric] / this.earnings[year - offset][prevQuarter][metric]) - 1) * 100;
            } else if (this.earnings[year][currQuarter][metric] >= 0 && this.earnings[year - offset][prevQuarter][metric] < 0) {
                return 'Pos';
            } else {
                return 'Neg';
            }                 
        }
        const _yearlyGrowth = (quarter, metric, year) => {     
            if (this.earnings[year][quarter][metric] > 0 && this.earnings[year - 1][quarter][metric] > 0) {
                return ((this.earnings[year][quarter][metric] / this.earnings[year - 1][quarter][metric]) - 1) * 100;
            } else if ((this.earnings[year][quarter][metric] >= 0 && this.earnings[year - 1][quarter][metric] < 0)) {
                return 'Pos';
            } else {
                return 'Neg';
            }                        
        }        
        
        Object.keys(this.earnings).forEach(y => {
            const quarters = this.earnings[y];        
            Object.keys(quarters).forEach(q => {
                this.earnings[y][q]['eps Q/Q (%)'] = '-';
                this.earnings[y][q]['rev Q/Q (%)'] = '-';
                this.earnings[y][q]['eps Y/Y (%)'] = '-';
                this.earnings[y][q]['rev Y/Y (%)'] = '-';
                if (q === 'Q4') {                    
                    if (this.earnings[y]['Q3']){
                        this.earnings[y]['Q4']['eps Q/Q (%)'] = _quarterlyGrowth('Q4','eps', 'Q3', y);
                        this.earnings[y]['Q4']['rev Q/Q (%)'] = _quarterlyGrowth('Q4', 'revenue', 'Q3', y);                        
                    }
                    if (this.earnings[y-1]?.['Q4']) {
                        this.earnings[y]['Q4']['eps Y/Y (%)'] = _yearlyGrowth('Q4', 'eps', y);
                        this.earnings[y]['Q4']['rev Y/Y (%)'] = _yearlyGrowth('Q4', 'revenue', y);                        
                    }                    
                }
                if (q === 'Q3') {                    
                    if (this.earnings[y]['Q2']){
                        this.earnings[y]['Q3']['eps Q/Q (%)'] = _quarterlyGrowth('Q3','eps', 'Q2', y);
                        this.earnings[y]['Q3']['rev Q/Q (%)'] = _quarterlyGrowth('Q3', 'revenue', 'Q2', y);                        
                    }
                    if (this.earnings[y-1]?.['Q3']) {
                        this.earnings[y]['Q3']['eps Y/Y (%)'] = _yearlyGrowth('Q3', 'eps', y);
                        this.earnings[y]['Q3']['rev Y/Y (%)'] = _yearlyGrowth('Q3', 'revenue', y); 
                    }                    
                }
                if (q === 'Q2') {                
                    if (this.earnings[y]['Q1']) {
                        this.earnings[y]['Q2']['eps Q/Q (%)'] = _quarterlyGrowth('Q2','eps', 'Q1', y);
                        this.earnings[y]['Q2']['rev Q/Q (%)'] = _quarterlyGrowth('Q2', 'revenue', 'Q1', y);                                                           
                    }
                    if (this.earnings[y-1]?.['Q2']) {
                        this.earnings[y]['Q2']['eps Y/Y (%)'] = _yearlyGrowth('Q2', 'eps', y);
                        this.earnings[y]['Q2']['rev Y/Y (%)'] = _yearlyGrowth('Q2', 'revenue', y);                        
                    }                    
                }
                if (q === 'Q1' && this.earnings[y - 1]) {                                        
                    this.earnings[y]['Q1']['eps Q/Q (%)'] = _quarterlyGrowth('Q1','eps', 'Q4', y);
                    this.earnings[y]['Q1']['rev Q/Q (%)'] = _quarterlyGrowth('Q1', 'revenue', 'Q4', y);  
                    
                    if (this.earnings[y-1]?.['Q1']) {
                        this.earnings[y]['Q1']['eps Y/Y (%)'] = _yearlyGrowth('Q1', 'eps', y);
                        this.earnings[y]['Q1']['rev Y/Y (%)'] = _yearlyGrowth('Q1', 'revenue', y);  
                    }                    
                }                
            })
        });
    }
}

module.exports = {
    EarningsHistory
};