const { saveJson } = require('../utils/saveJson.js');

/*
filters = {
  pokeName: (name) => name === 'Venusaur',
  pokeLevel: (level) => level >= 80,
  moveset: 'PVE' | 'PVP' | 'ALL',
  moveIndex: (idx) => idx >= 5,
  moveDetails: (details) => details.includes('Aoe'),
  moveName: (name) => name === 'Bug Bite',
  moveCD: (cd) => (+cd) <= 50,
  moveType: (type) => type === 'Dark',
  moveLevel: (level) => level >= 80,
}
*/
const noop = () => true;

function getFilteredMoves(
  pokemonData,
  {
    pokeName = noop,
    pokeLevel = noop,
    moveset = 'ALL',
    moveIndex = noop,
    moveDetails = noop,
    moveName = noop,
    moveCD = noop,
    moveType = noop,
    moveLevel = noop,
  },
  shouldSaveJson = true,
) {
  const ret = {
    M1: [],
    M2: [],
    M3: [],
    M4: [],
    M5: [],
    M6: [],
    M7: [],
    M8: [],
    M9: [],
    M10: [],
    M11: [],
    M12: [],
    M13: [],
    M14: [],
    M15: [],
  };

  pokemonData.forEach(pokemon => {
    let flag1 = !!pokeName(pokemon.general_info.name);

    flag1 = flag1 && !!pokeLevel(pokemon.general_info.nevel);

    if (!!flag1) {
      moveset = (moveset || 'all').toUpperCase();
      const moves =
        !!moveset && !!pokemon.moves[moveset]
          ? pokemon.moves[moveset]
          : !!pokemon.moves.ALL
          ? pokemon.moves.ALL
          : pokemon.moves.PVE;

      if (!!moves) {
        moves.forEach((move, idx) => {
          let flag2 = !!moveIndex(idx + 1);

          flag2 = flag2 && !!moveDetails(move.details);

          flag2 = flag2 && !!moveName(move.name);

          flag2 = flag2 && !!moveCD(move.cd);

          flag2 = flag2 && !!moveType(move.type);

          flag2 = flag2 && !!moveLevel(move.level);

          if (!!flag2) {
            if (!ret[`M${idx + 1}`]) ret[`M${idx + 1}`] = [];

            ret[`M${idx + 1}`].push({
              pokeName: pokemon.general_info.name,
              pokeLevel: pokemon.general_info.level,
              ...move,
            });
          }
        });
      }
    }
  });

  if (Object.keys(ret).length > 0 && !!shouldSaveJson) {
    saveJson(ret, 'filteredMoves.json');
  }

  return ret;
}

exports.getFilteredMoves = getFilteredMoves;
