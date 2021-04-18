/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

async function build() {
  let napiBinary = path.join(__dirname, 'node_modules/@napi-rs/cli/scripts/index.js');
  let dir = path.join(__dirname, 'parcel_sourcemap_node');
  let artifactsDir = path.join(dir, 'artifacts');

  fs.removeSync(artifactsDir);
  fs.mkdirSync(artifactsDir);

  console.log('Building node artifact...');

  await new Promise((resolve, reject) => {
    let args = ['build', '--platform', '-c', '../package.json', './artifacts'];
    if (process.env.RUST_TARGET) {
      args.push('--target', process.env.RUST_TARGET);
    }

    if (process.env.IS_RELEASE) {
      args.push('--release');
    }

    let yarn = spawn(napiBinary, args, {
      stdio: 'inherit',
      cwd: dir,
      shell: true,
    });

    yarn.on('error', reject);
    yarn.on('close', resolve);
  });
}

build();
