node ./scripts/main.js -c ./benchmark/network-model/couchDB/base.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json 
node ./scripts/main.js -c ./benchmark/network-model/couchDB/get-asset-ramp.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json 
node ./scripts/main.js -c ./benchmark/network-model/couchDB/asset-size-ramp.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json 
node ./scripts/main.js -c ./benchmark/network-model/couchDB/range-query-ramp.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json 
node ./scripts/main.js -c ./benchmark/network-model/couchDB/rich-query-ramp.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json 