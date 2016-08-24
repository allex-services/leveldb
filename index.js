function createServicePack(execlib) {
  'use strict';


  return {
    service : {
      dependencies : ['.', 'allex:leveldb:lib']
    },
    sinkmap : {
      dependencies: ['.']
    }
  };
}

module.exports = createServicePack;
