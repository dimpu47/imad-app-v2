console.log('Loaded!');
/*
// changing html-value
var element = document.getElementById('main-text');
element.innerHTML = 'New Value';

//madi's movement
var img = document.getElementById('madi');
var marginLeft = 0;
function moveRight() { 
    marginLeft = marginLeft+1; 
    img.style.marginLeft = marginLeft + 'px';
}
img.onclick = function () { 
    var interval = setInterval(moveRight, 50);
};
*/



// counter code

var button = document.getElementById('counter');

button.onclick = function () {
   // create request to counter endpoint
    var request = new XMLHttpRequest();
    // Capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status===200) {
                var counter = request.responseText;
                var span = document.getElementById('count');
                span.innerHTML = counter.toString();
            }
        }
    };
    
    // make request 
    request.open('GET', 'http://dimpu47.imad.hasura-app.io/counter', true);
    request.send(null);
};

// counter2 code

var button = document.getElementById('counter2');

button.onclick = function () {
   // create request to counter endpoint
    var request = new XMLHttpRequest();
    // Capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status===200) {
                var counter = request.responseText;
                var span = document.getElementById('count2');
                span.innerHTML = counter.toString();
            }
        }
    };
    
    // make request 
    request.open('GET', 'http://dimpu47.imad.hasura-app.io/counter2', true);
    request.send(null);
};




// Submit Name
var submit = document.getElementById('submit_btn');
submit.onclick = function () {
    // create request to counter endpoint
    var request = new XMLHttpRequest();
    // Capture the response and store it in a variable
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status===200) {
                
                // cature a list of name and render it as the list.
                var names = request.responseText;
                names = JSON.parse(names);
                var list = '';
                for (var i=0; i<names.length;i++) {
                    list += '<div class="well well-sm"><ul class="list-group"><li class="list-group-item">'+names[i]+'</li></ul></div>';
                }
                var ul = document.getElementById('namelist');
                ul.innerHTML = list;
            }
        }
    };
    
    // make request
    var nameInput = document.getElementById('name');
    var name = nameInput.value;
    request.open('GET', 'http://dimpu47.imad.hasura-app.io/submit-name?name='+name, true);
    request.send(null);
    
    
};

// Submit username and password /login
var submit = document.getElementById('submit_btn1');
submit.onclick= function(){
    
    var request = new XMLHttpRequest(); 
    request.onreadystatechange = function() {
    if(request.readyState === XMLHttpRequest.DONE){
         if (request.status === 200) {
             
             console.log('user loged in');
             alert("Logged in Successfully");
             window.location.href ='/info';
        } else {
             if (request.status==403) {
                 alert("Invalid password/Username");
                 submit.value = 'Invalid credentials. Try again?';
            } else {
                if (request.status==500) {
                    alert("Internal Server Error");
                }
            }
        }
      }
     
    };
 
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    console.log(username);
    console.log(password);
    request.open('POST','http://dimpu47.imad.hasura-app.io/login', true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({username: username, password: password}));  
    submit.value = 'Logging in...'; 
   
};


// create new user
var register = document.getElementById('register_btn');
    register.onclick = function () {
     
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {

          if (request.readyState === XMLHttpRequest.DONE) {
              if (request.status === 200) {
                  alert('User created successfully');
                  register.value = 'Registered!';
              } else {
                  alert('Could not register the user');
                  register.value = 'Register';
              }

          }

        };
        
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    console.log(username);
    console.log(password);
    request.open('POST', '/create-user', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({username: username, password: password}));  
    register.value = 'Registering...';

     
 };
