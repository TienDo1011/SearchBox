var fs = require('fs');

fs.readFile('./american-english', 'utf8', (err, data) => {
  if (err) throw err;
  const arr = data.split('\n');
  console.log(arr.length);
  let i, temparray;
  const chunk = 20000;
  const j = arr.length;
  let no = 0;
  for(i = 0; i < j; i += chunk) {
    no += 1;
    temparray = arr.slice(i, i + chunk);
    fs.writeFile(`./dicList/${no}.txt`, temparray, (err) => {
      if (err) throw err;
    });
  }
})

// Create JSON array data
fs.readFile('./american-english', 'utf8', (err, data) => {
  if (err) throw err;
  const arr = data.split('\n');
  fs.writeFile(`./american-english.json`, JSON.stringify(arr), (err) => {
    if (err) throw err;
  });
})