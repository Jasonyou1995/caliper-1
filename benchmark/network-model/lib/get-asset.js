/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';


// Investigate a 'get' that may or may not result in ledger appeding via orderer. Assets are created in the init phase
// with a byte size that is specified as in input argument. The arguments "nosetup" and "consensus" are optional items that are default false.
// - label: get-asset-100
//     chaincodeId: fixed-asset
//     txNumber:
//     - 1000
//     rateControl:
//     - type: fixed-rate
//       opts:
//         tps: 50
//     arguments:
//       bytesize: 100
//       assets: 5000
//       nosetup: false
//       consensus: false
//     callback: benchmark/network-model/lib/get-asset.js

const helper = require('./helper');

module.exports.info  = 'Get Asset of fixed size.';

const chaincodeID = 'fixed-asset';
let clientIdx, assets, bytesize, consensus;
let bc, contx;

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    contx = context;
    clientIdx = context.clientIdx;

    const contract = await context.network.getContract(chaincodeID);
    context.contract = contract;
    contx = context;

    assets = args.assets ? parseInt(args.assets) : 0;

    bytesize = args.bytesize;
    consensus = args.consensus ? (args.consensus === 'true' || args.consensus === true): false;
    const nosetup = args.nosetup ? (args.nosetup === 'true' || args.nosetup === true) : false;

    if (nosetup) {
        console.log('   -> Skipping asset creation stage');
    } else {
        console.log('   -> Entering asset creation stage');
        await helper.addBatchAssets(contx, clientIdx, args);
        console.log('   -> Test asset creation complete');
    }

    return Promise.resolve();
};

module.exports.run = function() {
    // Create argument array [consensus(boolean), functionName(String), otherArgs(String)]
    const uuid = Math.floor(Math.random() * Math.floor(assets));
    const itemKey = 'client' + clientIdx + '_' + bytesize + '_' + uuid;
    const myArgs = [consensus, 'getAsset', itemKey];
    return bc.queryState(contx, chaincodeID, 'v1', myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};
