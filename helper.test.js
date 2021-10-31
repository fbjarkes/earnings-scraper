const {lastQuarterGrowthFilter} = require('./helper');
const {expect} = require('chai');

describe('filterByGrowthParameters', () => {
    const earningsData = {
        '2020': {
            Q4: {
                eps: 4
            },
            Q3: {
                eps: 3
            },
            Q2: {
                eps: 2
            },
            Q1: {
                eps: 1
            }
        },
        '2021': {
            Q2: {
                date: 'Jun 2021',
                eps: 3.61,
                'eps estimate': '3.06',
                'eps surprise': '0.55',
                'eps surprise (%)': '17.97',
                'eps Q/Q (%)': 9.393939393939398,
                'rev Q/Q (%)': 11.119602598395106,
                'eps Y/Y (%)': 100.55555555555556,
                'rev Y/Y (%)': 55.59122525414659
            },
            Q1: {
                date: 'Mar 2021',
                eps: 3.3,
                'eps estimate': '2.34',
                'eps surprise': '0.96',
                'eps surprise (%)': '41.03',
                revenue: 26170000000,
                'eps Q/Q (%)': -14.948453608247425,
                'rev Q/Q (%)': -6.768792304951909,
                'eps Y/Y (%)': 92.98245614035088,
                'rev Y/Y (%)': 47.51972942502818
            }
        }
    };

    describe('should filter on eps Q/Q (%)', () => {
        it('should return true for no parameters', () => {
            expect(lastQuarterGrowthFilter({epsQQ: null}, earningsData)).to.be.true;
            expect(lastQuarterGrowthFilter({}, earningsData)).to.be.true;
        });
        it('should be true when above threshold', () => {
            expect(lastQuarterGrowthFilter({'epsQQ': 9.3}, earningsData)).to.be.true;
        });
        it('should be true when threshold is zero', () => {
            expect(lastQuarterGrowthFilter({'epsQQ': 0}, earningsData)).to.be.true
        });
        it('should be false when below threshold', () => {
            expect(lastQuarterGrowthFilter({'epsQQ': 10}, earningsData)).to.be.false
        });
    });

    describe('should filter on EPS and Rev for Q/Q and Y/Y', () => {
        it('should be true when all parameters are defined and valid', () => {
            expect(lastQuarterGrowthFilter({epsQQ: 3.0, epsYY: 50, revQQ: 10, revYY: 50}, earningsData));
        })
    });
}); 