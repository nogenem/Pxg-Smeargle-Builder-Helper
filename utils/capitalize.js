const capitalize = str => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');
};

exports.capitalize = capitalize;
