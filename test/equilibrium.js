'use strict';

var Equilibrium = require('..');
var parser = require('../src/parser');
var _ = require('lodash');

var CaFeCO3 = {
    eq: [
        'CO3-- -> CO3--', 1,
        'Ca++   -> Ca++', 1,
        'Fe++   -> Fe++', 1,
        'H+ -> H+', 1,
        'H2O  -> H2O', 1,
        'OH- -> H2O - H+', 1e14,
        'HCO3- -> H+ + CO3--', 1/(2.1e10),
        'H2CO3 -> 2 H+ + CO3--', 1/(2.2e17)
    ],
    precipitations: [
        'CaCO3 -> Ca++ + CO3--', 4.8e-9,
        'CaO2H2 -> Ca++ + 2 H2O - 2 H+', 4.68e22,
        'FeCO3 -> Fe++ + CO3--', 3.3e-11,
        'FeO2H2 -> Fe++ + 2 H2O - 2 H+', 4.87e21
    ],
    solvent: 'H2O',
    fixed: 'H+',
    concentrations: {
        'H+': 0.1,
        'Fe++': 0.07,
        'Ca++': 0.07,
        'CO3--': 0.1
    },
    randomGenerator: ['seed', '123']
};

describe('easy-equilibrium', function () {
    it('Rebase', function() {
        var eq = new Equilibrium(CaFeCO3);
        var el = parser.parseReaction('FeO2H2 -> Fe++ + 2 OH-');
        console.log('un-rebased', el.products);
        var rebased = eq._rebase(el.products);
        console.log('Rebased', rebased);
        var r = _.isEqual(rebased, [ { c: 'Fe++', n: 1 }, { c: 'H2O', n: 2 }, { c: 'H+', n: -2 } ]);
        r.should.be.true;
    });

    it('Unindependant', function() {
        (function() {
            var desc1 = _.cloneDeep(CaFeCO3);
            desc1.eq[12] = 'HCO3- -> 2 H+ + CO2';
            var eq = new Equilibrium(desc1);
        }).should.throw('Cannot find component CO2');


    })
});
