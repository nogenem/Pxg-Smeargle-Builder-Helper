const { saveJson } = require('../utils/saveJson.js');

function sortElementsByEffectiveness(effectivenessData, shouldSaveJson = true) {
  const ret = {
    Score: [],
    'Efetivo +': [],
    Normal: [],
    'Inefetivo -': [],
    Nulo: [],
  };
  const score = {};

  Object.keys(effectivenessData).forEach(element => {
    const effData = effectivenessData[element];
    score[element] = 0;

    let tmp = (effData['Muito Efetivo'] || 0) + (effData['Efetivo'] || 0);
    ret['Efetivo +'].push([element, tmp]);
    score[element] += tmp;

    tmp = effData['Normal'] || 0;
    ret['Normal'].push([element, tmp]);
    score[element] += tmp / 4;

    tmp = (effData['Muito Inefetivo'] || 0) + (effData['Inefetivo'] || 0);
    ret['Inefetivo -'].push([element, tmp]);
    score[element] -= tmp / 2;

    tmp = effData['Nulo'] || 0;
    ret['Nulo'].push([element, tmp]);
    score[element] -= tmp;
  });

  ret['Efetivo +'].sort((a, b) => b[1] - a[1]);
  ret['Normal'].sort((a, b) => b[1] - a[1]);
  ret['Inefetivo -'].sort((a, b) => b[1] - a[1]);
  ret['Nulo'].sort((a, b) => b[1] - a[1]);

  ret['Score'] = Object.entries(score).sort((a, b) => {
    return b[1] - a[1];
  });

  if (!!shouldSaveJson) {
    saveJson(ret, '4_sortedEffectiveness.json');
  }

  return ret;
}

exports.sortElementsByEffectiveness = sortElementsByEffectiveness;
