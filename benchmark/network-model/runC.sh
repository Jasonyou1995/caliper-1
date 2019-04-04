# nohup ./runC.sh &
# Tests
docker kill $(docker ps -aq);docker rm $(docker ps -aq);docker rmi $(docker images dev* -q);
node ../../scripts/main.js -c ./benchmark/network-model/couchDB/create-asset.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/couchDB/create-asset-batch.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/couchDB/get-asset.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/couchDB/get-asset-batch.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/couchDB/mixed-range-query-pagination.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/couchDB/mixed-rich-query-pagination.yaml -n ./network/fabric-v1.4/2org1peerco