'use strict';

var parser = require('../src/parser');

describe('Reaction parser', function () {
    it('H2O -> H+ - 2 OH-', function () {
        parser.parseReaction('H2O -> H+ - 2 OH-')
            .should.be.eql({
            reactives: [{ c: 'H2O', n: 1}],
            products: [{ c: 'H+', n: 1}, {c:'OH-', n: -2}]
        });
    });

    it('H2O -> H+ - OH- - OH-', function() {
        parser.parseReaction('H2O -> H+ - OH- - OH-')
            .should.be.eql({
            reactives: [{ c: 'H2O', n: 1}],
            products: [{ c: 'H+', n: 1}, {c:'OH-', n: -2}]
        });
    });
});
