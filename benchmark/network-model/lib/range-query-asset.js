/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';


// Investigate a paginated range query that may or may not result in ledger appeding via orderer. Assets are created in the init phase
// with a byte size that is specified as in input argument. Pagesize and the number of existing test assets, as well as the range and offset, are also cofigurable. The arguments
// "nosetup" and "consensus" are optional items that are default false.
// - label: query-asset-100
//     chaincodeId: fixed-asset
//     txNumber:
//     - 1000
//     rateControl:
//     - type: fixed-rate
//       opts:
//         tps: 50
//     arguments:
//       bytesize: 100
//       pagesize: 10
//       range: 10
//       offset: 100
//       assets: 5000
//       nosetup: false
//       consensus: false
//     callback: benchmark/network-model/lib/range-query-asset.js


module.exports.info  = 'Paginated Range Querying Assets of fixed size.';

const bytes = (s) => {
    return ~-encodeURI(s).split(/%..|./).length;
};

const chaincodeID = 'fixed-asset';
let clientIdx, testAssetNum, pagesize, offset, range, consensus;
let asset = {docType: chaincodeID, content: ''};
let bc, contx, bytesize, nomatch, startKey, endKey;

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    contx = context;
    clientIdx = context.clientIdx;

    const contract = await context.network.getContract(chaincodeID);
    context.contract = contract;
    contx = context;

    offset = parseInt(args.offset);
    range = parseInt(args.range);
    pagesize = args.pagesize;
    bytesize = args.bytesize;

    testAssetNum = args.nomatch ? parseInt(args.assets) : 0;
    nomatch = args.nomatch ?  (args.nomatch === 'true' || args.nomatch === true): false;
    startKey = nomatch ? 'client_nomatch_' + offset : 'client' + clientIdx + '_' + bytesize + '_' + offset;
    endKey = nomatch ? 'client_nomatch_' + (offset + range) : 'client' + clientIdx + '_' + bytesize + '_' + (offset + range);

    consensus = args.consensus ? (args.consensus === 'true' || args.consensus === true): false;
    const nosetup = args.nosetup ? (args.nosetup === 'true' || args.nosetup === true) : false;

    if (nosetup || testAssetNum === 0) {
        console.log('   -> Skipping asset creation stage');
    } else {
        console.log('   -> Creating assets of size: ', args.create_sizes);
        for (let index in args.create_sizes) {
            const size = args.create_sizes[index];
            console.log('   -> Creating asset set of size: ', size);
            const uuidBase = 'client' + clientIdx + '_' + size + '_';

            // define the asset to be created in this loop
            asset.bytesize = size;
            asset.creator = 'client' + clientIdx;
            asset.uuid = uuidBase;

            // Complete the asset definition
            const rand = 'random';
            let idx = 0;
            while (bytes(JSON.stringify(asset)) < size) {
                const letter = rand.charAt(idx);
                idx = idx >= rand.length ? 0 : idx+1;
                asset.content = asset.content + letter;
            }

            // Create assets loop
            for (let i=0; i<testAssetNum; i++) {
                asset.uuid = uuidBase + i;
                await context.contract.submitTransaction('createAsset', JSON.stringify(asset));
            }
        }
        console.log('   -> Test asset creation complete');
    }

    return Promise.resolve();
};

module.exports.run = function() {
    // Create argument array [consensus(boolean), functionName(String), otherArgs(String)]
    const myArgs = [consensus, 'paginatedRangeQuery', startKey, endKey, pagesize];
    return bc.queryState(contx, chaincodeID, 'v1', myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};
