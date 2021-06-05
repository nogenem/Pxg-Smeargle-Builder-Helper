const axios = require('axios');
const cheerio = require('cheerio');

const { saveJson } = require('../utils/saveJson.js');
const { capitalize } = require('../utils/capitalize.js');

async function scrapWiki(pokemonData, shouldSaveJson = true) {
  const baseUrl = 'https://wiki.pokexgames.com';

  const { data: mainPageData } = await axios.get(
    `${baseUrl}/index.php/Ataques_Bloqueados`,
  );

  const $ = cheerio.load(mainPageData);
  const tables = $('table.wikitable');

  const ret = {
    moves: [],
    pokemons: [],
  };

  tables
    .eq(0)
    .find('td')
    .each((i, el) => {
      el = $(el);
      ret.moves.push(capitalize(el.text()));
    });

  const trs = tables.eq(1).find('tr');
  for (let i = 0; i < trs.length; i += 2) {
    trs
      .eq(i)
      .find('th')
      .each((j, el) => {
        el = $(el);
        const text = capitalize(el.text().replace(/\(todos\)/gi, ''));
        ret.pokemons.push(text);
      });
  }

  // PS: Não sei se a lista esta totalmente certa e completa... ;/
  pokemonData.forEach(pokemon => {
    const name = pokemon.generalInfo.Nome;
    if (!name) {
      console.log(pokemon);
    }
    const match = name.match(/^(shiny|mega|elite|alolan).+/i);
    if (!!match && match.length > 0) {
      ret.pokemons.push(name);
    }
  });
  ret.pokemons.push(
    'Dark Abra',
    'Crystal Onix',
    'Big Onix',
    'Giant Galvantula',
    'Unown Legion',
    'Mismagius',
    'Golden Sudowoodo',
    'Red Gyarados',
    'Dark Pichu',
  );
  ret.pokemons.push('Zoroark');
  ret.pokemons.push(
    'Articuno',
    'Moltres',
    'Zapdos',
    'Lugia',
    'Celebi',
    'Regirock',
    'Regice',
    'Registeel',
    'Latias',
    'Latios',
    'Cresselia',
    'Darkrai',
    'Mewtwo',
    'Mew',
    'Raikou',
    'Entei',
    'Suicune',
  );

  if (!!shouldSaveJson) {
    saveJson(ret, 'smeargleBlockedData.json');
  }

  return ret;
}

exports.scrapWiki = scrapWiki;
