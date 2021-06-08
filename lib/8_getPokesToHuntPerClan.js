const { saveJson } = require('../utils/saveJson.js');

const CLANS_ELEMENTS = {
  Malefic: ['Ghost', 'Dark', 'Poison'],
  Orebound: ['Ground', 'Rock'],
  Volcanic: ['Fire'],
  Naturia: ['Grass', 'Bug'],
  Gardestrike: ['Fighting', 'Normal'],
  Ironhard: ['Crystal', 'Steel'],
  Wingeon: ['Flying', 'Dragon'],
  Raibolt: ['Electric'],
  Psycraft: ['Psychic', 'Fairy'],
  Seavell: ['Water', 'Ice'],
};

function getPokesToHuntPerClan(pokesToHunt, shouldSaveJson = true) {
  const ret = {};

  Object.entries(pokesToHunt).forEach(([huntLvl, hunts]) => {
    ret[huntLvl] = {};

    hunts.forEach(pokesInHunt => {
      Object.entries(CLANS_ELEMENTS).forEach(([clan, elements]) => {
        if (!ret[huntLvl][clan]) ret[huntLvl][clan] = [];

        const pokes = Array.isArray(pokesInHunt) ? pokesInHunt : [pokesInHunt];

        let isEffective = false;
        elements.forEach(element => {
          let effectivenessCount = 0;
          pokes.forEach(p => {
            if (
              p.effectiveness['Muito Efetivo'] &&
              p.effectiveness['Muito Efetivo'].includes(element)
            ) {
              effectivenessCount++;
            } else if (
              p.effectiveness['Efetivo'] &&
              p.effectiveness['Efetivo'].includes(element)
            ) {
              effectivenessCount++;
            }
          });

          if (effectivenessCount === pokes.length) isEffective = true;
        });

        if (isEffective) {
          const pokesNames = pokes.map(p => p.general_info.name).join(' - ');
          if (!ret[huntLvl][clan].includes(pokesNames))
            ret[huntLvl][clan].push(pokesNames);
        }
      });
    });
  });

  if (!!shouldSaveJson) {
    saveJson(ret, '8_filteredPokesToHuntPerClan.json');
  }

  return ret;
}

exports.getPokesToHuntPerClan = getPokesToHuntPerClan;
