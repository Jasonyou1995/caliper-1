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



class Data {
  #timeStamp;
  #timeString;

  constructor() {
    this.#timeStamp = new Date().getTime();
    this.#timeString = new Date().toISOString();

    /* Transaction throughput data */
    this.txThroughput = {
      type: 'txThroughput',
      value: this.getRandomInt(3000, 5000, 4),
      time: this.#timeString,
      id: `txThroughput_${this.#timeStamp}_${this.getRandomInt(0, 9999, 4)}`,
    };

    /* Transaction latency data */
    this.txLatency = {
      type: 'txLatency',
      value: this.getRandomNumber(5, 50),
      time: this.#timeString,
      id: `txLatency_${this.#timeStamp}_${this.getRandomInt(0, 9999, 4)}`,
    };

    /* Read throughput data */
    this.readThroughput = {
      type: 'readThroughput',
      value: this.getRandomInt(5000, 6000, 4),
      time: this.#timeString,
      id: `readThroughput_${this.#timeStamp}_${this.getRandomInt(0, 9999, 4)}`,
    };

    /* Read latency data */
    this.readLatency = {
      type: 'readLatency',
      value: this.getRandomNumber(1, 30),
      time: this.#timeString,
      id: `readLatency_${this.#timeStamp}_${this.getRandomInt(0, 9999, 4)}`,
    };
  }


  // refresh the data in this instance with new random values
  refresh() {
    // updating the new timestamp
    this.#timeStamp = new Date().getTime();
    this.#timeString = new Date().toISOString();

    // updating the stored data
    this.txThroughput.value = this.getRandomInt(3000, 5000, 4);
    this.txThroughput.time = this.#timeString,
    this.txThroughput.id = `txThroughput_${this.#timeStamp}_${this.getRandomInt(0, 9999, 4)}`;

    this.txLatency.value = this.getRandomNumber(5, 50);
    this.txLatency.time = this.#timeString,
    this.txLatency.id = `txLatency_${this.#timeStamp}_${this.getRandomInt(0, 9999, 4)}`;

    this.readThroughput.value = this.getRandomInt(5000, 6000, 4);
    this.readThroughput.time = this.#timeString,
    this.readThroughput.id = `readThroughput_${this.#timeStamp}_${this.getRandomInt(0, 9999, 4)}`;

    this.readLatency.value = this.getRandomNumber(1, 30);
    this.readLatency.time = this.#timeString,
    this.readLatency.id = `readLatency_${this.#timeStamp}_${this.getRandomInt(0, 9999, 4)}`;

    console.log("[+] Data refresh finished!")
  }

  /*
    Return random float number between given min (inclusive) and max (exclusive)
  */
  getRandomNumber(min, max) {
    let value = Math.random() * (max - min) + min;
    value = Math.round(value * 100) / 100;
    return value;
  }

  /*
    Get random int between min and max with size at least 'size'
  */
  getRandomInt(min, max, size) {
    let value = Math.floor(Math.random() * (max - min) + min)
    value = value + '';
    while (value.length < size) value = '0' + value;
    return value;
  }
}

module.exports = Data;
