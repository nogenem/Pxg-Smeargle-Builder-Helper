const axios = require('axios');
const cheerio = require('cheerio');

const { saveJson } = require('../utils/saveJson.js');
const { capitalize } = require('../utils/capitalize.js');

function parseGeneralInfo($, container, text) {
  const ret = {};

  ret.Nome = text.match(/Nome:(.+)(\n|$)/);
  if (!ret.Nome || ret.Nome.length < 2) {
    ret.Nome = '';
  } else {
    ret.Nome = capitalize(ret.Nome[1].replace(/\./g, ''));
  }

  ret.Level = text.match(/Level:(.+)(\n|$)/);
  if (!ret.Level || ret.Level.length < 2) {
    ret.Level = '';
  } else {
    ret.Level = +ret.Level[1];
  }

  ret.Elementos = text.match(/Elemento:(.+)(\n|$)/);
  if (!ret.Elementos || ret.Elementos.length < 2) {
    ret.Elementos = [];
  } else {
    ret.Elementos = ret.Elementos[1]
      .split('/')
      .map(e => capitalize(e.replace(/\./g, '')));
  }

  ret.Habilidades = text.match(/Habilidades:(.+)(\n|$)/);
  if (!ret.Habilidades || ret.Habilidades.length < 2) {
    ret.Habilidades = [];
  } else {
    ret.Habilidades = ret.Habilidades[1]
      .replace('.', '')
      .replace(' and ', ',')
      .split(',')
      .map(h => capitalize(h.replace(/\./g, '')));
  }

  ret.Boost = text.match(/Boost:(.+)(\n|$)/);
  if (!ret.Boost || ret.Boost.length < 2) {
    ret.Boost = [];
  } else {
    let tmp = ret.Boost[1].split(' ou ');
    if (tmp.length === 1) {
      ret.Boost = tmp[0].split('(').map(b => capitalize(b).replace(/\./g, ''));
    } else {
      ret.Boost = [
        capitalize(tmp[0]),
        ...tmp[1].split('(').map(b => capitalize(b.replace(/\./g, ''))),
      ];
    }
    ret.Boost[ret.Boost.length - 1] = +ret.Boost[ret.Boost.length - 1].replace(
      ')',
      '',
    );
  }

  ret.Materia = text.match(/Materia:(.+)(\n|$)/);
  if (!ret.Materia || ret.Materia.length < 2) {
    ret.Materia = [];
  } else {
    ret.Materia = ret.Materia[1]
      .split(' ou ')
      .map(m => capitalize(m.replace(/\./g, '')));
  }

  ret['Pedra de Evolução'] = text.match(/Pedra de Evolução:(.+)(\n|$)/);
  if (!ret['Pedra de Evolução'] || ret['Pedra de Evolução'].length < 2) {
    ret['Pedra de Evolução'] = [];
  } else {
    ret['Pedra de Evolução'] = ret['Pedra de Evolução'][1]
      .split(' and ')
      .reduce((acc, cur) => {
        acc.push(...cur.split(' e '));
        return acc;
      }, [])
      .map(p => capitalize(p.replace(/\./g, '')));
  }

  return ret;
}

function parseEvolutions($, container, text) {
  return text.split('\n').map(e => e.replace(/\./g, '').trim());
}

function parseEffectiveness($, container, text) {
  const WRONG_EFFECTIVENESS = {
    'Super Efetivo': 'Muito Efetivo', // Um monte de paginas ¬¬
  };
  const WRONG_ELEMENT = {
    Pyschic: 'Psychic', // Honedge, Doublade, Aegislash
    Electrice: 'Electric', // Rattata, Raticate, Bunnelby, Shiny Rattata, Shiny_Raticate, Shiny_Bunnelby
  };
  const ret = {};

  // PS: 'Shiny_Sceptile' tem '\n' entre as efetividades;
  // PS: 'Diggersby' não tem '.' em toda linha de efetividade;
  // PS: 'Pyroar' não tem ',' entre todas as efetividades;
  // PS: Alguns pokes tem efetividade escrita errado, como 'Pyschic' e 'Electrice';
  // PS: 'Shiny_Klinklang' tem ' e ' em vez de ' and ' nas efetividades;
  // PS: 'Mega_Abomasnow' tem 2 'Efetivo:';

  let lastBNodeTxt = null;
  container.contents().each((i, el) => {
    const element = $(el);
    if (element.is('b')) {
      lastBNodeTxt = capitalize(element.text().replace(/\n|:/g, ''));
      lastBNodeTxt = WRONG_EFFECTIVENESS[lastBNodeTxt] || lastBNodeTxt;
    } else if (lastBNodeTxt) {
      const txt = element
        .text()
        .replace(/\n/g, ' ')
        .replace(/\./g, '')
        .replace(' and ', ',')
        .replace(' e ', ',')
        .split(',')
        .map(t => t.trim())
        .reduce((acc, cur) => {
          acc.push(...cur.split(' '));
          return acc;
        }, [])
        .map(e => capitalize(e))
        .map(e => WRONG_ELEMENT[e] || e);

      ret[lastBNodeTxt] = txt;
      lastBNodeTxt = null;
    } else {
      lastBNodeTxt = null;
    }
  });

  // const match = [...text.match(/([^:]+):([^\.]+)(\.|$)/gm)].map(t =>
  //   t.replace(/\n/g, ' ').trim(),
  // );

  // text.split('\n').map(effTxt => {
  // match.map(effTxt => {
  //   const tmp = effTxt.split(':');
  //   ret[capitalize(tmp[0])] = tmp[1]
  //     .replace('.', '')
  //     .replace(' and ', ',')
  //     .split(',')
  //     .map(e => capitalize(e))
  //     .map(e => WRONG_ELEMENT[e] || e);
  // });

  return ret;
}

function parseMoves($, container, text) {
  const tds = $('tbody > tr > td', container);
  const ret = [];

  for (let i = 0; i < tds.length; i += 7) {
    if (!tds[i + 1]) continue;

    const move = {
      details: [],
    };

    let tmp = $(tds[i + 1].children[0])
      .text()
      .replace('\n', '')
      .trim();
    if (!tmp) {
      tmp = $(tds[i + 1])
        .find('b')
        .text()
        .replace('\n', '')
        .trim();
    }
    tmp = tmp.split('(');
    move.name = capitalize(tmp[0]);
    if (tmp.length > 1) {
      move.cd = tmp[1].replace(')', '').trim();
    } else {
      move.cd = '';
    }

    const detailsChildren = $('a', $(tds[i + 3]));
    detailsChildren.each(j => {
      let detail = capitalize(detailsChildren.eq(j).attr('title'));
      if (!detail) {
        // PS: 'Poliwrath' não tem 'title' para icone de Neverboost
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

    const typeChildren = $('a', $(tds[i + 4]));
    move.type = capitalize(typeChildren.eq(0).attr('title'));

    tmp = $(tds[i + 6])
      .text()
      .trim()
      .replace('\n', '')
      .split(' ');
    if (tmp.length < 2) {
      move.level = '';
    } else {
      move.level = +tmp[1];
    }

    ret.push(move);
  }

  return ret;
}

async function parsePokemonPage(url) {
  console.log(`Parsing: ${url}`);

  const { data: pokePageData } = await axios.get(url);
  const retData = {
    generalInfo: {},
    evolutions: {},
    moves: {},
    effectiveness: {},
  };

  try {
    const $2 = cheerio.load(pokePageData);
    const divChildren = $2('.mw-parser-output').children();

    // 'Articuno', 'Moltres', 'Zapdos', 'Lugia' e entre outros não possuem nenhum dado na wiki
    if (!divChildren || divChildren.length === 1) {
      retData.generalInfo.Nome = url.substr(url.lastIndexOf('/') + 1);
    }

    const pageText = [];
    let moveKey = '';
    divChildren.each((i, container) => {
      container = $2(container);
      const text = container.text().trim();

      if (text.startsWith('Nome:')) {
        retData.generalInfo = parseGeneralInfo($2, container, text);
      } else if (text.toLowerCase().includes('precisa de level')) {
        retData.evolutions = parseEvolutions($2, container, text);
      } else if (text.includes('Normal:')) {
        retData.effectiveness = parseEffectiveness($2, container, text);
      } else if (text.toLowerCase().trim().startsWith('moveset pv')) {
        moveKey = text.split(' ')[1].trim().toUpperCase();
      } else if (text.startsWith('M1')) {
        if (!moveKey) moveKey = 'ALL';
        retData.moves[moveKey] = parseMoves($2, container, text);
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

async function scrapWiki(prevSavedPokemonJSON, shouldSaveJson = true) {
  const baseUrl = 'https://wiki.pokexgames.com';

  // PS: FOR TESTING
  // const pokeToTest = 'Xatu';
  // const ret = await parsePokemonPage(`${baseUrl}/index.php/${pokeToTest}`);
  // console.log(ret);
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

  return pokemonData;
}

exports.scrapWiki = scrapWiki;
