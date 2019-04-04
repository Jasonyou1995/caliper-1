/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const bytes = (s) => {
    return ~-encodeURI(s).split(/%..|./).length;
};

/**
 * Insert asset batches
 * @param {Object} context the BC context
 * @param {Integer} clientIdx the client index
 * @param {Object} args the client arguments
 */
module.exports.addBatchAssets = async function(context, clientIdx, args) {
    console.log('   -> Creating assets of size: ', args.create_sizes);

    const testAssetNum = args.assets ? parseInt(args.assets) : 0;
    for (let index in args.create_sizes) {
        const size = args.create_sizes[index];
        console.log('   -> Creating asset set of size: ', size);
        const uuidBase = 'client' + clientIdx + '_' + size + '_';

        // define the asset to be created in this loop
        const baseAsset = {};
        baseAsset.docType = 'fixed-asset';
        baseAsset.bytesize = size;
        baseAsset.creator = 'client' + clientIdx;
        baseAsset.uuid = uuidBase;

        // Create assets in batches, because it is faster!!
        // -Complete the asset definition
        const rand = 'random';
        let idx = 0;
        let content = '';
        baseAsset.content = content;
        while (bytes(JSON.stringify(baseAsset)) < size) {
            const letter = rand.charAt(idx);
            idx = idx >= rand.length ? 0 : idx+1;
            content = content + letter;
            baseAsset.content = content;
        }

        // -Generate all assets
        const assets = [];
        for (let i=0; i<testAssetNum; i++) {
            const asset = {};
            asset.docType = baseAsset.docType;
            asset.bytesize = baseAsset.bytesize;
            asset.creator = baseAsset.creator;
            asset.content = baseAsset.content;
            asset.uuid = uuidBase + i;
            assets.push(asset);
        }

        // -Break into batches of (max) 50
        const batches = [];
        idx = 0;
        while(assets.length) {
            batches[idx]=assets.splice(0,50);
            idx++;
        }

        // -Insert each batch
        for (const index in batches){
            const batch = batches[index];
            try {
                await context.contract.submitTransaction('createAssetsFromBatch', JSON.stringify(batch));
            } catch (err) {
                console.error('Error: ', err);
                throw err;
            }
        }
    }
};

/**
 * Insert asset batches of mixed size
 * @param {Object} context the BC context
 * @param {Integer} clientIdx the client index
 * @param {Object} args the client arguments
 */
module.exports.addMixedBatchAssets = async function(context, clientIdx, args) {
    console.log('   -> Creating assets of size: ', args.create_sizes);

    const testAssetNum = args.assets ? parseInt(args.assets) : 0;
    const uuidBase = 'client' + clientIdx + '_';

    const baseAssets = [];
    // Define base assets sizes
    for (let index in args.create_sizes) {
        const size = args.create_sizes[index];

        // define the asset to be created in this loop
        const baseAsset = {};
        baseAsset.docType = 'fixed-asset';
        baseAsset.bytesize = size;
        baseAsset.creator = 'client' + clientIdx;
        baseAsset.uuid = uuidBase;

        // Create assets in batches, because it is faster!!
        // -Complete the asset definition
        const rand = 'random';
        let idx = 0;
        let content = '';
        baseAsset.content = content;
        while (bytes(JSON.stringify(baseAsset)) < size) {
            const letter = rand.charAt(idx);
            idx = idx >= rand.length ? 0 : idx+1;
            content = content + letter;
            baseAsset.content = content;
        }

        baseAssets.push(baseAsset);
    }

    // -Generate all assets
    const assets = [];
    let idx =0;
    for (let i=0; i<testAssetNum; i++) {
        // loop over baseAssets defined above
        const asset = {};
        asset.docType = baseAssets[idx].docType;
        asset.bytesize = baseAssets[idx].bytesize;
        asset.creator = baseAssets[idx].creator;
        asset.content = baseAssets[idx].content;
        asset.uuid = uuidBase + i;
        assets.push(asset);
        idx = (idx + 1) % args.create_sizes.length;
    }

    // -Break into batches of (max) 50
    const batches = [];
    idx = 0;
    while(assets.length) {
        batches[idx]=assets.splice(0,50);
        idx++;
    }

    // -Insert each batch
    console.log('   -> Adding ' + batches.length + ' batch(es) to DB');
    for (const index in batches){
        const batch = batches[index];
        try {
            await context.contract.submitTransaction('createAssetsFromBatch', JSON.stringify(batch));
        } catch (err) {
            console.error('Error: ', err);
            throw err;
        }
    }
};