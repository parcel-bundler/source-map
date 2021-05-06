const path = require('path');
const fs = require('fs-extra');
const globby = require('globby');

const ARTIFACTS_ROOT = path.join(__dirname, 'parcel_sourcemap_node/artifacts');

let artifacts = globby.sync(path.join(ARTIFACTS_ROOT, '**'));
if (!artifacts.length) {
  throw new Error('No artifacts found!');
}

for (let artifact of artifacts) {
  let stat = fs.statSync(artifact);
  if (stat.isFile()) {
    let filename = path.basename(artifact);
    fs.moveSync(artifact, path.join(ARTIFACTS_ROOT, filename));
    console.log('Moved:', filename);

    let dirname = path.dirname(artifact);
    if (fs.readdirSync(dirname).length === 0) {
      fs.unlinkSync(dirname);
      console.log('Removed:', dirname);
    } else {
      console.warn('Could not remove:', dirname, 'as it is not empty');
    }
  }
}

console.log('=== Artifacts Moved ===');
let artifactsContent = fs.readdirSync(ARTIFACTS_ROOT);
for (let a of artifactsContent) {
  console.log(a);
}
