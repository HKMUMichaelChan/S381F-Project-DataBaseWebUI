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

// 設置模板引擎為ejs
app.set('view engine', 'ejs');

// 設置靜態文件目錄
app.use(express.static('public'));

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
// For parsing application/json
app.use(express.json());


// 設置上傳文件存儲目錄和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// 連接到MongoDB


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
    // console.log(request.query)
    userid = request.session.userid


    const query = queryBuilder( request.query["name"] , request.query["description"] , request.query["category"] , request.query["rangeMin"], request.query["rangeMax"] );

      console.log(query);
      // query[request.query["type"]] = { $regex: request.query["search"], $options: "i" };

    cursor = db.collection('Products').find(query);
    cursor.toArray((error, Products) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(Products);
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
        console.log(Products[0]);
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
      
      console.log('Data updated:', id);
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
    console.log(result);
  }
  app.post('/removeProduct', function(request, response){
    if (!request.session.authenticated) { 
      response.send("Invalid authority");
      return
        }
    if(request.query.hasOwnProperty("target")){
      // console.log("search");
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
      console.log('Data uploaded:', result.insertedId);
    } catch (error) {
      console.error('Failed to upload data', error);
    }
  }
  
  app.post('/addProduct', function(request, response) {
    if (!request.session.authenticated) { 
      response.send("Invalid authority");
      }
    console.log('addProduct')
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


  // 處理登入頁面
  app.get('/login', function(request, response) {

    if (request.query['m'] == '0'){
        response.render('login', message = "Username or password is incorrect");
    }
    else {
        response.render('login', message = "");
    }

  });

  // 處理登入請求
  app.post('/login', (request, response) => {

    const userid = request.body.username; // 從請求中獲取使用者名稱
    const password = request.body.password; // 從請求中獲取密碼
  
    // 在 MongoDB 的 Account 集合中查詢符合使用者名稱的文件
    db.collection('Auth').findOne({userid: userid }, function(err, user) {
      if (err) throw err;

      console.log(userid)

      if (user && user.password === password) {
        // 使用者驗證成功，將使用者資訊存儲到會話中
        request.session.userid = userid;
        request.session.authenticated = true,
        console.log(request.session)
        response.redirect('/');
      } 
      else {
        response.json({"error":"Username or password is incorrect"}); // 替換為相應的處理邏輯
      }
    });
  });



//   // 處理上傳文件請求
//   app.post('/upload', upload.single('file'), function(req, res) {
//     // 處理上傳文件邏輯
//     // ...

//     // 重定向到主頁
//     res.redirect('/');
//   });

//   // 處理更改文件請求
//   app.post('/edit/:id', function(req, res) {
//     const id = req.params.id;
//     const newData = req.body;

//     // 處理更改文件邏輯
//     // ...

//     // 重定向到主頁
//     res.redirect('/');
//   });

//   // 處理刪除文件請求
//   app.post('/delete/:id', function(req, res) {
//     const id = req.params.id;

//     // 處理刪除文件邏輯
//     // ...

//     // 重定向到主頁
//     res.redirect('/');
//   });

//   // 處理搜尋請求
//   app.post('/search', function(req, res) {
//     const keyword = req.body.keyword;

//     // 處理搜尋邏輯
//     // ...

//     // 重定向到主頁
//     res.redirect('/');
//   });

  // 啟動伺服器
  app.listen(port, function() {
    console.log('Server listening on port ' + port);
  });
});