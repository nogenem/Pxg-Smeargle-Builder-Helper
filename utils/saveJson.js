const path = require('path');
const fs = require('fs');

function saveJson(data, jsonName) {
  const jsonPath = path.resolve('json', jsonName);
  fs.writeFile(jsonPath, JSON.stringify(data, null, 2), err => {
    if (err) {
      throw err;
    }
    console.log(jsonPath, ' was saved.');
  });
}

exports.saveJson = saveJson;
