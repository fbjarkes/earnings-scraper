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
            'eps estimate': estimate,
            'eps surprise': beat ? beatOrMissVal : -beatOrMissVal,            
            'eps surprise (%)': surprisePercent,            
            'revenue': this.parseRevenue(rev),            
        }        

        if (this.earnings[year] === undefined) {
            this.earnings[year] = {}
        }   
        this.earnings[year][quarter] = q;                    
    }

    calculateQuarterlyAndQuarterly() {
        const currYear = new Date().getFullYear();
        for (var i = 0; i < Object.keys(this.earnings).length; i++) {
            const quarters = this.earnings[currYear-i];
            console.log(currYear-i);
            Object.keys(quarters).forEach(q => {
                if (q === 'Q4') {
                    if (this.earnings[currYear-i]['Q3']) {
                        this.earnings[currYear-i]['Q4']['eps Q/Q (%)'] = ((this.earnings[currYear-i]['Q4']['eps'] / this.earnings[currYear-i]['Q3']['eps']) - 1) * 100
                        this.earnings[currYear-i]['Q4']['rev Q/Q (%)'] = ((this.earnings[currYear-i]['Q4']['revenue'] / this.earnings[currYear-i]['Q3']['revenue']) - 1) * 100
                    }
                    if (this.earnings[currYear-i-1]?.['Q4']) {
                        this.earnings[currYear-i]['Q4']['eps Y/Y (%)'] = ((this.earnings[currYear-i]['Q4']['eps'] / this.earnings[currYear-i-1]['Q4']['eps']) - 1) * 100
                        this.earnings[currYear-i]['Q4']['rev Y/Y (%)'] = ((this.earnings[currYear-i]['Q4']['revenue'] / this.earnings[currYear-i-1]['Q4']['revenue']) - 1) * 100
                    }                    
                }
                if (q === 'Q3') {                    
                    if (this.earnings[currYear-i]['Q2']) {
                        this.earnings[currYear-i]['Q3']['eps Q/Q (%)'] = ((this.earnings[currYear-i]['Q3']['eps'] / this.earnings[currYear-i]['Q2']['eps']) - 1) * 100
                        this.earnings[currYear-i]['Q3']['rev Q/Q (%)'] = ((this.earnings[currYear-i]['Q3']['revenue'] / this.earnings[currYear-i]['Q2']['revenue']) - 1) * 100
                    }
                    if (this.earnings[currYear-i-1]?.['Q3']) {
                        this.earnings[currYear-i]['Q3']['eps Y/Y (%)'] = ((this.earnings[currYear-i]['Q3']['eps'] / this.earnings[currYear-i-1]['Q3']['eps']) - 1) * 100
                        this.earnings[currYear-i]['Q3']['rev Y/Y (%)'] = ((this.earnings[currYear-i]['Q3']['revenue'] / this.earnings[currYear-i-1]['Q3']['revenue']) - 1) * 100
                    }                    
                }
                if (q === 'Q2') {      
                    if (this.earnings[currYear-i]['Q1']) {              
                        this.earnings[currYear-i]['Q2']['eps Q/Q (%)'] = ((this.earnings[currYear-i]['Q2']['eps'] / this.earnings[currYear-i]['Q1']['eps']) - 1) * 100
                        this.earnings[currYear-i]['Q2']['rev Q/Q (%)'] = ((this.earnings[currYear-i]['Q2']['revenue'] / this.earnings[currYear-i]['Q1']['revenue']) - 1) * 100
                    }
                    if (this.earnings[currYear-i-1]?.['Q2']) {
                        this.earnings[currYear-i]['Q2']['eps Y/Y (%)'] = ((this.earnings[currYear-i]['Q2']['eps'] / this.earnings[currYear-i-1]['Q2']['eps']) - 1) * 100
                        this.earnings[currYear-i]['Q2']['rev Y/Y (%)'] = ((this.earnings[currYear-i]['Q2']['revenue'] / this.earnings[currYear-i-1]['Q2']['revenue']) - 1) * 100
                    }                    
                }
                if (q === 'Q1' && this.earnings[currYear-i - 1]) {                    
                    this.earnings[currYear-i]['Q1']['eps Q/Q (%)'] = ((this.earnings[currYear-i]['Q1']['eps'] / this.earnings[currYear-i - 1]['Q4']['eps']) - 1) * 100
                    this.earnings[currYear-i]['Q1']['rev Q/Q (%)'] = ((this.earnings[currYear-i]['Q1']['revenue'] / this.earnings[currYear-i -1]['Q4']['revenue']) - 1) * 100

                    if (this.earnings[currYear-i-1]?.['Q1']) {
                        this.earnings[currYear-i]['Q1']['eps Y/Y (%)'] = ((this.earnings[currYear-i]['Q1']['eps'] / this.earnings[currYear-i-1]['Q1']['eps']) - 1) * 100
                        this.earnings[currYear-i]['Q1']['rev Y/Y (%)'] = ((this.earnings[currYear-i]['Q1']['revenue'] / this.earnings[currYear-i-1]['Q1']['revenue']) - 1) * 100
                    }                    
                }                
            })
        }
    }
}

module.exports = {
    EarningsHistory
};