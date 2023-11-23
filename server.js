const express = require('express');
const multer = require('multer');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const ejs = require('ejs');
const session = require('express-session');



const app = express();
const port = 3000;


app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false
  }));


app.set('view engine', 'ejs');


app.use(express.static('public'));


app.use(express.urlencoded({ extended: true }))

app.use(express.json());



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });



const username = 'admin'
const password = 'TygmaQPZ0AOBjjIl'
const url = 'mongodb+srv://' + username + ':'+ password +'@s381f-project-databasew.huzseku.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'ServerData';


MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {
  if (err) throw err;
  console.log('Connected to MongoDB');

  const db = client.db(dbName);

function queryBuilder(name = "", description = "", category = "", price_min = "", price_max = "") {
  const query = {};
  
  if (name !== "") {
    query.name = { $regex: name, $options: 'i' };
  }

  if (description !== "") {
    query.description = { $regex: description, $options: 'i' };
  }

  if (category !== "") {
    query.category = { $regex: category, $options: 'i' };
  }

  if (price_min !== "" && price_max !== "") {
    query.price = { $gte: Number(price_min), $lte: Number(price_max) };
  }

  return query;
}

  // 處理主頁頁面
  app.get('/', function(request, response) {

    if (!request.session.authenticated) { 
      response.redirect('/login');
      return
        }
    userid = request.session.userid


    const query = queryBuilder( request.query["name"] , request.query["description"] , request.query["category"] , request.query["rangeMin"], request.query["rangeMax"] );


    cursor = db.collection('Products').find(query);
    cursor.toArray((error, Products) => {
      if (error) {
        console.error(error);
        return;
      }
      response.render('index', {userid:userid, Products:Products, query:request.query});
    });
    
    
  });



  app.get('/editProductForm', function(request, response){
    if (!request.session.authenticated) { 
      response.send("Invalid authority");
      return
        }
    if(request.query.hasOwnProperty("target")){
      cursor = db.collection('Products').find({"_id" : ObjectId(request.query["target"])});
      cursor.toArray((error, Products) => {
        if (error) {
          console.error(error);
          return;
        }
        response.render('editProductForm', {Product:Products[0]});
      });
    }
    
    else{
      response.send("Error:No Edit Target")
    }
  });
  async function updateDocumentById(id, updatedData){
    
    const filter = { _id: ObjectId(id) };
    const update = { $set: updatedData };
    try{
      const result = await db.collection('Products').updateOne(filter, update);
      
    } catch (error) {
      console.error('Failed to upload data', error);
    }
  }
  app.post('/editProduct', function(request, response){
    if (!request.session.authenticated) { 
      response.send("Invalid authority");
      return
        }
    if(request.query.hasOwnProperty("target")){
      const name = request.body.name; 
      const description = request.body.description; 
      const price = request.body.price; 
      const category = request.body.category; 
      const imageUrl = request.body.imageUrl; 

      const updatedData = { 
        name: name,
        description: description,
        price: Number(price),
        category: category,
        imageUrl: imageUrl,
      };

      updateDocumentById(request.query['target'], updatedData);

      response.sendStatus(200);
    }
    
    else{
      response.send("Error:No Edit Target")
    }
  });
  async function removeData(filter){
    const result = await db.collection('Products').deleteOne(filter);
  }
  app.post('/removeProduct', function(request, response){
    if (!request.session.authenticated) { 
      response.send("Invalid authority");
      return
        }
    if(request.query.hasOwnProperty("target")){

      const filter = { _id: ObjectId(request.query['target']) };
      removeData(filter);
      response.sendStatus(200);
    }
    else{
      response.send("Error:No Remove Target")
    }
});

  app.get('/addProductForm', function(request, response) {
    if (!request.session.authenticated) { 
      response.send("Invalid authority");
      return
        }
    response.render('addProductForm');
  });

  function createProduct(name , description, price, category, imageUrl){
    price = Number(price)
    if (isNaN(price)) {
      return ('Input (Price) is not a number');
    } 

      return {
      name: name,
      description: description,
      price: price,
      category: category,
      imageUrl: imageUrl,
    };
  }
  async function uploadData(collection, data) {
    try {
      const result = await collection.insertOne(data);
    } catch (error) {
      console.error('Failed to upload data', error);
    }
  }
  
  app.post('/addProduct', function(request, response) {
    if (!request.session.authenticated) { 
      response.send("Invalid authority");
      }
    const name = request.body.name; 
    const description = request.body.description; 
    const price = request.body.price; 
    const category = request.body.category; 
    const imageUrl = request.body.imageUrl; 


    const product = createProduct(name , description, price, category, imageUrl);
    if (typeof product === 'string') {
      return product
    }

    uploadData(db.collection('Products'), product)
    response.sendStatus(200);

  });



  app.get('/login', function(request, response) {

    if (request.query['m'] == '0'){
        response.render('login', message = "Username or password is incorrect");
    }
    else {
        response.render('login', message = "");
    }

  });

  app.post('/login', (request, response) => {

    const userid = request.body.username; 
    const password = request.body.password; 
  

    db.collection('Auth').findOne({userid: userid }, function(err, user) {
      if (err) throw err;



      if (user && user.password === password) {

        request.session.userid = userid;
        request.session.authenticated = true,
        response.redirect('/');
      } 
      else {
        response.json({"error":"Username or password is incorrect"});
      }
    });
  });


  app.get('/logout', (req, res) => {

    req.session.userId = null;
    req.session.authenticated = null;
  
    res.redirect('/login');
  });

  app.listen(port, function() {
    console.log('Server listening on port ' + port);
  });
});