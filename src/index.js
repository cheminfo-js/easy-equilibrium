'use strict';

var Equilibrium = require('chem-equilibrium');
var parser = require('./parser');
var cache = require('./cc-cache');

function EasyEq(desc) {
    this.desc = desc;
    this._init();
    this._components();
    this._species();
    this._charges();
    this._coefficients();

    //
    //this.equilibrium = new Equilibrium({
    //    precipitationConstants: [],
    //    precipitationCoefficients: [[]],
    //    solutionConstants: constants,
    //    solutionSpeciesCharges: this.charges,
    //    solutionCoefficients: this.coefficients,
    //    totalConcentrations: this.totalConcentrations,
    //    fixedActivities: this.fixedConcentrations,
    //    randomGenerator: ['seed', 123]
    //});
}

EasyEq.prototype._init = function() {
    this.Ka = {};
    this.equations = this.desc.eq.filter(function(v, i) {
        return i%2 === 0;
    });
    var constants = this.desc.eq.filter(function(v, i) {
        return i%2 === 1;
    });
    for(var i=0; i<this.equations.length; i++) {
        var rname = cache.norm(parser.parseReaction(this.equations[i]).reactives[0].c);
        this.Ka[rname] = constants[i];
    }
};

EasyEq.prototype._components = function() {
    this.components = [];
    for(var i=0; i<this.equations.length; i++) {

        var parsed = parser.parseReaction(this.equations[i]);
        if(parsed.reactives.length !== 1 || parsed.products.length !== 1) continue;
        var rname = cache.norm(parsed.reactives[0].c);
        var pname = cache.norm(parsed.products[0].c);
        if(rname !== pname) continue;
        this.components[i] = rname;
    }

    // Order components
    // Find fixed component
    if(this.desc.fixed) {
        var fixed = cache.norm(this.desc.fixed);
        var idx = this.components.indexOf(fixed);
        if(idx > -1) {
            this.components.splice(idx,1);
            this.components.push(fixed);
        }
    }

    if(this.desc.solvent) {
        var solvent = cache.norm(this.desc.solvent);
        var idx = this.components.indexOf(solvent);
        if(idx > -1) {
            this.components.splice(idx, 1);
            this.components.push(solvent);
        }
    }
    console.log('components', this.components);
};

EasyEq.prototype._species = function() {
    this.species = new Array(this.components.length);
    for(var i=0; i<this.components.length; i++) this.species[i] = this.components[i];

    for(i=0; i<this.equations.length; i++) {
        var parsed = parser.parseReaction(this.equations[i]);
        var rname = cache.norm(parsed.reactives[0].c);
        if(this.species.indexOf(rname) === -1) this.species.push(rname);
    }
    console.log('species', this.species);
};

EasyEq.prototype._charges = function() {
    this.charges = [];
    for(var i=0; i<this.species.length; i++) {
        var totalCharge = 0;
        var cc = cache.getCC(this.species[i]);
        for (var j = 0; j < cc.parts.length; j++) {
            totalCharge += (cc.parts[j].charge || 0);
        }
        this.charges.push(totalCharge);
    }
    console.log('charges', this.charges);
};

EasyEq.prototype._coefficients = function() {
    this.coefficients = [];
};

EasyEq.prototype.isSolvent = function(c) {
    if(this.desc.solvent === undefined || this.desc.solvent === 'none'){
        return false;
    }
    var c1 = cache.norm(this.desc.solvent);
    var c2 = cache.norm(c);
    return c1 === c2;
};

module.exports = EasyEq;