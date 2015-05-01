'use strict';

var parser = require('../src/parser');

describe('Reaction parser', function () {
    it('should not throw', function () {
        (function() {
            var r = parser.parseReaction('H2O -> H+ - 2 OH-');
            console.log(r);
        }).should.not.throw();
    });
});
