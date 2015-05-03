var Eq = require('..');

var desc = {
    eq: [
        'CO3-- -> CO3--', 1,
        'H+ -> H+', 1,
        'H2O  -> H2O', 1,
        'OH- -> H2O - H+', 1e14,
        'HCO3- -> H+ + CO3--', 1/(2.1e10),
        'H2CO3 -> 2 H+ + CO3--', 1/(2.2e17)
    ],
    solvent: 'H2O',
    fixed: 'H+',
    concentrations: {
        'H+': 0.1,
        'CO3--': 0.7
    }
};

var eq = new Eq(desc);

for(var ph=4.75; ph<=4.75; ph++) {
    var H = Math.pow(10, -ph);
    console.log(H);
    eq.setEquilibriumActivity('H+', H);
    eq.calculate(true, false);
    var c = eq.getSpeciesConcentrations();
    console.log(c);
}