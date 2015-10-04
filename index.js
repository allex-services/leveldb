function createServicePack(execlib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    d = q.defer(),
    execSuite = execlib.execSuite;

  execSuite.libRegistry.register('allex_leveldblib').done(
    realCreator.bind(null, d),
    d.reject.bind(d)
  );

  function realCreator(defer, leveldblib){
    var ret = require('./clientside')(execlib),
      execSuite = execlib.execSuite,
      ParentServicePack = execSuite.registry.get('.');

    ret.Service = require('./servicecreator')(execlib, ParentServicePack, leveldblib);
    defer.resolve(ret);
  }

  return d.promise;
  'use strict';
  var ret = require('./clientside')(execlib),
    execSuite = execlib.execSuite,
    ParentServicePack = execSuite.registry.get('.');

  ret.Service = require('./servicecreator')(execlib, ParentServicePack);
  return ret;
}

module.exports = createServicePack;
