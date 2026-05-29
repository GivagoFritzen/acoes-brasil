const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function toRelPath(absPath) {
  const normalized = absPath.replace(/\\/g, '/');
  const rootPrefix = projectRoot.replace(/\\/g, '/') + '/';
  if (normalized.startsWith(rootPrefix)) {
    return normalized.slice(rootPrefix.length);
  }
  return normalized;
}

console.log('Validando arquivos de coverage...\n');

const backLcovPath = path.join(projectRoot, 'back/coverage/lcov.info');
if (fs.existsSync(backLcovPath)) {
  console.log(`\u2713 Coverage do Backend encontrado: back/coverage/lcov.info`);
} else {
  console.error(`\u2717 ERRO: Coverage do Backend NÃO encontrado em: back/coverage/lcov.info`);
  process.exit(1);
}

const frontCoverageFinalPath = path.join(projectRoot, 'front/coverage/app/coverage-final.json');
const frontLcovPath = path.join(projectRoot, 'front/coverage/lcov.info');

if (!fs.existsSync(frontCoverageFinalPath)) {
  console.error(`\u2717 ERRO: Coverage do Frontend NÃO encontrado em: front/coverage/app/coverage-final.json`);
  process.exit(1);
}

console.log(`\u2713 Coverage do Frontend encontrado: front/coverage/app/coverage-final.json`);

console.log('\nConvertendo coverage-final.json para lcov.info...');

const coverageData = JSON.parse(fs.readFileSync(frontCoverageFinalPath, 'utf8'));
const frontAbsPrefix = projectRoot.replace(/\\/g, '/') + '/front/';
let lcovLines = [];

for (const [filePath, fileCoverage] of Object.entries(coverageData)) {
  const relPath = toRelPath(filePath);
  lcovLines.push(`SF:${relPath}`);

  const lineHits = {};
  for (const [stmtId, stmt] of Object.entries(fileCoverage.statementMap || {})) {
    const line = stmt.start.line;
    const hit = fileCoverage.s[stmtId] || 0;
    if (!lineHits[line] || hit > lineHits[line]) {
      lineHits[line] = hit;
    }
  }

  for (const [line, hit] of Object.entries(lineHits).sort((a, b) => Number(a) - Number(b))) {
    lcovLines.push(`DA:${line},${hit}`);
  }

  lcovLines.push('end_of_record');
}

fs.writeFileSync(frontLcovPath, lcovLines.join('\n'), 'utf8');
console.log(`  lcov.info gerado com ${Object.keys(coverageData).length} arquivo(s).`);

console.log('\nNormalizando caminhos do coverage do frontend...');

let frontLcov = fs.readFileSync(frontLcovPath, 'utf8');
const lines = frontLcov.split('\n');
let changed = 0;
const normalized = lines.map((line) => {
  if (line.startsWith('SF:')) {
    const sfPath = line.slice(3);
    if (!sfPath.startsWith('front/')) {
      const normalizedSf = sfPath.replace(/\\/g, '/');
      if (normalizedSf.includes(frontAbsPrefix)) {
        const relPath = 'front/' + normalizedSf.slice(frontAbsPrefix.length);
        changed++;
        return 'SF:' + relPath;
      }
    }
  }
  return line;
});

if (changed > 0) {
  fs.writeFileSync(frontLcovPath, normalized.join('\n'), 'utf8');
  console.log(`  ${changed} caminho(s) normalizado(s) com sucesso.`);
} else {
  console.log('  Nenhum caminho precisou ser normalizado.');
}

console.log('\nArquivos de coverage prontos para análise SonarQube.');