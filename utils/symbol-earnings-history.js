
class SymbolEarningsHistory {
    
    #symbol
    #earnings

    constructor(symbol, earnings) {
        this.#symbol = symbol;
        this.#earnings = earnings;
    }
    
    getSymbol() {
        return this.#symbol;
    }

    getEarnings() {
        return this.#earnings;
    }

    isError() {
        return Object.entries(this.#earnings).length === 0;
    }
}

module.exports = {
    SymbolEarningsHistory
};