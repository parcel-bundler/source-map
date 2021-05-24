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
  console.log('Initializing sourcemap...');
  await init;

  console.log('Running benchmark...');
  const results = [];
  results.push(await consume());
  results.push(await serialize());
  results.push(await modify());

  console.log('Formatting benchmark results...');
  const output = results.map(formatSummary).join('\n');

  console.log('Saving benchmark...');
  let benchFilePath = path.join(process.cwd(), 'bench.txt');
  await fs.writeFile(benchFilePath, output, 'utf-8');
}

run();
