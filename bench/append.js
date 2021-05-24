const b = require('benny');
const { SourceMap } = require('./setup');
const AngularSourceMap = require('./maps/angular');

exports.append = function () {
  let sourcemapInstance = new SourceMap();
  sourcemapInstance.addVLQMap(AngularSourceMap);

  let sourcemapInstance2 = new SourceMap();
  sourcemapInstance2.addVLQMap(AngularSourceMap);

  return b.suite(
    'append',
    b.add('addSourceMap', () => {
      sourcemapInstance.addSourceMap(sourcemapInstance2, 318);
    }),
    b.cycle(),
    b.complete()
  );
};
