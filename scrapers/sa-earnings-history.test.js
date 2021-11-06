const {expect} = require('chai');
const { SeekingAlphaEarningsHistory } = require('./sa-earnings-history');

describe('SeekingAlphaEarningsHistory', () => {
    const earningsHistory = new SeekingAlphaEarningsHistory();
    describe('parseRevenue', () => {
        it('should parse revenue correctly', () => {
            const revContent = '\n       Revenue  of $11.88M\n         beat by $2.60M';
            expect(earningsHistory.parseRevenue(revContent)).to.eq(11880000);
        });
        it('should handle zero revenue', () => {
            const revContent = '\n       Revenue  of $0.00\n         in-line';
            expect(earningsHistory.parseRevenue(revContent)).to.eq(0);
        });
        it('should handle erroneous data', () => {
            expect(earningsHistory.parseRevenue('\n   \n')).to.be.NaN;
            expect(earningsHistory.parseRevenue(undefined)).to.be.NaN;
            expect(earningsHistory.parseRevenue(null)).to.be.NaN;
        });    
    });
    describe('parseBeatOrMiss', () => {
        it('should parse beat or miss value', () => {
            const epsContent = ' EPS of $1.29\n          beat by $1.11\n        ';
            expect(earningsHistory.parseBeatOrMiss(epsContent)).to.eq(1.11);
        });        
        it('should handle erroneous data', () => {
            expect(earningsHistory.parseBeatOrMiss('\n   \n')).to.be.NaN;
            expect(earningsHistory.parseBeatOrMiss(undefined)).to.be.NaN;
            expect(earningsHistory.parseBeatOrMiss(null)).to.be.NaN;
            expect(earningsHistory.parseBeatOrMiss(' XYZ of $1.29\n')).to.be.NaN;
        });
        it('should handle Funds From Operations (FFO)', () => {
            const epsContent = ' FFO of -$0.16\n          missed by -$0.45\n        ';
            expect(earningsHistory.parseBeatOrMiss(epsContent)).to.eq(-0.45);
        }) 
    });
    describe('parseEps', () => {
        it('should parse EPS value', () => {
            const epsContent = ' EPS of $1.29\n          beat by $1.11\n        ';
            expect(earningsHistory.parseEps(epsContent)).to.eq(1.29);
        });
        it('should handle erroneous data', () => {
            expect(earningsHistory.parseEps('\n   \n')).to.be.NaN;
            expect(earningsHistory.parseEps(undefined)).to.be.NaN;
            expect(earningsHistory.parseEps(null)).to.be.NaN;
            expect(earningsHistory.parseEps(' XYZ of $1.29\n')).to.be.NaN;
        });
        it('should handle Funds From Operations (FFO)', () => {
            const epsContent = ' FFO of -$0.16\n          missed by -$0.45\n        ';
            expect(earningsHistory.parseEps(epsContent)).to.eq(-0.16);
        }) 
    });
});