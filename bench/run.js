const Benchmark = require('tiny-benchy');
const sourceMap = require("source-map");

const test_maps = [require("./maps/angular")];
const suite = new Benchmark();

suite.add("source-map#consume", async () => {
  for (let map of test_maps) {
    let smc = await new sourceMap.SourceMapConsumer(map);
    smc.destroy();
  }
});

suite.add("source-map#consume->generate", async () => {
  for (let map of test_maps) {
    let smc = await new sourceMap.SourceMapConsumer(map);
    smg = sourceMap.SourceMapGenerator.fromSourceMap(smc);
    smc.destroy();
  }
});

suite.run();
