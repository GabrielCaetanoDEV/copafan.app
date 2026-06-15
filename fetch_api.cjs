const https = require('https');

const url = 'https://raw.githubusercontent.com/GabrielCaetanoDEV/copafan.app/main/src/data/copaData.ts';

https.get(url, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('--- DEPLOYED copaData.ts (generateKnockoutBracket) ---');
    const lines = data.split('\n');
    const startIdx = lines.findIndex(l => l.includes('export function generateKnockoutBracket'));
    if (startIdx !== -1) {
      console.log(lines.slice(startIdx, startIdx + 160).join('\n'));
    } else {
      console.log('Function not found!');
    }
    console.log('--- END ---');
  });
}).on('error', err => {
  console.error(err);
});
