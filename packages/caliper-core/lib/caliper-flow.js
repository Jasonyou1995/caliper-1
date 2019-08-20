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

const Blockchain = require('./blockchain');
const CaliperUtils = require('./utils/caliper-utils');
const ClientOrchestrator  = require('./client/client-orchestrator');
const Config = require('./config/config-util');
const Monitor = require('./monitor/monitor');
const Report = require('./report/report');
const Test = require('./test/defaultTest');

const demo = require('./gui/src/demo.js');
const path = require('path');

const logger = CaliperUtils.getLogger('caliper-flow');

/**
 * Run the benchmark based on passed arguments
 * @param {String} absConfigFile fully qualified path of the test configuration file
 * @param {String} absNetworkFile fully qualified path of the blockchain configuration file
 * @param {AdminClient} admin a constructed Caliper Admin Client
 * @param {ClientFactory} clientFactory a Caliper Client Factory
 * @param {String} workspace fully qualified path to the root location of network files
 * @returns {Integer} the error status of the run
 */
module.exports.run = async function(absConfigFile, absNetworkFile, admin, clientFactory, workspace) {

    let errorStatus = 0;
    let successes = 0;
    let failures = 0;

    // High level flow specifications from user
    let flowFlags = 0;
    let performStart;
    let performInit;
    let performInstall;
    let performTest;
    let performEnd;
    if (Config.get(Config.keys.Flow.StartOnly, false)) {
        logger.info('Flow flag detected, will only execute start scripts');
        performStart = true;
        performInit = false;
        performInstall = false;
        performTest = false;
        performEnd = false;
        flowFlags++;
    } else if (Config.get(Config.keys.Flow.InitOnly, false)) {
        logger.info('Flow flag detected, will only perform init phase');
        performStart = false;
        performInit = true;
        performInstall = false;
        performTest = false;
        performEnd = false;
        flowFlags++;
    } else if (Config.get(Config.keys.Flow.InstallOnly, false)) {
        logger.info('Flow flag detected, will only perform smart contract install phase');
        performStart = false;
        performInit = false;
        performInstall = true;
        performTest = false;
        performEnd = false;
        flowFlags++;
    } else if (Config.get(Config.keys.Flow.TestOnly, false)) {
        logger.info('Flow flag detected, will only perform test phase');
        performStart = false;
        performInit = false;
        performInstall = false;
        performTest = true;
        performEnd = false;
        flowFlags++;
    } else if (Config.get(Config.keys.Flow.EndOnly, false)) {
        logger.info('Flow flag detected, will only execute end scripts');
        performStart = false;
        performInit = false;
        performInstall = false;
        performTest = false;
        performEnd = true;
        flowFlags++;
    } else {
        performStart = true;
        performInit = true;
        performInstall = true;
        performTest = true;
        performEnd = true;
    }

    if (flowFlags > 1) {
        throw new Error('Multiple benchmark flow parameters specified, only one of [flow-init-only, flow-install-only, flow-test-only] may be specified at a time');
    }

    logger.info('####### Caliper Test #######');
    const adminClient = new Blockchain(admin);
    const clientOrchestrator  = new ClientOrchestrator(absConfigFile);
    const monitor = new Monitor(absConfigFile);
    const report = new Report(monitor);
    report.createReport(absConfigFile, absNetworkFile, adminClient.gettype());
    demo.init();

    let configObject = CaliperUtils.parseYaml(absConfigFile);
    let networkObject = CaliperUtils.parseYaml(absNetworkFile);

    try {
        // Conditional running of 'start' commands
        if (!performStart)  {
            logger.info('Skipping start commands due to benchmark flow conditioning');
        } else {
            if (networkObject.hasOwnProperty('caliper') && networkObject.caliper.hasOwnProperty('command') && networkObject.caliper.command.hasOwnProperty('start')) {
                if (!networkObject.caliper.command.start.trim()) {
                    throw new Error('Start command is specified but it is empty');
                } else {
                    const cmd = 'cd ' + workspace + ';' + networkObject.caliper.command.start;
                    await CaliperUtils.execAsync(cmd);
                }
            }
        }

        // Conditional network initialisation
        if (!performInit) {
            logger.info('Skipping initialization phase due to benchmark flow conditioning');
        } else {
            await adminClient.init();
        }

        // Conditional smart contract installation
        if (!performInstall) {
            logger.info('Skipping install smart contract phase due to benchmark flow conditioning');
        } else {
            await adminClient.installSmartContract();
        }

        // Conditional test phase
        if (!performTest) {
            logger.info('Skipping benchmark test phase due to benchmark flow conditioning');
        } else {
            // Start the monitors
            try {
                await monitor.start();
                logger.info('Started monitor successfully');
            } catch (err) {
                logger.error('Could not start monitor, ' + (err.stack ? err.stack : err));
            }

            let testIdx = 0;
            let numberOfClients = await clientOrchestrator.init();
            let clientArgs = await adminClient.prepareClients(numberOfClients);

            const tester = new Test(clientArgs, absNetworkFile, clientOrchestrator, clientFactory, workspace, report, demo, monitor);
            const allTests = configObject.test.rounds;
            for (let test of allTests) {
                ++testIdx;
                const response = await tester.runTestRounds(test, (testIdx === allTests.length));
                successes += response.successes;
                failures += response.failures;
            }

            logger.info('---------- Finished Test ----------\n');
            report.printResultsByRound();
            monitor.printMaxStats();
            await monitor.stop();

            const date = new Date().toISOString().replace(/-/g,'').replace(/:/g,'').substr(0,15);
            const outFile = path.join(process.cwd(), `report-${date}.html`);
            await report.finalize(outFile);

            clientOrchestrator.stop();

            demo.stopWatch();

            // NOTE: keep the below multi-line formatting intact, otherwise the indents will interfere with the template literal
            let testSummary = `# Test summary: ${successes} succeeded, ${failures} failed #`;
            logger.info(`

${'#'.repeat(testSummary.length)}
${testSummary}
${'#'.repeat(testSummary.length)}
`);
        }
    } catch (err) {
        logger.error(`Error: ${err.stack ? err.stack : err}`);
        errorStatus = 1;
    } finally {
        // Conditional running of 'end' commands
        if (performEnd) {
            if (networkObject.hasOwnProperty('caliper') && networkObject.caliper.hasOwnProperty('command') && networkObject.caliper.command.hasOwnProperty('end')) {
                if (!networkObject.caliper.command.end.trim()) {
                    logger.error('End command is specified but it is empty');
                } else {
                    const cmd = 'cd ' + workspace + ';' + networkObject.caliper.command.end;
                    await CaliperUtils.execAsync(cmd);
                }
            }
        } else {
            logger.info('Skipping end commands due to benchmark flow conditioning');
        }
    }

    return errorStatus;
};
