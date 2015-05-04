var Eq = require('..');

var desc = {
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
    }
};

var eq = new Eq(desc);
for(var ph=2; ph<=2; ph=ph+0.02) {
    var H = Math.pow(10, -ph);
    eq.setEquilibriumActivity('H+', H);
    eq.calculate(true, false);
    var x = eq.finalConcentrations();

    console.log(x);
    //var c = eq.getSpeciesConcentrations();
    var solProducts = eq.saturationIndices();
}