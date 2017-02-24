var fs = require('fs');

fs.readFile('./corncob_lowercase.txt', 'utf8', (err, data) => {
  if (err) throw err;
  var arr = data.split('\r\n');
  console.log(arr);
})
