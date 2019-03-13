/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';


// Investigate a paginated rich query that may or may not result in ledger appeding via orderer. Assets are created in the init phase
// with a byte size that is specified as in input argument. Pagesize and the number of existing test assets are also cofigurable. The argument
// "nosetup" and "consensus" are optional items that are default false. Resulting mago query is that whch targets assets created by the same client
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
//       assets: 5000
//       nosetup: true
//     callback: benchmark/network-model/lib/rich-query-asset.js


module.exports.info  = 'Paginated Rich Querying Assets of fixed size.';

const bytes = (s) => {
    return ~-encodeURI(s).split(/%..|./).length;
};

const chaincodeID = 'fixed-asset';
let clientIdx, testAssetNum, pagesize, mangoQuery, consensus;
let asset = {docType: chaincodeID, content: ''};
let bc, contx, bytesize, nomatch;

module.exports.init = async function(blockchain, context, args) {
    bc = blockchain;
    contx = context;
    clientIdx = context.clientIdx;

    const contract = await context.network.getContract(chaincodeID);
    context.contract = contract;
    contx = context;

    testAssetNum = args.assets;
    bytesize = args.bytesize;
    pagesize = args.pagesize;

    consensus = args.consensus ? (args.consensus === 'true' || args.consensus === true) : false;
    nomatch = args.nomatch ?  (args.nomatch === 'true' || args.nomatch === true): false;
    const nosetup = args.nosetup ? (args.nosetup === 'true' || args.nosetup === true) : false;

    console.log('   -> Rich query test configured with consensus flag set to ', consensus.toString());

    // Create a mango query that returns assets created by this client only
    mangoQuery = {
        'selector': {
            'docType': chaincodeID,
            'creator': nomatch ? 'client_nomatch' : 'client' + clientIdx,
            'bytesize': bytesize
        }
    };

    if (nosetup || testAssetNum === 0) {
        console.log('   -> Skipping asset creation stage');
    } else {
        // Create for the following sizes
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
    const myArgs = [consensus, 'paginatedRichQuery', JSON.stringify(mangoQuery), pagesize];
    return bc.queryState(contx, chaincodeID, 'v1', myArgs);
};

module.exports.end = function() {
    return Promise.resolve();
};
