# nohup ./runBaseline.sh &
# Ensure clean start
docker kill $(docker ps -aq);docker rm $(docker ps -aq);docker rmi $(docker images dev* -q);
# Tests
node ../../scripts/main.js -c ./benchmark/network-model/levelDB/base.yaml -n ./network/fabric-v1.4/2org1peergoleveldb/fabric-node.json;
node ../../scripts/main.js -c ./benchmark/network-model/couchDB/base.yaml -n ./network/fabric-v1.4/2org1peercouchdb/fabric-node.json;