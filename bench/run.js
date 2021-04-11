const fs = require('fs-extra');
const path = require('path');

const { init } = require('./setup');
const { consume } = require('./consume');
const { serialize } = require('./serialize');
const { modify } = require('./modify');

function formatSummary(summary) {
  return summary.results
    .map((result) => {
      return `${summary.name}#${result.name} x ${result.ops} ops/sec ±${result.margin}% (${result.samples} runs sampled)`;
    })
    .join('\n');
}

async function run() {
  await init;

  const output = [await consume(), await serialize(), await modify()].map(formatSummary).join('\n');

  await fs.writeFile(path.join(process.cwd(), 'bench.txt'), output, 'utf8');
}

run();
