const ACTIONS = {
  SCRAP_POKES_FROM_WIKI: { saveErrors: false, exec: true, saveJson: true },

  GET_POKES_TO_HUNT: { exec: false, saveJson: true },
  GET_EFFECTIVENESS_COUNT_PER_ELEMENT: {
    exec: false,
    saveJson: true,
  },
  SORT_EFFECTIVENESS_DATA: { exec: false, saveJson: true },

  SCRAP_SMEARGLE_BLOCKED_DATA_FROM_WIKI: { exec: false, saveJson: true },

  GET_FILTERED_MOVES: { exec: false, saveJson: true },

  GET_POKEMON_DATA_STATS: { exec: false, saveJson: true },
};

(async function () {
  // LOAD JSONs
  let pokemonData = require('./json/1-1_pokemons.json');

  if (!pokemonData || !Array.isArray(pokemonData)) {
    throw new Error('`./json/1-1_pokemons.json` should have an array ([])!');
  }

  let smeargleBlockedData = require('./json/5_smeargleBlockedData.json');

  if (!smeargleBlockedData || typeof smeargleBlockedData !== 'object') {
    throw new Error(
      '`./json/5_smeargleBlockedData.json` should have an object ({})!',
    );
  }

  // ACTIONS
  if (ACTIONS.SCRAP_POKES_FROM_WIKI.exec) {
    const { scrapWiki } = require('./lib/1_scrapPokesFromWiki.js');

    pokemonData = await scrapWiki(
      pokemonData,
      ACTIONS.SCRAP_POKES_FROM_WIKI.saveJson,
      ACTIONS.SCRAP_POKES_FROM_WIKI.saveErrors,
    );
  }

  let pokesToHunt = {};
  if (ACTIONS.GET_POKES_TO_HUNT.exec) {
    const { getPokesToHunt } = require('./lib/2_getPokesToHunt.js');

    pokesToHunt = getPokesToHunt(
      pokemonData,
      ACTIONS.GET_POKES_TO_HUNT.saveJson,
    );

    // console.log('pokesToHunt.len', pokesToHunt.length);
  }

  let effectivenessCountPerElement = {};
  if (
    ACTIONS.GET_EFFECTIVENESS_COUNT_PER_ELEMENT.exec &&
    Object.keys(pokesToHunt).length > 0
  ) {
    const {
      getEffectivenessCountPerElement,
    } = require('./lib/3_getEffectivenessCountPerElement.js');

    effectivenessCountPerElement = getEffectivenessCountPerElement(
      // pokemonData,
      pokesToHunt['150-299'],
      // pokesToHunt['300-399'],
      // pokesToHunt['400-600'],
      ACTIONS.GET_EFFECTIVENESS_COUNT_PER_ELEMENT.saveJson,
    );
  }

  let sortedEffectiveness = {};
  if (
    ACTIONS.SORT_EFFECTIVENESS_DATA.exec &&
    Object.keys(effectivenessCountPerElement).length > 0
  ) {
    const {
      sortElementsByEffectiveness,
    } = require('./lib/4_sortElementsByEffectiveness.js');

    sortedEffectiveness = sortElementsByEffectiveness(
      effectivenessCountPerElement,
      ACTIONS.SORT_EFFECTIVENESS_DATA.saveJson,
    );

    // console.log(sortedEffectiveness);
  }

  if (
    ACTIONS.SCRAP_SMEARGLE_BLOCKED_DATA_FROM_WIKI.exec &&
    Object.keys(smeargleBlockedData).length === 0
  ) {
    const {
      scrapWiki,
    } = require('./lib/5_scrapSmeargleBlockedDataFromWiki.js');

    smeargleBlockedData = await scrapWiki(
      pokemonData,
      ACTIONS.SCRAP_SMEARGLE_BLOCKED_DATA_FROM_WIKI.saveJson,
    );

    // console.log(smeargleBlockedData);
  }

  let filteredMoves = {};
  if (ACTIONS.GET_FILTERED_MOVES.exec) {
    const { arrayDiff } = require('./utils/arrayDiff.js');
    const { getFilteredMoves } = require('./lib/6_getFilteredMoves.js');

    const NOT_REAL_AOE_MOVES = [
      'Waterfall',
      'Rapid Spin',
      'Aurora Beam',
      'Frost Breath',
      'Assurance',
      'Scald',
      'Aqua Jet',
      'Ice Beam',
      'Hydro Cannon',
      'Shadowave',
      'Lunar Beam',
      'Ancient Power',
      'Whirlpool',
      'Power Gem',
      'Head Smash',
      'Icy Wind',

      // Stuns
      'Brick Break',
      'Hammer Arm',
    ];
    const PULL_MOVES = ['Eruption', 'Magnet Pull', 'Spectral Grap'];

    const baseFilter = {
      pokeName: name => !smeargleBlockedData.pokemons.includes(name),
      moveLevel: level => level >= 80,
      moveIndex: idx => idx >= 5 && idx <= 8,
    };

    const getBestScoreMovesFilter = {
      ...baseFilter,
      moveName: name =>
        !smeargleBlockedData.moves.includes(name) &&
        !NOT_REAL_AOE_MOVES.includes(name),

      moveDetails: details =>
        arrayDiff(['Aoe', 'Damage'], details).length === 0 &&
        !details.includes('Target'),
      moveType: type =>
        ['Ice', 'Dark', 'Rock', 'Water', 'Flying'].includes(type),
    };

    const getPullMovesFilter = {
      ...baseFilter,
      moveName: name =>
        !smeargleBlockedData.moves.includes(name) &&
        !NOT_REAL_AOE_MOVES.includes(name) &&
        PULL_MOVES.includes(name),
      moveDetails: details =>
        arrayDiff(['Aoe', 'Damage'], details).length === 0 &&
        !details.includes('Target'),
    };

    const getStunMovesFilter = {
      ...baseFilter,
      moveIndex: idx => idx <= 8,
      moveName: name =>
        !smeargleBlockedData.moves.includes(name) &&
        !NOT_REAL_AOE_MOVES.includes(name),
      moveDetails: details =>
        arrayDiff(['Aoe', 'Damage', 'Stun'], details).length === 0 &&
        !details.includes('Target'),
    };

    filteredMoves = await getFilteredMoves(
      pokemonData,
      getBestScoreMovesFilter,
      ACTIONS.GET_FILTERED_MOVES.saveJson,
    );

    // console.log({
    //   M5_len: filteredMoves.M5.length,
    //   M6_len: filteredMoves.M6.length,
    //   M7_len: filteredMoves.M7.length,
    //   M8_len: filteredMoves.M8.length,
    // });
  }

  let pokemonDataStats = {};
  if (ACTIONS.GET_POKEMON_DATA_STATS.exec) {
    const { getPokemonDataStats } = require('./lib/7_getPokemonDataStats.js');

    pokemonDataStats = getPokemonDataStats(
      pokemonData,
      ACTIONS.GET_POKEMON_DATA_STATS.saveJson,
    );

    console.log(pokemonDataStats);
  }
})();
