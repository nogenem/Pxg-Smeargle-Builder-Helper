const { saveJson } = require('../utils/saveJson.js');

function getPokemonDataStats(pokemonData, shouldSaveJson = true) {
  const ret = {
    PokeNames: {},
    PokeLevels: {},
    PokeElements: {},
    PokeAbilities: {},
    PokeBoosts: {},
    PokeMaterias: {},
    PokeEvolutionStones: {},
    EffectivenesKeys: {},
    EffectivenesTypes: {},
    Movesets: {},
    MoveNames: {},
    MoveCDs: {},
    MoveTypes: {},
    MoveLevels: {},
    MoveDetails: {},
  };

  pokemonData.forEach(pokemon => {
    if (!!pokemon.general_info.name) {
      if (!ret.PokeNames[pokemon.general_info.name]) {
        ret.PokeNames[pokemon.general_info.name] = 0;
      }
      ret.PokeNames[pokemon.general_info.name]++;
    }

    if (!!pokemon.general_info.level) {
      if (!ret.PokeLevels[pokemon.general_info.level]) {
        ret.PokeLevels[pokemon.general_info.level] = 0;
      }
      ret.PokeLevels[pokemon.general_info.level]++;
    }

    if (!!pokemon.general_info.elements) {
      pokemon.general_info.elements.forEach(element => {
        if (!ret.PokeElements[element]) {
          ret.PokeElements[element] = 0;
        }
        ret.PokeElements[element]++;
      });
    }

    if (!!pokemon.general_info.abilities) {
      pokemon.general_info.abilities.forEach(ability => {
        if (!ret.PokeAbilities[ability]) {
          ret.PokeAbilities[ability] = 0;
        }
        ret.PokeAbilities[ability]++;
      });
    }

    if (!!pokemon.general_info.boost) {
      pokemon.general_info.boost.forEach(boost => {
        if (!ret.PokeBoosts[boost]) {
          ret.PokeBoosts[boost] = 0;
        }
        ret.PokeBoosts[boost]++;
      });
    }

    if (!!pokemon.general_info.materias) {
      pokemon.general_info.materias.forEach(materia => {
        if (!ret.PokeMaterias[materia]) {
          ret.PokeMaterias[materia] = 0;
        }
        ret.PokeMaterias[materia]++;
      });
    }

    if (!!pokemon.general_info.evolution_stones) {
      pokemon.general_info.evolution_stones.forEach(stone => {
        if (!ret.PokeEvolutionStones[stone]) {
          ret.PokeEvolutionStones[stone] = 0;
        }
        ret.PokeEvolutionStones[stone]++;
      });
    }

    Object.keys(pokemon.effectiveness).forEach(eff => {
      if (!ret.EffectivenesKeys[eff]) {
        ret.EffectivenesKeys[eff] = 0;
      }
      ret.EffectivenesKeys[eff]++;

      pokemon.effectiveness[eff].forEach(type => {
        if (!ret.EffectivenesTypes[type]) {
          ret.EffectivenesTypes[type] = 0;
        }
        ret.EffectivenesTypes[type]++;
      });
    });

    Object.keys(pokemon.moves).forEach(moveset => {
      if (!ret.Movesets[moveset]) {
        ret.Movesets[moveset] = 0;
      }
      ret.Movesets[moveset]++;

      pokemon.moves[moveset].forEach(move => {
        if (!ret.MoveNames[move.name]) {
          ret.MoveNames[move.name] = 0;
        }
        ret.MoveNames[move.name]++;

        if (!ret.MoveCDs[move.cd]) {
          ret.MoveCDs[move.cd] = 0;
        }
        ret.MoveCDs[move.cd]++;

        if (!ret.MoveTypes[move.type]) {
          ret.MoveTypes[move.type] = 0;
        }
        ret.MoveTypes[move.type]++;

        if (!ret.MoveLevels[move.level]) {
          ret.MoveLevels[move.level] = 0;
        }
        ret.MoveLevels[move.level]++;

        move.details.forEach(detail => {
          if (!ret.MoveDetails[detail]) {
            ret.MoveDetails[detail] = 0;
          }
          ret.MoveDetails[detail]++;
        });
      });
    });
  });

  if (!!shouldSaveJson) {
    saveJson(ret, '7_pokemonDataStats.json');
  }

  return ret;
}

exports.getPokemonDataStats = getPokemonDataStats;
