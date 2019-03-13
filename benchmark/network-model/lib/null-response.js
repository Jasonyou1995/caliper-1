/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';


// Investigate submitTransaction() or evaluateTransaction() by calling a nullRepsonse chaincode function. Passed argument
// "consensus" is an optional (default false) argument to conditionally use the ordering service.
// - label: null-response-ordered
//     chaincodeId: fixed-asset
//     txNumber:
//     - 1000
//     rateControl:
//     - type: fixed-rate
//       opts:
//         tps: 50
//     arguments:
//       consensus: true
//     callback: benchmark/network-model/lib/null-response.js

module.exports.info  = 'Null Repsonse';

const chaincodeID = 'fixed-asset';
let bc, contx, consensus;

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    consensus = args.consensus ? (args.consensus === 'true' || args.consensus === true): false;
    const contract = await context.network.getContract(chaincodeID);
    context.contract = contract;
    contx = context;
};

module.exports.run = function() {

    // Create argument array [consensus(boolean), functionName(String), otherArgs(String)]
    const myArgs = [consensus, 'nullResponse'];
    return bc.queryState(contx, chaincodeID, 'v1', myArgs);

};

module.exports.end = function() {
    return Promise.resolve();
};
