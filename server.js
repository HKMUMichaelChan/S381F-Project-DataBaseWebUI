const express = require('express');
const multer = require('multer');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const ejs = require('ejs');
const session = require('express-session');


const app = express();
const port = 3000;

// 設置模板引擎為ejs
app.set('view engine', 'ejs');

// 設置靜態文件目錄
app.use(express.static('public'));

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
const dbName = 'mydatabase';


MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {
  if (err) throw err;
  console.log('Connected to MongoDB');

  const db = client.db(dbName);

  // 處理主頁請求
  app.get('/', function(request, response) {
    db.collection('users').find().toArray(function(err, result) {
      if (err) throw err;
      response.render('index', { users: result });
    });
  });

  // 處理登入請求
  app.post('/login', function(req, res) {
    // 處理登入邏輯
    // ...

    // 重定向到主頁
    res.redirect('/');
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