const fs = require('fs-extra');
const path = require('path');

const { init } = require('./setup');
const { consume } = require('./consume');
const { serialize } = require('./serialize');
const { modify } = require('./modify');
const { append } = require('./append');

function formatSummary(summary) {
  return summary.results
    .map((result) => {
      return `${summary.name}#${result.name} x ${result.ops} ops/sec ±${result.margin}% (${result.samples} runs sampled)`;
    })
    .join('\n');
}

async function run() {
  console.log('Initializing sourcemap...');
  await init;

  console.log('Running benchmark...');
  const results = [await consume(), await serialize(), await modify(), await append()];

  console.log('Formatting benchmark results...');
  const output = results.map(formatSummary).join('\n');

  console.log('Saving benchmark...');
  let benchFilePath = path.join(process.cwd(), 'bench.txt');
  await fs.writeFile(benchFilePath, output, 'utf-8');
}

run();
