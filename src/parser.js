'use strict';

var cache = require('./cc-cache');

module.exports = {
    // For example 'OH- -> H2O - H+'
    // returns
    // {
    //   reactives: [{c: 'H+', n: 1}],
    //   products: [{c: 'H2O', n: 1}, {c: 'H+', n: -1}]
    // }


    parseReaction: function(r, options) {
        var parsed = {reactives: [], products: []};
        // TODO: add options for constraints on how should the reactions be like
        //       max number of reactives etc...
        var defaultOptions = {

        };
        // Separate reactives and products
        var rp = r.split(' -> ');
        if(rp.length !== 2) {
            throw new Error('Invalid reaction');
        }

        var reactives = rp[0];
        var products = rp[1];

        var reg = /\s\+\s|\s-\s/
        reactives = reactives.split(reg);

        products = products.split(reg);
        if(products.length < 1) {
            throw new Error('Invalid products');
        }


        // Split reactives with


        // Analyse each reactive and product
        for(var i=0; i<reactives.length; i++) {
            var parsedReactive = parseReactionElement(reactives[i]);
            // Make sure chemcalc can process this element
            cache.getCC(parsedReactive.c);
            parsed.reactives.push(parsedReactive);
        }
        for(i=0; i<products.length; i++) {
            var parsedProduct = parseReactionElement(products[i]);
            // Make sure chemcalc can process this element
            cache.getCC(parsedProduct.c);
            parsed.products.push(parsedReactive);
        }
        return parsed;
    }
};

function parseReactionElement(el) {
    var parsed = {};
    var reactive, product, c, n;
    reactive = el.split('*');
    if(reactive.length > 2) throw new Error('Invalid reactive ' + el);
    if(reactive.length === 2) {
        parsed.n = +(reactive[0]);
        parsed.c = reactive[1].trim();
    }
    else {
        parsed.n = 1;
        parsed.c = reactive[0].trim();
    }
    return parsed;
}