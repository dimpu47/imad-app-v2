var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');


var config = {
  user: 'dimpu47', //env var: PGUSER 
  database: 'dimpu47', //env var: PGDATABASE 
  password: process.env.DB_PASSWORD, //env var: PGPASSWORD 
  host: 'db.imad.hasura-app.io',
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};



var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

app.use(session({
   secret:'someRandomValue',
   cookie:{maxAge: 1000*60*24*30}
}));



function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    var htmlTemplate = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>
                  ${title}
            </title>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link href="/ui/style.css" rel="stylesheet" />

            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
            <script src="https://use.fontawesome.com/5b75c7b551.js"></script>
        </head>
        <body class='bg'>
            <div class="container container-fluid">
                <div class='jumbotron'>
                    <div class="lead">
                    <a href="/">Home</a>
                    </div>
                    <hr/>
                    <h1 class="lead">
                        ${heading}
                    </h1>
                    <div class="lead">
                        <h6>${date.toDateString()}</h6>
                    </div>
                    <div class="lead">
                        ${content}
                    </div>
                    
                    <br>
                    <hr>
                    
                    
                     <div id="comments" class="form-group">
                        <h2>Have something to say?...</h2>   
                        <textarea class="form-control" style="height:100px; width:680px;" id="input" placeholder="comment something about this article or...not."></textarea>
                        <button class="btn btn-success" type="button" style="margin-top:8px;" id="submitComment">Submit</button>
                    </div>
                    
                    <ol id="showComment" class="list-group">
           
                    </ol>
      
                </div>
      
       
            </div>

       
             <script>
                var d = new Date();
                var submitCom = document.getElementById('submitComment');
                submitCom.onclick = function(){
                    var re = new XMLHttpRequest();//INItIALIZING THE REQUEST
                re.onreadystatechange = function(){
                  if(re.readyState === XMLHttpRequest.DONE)
                  {
                      if(re.status === 200)
                      {
                      var texts =re.responseText;
                      texts=JSON.parse(texts);
                      var comments='';
                      for(var i=0;i<texts.length;i++){
                      comments += '<li class="list-group-item">'+texts[i]+'<br><br><h6><span class="pull-right">'+d.toDateString()+'</span><br></h6><hr></li>';
                      }
                      var y = document.getElementById('showComment');
                       y.innerHTML = comments;
                      }
                  }
                    
                };
                //MAKING THE REQUEST
                var commentInput = document.getElementById('input');
                var co = commentInput.value;
                     re.open('GET','http://dimpu47.imad.hasura-app.io/articles?article='+co,true);
                     re.send(null);
                };
            </script>
             
             
        </body>
    </html>
    `;
    return htmlTemplate;
}




function hash(input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ['pbkdf2', '10000', salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function (req, res) {
    var hashedString = hash(req.params.input, "random-salt-string");
    res.send(hashedString);
});

app.post("/create-user", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
        
    pool.query('INSERT INTO "user" (username, password) values($1,$2)', [username, dbString], function (err, results) {
    if (err) {
        res.status(500).send(err.toString());
    } else {
        res.send('User Successfully Created' + username);
    }
  });

});

app.post('/login',function(req,res){
    
    var username = req.body.username;
    var password = req.body.password;
    
     pool.query('SELECT * FROM "user" WHERE username =$1',[username],function(err,result){
       if(err){
           res.status(500).send(err.toString());
       } else{
           if(result.rows.length === 0){
               res.status(403).send('Username/Password is Invalid');
           } else {
               var dbString = result.rows[0].password;
               var salt = dbString.split('$')[2];
               var hashedPassword = hash(password,salt);
               if (hashedPassword === dbString) {
                   req.session.auth={userId: result.rows[0].id};
                   res.send('credentials correct.');
                    
               } else {
                 res.status(403).send('Username/Password is Invalid');  
               }
           }
       }
});

});

app.get('/check-login', function (req, res) {
    if (req.session && req.session.auth && req.session.auth.userId) {
       pool.query('SELECT * FROM "user" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
               res.status(500).send(err.toString());
           } else {
               res.send(result.rows[0].username);    
           }
       });
    }else {
       res.status(400).send('You are not logged in');
   }
});

app.get('/logout',function (req,res){
   delete req.session.auth;
   res.send('<html><head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"><script src="https://use.fontawesome.com/7f7c7f338a.js"></script></head><body class="container container-fluid"></br><div align="container container-fluid"><div class="jumbotron"><h1 class="lead">Hasta La Vista Amigo!</h1><h3>You have been successfully Logged out. May you live in peace, forever &amp; ever. <i class="fa fa-hand-peace-o" aria-hidden="true"></i></h3><br/><br/><a href="/">Back to home</a> </div> </div></body></html>');
    
});


var pool = new Pool(config);
app.get('/get-articles', function (req, res) {

   pool.query('SELECT * FROM article ORDER BY date DESC', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});


app.get('/info', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'info.html'));
});


var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    // make request
    pool.query('SELECT * FROM test', function (err, results) {
       if (err) {
            res.status(500).send(err.toString(''));
       } else { 
            res.send(JSON.stringify(results.rows));
       }
    });

    
    // respond with results
});

var counter=0;
app.get('/counter', function(req,res){
 counter = counter + 1;
 res.send(counter.toString());
});

var counter2=0;
app.get('/counter2', function(req,res){
 counter2 = counter2 + 1;
 res.send(counter2.toString());
});



var names=[];


app.get('/submit-name', function(req, res) {
    // Get the name from the request
    var name = req.query.name;
    names.push(name);
    // JSON
    res.send(JSON.stringify(names));
});


app.get('/articles/:articleName', function(req,res) {
    
    // var articleName = req.params.articleName;
    
    pool.query("SELECT * FROM article WHERE title = $1",[req.params.articleName], function (err, results) {
      
      if (err) {
          res.status(500).send(err.toString());
      } else {
          if (results.rows.length === 0) {
              
              res.status(404).send('Article Not Found');
              
          } else {
              var articleData = results.rows[0];
              res.send(createTemplate(articleData));
          }
      }
    });
    
});

var texts = []
app.get('/articles',function(req,res){
   var article = req.query.article;
   texts.push(article);
   res.send(JSON.stringify(texts));
    
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/about', function (req, res) {
  if (req.session && req.session.auth && req.session.auth.userId) {
      res.sendFile(path.join(__dirname, 'ui', 'aboutL.html'));
  } else {
      res.sendFile(path.join(__dirname, 'ui', 'about.html'));
  }
  
});

app.get('/gauravC_resume', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'gauravChoudhary_resume-2016.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

app.get('/ui/article.js', function (req, res) { 
  res.sendFile(path.join(__dirname, 'ui', 'article.js')); 
});

app.get('/ui/info.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'info.js'));
});

app.get('/ui/universe.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'universe.jpg'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
