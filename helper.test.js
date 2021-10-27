const {filterByGrowthParameters} = require('./helper');
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
                eps: 2,
                'eps Q/Q (%)': 9.393939393939398,
            },
            Q1: {
                eps: 1
            }
        }
    };

    it('should return true for no parameters', () => {
        expect(filterByGrowthParameters(earningsData, {epsQQ: null})).to.be.true;
    });

    describe('should filter on eps Q/Q (%)', () => {
        
        it('should be true when above threshold', () => {
            expect(filterByGrowthParameters(earningsData, {'epsQQ': 9.3})).to.be.true;
        });
        it('should be true when threshold is zero', () => {
            expect(filterByGrowthParameters(earningsData, {'epsQQ': 0})).to.be.true
        });
        it('should be false when below threshold', () => {
            expect(filterByGrowthParameters(earningsData, {'epsQQ': 10})).to.be.false
        });
    });    
}); 