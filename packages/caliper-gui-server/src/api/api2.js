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
/*
 * Author:               Jason You
 * Last modified date:   March 1 2020
 *
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
/*jshint esversion: 6 */

// NOTE: This API is not used for connected to Caliper-CLI, instead it
// provides a complete demo on how to interact with data generated from
// Caliper-CLI.
// Since most of the development on Caliper-CLI is still undergoing, we
// will not connect to it now. In the future when more stable version come
// out, this demo API can be a reference for the connecting functionalities.

let express = require('express');
let api = express.Router();

// testing data generator for Caliper-gui
let Data = require('../utility/random-data-generator.js');
let data = new Data();

console.log(data);
// data.refresh();
// console.log(data);

api.get('/', function(req, res) {
    res.end('APIv2 TODO');
});

module.exports = api;
