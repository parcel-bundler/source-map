const b = require('benny');
const { SourceMap } = require('./setup');
const AngularSourceMap = require('./maps/angular');

exports.modify = function () {
  let sourcemapInstance = new SourceMap();
  sourcemapInstance.addRawMappings(AngularSourceMap);

  return b.suite(
    'modify',
    b.add('positive line offset', () => {
      sourcemapInstance.offsetLines(150, 254);
    }),
    b.add('negative line offset', () => {
      sourcemapInstance.offsetLines(150, 254);
    }),
    b.add('positive column offset', () => {
      sourcemapInstance.offsetColumns(301, 190, 568);
    }),
    b.add('negative column offset', () => {
      sourcemapInstance.offsetColumns(301, 1000, -25);
    }),
    b.cycle(),
    b.complete()
  );
};
