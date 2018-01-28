var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

const AWS = require('aws-sdk');

AWS.config.update({
    region: "ap-southeast-1"
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "TrCalc";
app.route('/data/:id')
    .get((req, res)=> {
        const id = req.params.id;
        const params = {
            TableName: tableName,
            Key: {
                id: id
            }
        };
        docClient.get(params).promise().then((response) => {
            if (!response || response.Item) {
                // Todo: Error message.
            }
            res.send(response.Item);
        }, (err) => {
            res.send(err);
        });
    });


    app.route('/data').post((req, res) => {
      save(req.body.id, {
          inputA: req.body.inputA,
          inputB: req.body.inputB,
          operand: req.body.operand
      }).then((response) => {
          res.send({'message': 'OK'})
      }, (err) => {
          res.send(err);
      });
  });



function save (id, data) {
  const params = {
      TableName: tableName,
      Item: {
          "id":  id,
          "inputA": data.inputA,
          "inputB": data.inputB,
          "operand": data.operand,
      }    
  }

  return docClient.put(params).promise();
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
