const { saveJson } = require('../utils/saveJson.js');

function getPokesToHuntPerGroupOfElements(
  pokesToHunt,
  elements,
  shouldSaveJson = true,
) {
  const ret = {
    Summary: {},
  };

  Object.entries(pokesToHunt).forEach(([huntLvl, hunts]) => {
    ret[huntLvl] = [];
    ret.Summary[huntLvl] = 0;

    hunts.forEach(pokesInHunt => {
      const pokes = Array.isArray(pokesInHunt) ? pokesInHunt : [pokesInHunt];
      const pokesNames = pokes.map(p => p.general_info.name).join(' - ');

      let effectivenessScore = 0;
      elements.forEach(element => {
        pokes.forEach(p => {
          if (
            p.effectiveness['Muito Efetivo'] &&
            p.effectiveness['Muito Efetivo'].includes(element)
          ) {
            effectivenessScore += 2;
          } else if (
            p.effectiveness['Efetivo'] &&
            p.effectiveness['Efetivo'].includes(element)
          ) {
            effectivenessScore += 1.5;
          } else if (
            p.effectiveness['Normal'] &&
            p.effectiveness['Normal'].includes(element)
          ) {
            effectivenessScore += 1;
          } else if (
            p.effectiveness['Inefetivo'] &&
            p.effectiveness['Inefetivo'].includes(element)
          ) {
            effectivenessScore += 0.75;
          } else if (
            p.effectiveness['Muito Inefetivo'] &&
            p.effectiveness['Muito Inefetivo'].includes(element)
          ) {
            effectivenessScore += 0.5;
          } else if (
            p.effectiveness['Nulo'] &&
            p.effectiveness['Nulo'].includes(element)
          ) {
            effectivenessScore += 0;
          }
        });
      });

      const MIN_SCORE = 3;
      if (effectivenessScore >= MIN_SCORE * pokes.length) {
        if (!ret[huntLvl].includes(pokesNames)) {
          ret[huntLvl].push(pokesNames);
          ret.Summary[huntLvl] += 1;
        }
      }
    });
  });

  if (!!shouldSaveJson) {
    saveJson(ret, '9_filteredPokesToHuntPerGroupOfElements.json');
  }

  return ret;
}

exports.getPokesToHuntPerGroupOfElements = getPokesToHuntPerGroupOfElements;
