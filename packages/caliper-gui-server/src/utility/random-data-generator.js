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
/*!

=========================================================
* Hyperledger Caliper GUI
=========================================================

* Author: Jason You
* GitHub:
* Licensed under the Apache 2.0 - https://www.apache.org/licenses/LICENSE-2.0

Copyright (c) 2020 Jason You

*/

/*
  Generating random data on every request based on the data format of the
  Hyperledger Caliper data flow.
  This is for demo purpose, and is helpful for developers to understand the
  usage of GUI when integrated with Caliper CLI.
*/

/*
  Return random float number between given min (inclusive) and max (exclusive)
*/
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

module.exports.dataConstructor = function Data() {
  /* Transaction throughput data */
  this.txThroughput = {
    timestamps: [],
    datasets: {
      data1: [],
      data2: [],
      data3: []
    }
  };

  /* Transaction latency data */
  this.txLatency = {
    timestamps: [],
    datasets: {
      data1: [],
      data2: [],
      data3: []
    }
  };

  /* Read throughput data */
  this.txThroughput = {
    timestamps: [],
    datasets: {
      data1: [],
      data2: [],
      data3: []
    }
  };

  /* Read latency data */
  this.readLatency = {
    timestamps: [],
    datasets: {
      data1: [],
      data2: [],
      data3: []
    }
  };

  // refresh the data in this instance with new random values
  this.refresh = () => {
    console.log("[+] Refreshing data...");

    console.log("[+] ... finished!")
  }
}
