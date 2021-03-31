const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const port =  process.env.PORT || 5056
const cors = require('cors');
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: false }));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrs6y.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const laptopsCollection = client.db(`${process.env.DB_NAME}`).collection("laptops");
  const ordersCollection = client.db(`${process.env.DB_NAME}`).collection("orders");

    app.get('/laptops', (req, res) =>{
      laptopsCollection.find()
      .toArray((err, items) => {
          res.send(items);
      })
  });

  app.post('/addLaptop', (req, res) => {
    const newLaptop = req.body;
    laptopsCollection.insertOne(newLaptop)
    .then(result => {
        res.send(result.insertedCount > 0);
    })
});

app.get('/laptop/:id', (req, res) => {
  laptopsCollection.find({_id: ObjectId(req.params.id)})
  .toArray((err, documents) => {
      res.send(documents[0]);
  })
});


app.post('/addOrder', (req, res) => {
  const order = req.body;
  ordersCollection.insertOne(order)
  .then(result => {
     res.send(result.insertedCount >0);
  })
});


  app.get('/orders', (req, res) => {
    const queryEmail = req.query.email;
    if (queryEmail) {
      ordersCollection.find({ email: queryEmail })
        .toArray((err, documents) => {
          res.status(200).send(documents);
        })
    }
    else {
      res.status(401).send('un-authorized access');
    }
  });

  app.delete('/deleteProduct/:id', (req, res)=>{
    const id = ObjectId(req.params.id);
    
    laptopsCollection.findOneAndDelete({_id: id})
    .then(result => {
        res.send(result.deletedCount > 0);
    });
});


 
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})