const { saveJson } = require('../utils/saveJson.js');

function getEffectivenessCountPerElement(pokemonData, shouldSaveJson = true) {
  const ret = {};

  pokemonData.forEach(pokemon => {
    pokemon = Array.isArray(pokemon) ? pokemon[pokemon.length - 1] : pokemon;

    Object.keys(pokemon.effectiveness).forEach(effKey => {
      pokemon.effectiveness[effKey].forEach(element => {
        if (!ret[element]) {
          ret[element] = {
            'Muito Efetivo': 0,
            Efetivo: 0,
            Normal: 0,
            Inefetivo: 0,
            'Muito Inefetivo': 0,
            Nulo: 0,
          };
        }
        if (!ret[element][effKey]) {
          ret[element][effKey] = 0;
        }
        ret[element][effKey]++;
      });
    });
  });

  if (!!shouldSaveJson) {
    saveJson(ret, '3_effectiveness.json');
  }

  return ret;
}

exports.getEffectivenessCountPerElement = getEffectivenessCountPerElement;
