const {lastQuarterGrowthFilter, prettyString} = require('./helper');
const {expect} = require('chai');

describe('filterByGrowthParameters', () => {
    describe('should filter on eps Q/Q (%)', () => {
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
        it('should be true when EPS Q/Q is "Pos" and EpsQQ=0', () => {
            expect(lastQuarterGrowthFilter({epsQQ: 0}, {
                '2021': {
                    Q2: {
                        date: 'Jun 2021',
                        eps: 3.61,
                        'eps estimate': '3.06',
                        'eps surprise': '0.55',
                        'eps surprise (%)': '17.97',
                        'eps Q/Q (%)': 'Pos',
                        'rev Q/Q (%)': 11.119602598395106,
                        'eps Y/Y (%)': 100.55555555555556,
                        'rev Y/Y (%)': 55.59122525414659
                    }                 
                }
            })).to.be.true;
        });
        it('should be false when EPS Q/Q is "Neg" and EpsQQ=0', () => {
            expect(lastQuarterGrowthFilter({epsQQ: 0}, {
                '2021': {
                    Q2: {
                        date: 'Jun 2021',
                        eps: 3.61,
                        'eps estimate': '3.06',
                        'eps surprise': '0.55',
                        'eps surprise (%)': '17.97',
                        'eps Q/Q (%)': 'Neg',
                        'rev Q/Q (%)': 11.119602598395106,
                        'eps Y/Y (%)': 100.55555555555556,
                        'rev Y/Y (%)': 55.59122525414659
                    }                 
                }
            })).to.be.false;
        });       
    });
           
    describe('should filter on EPS and Rev for Q/Q and Y/Y', () => {
        it('should be true when all parameters are defined and valid earnings values', () => {
            expect(lastQuarterGrowthFilter({epsQQ: 3.0, epsYY: 50, revQQ: 10, revYY: 50}, {
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
            })).to.be.true;
        });
        
        it('should be false when Y/Y is not set', () => {
            expect(lastQuarterGrowthFilter({epsQQ: 3.0, epsYY: 50, revQQ: 10, revYY: 50}, {
                '2021': {
                    Q2: {
                        date: 'Jun 2021',
                        eps: 3.61,
                        'eps estimate': '3.06',
                        'eps surprise': '0.55',
                        'eps surprise (%)': '17.97',
                        'eps Q/Q (%)': 9.393939393939398,
                        'rev Q/Q (%)': 11.119602598395106,
                        'eps Y/Y (%)': '-',
                        'rev Y/Y (%)': '-'
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
            })).to.be.false;
        });            

        it('should be false when all parameters are defined and invalid earnings values', () => {
            expect(lastQuarterGrowthFilter({epsQQ: 0, epsYY: 0, revQQ: 0, revYY: 0}, {
                '2021': {
                    Q2: {
                        date: 'Jun 2021',
                        eps: 3.61,
                        'eps estimate': '3.06',
                        'eps surprise': '0.55',
                        'eps surprise (%)': '17.97',
                        'eps Q/Q (%)': '',
                        'eps Y/Y (%)': null,
                        'rev Y/Y (%)': {}
                    }                    
                }
            })).to.be.false;
        });                
    });
}); 

describe('prettyPrint', () => {
    const aapl = {
        symbol: 'AAPL',
        earnings: {
            '2017': {
                Q4: {
                    date: 'Sep 2017',
                    eps: 0.52,
                    'eps estimate': '0.47',
                    'eps surprise': '0.05',
                    'eps surprise (%)': '10.64',
                    revenue: 52580000000,
                    'eps Q/Q (%)': 23.809523809523814,
                    'rev Q/Q (%)': 15.789473684210531,
                    'eps Y/Y (%)': '-',
                    'rev Y/Y (%)': '-'
                },
                Q3: {
                    date: 'Jun 2017',
                    eps: 0.42,
                    'eps estimate': '0.40',
                    'eps surprise': '0.02',
                    'eps surprise (%)': '5.00',
                    revenue: 45410000000,
                    'eps Q/Q (%)': -20.75471698113208,
                    'rev Q/Q (%)': -14.15879017013233,
                    'eps Y/Y (%)': '-',
                    'rev Y/Y (%)': '-'
                },
                Q2: {
                    date: 'Mar 2017',
                    eps: 0.53,
                    'eps estimate': '0.51',
                    'eps surprise': '0.02',
                    'eps surprise (%)': '3.92',
                    revenue: 52900000000,
                    'eps Q/Q (%)': -36.9047619047619,
                    'rev Q/Q (%)': -32.48245054243778,
                    'eps Y/Y (%)': '-',
                    'rev Y/Y (%)': '-'
                },
                Q1: {
                    date: 'Dec 2016',
                    eps: 0.84,
                    'eps estimate': '0.81',
                    'eps surprise': '0.03',
                    'eps surprise (%)': '3.70',
                    revenue: 78350000000,
                    'eps Q/Q (%)': '-',
                    'rev Q/Q (%)': '-',
                    'eps Y/Y (%)': '-',
                    'rev Y/Y (%)': '-'
                }
            },
            '2018': {
                Q4: {
                    date: 'Sep 2018',
                    eps: 0.73,
                    'eps estimate': '0.70',
                    'eps surprise': '0.03',
                    'eps surprise (%)': '4.29',
                    revenue: 62900000000,
                    'eps Q/Q (%)': 25.86206896551724,
                    'rev Q/Q (%)': 18.077717289281026,
                    'eps Y/Y (%)': 40.38461538461537,
                    'rev Y/Y (%)': 19.627234689996186
                },
                Q3: {
                    date: 'Jun 2018',
                    eps: 0.58,
                    'eps estimate': '0.54',
                    'eps surprise': '0.04',
                    'eps surprise (%)': '7.41',
                    revenue: 53270000000,
                    'eps Q/Q (%)': -14.705882352941192,
                    'rev Q/Q (%)': -12.872096826954527,
                    'eps Y/Y (%)': 38.095238095238095,
                    'rev Y/Y (%)': 17.308962783527846
                },
                Q2: {
                    date: 'Mar 2018',
                    eps: 0.68,
                    'eps estimate': '0.67',
                    'eps surprise': '0.01',
                    'eps surprise (%)': '1.49',
                    revenue: 61140000000,
                    'eps Q/Q (%)': -29.89690721649484,
                    'rev Q/Q (%)': -30.750934420659192,
                    'eps Y/Y (%)': 28.301886792452823,
                    'rev Y/Y (%)': 15.576559546313806
                },
                Q1: {
                    date: 'Dec 2017',
                    eps: 0.97,
                    'eps estimate': '0.96',
                    'eps surprise': '0.01',
                    'eps surprise (%)': '1.04',
                    revenue: 88290000000,
                    'eps Q/Q (%)': 86.53846153846152,
                    'rev Q/Q (%)': 67.91555724610119,
                    'eps Y/Y (%)': 15.476190476190489,
                    'rev Y/Y (%)': 12.686662412252714
                }
            },
            '2019': {
                Q4: {
                    date: 'Sep 2019',
                    eps: 0.76,
                    'eps estimate': '0.71',
                    'eps surprise': '0.05',
                    'eps surprise (%)': '7.04',
                    revenue: 64040000000.00001,
                    'eps Q/Q (%)': 38.18181818181816,
                    'rev Q/Q (%)': 19.011336182865655,
                    'eps Y/Y (%)': 4.109589041095885,
                    'rev Y/Y (%)': 1.812400635930067
                },
                Q3: {
                    date: 'Jun 2019',
                    eps: 0.55,
                    'eps estimate': '0.53',
                    'eps surprise': '0.02',
                    'eps surprise (%)': '3.77',
                    revenue: 53810000000,
                    'eps Q/Q (%)': -9.83606557377048,
                    'rev Q/Q (%)': -7.256118579800064,
                    'eps Y/Y (%)': -5.172413793103436,
                    'rev Y/Y (%)': 1.013703773230712
                },
                Q2: {
                    date: 'Mar 2019',
                    eps: 0.61,
                    'eps estimate': '0.59',
                    'eps surprise': '0.02',
                    'eps surprise (%)': '3.39',
                    revenue: 58020000000,
                    'eps Q/Q (%)': -41.346153846153854,
                    'rev Q/Q (%)': -31.182540623888034,
                    'eps Y/Y (%)': -10.294117647058831,
                    'rev Y/Y (%)': -5.103042198233565
                },
                Q1: {
                    date: 'Dec 2018',
                    eps: 1.04,
                    'eps estimate': '1.04',
                    'eps surprise': '0.00',
                    'eps surprise (%)': '0.00',
                    revenue: 84310000000,
                    'eps Q/Q (%)': 42.46575342465755,
                    'rev Q/Q (%)': 34.038155802861695,
                    'eps Y/Y (%)': 7.216494845360821,
                    'rev Y/Y (%)': -4.507871786159246
                }
            },
            '2020': {
                Q4: {
                    date: 'Sep 2020',
                    eps: 0.73,
                    'eps estimate': '0.70',
                    'eps surprise': '0.03',
                    'eps surprise (%)': '4.29',
                    revenue: 64700000000,
                    'eps Q/Q (%)': 12.307692307692308,
                    'rev Q/Q (%)': 8.393365722901658,
                    'eps Y/Y (%)': -3.9473684210526327,
                    'rev Y/Y (%)': 1.0306058713304145
                },
                Q3: {
                    date: 'Jun 2020',
                    eps: 0.65,
                    'eps estimate': '0.52',
                    'eps surprise': '0.13',
                    'eps surprise (%)': '25.00',
                    revenue: 59690000000,
                    'eps Q/Q (%)': 1.5625,
                    'rev Q/Q (%)': 2.3666609500943236,
                    'eps Y/Y (%)': 18.181818181818166,
                    'rev Y/Y (%)': 10.927336926221898
                },
                Q2: {
                    date: 'Mar 2020',
                    eps: 0.64,
                    'eps estimate': '0.57',
                    'eps surprise': '0.07',
                    'eps surprise (%)': '12.28',
                    revenue: 58310000000,
                    'eps Q/Q (%)': -48.8,
                    'rev Q/Q (%)': -36.495316924417345,
                    'eps Y/Y (%)': 4.918032786885251,
                    'rev Y/Y (%)': 0.49982764563942794
                },
                Q1: {
                    date: 'Dec 2019',
                    eps: 1.25,
                    'eps estimate': '1.14',
                    'eps surprise': '0.11',
                    'eps surprise (%)': '9.65',
                    revenue: 91820000000,
                    'eps Q/Q (%)': 64.4736842105263,
                    'rev Q/Q (%)': 43.37913803872577,
                    'eps Y/Y (%)': 20.192307692307686,
                    'rev Y/Y (%)': 8.907602894081368
                }
            },
            '2021': {
                Q4: {
                    date: 'Sep 2021',
                    eps: 1.24,
                    'eps estimate': '1.24',
                    'eps surprise': '0.00',
                    'eps surprise (%)': '0.00',
                    revenue: 83360000000,
                    'eps Q/Q (%)': -4.615384615384621,
                    'rev Q/Q (%)': 2.37013385730076,
                    'eps Y/Y (%)': 69.86301369863016,
                    'rev Y/Y (%)': 28.84080370942812
                },
                Q3: {
                    date: 'Jun 2021',
                    eps: 1.3,
                    'eps estimate': '1.01',
                    'eps surprise': '0.29',
                    'eps surprise (%)': '28.71',
                    revenue: 81430000000,
                    'eps Q/Q (%)': -7.142857142857128,
                    'rev Q/Q (%)': -9.098012949319045,
                    'eps Y/Y (%)': 100,
                    'rev Y/Y (%)': 36.42151114089462
                },
                Q2: {
                    date: 'Mar 2021',
                    eps: 1.4,
                    'eps estimate': '0.99',
                    'eps surprise': '0.41',
                    'eps surprise (%)': '41.41',
                    revenue: 89580000000,
                    'eps Q/Q (%)': -16.666666666666675,
                    'rev Q/Q (%)': -19.615936826992108,
                    'eps Y/Y (%)': 118.75,
                    'rev Y/Y (%)': 53.62716515177499
                },
                Q1: {
                    date: 'Dec 2020',
                    eps: 1.68,
                    'eps estimate': '1.42',
                    'eps surprise': '0.26',
                    'eps surprise (%)': '18.31',
                    revenue: 111440000000,
                    'eps Q/Q (%)': 130.13698630136986,
                    'rev Q/Q (%)': 72.24111282843894,
                    'eps Y/Y (%)': 34.399999999999984,
                    'rev Y/Y (%)': 21.367893705075147
                }
            }
        }
    };
    it('should return nicely formatted string', () => {           
        const expected = '\u001b[1m\u001b[22m\n\u001b[1mAAPL\u001b[22m\n            EPS   EPS Q/Q (%)  EPS Y/Y (%)       Rev   Rev Q/Q (%)  Rev Y/Y (%)\nQ4 2021    1.24            -5           70     83.4B             2           29\nQ3 2021     1.3            -7          100     81.4B            -9           36\nQ2 2021     1.4           -17          119     89.6B           -20           54\nQ1 2021    1.68           130           34    111.4B            72           21\nQ4 2020    0.73            12           -4     64.7B             8            1\nQ3 2020    0.65             2           18     59.7B             2           11\nQ2 2020    0.64           -49            5     58.3B           -36            0\nQ1 2020    1.25            64           20     91.8B            43            9\n';
        const output = prettyString(2, aapl);
        expect(output).to.equal(expected);
    });
})