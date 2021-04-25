/* server start*/

const http = require("http");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;

const server = http.createServer((req, res) => {
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
  const decoder = new stringDecoder("utf-8");
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
      'payload': buffer,
    };
    // route request to handler
    chosenHandler(data, (statusCode, payload) => {
      //use status code callback 200
      statusCode = typeof(statusCode)  == "number" ? statusCode : 200;

      //some text
      payload = typeof(payload) == "object" ? payload : {};

      //convert to string
      const payloadString = JSON.stringify(payload);

      //  send a response
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
});

server.listen(3000, () => {
  console.log("server is listening on port 3000");
});

//define the handlers
const handlers = {};

//sample handler
handlers.sample = (data, callback) => {
  //callback ....
  callback(406, { name: "sample handlers" });
};

//not fond handler
handlers.notFound = (data, callback) => {
  callback(404);
};

//define a request routers
const router = {
  sample: handlers.sample,
};
