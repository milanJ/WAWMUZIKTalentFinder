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
  // Sanitize 'skills' param.
  var skillsString = req.query['skills'];
  if(skillsString.startsWith(',')){
    skillsString = skillsString.substring(1, skillsString.length);
  }
  if(skillsString.endsWith(',')){
    skillsString = skillsString.substring(0, skillsString.length - 1);
  }

  // If there are no skills return 400.
  if (!skillsString || !skillsString.trim()) {
    return res.sendStatus(400);
  }

  // Parse skills array.
  var skills = skillsString.split(",");

  // Find the best match.
  var mostSkills = 0;
  var candidateWithMostSkills = null;
  const candidateKeys = cache.keys();
  for (let candidateId of candidateKeys) {
    const candidate = cache.get(candidateId);

    var skillsFound = 0;
    for(let skill of skills){
      if(candidate.skills.includes(skill)){
        skillsFound++;
      }
    }

    if(skillsFound > mostSkills){
      mostSkills = skillsFound;
      candidateWithMostSkills = candidate;
    }
  }

  // Send response.
  res.setHeader('content-type', 'application/json');
  if(mostSkills == 0){
    res.sendStatus(404);
  } else {
    res.send(candidateWithMostSkills)
  }
})

app.post('/candidates', function (req, res) {
  // Check content type.
  var contype = req.headers['content-type'];
  if (!contype || contype.indexOf('application/json') !== 0) {
    return res.sendStatus(415);
  }

  // Check if body is empty.
  var body = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.sendStatus(400);
  }
  
  // Save body in memory.
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
