/* server start*/

const http = require("http");
const https = require('https');
const url = require("url");
const { StringDecoder } = require("string_decoder");
const config = require("./lib/config");
const fs = require("fs");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");
// const _data = require("./lib/data");

//test delete
// _data.create("test", "newFile", { 'foo': "bar" }, (err) => {
//   console.log("error", err);
// });
// _data.read("test", "newFile", (err, date) => {
//   console.log("error", err, "date", date);
// });
// _data.update("test", "newFile", { 'foo': "buzz" }, (err) => {
//   console.log("error", err);
// });
// _data.delete("test", "newFile", (err) => {
//   console.log("error", err);
// });


//HTTP server
const httpServer = http.createServer((req, res) => {
  UnifiedServer(req, res);
});
httpServer.listen(config.httpPort, () => {
  console.log(
    `server is listening on port ${config.httpPort} in ${config.envName} mode`
  );
});

//HTTPS
const httpsServerOptions = {
  "key": fs.readFileSync("./https/key.pem"),
  "cert": fs.readFileSync("./https/cert.pem"),
};
https.createServer(httpsServerOptions, (req, res) => {
  UnifiedServer(req, res);
}).listen(config.httpsPort, () => {
  console.log(
    `server is listening on port ${config.httpsPort} in ${config.envName} mode`
  );
});

const UnifiedServer = (req, res) => {
  //  get the url
  const parseUrl = url.parse(req.url, true);

  // get the path
  const path = parseUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  //get a query string
  const queryStringObject = parseUrl.query;

  //get the HTTP method
  const method = req.method.toLocaleLowerCase();

  // get headers as object
  const headers = req.headers;

  // get a payload if there is any
  const decoder = new StringDecoder("utf8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    //chose a handler not found
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // Construct data for handler
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parsedJsonToObject(buffer),
    };
    // route request to handler
    chosenHandler(data, (statusCode, payload) => {
      //use status code callback 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      //some text
      payload = typeof payload == "object" ? payload : {};

      //convert to string
      const payloadString = JSON.stringify(payload);

      //  Return a response
      res.setHeader("Content-type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      // log the response
      console.log("retuning this response:", statusCode, payloadString);
    });
  });

  console.log(`Request received on path:${trimmedPath} `);
  console.log(` with this method:${method}`);
  console.log(
    `and with those query parameters:` + JSON.stringify(queryStringObject)
  );
  console.log(`Request received width these headers:`, headers);
};

//define a request routers
const router = {
  'ping': handlers.ping,
  'users': handlers.users
};

