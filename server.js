const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
var express = require('express');
const bodyParser = require('body-parser');

const crypto = require('crypto');

let app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

var Schema = mongoose.Schema;

var messageSchema = new Schema({
  nickname:  String,
  message: String
});

var messagerieModel = mongoose.model('messagerie', messageSchema);

var token = "Bearer ";

app.use(express.json());
app.set('view engine', 'ejs')

app.post("/message", urlencodedParser, (req, res) =>
{
  if (!req.body)
  {
    return res.status(400).send('Body is missing');
  }

  if (!req.body.nickname || !req.body.message)
  {
    return res.status(400).send("Missing nickname or message");
  }

  let model = new messagerieModel(req.body);
  model.save().then(doc => {
    if (!doc || doc.length === 0)
    {
      return res.status(500);
    }
    return res.status(201).send(doc);
  }).catch(err => {
    return res.status(500).json(err);
  })
})
.get('/message', (req, res) =>
{
  if (req.headers.authorization == token)
  {
      messagerieModel.find({}, (err, data) => {
      if (err)
      {
         res.status(500).send(err);
      }
      res.status(200).send(data);
    })
  }
  else
  {
    res.status(500).send("Invalid token");
  }
})
.post('/auth', urlencodedParser, (req, res) => {
  if (!req.body)
  {
    return res.status(400).send('Body is missing');
  }
  if (!req.body.email || !req.body.password)
  {
    return res.status(400).send("Missing email or password");
  }
  crypto.randomBytes(16, function(err, buffer) {
    token += buffer.toString('hex');
    res.status(200).send(token);
  });
})
app.get("/", (req, res) =>
{
  var url = "mongodb://localhost:27017/messagerie";
  mongoose.connect(url);
  const client = new MongoClient(url, { useNewUrlParser: true });
  client.connect(err => {
    const collection = client.db("messagerie").collection("devices");
    // perform actions on the collection object
    client.close();
    });
    res.render('messagerie.ejs');
    
})
.use(express.static(__dirname + '/views/'));

app.listen(8080);
