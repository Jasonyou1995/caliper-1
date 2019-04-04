/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const RateInterface = require('./rateInterface.js');
const Sleep = require('../util').sleep;
const Logger = require('../util').getLogger('fixedBacklog.js');

/**
 * Rate controller for driving at a target loading (backlog transactions). This controller will aim to maintain a defined backlog
 * of unfinished transactions by modifying the driven TPS.
 */
class FixedBacklog extends RateInterface {
    /**
     * Creates a new instance of the FixedBacklog class.
     * @constructor
     * @param {object} opts Options for the rate controller.
     */
    constructor(opts) {
        super(opts);
    }

    /**
     * Initialise the rate controller with a passed msg object
     * - Only requires the desired cnumber of unfinished transactions per client
     * @param {JSON} msg the initialisation message
     */
    init(msg) {
        this.sleep_time = this.options.sleep_time ? parseFloat(this.options.sleep_time) : 100;
        this.unfinished_per_client = this.options.unfinished_per_client ? parseInt(this.options.unfinished_per_client) : 10;
        this.zero_succ_count = 0;
        this.total_sleep_time = 0;
    }

    /**
    * Perform the rate control action based on knowledge of the start time, current index, and current results.Sleep a suitable time
    * @param {number} start, generation time of the first test transaction
    * @param {number} idx, sequence number of the current test transaction
    * @param {Int} minorUnfinished, submitted - unprocessed results
    * @param {Array} resultStats, result status set formed in txUpdate() callback
    * @async
    */
    async applyRateControl(start, idx, minorUnfinished, resultStats) {

        // Waiting until successful transactions occur.
        if(resultStats.length < 2 || !resultStats[0].succ || !resultStats[0].delay)  {
            await Sleep(this.sleep_time);
            return;
        }

        // Get transaction details
        let stats = resultStats[0]; //processed results
        const processedSent = stats.length;
        let unfinished = minorUnfinished - (processedSent);

        Logger.debug('unfinished: ' + unfinished);
        // Shortcut if we are below the target threshold
        if(unfinished < this.unfinished_per_client) {
            return;
        }

        // Determines the sleep time according to the current number of
        // unfinished transactions with that in the config file
        const delay = resultStats[0].delay;
        const avDelay = ((delay.sum)/processedSent)*1000;
        const error = unfinished - this.unfinished_per_client;

        // Sleep for a count of the load error and the current average delay
        await Sleep(error * avDelay);
    }

    /**
     * Notify the rate controller about the end of the round.
     * @async
     */
    async end() { }
}


/**
 * Creates a new rate controller instance.
 * @param {object} opts The rate controller options.
 * @param {number} clientIdx The 0-based index of the client who instantiates the controller.
 * @param {number} roundIdx The 1-based index of the round the controller is instantiated in.
 * @return {RateInterface} The rate controller instance.
 */
function createRateController(opts, clientIdx, roundIdx) {
    return new FixedBacklog(opts);
}

module.exports.createRateController = createRateController;
