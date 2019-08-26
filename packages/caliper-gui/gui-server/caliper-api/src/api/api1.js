'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const shell = require('shelljs');

// caliper-core dependencies
const { CaliperUtils } = require('caliper-core');
// Caliper Flow Test Script for GUI
const CaliperFlow = require('../gui-caliper-flow');

const express = require('express');
const api = express.Router();
const multer = require('multer');		// for file reading
const mime = require('mime-types');

// sample config files
const sampleTestConfigPath = 'data/sample-config/sample-test-config.yaml';
const sampleNetworkConfigPath = 'data/sample-config/sample-network-config-fabric-v1.4.yaml';
// user uploaded config files
const configPath = 'data/config/';		// relative to the app.js in ./caliper-api
let networkConfigFile = '';
let testConfigFile = '';

// Run benchmark config parameters
let benchConfigFile = '';
let blockchainConfigFile = '';
let workspace = '';


const DEBUG = true;		// debug mode on/off
const TEST_START = false;	// global variable to check test start/end status

// MongoDB dependencies
const mongo = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017';

// test db
let mongodbOptions = {
	useUnifiedTopology: true,
	useNewUrlParser: true,
}
mongo.connect(mongoUrl, mongodbOptions, (err, client) => {
	if (err) {
		console.log(err);
		return;
	} else {
		console.log("We are connected");
		const db = client.db('caliper');
		const collectionConfig = db.collection('config');
		const collectionResults = db.collection('results');
		collectionConfig.insertOne({name: 'Jason Y'}, (err, result) => {
			if (err) {
				console.log(err);
			}
		})
	}
})

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (!checkPath(configPath)) {
			createPath(configPath);
		}		// make sure that path exists
		cb(null, configPath);
	},
	filename: (req, file, cb) => {
		// const filename = file.fieldname + '-' + Date.now();
		const filename = file.fieldname + '.yaml';
		cb(null, filename);
	}
})

// Get the upload multer function to create a publish function
// @param {String} configType: the key or file field name
// @return {String} a publish function
const getPublish = function(configType) {
	let upload = multer({
		storage: storage,
		fileFilter: (req, file, cb) => {
			if (DEBUG) {
				console.log('[DEBUG fileFilter] file:', file);		// debug
			}
			// Check the mime type of the received file first
			let mimeType = mime.lookup(file.originalname);
			if (!['text/vnd.yaml', 'text/yaml', 'text/x-yaml', 'application/x-yaml'].includes(mimeType)) {
				return cb({
					statusCode: 400,
					error: 'Only YAML files are allowed',
				})
			}
			return cb(null, true);
		}
	 }).single(configType);

	let publish = (req, res, callback) => {
		upload(req, res, (err) => {
			if (err instanceof multer.MulterError) {
				console.error('[Multer ERR]', err);
			} else if (err) {
				console.error('[SERVER ERR]', err)
				callback({ statusCode: 500, error: err });
		   } else {
			   // Successfully uploaded file

			   //TODO: save the file to DB in YAML/JSON format

				// console.log(req, '----req----');
			   console.log(req.file, '----FILE----');		// debug
			   callback({ statusCode: 200, error: null, file: req.file });
		   }
		})
	}
	
	return publish;
}

// Set the network config publish functions
const publishNetworkConfig = getPublish('network-config-file');
const publishTestConfig = getPublish('test-config-file');

 api.post('/network-config', (req, res, next) => {
	publishNetworkConfig(req, res, ({statusCode, error, file}) => {
		 if (statusCode != 200) {
			res.status(statusCode).json({error});
		 } else {
			 // TODO: store the config file in DB
			 //

			// set the config file path so the test can start
			networkConfigFile = 'data/config/network-config-file.yaml';
			res.status(statusCode).json({ file });
		 }
	 });
 })

 api.post('/test-config', (req, res, next) => {
	publishTestConfig(req, res, ({statusCode, error, file}) => {
		if (statusCode != 200) {
			res.status(statusCode).json({error});
		} else {
			// TODO: store the config file in DB
			//

			// set the config file path so the test can start
			testConfigFile = 'data/config/test-config-file.yaml';
			res.status(statusCode).json({ file });
		}
	});
})

// Test function to generate test reaults based on given test and network config files.
api.get('/run-test/:useSample', async (req, res, next) => {
	// TODO: make the startTest() return a JSON output so I can visualize it! (Don't even need to be real-time)
	// because this is just a one time test right now!
	let useSample = JSON.parse(req.params.useSample); 
	let result = await startTest(useSample);
	console.log('[DEBUG] req.params.useSample:', req.params.useSample);
	
	if (result) {
		res.end('Test finished!');
	} else {
		res.end('Empty result! Something is wrong! Check if you uploaded file or not!')
	}
})

// Start the Caliper test by calling dependencies in caliper-core
// The main purpose of this function is to get (real-time, not even necessary at this time)
// test results from the test! (JSON)
const startTest = async function(useSample) {

	// TODO: revent user from double testing
	// (if the test started TEST_START===true, then must disconnct/RESET first before the next START_TEST)
	// Maybe just connect everything to an API.

	if (useSample) {
		testConfigFile = sampleTestConfigPath;
		networkConfigFile = sampleNetworkConfigPath;
	} else if (networkConfigFile === '' || testConfigFile === '') {
		console.log('[DEBUG] NetworkConfigFile:------------\n', networkConfigFile);
		console.log('[DEBUG] testConfigFile:------------\n', testConfigFile);
		console.log('[ERROR] The config files are not uploaded, cannot start test!');
		return null;
		// TODO: send status code to the browser so it can response ERROR to user
	}

	let result = {
		success: false,
		data: null,
	};		// the result JSON object return to client and DB

	// Getting all the required inputs for test
	let argv = {
		workspace: '.',	// the workspace need to be the folder that contains all the network files used in the network config file, and it must be an absolute path to it (string path) [./ is only the sample workspace]
		benchConfig: testConfigFile,
		blockchainConfig: networkConfigFile,

	};
	// The benchmark tests on caliper core
	let dataOutput = await runBenchmark(argv)
	.then((res) => {
		if (dataOutput) {
			result.data = dataOutput;
			result.success = true;
		} else {
			throw new Error('Empty or null data output!');
		}
	})
	.catch((err) => {
		console.log(err);
	});

	// TODO: Save the result data in MongoDB

	// TODO: Build an api.get to let GUI to query result data from the API -> DB

	// clean();	// clean the config file paths

	return result;
}

/**
* Command process for run benchmark command
* @param {string} argv argument list from caliper GUI startTest API call
*/
const  runBenchmark = async function(argv) {
	// Workspace is expected to be the root location of working folders
	workspace = argv.workspace;
	benchConfigFile = path.join(workspace, argv.benchConfig);
	blockchainConfigFile = path.join(workspace, argv.blockchainConfig);

	if(!fs.existsSync(benchConfigFile)) {
		throw(new Error('Configuration file ' + benchConfigFile + ' does not exist'));
	}

	if(!fs.existsSync(blockchainConfigFile)) {
		throw(new Error('Configuration file ' + blockchainConfigFile + ' does not exist'));
	}

	let blockchainType = '';
	let networkObject = CaliperUtils.parseYaml(blockchainConfigFile);
	if (networkObject.hasOwnProperty('caliper') && networkObject.caliper.hasOwnProperty('blockchain')) {
		blockchainType = networkObject.caliper.blockchain;
	} else {
		throw new Error('The configuration file [' + blockchainConfigFile + '] is missing its "caliper.blockchain" attribute');
	}

	try {
		console.log(chalk.blue.bold(['Benchmark for target Blockchain type ' + blockchainType + ' about to start']));
		const {AdminClient, ClientFactory} = require('caliper-' + blockchainType);
		const adminClient = new AdminClient(blockchainConfigFile, workspace);
		const clientFactory = new ClientFactory(blockchainConfigFile, workspace);

		// The main caliper test
		const response = await CaliperFlow.run(benchConfigFile, blockchainConfigFile, adminClient, clientFactory, workspace);

		if (response === 0) {
			console.log(chalk.blue.bold('Benchmark run successful'));
		} else {
			console.log(chalk.red.bold('Benchmark failure'));
			throw new Error('Benchmark failure');
		}
	} catch (err) {
		throw err;
	}
}

// Check the existence of a path, and create if it doesn't exists
const checkPath = function(path) {
	return fs.existsSync(path);
}

// recursively create directory in path
const createPath = function(path) {
	shell.mkdir('-p', path);
}

// TODO: remove the configuration files after closing/finishing
const clean = function() {
	// Let the test function know that no current config files provided
	networkConfigFile = '';
	testConfigFile = '';
	// Delete to local temp config files
	
}


module.exports = api;
