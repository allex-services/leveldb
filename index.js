function createServicePack(execlib) {
  'use strict';


  return {
    service : {
      dependencies : ['.', 'allex_leveldblib']
    },
    sinkmap : {
      dependencies: ['.']
    }
  };
}

module.exports = createServicePack;
