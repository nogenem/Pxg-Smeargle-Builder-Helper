const { saveJson } = require('../utils/saveJson.js');

// PS: Certeza que as listas não estão completas...
const OUTLAND_POKES = [
  // NORTH
  ['Feraligatr', 'Blastoise'],
  ['Gyarados', 'Mantine'],
  'Girafarig',
  'Xatu',
  'Alakazam',
  'Hypno',
  'Pinsir',
  'Heracross',
  'Scyther',
  'Meganium',
  'Venusaur',
  // EAST
  'Crobat',
  ['Nidoking', 'Nidoqueen'],
  'Misdreavus',
  'Gengar',
  ['Hitmonlee', 'Hitmonchan', 'Hitmontop'],
  'Rhydon',
  'Golem',
  'Pupitar',
  'Arcanine',
  'Charizard',
  'Magmar',
  // SOUTH
  'Typhlosion',
  ['Donphan', 'Sandslash'],
  'Marowak',
  'Miltank',
  ['Ursaring', 'Snorlax'],
  ['Clefable', 'Wigglytuff'],
  ['Dewgong', 'Cloyster'],
  'Jynx',
  'Piloswine',
  'Dragonair',
  'Noctowl',
  'Pidgeot',
  'Skarmory',
];
const PHENAC_POKES = [
  ['Duskull', 'Dusclops'],
  'Shuppet',
  'Sableye',
  'Banette',
  ['Aron', 'Lairon', 'Aggron'],
  'Metang',
  'Mawile',
  ['Bagon', 'Shelgon'],
  ['Loudred', 'Exploud'],
  ['Swablu', 'Altaria'],
  ['Taillow', 'Swellow'],
  ['Cacnea', 'Cacturne'],
  ['Vibrava', 'Flygon'],
  ['Ralts', 'Kirlia', 'Gardevoir'],
  ['Meditite', 'Medicham'],
  ['Spoink', 'Grumpig'],
  ['Baltoy', 'Claydol'],
  'Vigoroth',
  'Seviper',
  ['Lotad', 'Lombre', 'Ludicolo'],
  'Sceptile',
  ['Nuzleaf', 'Shiftry'],
  ['Marshtomp', 'Swampert'],
  'Crawdaunt',
  'Blaziken',
  'Camerupt',
  'Glalie',
  ['Sealeo', 'Walrein'],
  'Granbull',
  'Manectric',
];
// https://forum.pokexgames.com/threads/208067-Lures-das-HUNTS-no-NW
const NW_300 = [
  'Diglett',
  'Phanpy',
  'Alolan Meowth',
  'Grimer',
  'Carvanha',
  ['Skiddo', 'Nuzleaf'],
  'Machoke',
  'Cranidos',
  "Farfetch'd",
  ['Ralts', 'Kirlia'],
  ['Bagon', 'Dratini', 'Gible'],
  'Beedrill',
  'Shuppet',
  ['Vigoroth', 'Litleo'],
  ['Klink', 'Klang'],
  ['Pansear', 'Magby'],
  'Barboach',
  ['Tynamo', 'Eelektrik'],
  'Sneasel',
  'Spoink',
  'Mantyke',
  'Elekid',
];
const NW_400 = [
  'Gallade',
  'Sharpedo',
  'Rhydon',
  'Starmie',
  'Pyroar Female',
  'Whiscash',
  'Torterra',
  ['Togetic', 'Togekiss'],
  'Infernape',
  'Gogoat',
  'Weezing',
  'Luxray',
  'Klinklang',
  'Alolan Raichu',
  ['Raichu', 'Manectric'],
  ['Simisear', 'Ninetales', 'Houndoom'],
  'Alakazam',
  ['Wormadam', 'Wormadam Steel'],
  ['Wormadam', 'Wormadam Ground'],
  'Alolan Muk',
  'Empoleon',
  'Pinsir',
  'Alolan Persian',
  'Gardevoir',
  'Cloyster',
  'Honchkrow',
  ['Banette', 'Misdreavus'],
];

function getPokesToHunt(pokemonData, shouldSaveJson = true) {
  const tmpPokemonData = pokemonData.reduce((acc, cur) => {
    if (!acc[cur.general_info.name]) {
      acc[cur.general_info.name] = cur;
    }
    return acc;
  }, {});
  const filteredPokemonData = {
    '150-299': [],
    '300-399': [],
    '400-600': [],
  };

  const filteringFunc = key => pokemon => {
    const poke = Array.isArray(pokemon) ? pokemon[pokemon.length - 1] : pokemon;
    if (!tmpPokemonData[poke]) {
      console.warn('POKEMON NOT FOUND: ', pokemon);
    } else {
      filteredPokemonData[key].push(tmpPokemonData[poke]);
    }
  };

  OUTLAND_POKES.forEach(filteringFunc('150-299'));
  PHENAC_POKES.forEach(filteringFunc('150-299'));
  NW_300.forEach(filteringFunc('300-399'));
  NW_400.forEach(filteringFunc('400-600'));

  if (!!shouldSaveJson) {
    saveJson(filteredPokemonData, 'filteredPokemonData.json');
  }

  return filteredPokemonData;
}

exports.getPokesToHunt = getPokesToHunt;
