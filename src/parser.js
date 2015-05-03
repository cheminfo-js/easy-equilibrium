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

        parsed.reactives = parseElements(reactives);
        parsed.products = parseElements(products);



        // Split reactives with

        //
        //// Analyse each reactive and product
        //for(var i=0; i<reactives.length; i++) {
        //    var parsedReactive = parseReactionElement(reactives[i]);
        //    // Make sure chemcalc can process this element
        //    parsedReactive.c = cache.norm(parsedReactive.c);
        //    parsed.reactives.push(parsedReactive);
        //}
        //for(i=0; i<products.length; i++) {
        //    var parsedProduct = parseReactionElement(products[i]);
        //    // Make sure chemcalc can process this element
        //    parsedProduct.c = cache.norm(parsedProduct.c);
        //    parsed.products.push(parsedProduct);
        //}
        return parsed;
    }
};

function parseElements(els) {
    els = els.split(/\s+/);
    var r = [];
    var sign = 1;
    var n = 1;
    for(var i=0; i<els.length; i++) {
        if(els[i] === '-') {
            sign = -1;
            n = 1;
            continue;
        }
        if(els[i] === '+') {
            sign = 1;
            n = 1;
            continue;
        }
        if(!isNaN(+els[i])) {
            n = +els[i];
            continue;
        }
        r.push({
            c: cache.norm(els[i]),
            n: sign * n
        });
    }
    var count = {};
    for(i=0; i< r.length; i++) {
        if(!count[r[i].c]) count[r[i].c] = r[i].n;
        else count[r[i].c] += r[i].n;
    }

    var rr = [];
    for(var key in count) {
        rr.push({
            c: key,
            n: count[key]
        });
    }
    return rr;
}

function parseReactionElement(el) {
    var parsed = {};
    var reactive;
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
