const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function run() {
  let version = process.argv[process.argv.length - 1].trim();
  if (!/^\d+\.\d+\.\d+.*/.test(version)) {
    throw new Error(`${version} is an invalid version!`);
  }
  console.log(`Tagging release for ${version}`);

  console.log('Updating package.json...');
  const packageJsonFilepath = path.join(__dirname, 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonFilepath, 'utf-8');
  const parsedPkgJson = JSON.parse(packageJsonContent);
  parsedPkgJson.version = version;
  fs.writeFileSync(packageJsonFilepath, JSON.stringify(parsedPkgJson, null, '  '));
  execSync(`yarn version --new-version ${version} --no-commit-hooks`, {
    cwd: __dirname,
  });
  execSync('git add package.json', {
    cwd: __dirname,
  });
  execSync(`git commit -m "Release v${version}"`, {
    cwd: __dirname,
  });

  console.log('Updating cargo.toml...');
  execSync(`cargo release ${version} --no-confirm`, {
    cwd: __dirname,
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
