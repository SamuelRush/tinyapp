const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session")
const request = require('request'); //npm install request
const bcrypt = require('bcrypt');
const { getUserByEmail } = require("./helpers");

app.use(bodyParser.urlencoded({extended:true}));
//app.use(cookieParser())

app.use(cookieSession({
  name: 'session',
  keys: ["HUHF2FH32FH93FHDOSO"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"},
};

let userData = {

};

const users = {
  // "userRandomID": {
  //   id: "userRandomID", 
  //   email: "samuelrush@gmail.com", 
  //   password: "sam"
  // },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//creates new URL page
app.get("/urls/new", (req, res) => { //1111111111
  if (req.session.user_id !== undefined) {
    //was (with cookies): let templateVars = { user_id: req.cookies["user_id"] };
    let templateVars = { user_id: req.session["user_id"] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect(`/login`);
  }

});

//logs out of user
app.post("/urls/logout", (req, res) => {
  userData = {};
  //was (with cookie): res.clearCookie("user_id");
  req.session = null; //333333333333333
  res.redirect(`/urls`);
});

//deletes short URL from object and returns to url tab
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id.id === userData[req.params.shortURL].userID) {
  delete urlDatabase[req.params.shortURL];
  delete userData[req.params.shortURL];
  res.redirect(`/urls`);
  } else {
    res.redirect(`/access`);
  }
});

//when click edit, goes to shortURL site
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user_id.id === userData[req.params.shortURL].userID) {
  res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.redirect(`/access`);
  }
});

//keeps short URL when changing long URL
app.post("/urls/:shortURL/submit", (req, res) => {
  if (req.session.user_id.id === userData[req.params.shortURL].userID) {
  urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL 
  userData[req.params.shortURL]["longURL"] = req.body.longURL 
  res.redirect(`/urls`);
  //res.redirect(`/urls/${req.params.shortURL}`);
} else {
  res.redirect(`/access`);
}
});

//on log in...
app.post("/login", (req, res) => {
  const emailAddress = req.body.email
  const booVar = false
  if (checkEmail(emailAddress,booVar) === false) {
    res.send("Error 403, email address does not exist.");
    return;
  }
  for (let key in users) {
    if(emailAddress === users[key]["email"]) {
      if(bcrypt.compareSync(req.body.password, users[key]["password"])) {
        //was (with cookie): res.cookie("user_id", users[key])
        req.session.user_id = users[key]//222222222222222
        //makes user specific urlDatabase
        for (let item in urlDatabase){
          if(urlDatabase[item]["userID"] === key){
            userData[item] = {}
            userData[item]["longURL"] = urlDatabase[item]["longURL"]
            userData[item]["userID"] = urlDatabase[item]["userID"]
          }
        }
        res.redirect(`/urls`);
      } else {
      res.send("Error 403, password is incorrect.")
      return;
      } 
    }
  }
})

//registers new account
app.post("/register", (req, res) => {
  const emailAddress = req.body.email
  const booVar = false
  if (req.body.email === "" || req.body.password === "" || checkEmail(emailAddress,booVar) === true) {
    res.send("Error 400, email or password has been left blank. Or email aready exists.");
    return;
  }

  let randString = generateRandomString(6);
  users[randString] = {}; 
  users[randString]["id"] = randString;
  users[randString]["email"] = req.body.email
  users[randString]["password"] = bcrypt.hashSync(req.body.password,10) 
  req.session.user_id = users[randString];

  res.redirect(`/urls`);
});

//if URL exists return URL site otherwise randomly make new code
app.post("/urls", (req, res) => { 
  let website = req.body.longURL 
  for (let url in urlDatabase) {
    //if the website=longURL in urlDatabase and tinyURL matches in userdata and urlDatabase then
    if (urlDatabase[url]["longURL"] === website && userData[url] === urlDatabase[url]) { 
      res.redirect(`/urls/${url}`);
      return
    }
  } 
  let randomNum = generateRandomString(6); //**make this a callback to avoid duplicate shortURLs???
  urlDatabase[randomNum] = {}
  urlDatabase[randomNum]["longURL"] = website
  urlDatabase[randomNum]["userID"] = req.session.user_id.id
  userData[randomNum] = {}
  userData[randomNum]["longURL"] = website
  userData[randomNum]["userID"] = req.session.user_id.id
  res.redirect(`/urls/${randomNum}`);
});

//create the url index page
app.get("/urls", (req, res) => { //-----------
  if (req.session.user_id !== undefined) {
    let templateVars = { urls: userData, user_id: req.session["user_id"] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect(`/access`);
    return
  }
});

app.get("/access", (req, res) => {
  let templateVars = { urls: userData, user_id: req.session["user_id"] };
  res.render("accessonly", templateVars);
});

//creates login page
app.get("/login", (req,res) => {//RIIIIGHT HERE
  if (req.session["user_id"] === undefined) {
    let templateVars = { user_id: req.session["user_id"] };
    res.render("loginPage", templateVars);
  } else {
    res.redirect(`/urls`);
  }
  
});

//creates user account
app.get("/register", (req,res) => {
  let templateVars = { user_id: req.session["user_id"] };
  res.render("createAccount", templateVars);
});

//GOES TO the long URL website
app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]===undefined) {
    res.redirect(`/access`);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

//creates the final tiny URL page
app.get("/urls/:shortURL", (req, res) => {

  if(userData[req.params.shortURL] instanceof Object) {
    let templateVars = { shortURL: req.params.shortURL, longURL: userData[req.params.shortURL], user_id: req.session["user_id"] };
    res.render("urls_show", templateVars);
  } else {
    res.redirect(`/access`);
  }
});

//JSON of all URLs
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("*", (req, res) => {
  res.redirect(`/access`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function checkEmail(email,booVar) { 
  booVar = false;
  for (let key in users) {
    if(email === users[key]["email"]) {
      booVar = true;
    }
  }
  return booVar
}


// request(shortURL, function(error, response, body) {
//   if (error !== null){
//     console.log("The error value was not null, meaning the domain was not found!")
//   } else if (response.statusCode !== 200){
//     console.log("The response code is not 200 meaning the URL has an error!")
//   } else {
//   //console.log('statusCode:', response && response.statusCode);
//   }
// })
