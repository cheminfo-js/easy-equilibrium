'use strict';

var CC = require('chemcalc');

// Chemcalc cache in order not to recalculate all the time
// Also keeps one chemical formula for every product that has the same molecular weight

var chemcalcs = {};
var cByMW = {};

module.exports = {
    reset: function() {
        chemcalcs = {};
        cByMW = {};
    },

    getCC: function(c) {
        if(!chemcalcs[c]) {
            var r = CC.analyseMF(c);
            if(r.error) {
                throw new Error('chemcalc error on' + c + ': ' + r.error);
            }
            if(!cByMW[''+r.mw]) cByMW[''+r.mw] = c;
            chemcalcs[c] = r;
        }
        return chemcalcs[c];
    },

    norm: function(c) {
        var cc = module.exports.getCC(c);
        return cByMW[''+cc.mw];
    }
};