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
 * Last modified date:   March 1, 2019
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

// NOTE: currently using apiV2 for function demo purpose, in the future when
// Caliper-CLI has stable release, we will connect the GUI with it

const express = require('express');
const app = express();
const PORT = 3001;
const API_VERSION = "V2";
// const api = require('./src/api/api1.js');    // apiV1
const api = require('./src/api/api2.js');  // apiV2
const cors = require('cors');

// Using API middleware
app.use('/', api);

// Using CORS middleware
app.use(cors());

// For URL encoded data transfering POST and PUT
app.use(express.urlencoded({extended: true}));

// For JSON data transfering POST and PUT
app.use(express.json());

app.listen(PORT, function() {
    console.log(`Caliper-API started on port ${PORT} with localhost`);
});
