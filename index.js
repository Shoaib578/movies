var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const path = require('path');


const flash = require('express-flash')

const sessions = require('express-session')

const connect_db = require('./connect_db');

connect_db();

let User = require('./models/User');
let Movies = require('./models/Movies');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash())
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));




app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');




app.get('/register',isLoggedIn, (req, res) => {
   
    res.render('register',{showToast:false});
})

app.post("/register",isLoggedIn,(req,res)=>{
    let email = req.body.email;
   
    let password = req.body.password;
    let name = req.body.name;
    console.log(name)
    let toast = ""
    var user = User.findOne({ email: email});
    if(user.size>0){
         toast = "Email Already Exists! Please try another one";
         res.render("register",{showToast:true,toast:toast})

    }else{
        let new_user= new User({username:email,email: email,password:password,name:name})
        new_user.save()
        
      
       
        toast = "Registered successfully"
        
        res.render("register",{showToast:true,toast:toast})
       
        
    }

})

app.get('/login',isLoggedIn, (req, res) => {
    
    res.render('login',{showToast:false});
})

app.post("/login",isLoggedIn,(req,res)=>{
    let toast = ""
    let email = req.body.email
    let password = req.body.password
  
    User.findOne({ email: email})
    .then(user=>{
       
        if(user != null && user.password == password){
            let session = req.session
            session.user_id = user.id
            console.log(session)
            toast = "Logged in successfully"
            return res.redirect('/');

    
        }else{
             toast = "Incorrect email or password"
            return res.render('login',{showToast:true,toast:toast});
             
           
    
        }


    })
   

});

app.get('/',(req, res,next) => {
   
    var session = req.session

    if(session.user_id){
       if(req.path == "/"){
        return res.redirect("/home")
       }
        return next()
    }else{
        return res.redirect("/login")

    }
})


app.get("/add_movie",isLoggedOut,(req,res)=>{

    return res.render("add_movie",{showToast:false,toast:""})
})
app.post("/add_movie",isLoggedOut,(req,res)=>{
   let title = req.body.title;
   let description = req.body.description;
   let rating = req.body.rating;
   let genre = req.body.genre;
   let session = req.session;

   let user_id = session.user_id;

   let new_movie = new Movies({
    title: title,description: description,added_by:user_id.toString(),rating:rating,genre:genre
   });
   new_movie.save()

   return res.render("add_movie",{showToast:true,toast:"Movie Added"})


})


app.get("/home",isLoggedOut,(req, res) => {
    let session = req.session;
   Movies.find()
   .then(data=>{
    
    res.render("home",{data:data,user_id:session.user_id.toString()})

   })
  
})

app.get("/view_movie",isLoggedOut,(req,res)=>{
let movie_id = req.query.movie_id
let session = req.session;
let user_id = session.user_id
Movies.findById(movie_id)
.then(data=>{
    console.log(data)
    res.render("view_movie",{data:data,user_id:user_id})
})

})


app.get("/edit_movie",isLoggedOut,(req,res)=>{
    let movie_id = req.query.movie_id
    Movies.findById(movie_id)
    .then(data=>{
        
        res.render("edit_movie",{data:data,showToast:false,id:movie_id})
    })
    
})

app.post("/edit_movie",isLoggedOut,(req,res)=>{
    let movie_id = req.body.movie_id
   
    let title = req.body.title;
   let description = req.body.description;
   let rating = req.body.rating;
   let genre = req.body.genre;
  
   var newvalues = { $set: {title: title, description: description,rating:rating,genre:genre } };
    Movies.updateOne(Movies.findById(movie_id), newvalues, function(err, resp) {
        if (err) throw err;
        console.log("1 document updated");
       res.redirect("/edit_movie?movie_id="+movie_id);

      });
   
    
})


app.get("/delete_movie",isLoggedOut,(req,res)=>{
let movie_id = req.query.movie_id
console.log(movie_id)
Movies.findByIdAndDelete(movie_id,(err,obj)=>{
return res.redirect("/home")
  

})
})


app.get("/logout",(req,res)=>{
    req.session.destroy()
    return res.redirect("/login")
})

function isLoggedIn(req,res,next){
    let session = req.session
    if(session.user_id){
        return res.redirect("/home")
    }else{
        return next()

    }
}

function isLoggedOut(req,res,next){
    let session = req.session
    if(session.user_id){
        return  next()
    }else{
        return res.redirect("/login")

    }
}
app.listen(5000, (err) => {
    if(err){
        console.log(err);
    }else{
        console.log("The server is running at port 5000");
    }
    
})