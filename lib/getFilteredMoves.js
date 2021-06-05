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
function getFilteredMoves(pokemonData, filters, shouldSaveJson = true) {
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
    let flag1 =
      typeof filters.pokeName === 'function'
        ? !!filters.pokeName(pokemon.generalInfo.Nome)
        : true;

    flag1 =
      flag1 &&
      (typeof filters.pokeLevel === 'function'
        ? !!filters.pokeLevel(pokemon.generalInfo.Level)
        : true);

    if (!!flag1) {
      const moveset = (filters.moveset || 'all').toUpperCase();
      const moves =
        !!moveset && !!pokemon.moves[moveset]
          ? pokemon.moves[moveset]
          : !!pokemon.moves.ALL
          ? pokemon.moves.ALL
          : pokemon.moves.PVE;

      if (!!moves) {
        moves.forEach((move, idx) => {
          let flag2 =
            typeof filters.moveIndex === 'function'
              ? !!filters.moveIndex(idx + 1)
              : true;

          flag2 =
            flag2 &&
            (typeof filters.moveDetails === 'function'
              ? !!filters.moveDetails(move.details)
              : true);

          flag2 =
            flag2 &&
            (typeof filters.moveName === 'function'
              ? !!filters.moveName(move.name)
              : true);

          flag2 =
            flag2 &&
            (typeof filters.moveCD === 'function'
              ? !!filters.moveCD(move.cd)
              : true);

          flag2 =
            flag2 &&
            (typeof filters.moveType === 'function'
              ? !!filters.moveType(move.type)
              : true);

          flag2 =
            flag2 &&
            (typeof filters.moveLevel === 'function'
              ? !!filters.moveLevel(move.level)
              : true);

          if (!!flag2) {
            if (!ret[`M${idx + 1}`]) ret[`M${idx + 1}`] = [];

            ret[`M${idx + 1}`].push({
              pokeName: pokemon.generalInfo.Nome,
              pokeLevel: pokemon.generalInfo.Level,
              ...move,
            });
          }
        });
      }
    }
  });

  if (Object.keys(ret).length > 0 && !!shouldSaveJson) {
    saveJson({ filters: Object.keys(filters), ...ret }, 'filteredMoves.json');
  }

  return ret;
}

exports.getFilteredMoves = getFilteredMoves;
