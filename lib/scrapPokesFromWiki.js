const axios = require('axios');
const cheerio = require('cheerio');

const { saveJson } = require('../utils/saveJson.js');
const { capitalize } = require('../utils/capitalize.js');

const POSSIBLE_ELEMENTS = [
  'Grass',
  'Poison',
  'Ground',
  'Electric',
  'Normal',
  'Psychic',
  'Fire',
  'Water',
  'Flying',
  'Fighting',
  'Bug',
  'Rock',
  'Fairy',
  'Ice',
  'Steel',
  'Ghost',
  'Dragon',
  'Dark',
  'Metal',
  'Crystal',
  'Neutral',
];
const WRONG_ELEMENT_MAP = {
  Leaf: 'Grass',
  Metal: 'Steel',
  Pyschic: 'Psychic',
  Electrice: 'Electric',
  Nomral: 'Normal',
  Gardestrike: 'Normal',
  Earth: 'Ground',
  Eletric: 'Electric',
};

const POSSIBLE_ABILITIES = [
  'Cut',
  'Headbutt',
  'Dig',
  'Rock Smash',
  'Light',
  'Ride',
  'Teleport',
  'Blink',
  'Surf',
  'Fly',
  'Transform',
  'Levitate',
  'Dark Portal',
  'Control Mind',
  'None',
  'Control Minds',

  'Nenhuma',
  'Control Mind',
];
const WRONG_ABILITY_MAP = {
  Nenhuma: 'None',
  'Control Mind': 'Control Minds',
};

const POSSIBLE_STONES = [
  'Leaf Stone',
  'Venon Stone',
  'Earth Stone',
  'Thunder Stone',
  'Venom Stone',
  'Heart Stone',
  'Enigma Stone',
  'Fire Stone',
  'Water Stone',
  'Feather Stone',
  'Punch Stone',
  'Cocoon Stone',
  'Rock Stone',
  'Ice Stone',
  'Darkness Stone',
  'Ancient Stone',
  'Crystal Stone',
  'Metal Stone',
  'Mirror Stone',
  'Mystic Star',
  'Dimensional Stone',
];
const POSSIBLE_BOOSTS = [
  ...POSSIBLE_STONES,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  15,
  20,
  25,
  30,
  50,
  '?',
];
const WRONG_BOOST_MAP = {
  'Cocoon Stone Cocoon Stone': 'Cocoon Stone',
  'Meta Stone': 'Metal Stone',
};

const POSSIBLE_MATERIAS = [
  'Naturia',
  'Naturia Enhanced',
  'Naturia Superior',
  'Naturia Mastered',

  'Malefic',
  'Malefic Enhanced',
  'Malefic Superior',
  'Malefic Mastered',

  'Orebound',
  'Orebound Enhanced',
  'Orebound Superior',
  'Orebound Mastered',

  'Raibolt',
  'Raibolt Enhanced',
  'Raibolt Superior',
  'Raibolt Mastered',

  'Gardestrike',
  'Gardestrike Enhanced',
  'Gardestrike Superior',
  'Gardestrike Mastered',

  'Psycraft',
  'Psycraft Enhanced',
  'Psycraft Superior',
  'Psycraft Mastered',

  'Volcanic',
  'Volcanic Enhanced',
  'Volcanic Superior',
  'Volcanic Mastered',

  'Seavell',
  'Seavell Enhanced',
  'Seavell Superior',
  'Seavell Mastered',

  'Wingeon',
  'Wingeon Enhanced',
  'Wingeon Superior',
  'Wingeon Mastered',

  'Ironhard',
  'Ironhard Enhanced',
  'Ironhard Superior',
  'Ironhard Mastered',
];
const WRONG_MATERIAS_MAP = {
  Oreboun: 'Orebound',
};

const POSSIBLE_EFFECTIVENESS = [
  'Efetivo',
  'Normal',
  'Inefetivo',
  'Muito Inefetivo',
  'Muito Efetivo',
  'Nulo',
];
const WRONG_EFFECTIVENESS_MAP = {
  'Super Efetivo': 'Muito Efetivo',
  Superefetivo: 'Muito Efetivo',
};

const WRONG_MOVE_NAMES_MAP = {
  'Absorb - Level 50 - Grass.': 'Absorb',
  'Selfdestruction 280,68': 'Selfdestruction',
};

let ERRORS = {};

function addError(url, errorKey, error) {
  if (!ERRORS[url]) ERRORS[url] = {};
  if (!ERRORS[url][errorKey]) ERRORS[url][errorKey] = [];
  ERRORS[url][errorKey].push(error);
}

function parseGeneralInfo($, url, container, text) {
  const REPLACE_KEY_MAP = {
    nome: 'name',
    level: 'level',
    elemento: 'elements',
    habilidades: 'abilities',
    habilidade: 'abilities',
    boost: 'boost',
    materia: 'materias',
    matéria: 'materias',
    'pedra de evolução': 'evolution_stones',
    'mega stone': 'mega_stone',
    'item de evolução': 'evolution_items',
  };
  const replaceKeyKeysRegExp = new RegExp(
    `(${Object.keys(REPLACE_KEY_MAP).join('|')}):(\n|$)`,
    'i',
  );
  const ret = {
    name: '',
    level: '',
    elements: [],
    abilities: [],
    boost: [],
    materias: [],
    evolution_stones: [],
    mega_stone: '',
    evolution_items: '',
  };

  let lastBNodeTxt = null;
  container.contents().each((i, el) => {
    const element = $(el);
    let info = element.text().replace(/\n$/, '');

    if (element.is('b')) {
      if (!replaceKeyKeysRegExp.test(info.trim())) {
        // Culpa do Alolan_Marowak que possui tudo na na tag <b>
        addError(
          url,
          "Palavra em negrito errada na seção 'Informações Gerais'",
          info,
        );

        info = info.split(':');
        lastBNodeTxt = capitalize(info[0].replace(/\n/g, ''));

        info = info[1];
      } else {
        lastBNodeTxt = capitalize(info.replace(/\n|:/g, ''));
        info = null;

        if (!REPLACE_KEY_MAP[lastBNodeTxt.toLowerCase()]) {
          addError(
            url,
            "Palavra em negrito errada na seção 'Informações Gerais'",
            lastBNodeTxt,
          );
        }
      }
    }

    if (!!lastBNodeTxt && !!info) {
      const tmpFullLine = `${lastBNodeTxt}:${info}`;
      const tmpInfo = info.trim().toLowerCase();
      const key = lastBNodeTxt.toLowerCase();

      if (!tmpInfo) {
        addError(url, 'Informação em branco', tmpFullLine);
      } else {
        // if (tmpInfo.endsWith('.')) {
        //   addError(url, 'Possui ponto no fim', tmpFullLine);
        // }

        // if (/^\s.+/.test(info)) {
        if (
          !info.startsWith(' ') &&
          !info.startsWith(String.fromCharCode(160)) //nbsp
        ) {
          addError(url, 'Não tem espaço após :', tmpFullLine);
        }
      }

      if (key === 'nome') {
        info = capitalize(info.replace(/\./g, ''));
      } else if (key === 'level') {
        info = +info.trim();
      } else if (key === 'elemento') {
        if (!!tmpInfo && info.includes('/') && !info.includes(' / ')) {
          addError(url, 'Sem espaço entre barra', tmpFullLine);
        }
        if (!!tmpInfo && tmpInfo.includes(' and ')) {
          addError(url, "Possui 'and' no lugar de /", tmpFullLine);
        }

        info = info
          .replace(' and ', '/')
          .split('/')
          .map(e => capitalize(e.replace(/\./g, '')));

        info = info.map(element => {
          if (!POSSIBLE_ELEMENTS.includes(element)) {
            addError(url, 'Elemento desconhecido', element);
          }
          return WRONG_ELEMENT_MAP[element] || element;
        });
      } else if (key === 'habilidades' || key === 'habilidade') {
        if (key === 'habilidade') {
          addError(url, "'Habilidade' em vez de 'Habilidades'", tmpFullLine);
        }
        if (!!tmpInfo && tmpInfo.includes(' e ')) {
          addError(url, "Possui 'e' em vez de 'and'", tmpFullLine);
        }
        if (
          !!tmpInfo &&
          (tmpInfo.includes('none') || tmpInfo.includes('nenhuma'))
        ) {
          addError(url, "'None' vs 'Nenhuma' habilidade", tmpFullLine);
        }
        if (
          !!tmpInfo &&
          tmpInfo.includes('control mind') &&
          !tmpInfo.includes('control minds')
        ) {
          addError(
            url,
            "'Control Mind' vs 'Control Minds' habilidade",
            tmpFullLine,
          );
        }

        info = info
          .replace(' and ', ',')
          .replace(' e ', ',')
          .split(',')
          .map(h => capitalize(h.replace(/\./g, '')));

        info = info.map(ability => {
          if (!POSSIBLE_ABILITIES.includes(ability)) {
            addError(url, 'Habilidade desconhecida', ability);
          }
          return WRONG_ABILITY_MAP[ability] || ability;
        });
      } else if (key === 'boost') {
        let tmp = info.split(' ou ');
        if (tmp.length === 1) {
          info = tmp[0].split('(').map(b => capitalize(b).replace(/\./g, ''));
        } else {
          info = [
            capitalize(tmp[0]),
            ...tmp[1].split('(').map(b => capitalize(b.replace(/\./g, ''))),
          ];
        }
        // Pode ser só '?'
        if (info.length > 1) {
          info[info.length - 1] = +info[info.length - 1].replace(')', '');
        }

        info = info.map(boost => {
          if (!POSSIBLE_BOOSTS.includes(boost)) {
            addError(url, 'Boost desconhecido', boost);
          }
          return WRONG_BOOST_MAP[boost] || boost;
        });
      } else if (key === 'materia' || key === 'matéria') {
        if (key === 'matéria') {
          addError(url, "'matéria' em vez de 'materia'", tmpFullLine);
        }

        info = info.split(' ou ').map(m => capitalize(m.replace(/\./g, '')));

        info = info.map(materia => {
          if (!POSSIBLE_MATERIAS.includes(materia)) {
            addError(url, 'Materia desconhecida', materia);
          }
          return WRONG_MATERIAS_MAP[materia] || materia;
        });
      } else if (key === 'pedra de evolução') {
        if (!!tmpInfo && info.includes(' e ')) {
          addError(url, "Possui 'e' no lugar de 'and'", tmpFullLine);
        }

        info = info
          .replace(' e ', ' and ')
          .split(' and ')
          .map(stone => {
            if (stone.includes('\n')) {
              addError(url, "Possui '\\n' no meio da frase", tmpFullLine);
            }
            return capitalize(stone.replace('\n', ' ').replace(/\./g, ''));
          });
      } else if (key === 'mega stone') {
        info = capitalize(info.replace(/\./g, ''));
      } else if (key === 'item de evolução') {
        info = capitalize(info.replace(/\./g, ''));
      }

      ret[REPLACE_KEY_MAP[key]] = info;
      lastBNodeTxt = null;
    }
  });

  return ret;
}

function parseEvolutions($, url, container, text) {
  return text.split('\n').map(e => e.replace(/\./g, '').trim());
}

function parseEffectiveness($, url, container, text) {
  const ret = {};

  let lastBNodeTxt = null;
  container.contents().each((i, el) => {
    const element = $(el);
    if (element.is('b')) {
      lastBNodeTxt = capitalize(element.text().replace(/\n|:/g, ''));

      if (!POSSIBLE_EFFECTIVENESS.includes(lastBNodeTxt)) {
        addError(url, 'Efetividade desconhecida', lastBNodeTxt);
      }

      lastBNodeTxt = WRONG_EFFECTIVENESS_MAP[lastBNodeTxt] || lastBNodeTxt;
    } else if (lastBNodeTxt) {
      let info = element.text().replace(/\n$/, '');
      const tmpFullLine = `${lastBNodeTxt}:${info}`;
      const tmpInfo = info.trim().toLowerCase();

      if (!tmpInfo) {
        addError(url, 'Informação em branco', tmpFullLine);
      } else {
        if (!tmpInfo.endsWith('.')) {
          addError(url, 'Não possui ponto no fim', tmpFullLine);
        }
        if (!info.startsWith(' ')) {
          addError(url, 'Não tem espaço após :', tmpFullLine);
        }
        if (tmpInfo.includes(' e ')) {
          addError(url, "Possui 'e' em vez de 'and'", tmpFullLine);
        }
        if (tmpInfo.includes('\n')) {
          addError(url, "Possui '\\n' no meio da frase", tmpFullLine);
        }
      }

      info = info
        .replace(/\n/g, ' ')
        .replace(/\./g, '')
        .replace(' and ', ',')
        .replace(' e ', ',')
        .split(',')
        .map(element => element.trim())
        .reduce((acc, cur) => {
          if (cur.includes(' ')) {
            addError(url, "Possui ' ' em vez de ','", tmpFullLine);
          }

          acc.push(...cur.split(' '));
          return acc;
        }, [])
        .map(element => capitalize(element))
        .map(element => {
          if (!POSSIBLE_ELEMENTS.includes(element)) {
            addError(url, 'Elemento desconhecido', element);
          }
          return WRONG_ELEMENT_MAP[element] || element;
        })
        .filter(element => POSSIBLE_ELEMENTS.includes(element));

      ret[lastBNodeTxt] = info;
      lastBNodeTxt = null;
    } else {
      lastBNodeTxt = null;
    }
  });

  return ret;
}

function parseMoves($, url, container, text) {
  const tds = $('tbody > tr > td', container);
  const ret = [];

  let i = 0;
  for (i; i < tds.length; ) {
    let tmpTxt = $(tds[i]).text().replace('\n', '').trim();

    if (!!tmpTxt) {
      const move = {
        name: '',
        cd: '',
        type: '',
        level: '',
        details: [],
      };

      tmpTxt = tmpTxt.split('(');
      move.name = capitalize(tmpTxt[0]);

      if (!!WRONG_MOVE_NAMES_MAP[move.name]) {
        addError(url, 'Nome de ataque errado', move.name);
        move.name = WRONG_MOVE_NAMES_MAP[move.name];
      }

      if (tmpTxt.length > 1) {
        move.cd = tmpTxt[1].replace(')', '').trim();

        if (!!move.cd && !/(\d)+s/i.test(move.cd)) {
          addError(url, 'CD do ataque esta fora do padrão', move.cd);

          move.cd = Number.isNaN(+move.cd) ? '' : +move.cd;
        }
      }

      const detailsChildren = $('a', $(tds[i + 2]));
      detailsChildren.each(j => {
        let detail = capitalize(detailsChildren.eq(j).attr('title'));
        if (!detail) {
          detail = capitalize(
            detailsChildren
              .eq(j)
              .children()
              .eq(0)
              .attr('alt')
              .replace('.png', ''),
          );
        }
        move.details.push(detail);
      });

      const typeChildren = $('a', $(tds[i + 3]));
      move.type = capitalize(typeChildren.eq(0).attr('title'));

      if (!!move.type && !POSSIBLE_ELEMENTS.includes(move.type)) {
        addError(url, 'Tipo de ataque desconhecido (alt da img)', move.type);
      }
      move.type = WRONG_ELEMENT_MAP[move.type] || move.type;

      tmp = $(tds[i + 5])
        .text()
        .trim()
        .replace('\n', '')
        .split(' ');
      if (tmp.length === 2) {
        move.level = +tmp[1];
      }

      ret.push(move);

      i += 6;
    } else {
      i++;
    }
  }

  return ret;
}

async function parsePokemonPage(url) {
  console.log(`Parsing: ${url}`);

  if (!!ERRORS[url]) ERRORS[url] = {};

  const { data: pokePageData } = await axios.get(url);
  const retData = {
    general_info: {},
    evolutions: {},
    moves: {},
    effectiveness: {},
  };

  try {
    const $2 = cheerio.load(pokePageData);
    const divChildren = $2('.mw-parser-output').children();

    // 'Articuno', 'Moltres', 'Zapdos', 'Lugia' e entre outros não possuem nenhum dado na wiki
    if (!divChildren || divChildren.length === 1) {
      retData.general_info.name = url.substr(url.lastIndexOf('/') + 1);
    }

    const pageText = [];
    let moveKey = '';
    divChildren.each((i, container) => {
      container = $2(container);
      const text = container.text().trim();

      if (text.startsWith('Nome:')) {
        retData.general_info = parseGeneralInfo($2, url, container, text);
      } else if (text.toLowerCase().includes('precisa de level')) {
        retData.evolutions = parseEvolutions($2, url, container, text);
      } else if (text.includes('Normal:')) {
        retData.effectiveness = parseEffectiveness($2, url, container, text);
      } else if (text.toLowerCase().trim().startsWith('moveset pv')) {
        moveKey = text.split(' ')[1].trim().toUpperCase();
      } else if (text.trim().startsWith('M1')) {
        if (!moveKey) moveKey = 'ALL';
        retData.moves[moveKey] = parseMoves($2, url, container, text);
      }

      if (!!text) {
        pageText.push(text);
      }
    });
  } catch (err) {
    console.log('ERROR: ', url);
    throw err;
  }
  return retData;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapWiki(
  prevSavedPokemonJSON,
  shouldSaveJson = true,
  shouldSaveErrors = true,
) {
  const baseUrl = 'https://wiki.pokexgames.com';

  if (!!shouldSaveErrors) {
    ERRORS = require('../json/wikiErrors.json');
    if (!ERRORS || typeof ERRORS !== 'object') {
      throw new Error('`./json/wikiErrors.json` should have an object ({})!');
    }
  } else {
    ERRORS = {};
  }

  // PS: FOR TESTING
  // const pokeToTest = 'Pyroar';
  // const ret = await parsePokemonPage(`${baseUrl}/index.php/${pokeToTest}`);
  // console.log('RET:', ret);
  // console.log('ERRORS:', ERRORS);
  // return;

  const { data: mainPageData } = await axios.get(
    `${baseUrl}/index.php/Pok%C3%A9mon`,
  );
  const DELAY = 500;

  const $ = cheerio.load(mainPageData);
  const tables = $('table.wikitable');

  const urls = [];
  tables.each((_, table) => {
    const tds = $('tbody > tr > td', table);

    tds.each((__, td) => {
      const a = $('a', td);
      if (!!a && a.length && !!a.text()) {
        urls.push(`${baseUrl}${a.attr('href')}`);
      }
    });
  });

  const pokemonData = [...prevSavedPokemonJSON];
  for (let i = pokemonData.length; i < urls.length; i++) {
    try {
      const url = urls[i];
      const data = await parsePokemonPage(url);
      pokemonData[i] = { url, ...data };

      await sleep(DELAY);
      if (i !== 0 && i % 10 === 0) {
        console.log(`Parsed ${i}/${urls.length}`);
      }
    } catch (err) {
      console.error(err);
      break;
    }
  }

  if (!!shouldSaveJson && pokemonData.length !== prevSavedPokemonJSON.length) {
    saveJson(pokemonData, 'pokemons.json');
  }

  if (!!shouldSaveErrors && Object.keys(ERRORS).length > 0) {
    saveJson(ERRORS, 'wikiErrors.json');
  }

  return pokemonData;
}

exports.scrapWiki = scrapWiki;
