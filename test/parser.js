'use strict';

var parser = require('../src/parser');
var _ = require('lodash');

describe('Reaction parser', function () {
    it('H2O -> H+ - 2 OH-', function () {
        var r = parser.parseReaction('H2O -> H+ - 2 OH-');
        console.log(r);
        var isequal = _.isEqual(r, {
            reactives: [{ c: 'H2O', n: 1}],
            products: [{ c: 'H+', n: 1}, {c:'OH-', n: -2}]
        });
        isequal.should.be.true;
    });

    it('H2O -> H+ - OH- - OH-', function() {
        var r = parser.parseReaction('H2O -> H+ - OH- - OH-');
        var isequal = _.isEqual(r, {
            reactives: [{ c: 'H2O', n: 1}],
            products: [{ c: 'H+', n: 1}, {c:'OH-', n: -2}]
        });
        isequal.should.be.true;
    });
});
