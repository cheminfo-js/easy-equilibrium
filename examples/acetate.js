var Eq = require('..');

var desc = {
    eq: [
        'H+   -> H+', 1,
        'H2O  -> H2O', 1,
        'AcO- -> AcO-', 1,
        'OH-  -> H2O - H+', 1e14,
        'AcOH -> H(+1) + AcO-', Math.pow(10, -4.75)
    ],
    solvent: 'H2O',
    fixed: 'H(+1)',
    concentrations: {
        'H+': 0.1,
        'AcO-': 0.5
    }
};

var eq = new Eq(desc);