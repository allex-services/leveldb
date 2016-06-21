function createServicePack(execlib) {
  'use strict';


  return {
    service : {
      dependencies : ['allex:leveldb:lib']
    },
    sinkmap : {
      dependencies: ['allex:leveldb:lib']
    }
  };
}

module.exports = createServicePack;
