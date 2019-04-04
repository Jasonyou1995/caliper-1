# nohup ./runL.sh &
# Ensure clean start
docker kill $(docker ps -aq);docker rm $(docker ps -aq);docker rmi $(docker images dev* -q);
# Tests
node ../../scripts/main.js -c ./benchmark/network-model/levelDB/create-asset.yaml -n ./network/fabric-v1.4/2org1peergoleveldb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/levelDB/create-asset-batch.yaml -n ./network/fabric-v1.4/2org1peergoleveldb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/levelDB/get-asset.yaml -n ./network/fabric-v1.4/2org1peergoleveldb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/levelDB/get-asset-batch.yaml -n ./network/fabric-v1.4/2org1peergoleveldb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/levelDB/mixed-range-query-pagination.yaml -n ./network/fabric-v1.4/2org1peergoleveldb/fabric-node.json;