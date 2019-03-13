/*
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-console */

'use strict';

const { Contract } = require('fabric-contract-api');

/**
 * Simple chaincode to create an asset that may have a user provided body
 */
class Asset extends Contract {

    /**
     * PLaceholder for function that isnt needed functionally
     */
    async init(){

    }

    /**
     * Return a null response
     * @param {Context} ctx - the transaction context
     * @returns {null}  a null repsonse
     */
    async nullResponse(ctx) {
        console.info('Returning null response');
        return {};
    }

    /**
     * Create an Asset in the registry based on the body that is provided of the form
     * {
     *   uuid: unique identifier
     *   creator: the creator
     *   bytesize: target bytesize of asset
     *   content: variable content
     * }
     * @param {Context} ctx the context
     * @param {JSON} content the content to persist
     */
    async createAsset(ctx, content) {
        console.info('============= START : Create Asset ===========');
        console.info('inserting asset: ', content);

        const jsnContent = JSON.parse(content);
        await ctx.stub.putState(jsnContent.uuid, Buffer.from(content));

        console.info('============= END : Create Asset ===========');
    }

    /**
     * Get an Asset from the registry that was created by createAsset
     * @param {Context} ctx the context
     * @param {String} uuid the uuid to query
     * @returns {JSON} the result of the query
     */
    async getAsset(ctx, uuid) {
        console.info('Performing getState for asset with uuid: ', uuid);
        return await ctx.stub.getState(uuid);
    }

    /**
     * Run a paginated rich query
     * @param {Object} ctx - the transaction context
     * @param {String} queryString - the query to run
     * @param {String} pagesize - the pagesize to return
     * @param {String} passedBookmark - the bookmark from which to start the return
     * @returns {JSON} the results of the paginated query and responseMetadata in a JSON object
     */
    async paginatedRichQuery(ctx, queryString, pagesize, passedBookmark) {
        console.info('Paginated rich query with pagesize [' + pagesize + '] and query string: ', queryString);
        const response = {};
        const pageSize = parseInt(pagesize, 10);

        const bookmark = passedBookmark ? passedBookmark : false;

        if (bookmark) {
            console.info('Using passed bookmark ... ');
            const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(queryString, pageSize, bookmark);
            response.results = await this.getAllResults(iterator);
            response.responseMetadata = {
                RecordsCount: metadata.fetched_records_count,
                Bookmark: metadata.bookmark,
            };
        } else {
            console.info('Running without bookmark ... ');
            const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(queryString, pageSize);
            response.results = await this.getAllResults(iterator);
            response.responseMetadata = {
                RecordsCount: metadata.fetched_records_count,
                Bookmark: metadata.bookmark,
            };
        }
        return response;
    }

    /**
     * Get all results present in the iterator
     * @param {Object} iterator the itterator to retrieve results from
     * @returns {String[]} all results
     */
    async getAllResults(iterator) {
        let allResults = [];
        let res = await iterator.next();
        let iterate = res.value ? true: false;
        while (iterate) {
            if (res.value && res.value.value.toString()) {
                let jsonRes;
                try {
                    jsonRes = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.err(err);
                    jsonRes = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if(res.done){
                iterate = false;
            } else {
                res = await iterator.next();
            }
        }
        await iterator.close();
        return allResults;
    }

    /**
     * Run a paginated range query on the DB contents
     * @param {Object} ctx - the transaction context
     * @param {String} startKey - the first key in the range of interest
     * @param {String} endKey - the end key in the range of interest
     * @param {String} pagesize - the pagesize to return
     * @param {String} passedBookmark - the bookmark from which to start the return
     * @returns {JSON} the results of the paginated query and responseMetadata in a JSON object
     */
    async paginatedRangeQuery(ctx, startKey, endKey, pagesize, passedBookmark) {
        console.info('Paginated range query with pagesize [' + pagesize + '] and limit keys: [' + startKey + ',' + endKey + ']');
        const response = {};
        const pageSize = parseInt(pagesize, 10);

        const bookmark = passedBookmark ? passedBookmark : false;

        if (bookmark) {
            console.info('Using passed bookmark ... ');
            const { iterator, metadata } = await ctx.stub.getStateByRangeWithPagination(startKey,endKey, pageSize, bookmark);
            response.results = await this.getAllResults(iterator);
            response.responseMetadata = {
                RecordsCount: metadata.fetched_records_count,
                Bookmark: metadata.bookmark,
            };
        } else {
            console.info('Running without bookmark ... ');
            const { iterator, metadata } = await ctx.stub.getStateByRangeWithPagination(startKey,endKey, pageSize);
            response.results = await this.getAllResults(iterator);
            response.responseMetadata = {
                RecordsCount: metadata.fetched_records_count,
                Bookmark: metadata.bookmark,
            };
        }
        return response;
    }
}

module.exports = Asset;