'use strict';

var parser = require('../src/parser');

describe('Reaction parser', function () {
    it('should not throw', function () {
        (function() {
            parser.parseReaction('H2O -> H+ + OH-');
        }).should.not.throw();
    });
});
