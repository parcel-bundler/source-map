const path = require('path');
const fs = require('fs-extra');
const globby = require('globby');

const ARTIFACTS_ROOT = path.join(__dirname, 'parcel_sourcemap_node/artifacts');

let artifacts = globby.sync(path.join(ARTIFACTS_ROOT, '*/*.node'));
if (!artifacts.length) {
  throw new Error('No artifacts found!');
}

console.log('Moving artifacts...');

for (let artifact of artifacts) {
  let stat = fs.statSync(artifact);
  if (stat.isFile()) {
    let filename = path.basename(artifact);
    fs.moveSync(artifact, path.join(ARTIFACTS_ROOT, filename));
    console.log('Moved:', filename);
  }
}

console.log('Cleaning up artifacts folder...');

let artifactsFolderContent = fs.readdirSync(ARTIFACTS_ROOT);
for (let entry of artifactsFolderContent) {
  let fullPath = path.join(ARTIFACTS_ROOT, entry);
  if (!fullPath.endsWith('.node')) {
    fs.removeSync(fullPath);
    console.log('Removed:', fullPath);
  }
}

console.log('=== ARTIFACTS ===');
artifactsFolderContent = fs.readdirSync(ARTIFACTS_ROOT);
for (let entry of artifactsFolderContent) {
  console.log('-', entry);
}
