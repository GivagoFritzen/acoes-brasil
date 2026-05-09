const fs = require('fs');
const path = require('path');

const coverageFile = path.join(__dirname, 'front/coverage/app/coverage-final.json');
const outputFile = path.join(__dirname, 'front/coverage/lcov.info');

const data = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

let lcov = 'TN:\n';

for (const [file, coverage] of Object.entries(data)) {
  if (!coverage.s) continue;
  
  const filePath = file.replace(/^\.\//, '');
  lcov += 'SF:' + filePath + '\n';
  
  for (const [line, count] of Object.entries(coverage.s)) {
    lcov += 'DA:' + line + ',' + count + '\n';
  }
  
  lcov += 'end_of_record\n';
}

fs.writeFileSync(outputFile, lcov);

console.log('Coverage convertido para LCOV: ' + outputFile);