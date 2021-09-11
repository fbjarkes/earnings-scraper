# earnings-scraper
A simple earnings reports web scraping tool.
Using Puppeter non-headless browser mode in order to avoid robot/bot web scraping protection. 

Calculates and prints the most interesting numbers, e.g. yearly and quarterly EPS/Rev growth, to console.
## Example
```
 $ earnings-scraper.js --symbols AAPL,TSLA
```
Output:
```
AAPL
            EPS   EPS Q/Q (%)  EPS Y/Y (%)       Rev   Rev Q/Q (%)  Rev Y/Y (%)
Q3 2021     1.3            -7          100     81.4B            -9           36
Q2 2021     1.4           -17          119     89.6B           -20           54
Q1 2021    1.68           130           34    111.4B            72           21
Q4 2020    0.73            12           -4     64.7B             8            1
Q3 2020    0.65             2           18     59.7B             2           11
Q2 2020    0.64           -49            5     58.3B           -36            0
Q1 2020    1.25            64           20     91.8B            43            9

TSLA
            EPS   EPS Q/Q (%)  EPS Y/Y (%)       Rev   Rev Q/Q (%)  Rev Y/Y (%)
Q2 2021    1.45            56          230     12.0B            15           98
Q1 2021    0.93            16          304     10.4B            -3           73
Q4 2020     0.8             5           95     10.7B            22           46
Q3 2020    0.76            73          105      8.8B            45           39
Q2 2020    0.44            91          Pos      6.0B             1           -5
Q1 2020    0.23           -44          Pos      6.0B           -19           32
```
## Non-headless Chromium popup workaround
``
sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-901912/chrome-mac/Chromium.app
``