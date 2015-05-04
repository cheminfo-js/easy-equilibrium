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
    this._concentrations();
    this._constants();
    this._precipitationCoefficients();
    this._precipitationConstants();

    //
    this.equilibrium = new Equilibrium({
        precipitationConstants: this.precipitationConstants || [],
        precipitationCoefficients: this.precipitationCoefficients || [[]],
        solutionConstants: this.constants,
        solutionSpeciesCharges: this.charges,
        solutionCoefficients: this.coefficients,
        totalConcentrations: this.totalConcentrations,
        fixedActivities: this.fixedConcentrations,
        randomGenerator: this.desc.randomGenerator
    });
}

EasyEq.prototype._init = function() {
    this.Ka = {};
    this.equationsHash = {};
    var i, rname;
    this.equations = this.desc.eq.filter(function(v, i) {
        return i%2 === 0;
    });

    var constants = this.desc.eq.filter(function(v, i) {
        return i%2 === 1;
    });
    for(i=0; i<this.equations.length; i++) {
        rname = cache.norm(parser.parseReaction(this.equations[i]).reactives[0].c);
        this.Ka[rname] = constants[i];
        this.equationsHash[rname] = this.equations[i];
    }

    if(!this.desc.precipitations) return;

    this.precipitationConstants = this.desc.precipitations.filter(function(v, i) {
        return i%2 === 1;
    });
    this.precipitations = this.desc.precipitations.filter(function(v,i){
        return i%2 === 0;
    });


    for(i=0; i<this.precipitations.length; i++) {
        rname = cache.norm(parser.parseReaction(this.precipitations[i]).reactives[0].c);
    }
};

EasyEq.prototype._components = function() {
    this.components = [];
    for(var i=0; i<this.equations.length; i++) {

        var parsed = parser.parseReaction(this.equations[i]);
        if(parsed.reactives.length !== 1 || parsed.products.length !== 1) continue;
        var rname = cache.norm(parsed.reactives[0].c);
        var pname = cache.norm(parsed.products[0].c);
        if(rname !== pname) {
            console.log('continue');
            continue;
        }
        this.components.push(rname);
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
    this.coefficients = new Array(this.species.length);
    for(var i=0; i<this.species.length; i++) {
        this.coefficients[i] = new Array(this.components.length);
        fillArray(this.coefficients[i], 0);
    }



    for(var key in this.equationsHash) {
        var idx = this.species.indexOf(key);
        if(idx === -1) throw new Error('Cannot find specie');
        var parsed = parser.parseReaction(this.equationsHash[key]);

        // Rewrite products as linear combinations of components
        var products = this._rebase(parsed.products);
        //var products = parsed.products;
        for(i=0; i<products.length; i++) {
            var product = products[i];
            var cidx = this.components.indexOf(cache.norm(product.c));
            if(cidx === -1) {
                console.log(this.components);
                throw new Error('Cannot find component ' + product.c);

            }
            this.coefficients[idx][cidx] += product.n;
        }
    }
    console.log('coefficients', this.coefficients);
};

EasyEq.prototype._rebase = function(elements) {
    var r = [];
    for(var i=0; i<elements.length; i++) {
        var replaced = false;
        var idx = this.components.indexOf(elements[i].c);
        var idxs = this.species.indexOf(elements[i].c);
        if(idx === -1 && idxs > -1) {
            var eq = this.equationsHash[this.species[idxs]];
            if(eq) {
                var parsed = parser.parseReaction(eq);
                for(var j=0; j<parsed.products.length; j++) {
                    parsed.products[j].n *= elements[i].n;
                    r.push(parsed.products[j]);
                }
                replaced = true;
            }
        }
        if(!replaced) {
            r.push(elements[i]);
        }
    }
    return r;
};

EasyEq.prototype._precipitationCoefficients = function() {
    if(!this.desc.precipitations) return;
    this.precipitationCoefficients = new Array(this.precipitations.length);
    for(var i=0; i<this.precipitations.length; i++) {
        this.precipitationCoefficients[i] = new Array(this.components.length);
        fillArray(this.precipitationCoefficients[i], 0);
    }



    for(var j=0; j<this.precipitations.length; j++) {
        var parsed = parser.parseReaction(this.precipitations[j]);
        var products = this._rebase(parsed.products);
        for(i=0; i<products.length; i++) {
            var product = products[i];
            var cidx = this.components.indexOf(cache.norm(product.c));
            if(cidx === -1) {
                console.log(this.components);
                throw new Error('Cannot find component ' + product.c);
            }
            this.precipitationCoefficients[j][cidx] += product.n;
        }
    }
    console.log('precipitation coefficients', this.precipitationCoefficients);
};

EasyEq.prototype._precipitationConstants = function() {
      if(!this.desc.precipitations) return;
    for(var i=0;i<this.precipitationConstants.length; i++) {
        // this.precipitationConstants[i] = 1/this.precipitationConstants[i];
    }
    console.log('precipitation constants', this.precipitationConstants);
 };

EasyEq.prototype._concentrations = function() {
    this.totalConcentrations = [];
    this.fixedConcentrations = [];

    for(var i=0; i<this.components.length; i++) {
        if(this.isFixed(this.components[i])) {
            this.fixedConcentrations.push(this.desc.concentrations[this.components[i]] || 0);
            continue;
        }
        if(this.isSolvent(this.components[i])) continue;
        this.totalConcentrations.push(this.desc.concentrations[this.components[i]]);
    }
    console.log('total concentrations', this.totalConcentrations);
    console.log('fixed concentrations', this.fixedConcentrations);
};

EasyEq.prototype._constants = function() {
    this.constants = new Array(this.species.length);
    for(var key in this.Ka) {
        var idx = this.species.indexOf(key);
        if(idx === -1) throw new Error('Cannot link ka to specie');
        this.constants[idx] = 1/this.Ka[key];
    }
    console.log('constants', this.constants);
};

EasyEq.prototype.isSolvent = function(c) {
    if(this.desc.solvent === undefined || this.desc.solvent === 'none'){
        return false;
    }
    var c1 = cache.norm(this.desc.solvent);
    var c2 = cache.norm(c);
    return c1 === c2;
};

EasyEq.prototype.isFixed = function(c) {
    if(this.desc.fixed === undefined || this.desc.fixed === 'none'){
        return false;
    }
    var c1 = cache.norm(this.desc.fixed);
    var c2 = cache.norm(c);
    return c1 === c2;
};

EasyEq.prototype.hasFixed = function() {
    return this.desc.fixed !== undefined && this.desc.fixed !== 'none';
};

EasyEq.prototype.hasSolvent = function() {
    return this.desc.solvent !== undefined && this.desc.solvent !== 'none';
};

EasyEq.prototype.setEquilibriumActivity = function(c, concentration) {
    c = cache.norm(c);
    var idx = this.components.indexOf(c);
    if(idx === -1) throw new Error('Cannot set equilibrium activity of non-components');
    return this.equilibrium.setEquilibriumActivity(idx, concentration);
};

EasyEq.prototype.setTotalConcentration = function(c, concentration) {
    c = cache.norm(c);
    var idx = this.components.indexOf(c);
    if(idx === -1) throw new Error('Cannot set total concentration of non-components');
    return this.equilibrium.setTotalConcentration(idx, concentration);
};

EasyEq.prototype.calculate = function() {
    this.equilibrium.calculate.apply(this.equilibrium, arguments);
};

EasyEq.prototype.getSpeciesConcentrations = function() {
    var c = this.equilibrium.getSolutionSpeciesConcentrations();
    console.log(c.length);
    var r = {};
    for(var i=0; i< c.length; i++) {
        r[this.species[i]] = c[i];
    }
    return r;
};

EasyEq.prototype.saturationIndices = function() {
    return this.equilibrium.saturationIndices();
};

EasyEq.prototype.finalConcentrations = function() {
    return this.equilibrium.finalConcentrations();
}


function fillArray(arr, val) {
    for(var i=0; i<arr.length; i++) {
        arr[i] = val;
    }
}



module.exports = EasyEq;