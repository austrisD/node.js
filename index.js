/* server start*/

const http = require("http");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;

const server = http.createServer((req, res) => {
  //  get the url
  const parseUrl = url.parse(req.url, true);

  // get the path
  const path = parseUrl.pathname;
  const trimmedPathName = path.replace(/^\/+|\/+$/g, "");

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

    //  send a response
    res.end("hello\n");

    // log the response
    console.log(`Request received width this payload:`, buffer);
  });

  console.log(`Request received on path:${trimmedPathName} `);
  console.log(` with this method:${method}`);
  console.log(
    `and with those query parameters:` + JSON.stringify(queryStringObject)
  );
  console.log(`Request received width these headers:`, headers);
});

server.listen(3000, () => {
  console.log("server is listening on port 3000");
});
