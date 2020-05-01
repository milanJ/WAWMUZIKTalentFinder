const express = require('express')
const app = express()
const port = 3000

var cache = require('memory-cache');

var bodyParser = require('body-parser')
app.use( bodyParser.json() ); 

app.get('/', function (req, res) {
  res.send('Welcome to the Talent Finder API.')
})

app.get('/candidates/search', function (req, res) {
  console.log(req.query)
  res.send('candidates/search')
})

app.post('/candidates', function (req, res) {
  // Check content type.
  var contype = req.headers['content-type'];
  if (!contype || contype.indexOf('application/json') !== 0) {
    return res.sendStatus(415);
  }
  
  // Save body in memory.
  var body = req.body;
  const isUpdating = cache.get(body.id) != null;
  cache.put(body.id, body);

  // Reply with SUCCESS.
  if(isUpdating) {
    res.sendStatus(200);
  } else {
    res.sendStatus(201);
  }
})

app.listen(port, () => console.log(`Talent Finder is listening at http://localhost:${port}`))


// {
//  "id": "ae588a6b-4540-5714-bfe2-a5c2a65f547a",
//  "name": "Jimmy Coder",
//  "skills": [ "javascript", "es6", "nodejs", "express" ]
// }





// ● Each search request should return the candidate with the best coverage of the requested skills 
// i.e. if five different skills are requested, then a candidate who has four of them is better than a candidate who has only three of them, and so on.

// ● If two or more candidates have the same coverage (for example, both have seven out of ten requested skills), 
// any of these candidates may be returned – additional skills (which were not requested) do not matter.

// ● If no candidates match any skills, or no candidates exist at all, then the response must have an HTTP status code of 404. The response body is not important in such cases.

// ● If the request is invalid (has no body in the case of POST, or no ?skills=... in GET) then status code 400 (Bad Request) must be returned.

// ● HTTP 5xx error codes are considered errors and must not be returned.