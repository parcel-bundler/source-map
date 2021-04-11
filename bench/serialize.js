const b = require('benny');
const { SourceMap } = require('./setup');
const AngularSourceMap = require('./maps/angular');

exports.serialize = function () {
  let sourcemapInstance = new SourceMap();
  sourcemapInstance.addRawMappings(AngularSourceMap);

  return b.suite(
    'serialize',
    b.add('Save buffer', () => {
      sourcemapInstance.toBuffer();
    }),
    b.add('Serialize to vlq', () => {
      sourcemapInstance.toVLQ();
    }),
    b.cycle(),
    b.complete()
  );
};
