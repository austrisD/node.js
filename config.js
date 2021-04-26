const environments = {};

environments.staging = {
  'httpPort': 3000,
  'httpPort': 3001,
  'envName': "staging",
};

environments.production = {
  'httpsPort': 5000,
  'httpsPort': 5001,
  'envName': "production",
};

//determine environment
const currentEnvironments =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";
// if (typeof process.env.NODE_ENV == "string") {
//   const currentEnvironments = process.env.NODE_ENV.toLowerCase();
// }

const environmentsToExport =
  typeof environments[currentEnvironments] == "object"
    ? environments[currentEnvironments]
    : environments.staging;
// check thats environment

module.exports = environmentsToExport;

/*
In windows command-line, one can run "set NODE_ENV=production" or "set NODE_ENV=staging", before running "node index.js"

*/
