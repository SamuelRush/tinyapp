const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const request = require('request'); //npm install request

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//creates new URL page
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//stores username in a cookie and logs in
app.post("/urls/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});

//logs out of user
app.post("/urls/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
});

//deletes short URL from object and returns to url tab
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

//when click edit, goes to shortURL site
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//keeps short URL when changing long URL
app.post("/urls/:shortURL/submit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL 
  res.redirect(`/urls/${req.params.shortURL}`);
});

//registers new account
app.post("/register", (req, res) => {
  let randString = generateRandomString(6);
  users[randString] = {}; 
  users[randString]["id"] = randString;
  users[randString]["email"] = req.body.email
  users[randString]["password"] = req.body.password 
  res.cookie("user_id", users[randString])
  //console.log(req.cookies["user_id"])
  res.redirect(`/urls`);
});

//if URL exists return URL site otherwise randomly make new code
app.post("/urls", (req, res) => { 
  let website = req.body.longURL 
  for (let url in urlDatabase) {
    if (urlDatabase[url] === website) {
      res.redirect(`/urls/${url}`);
      return
    }
  } 
  let randomNum = generateRandomString(6); //**make this a callback to avoid duplicate shortURLs???
  urlDatabase[randomNum]=website
  res.redirect(`/urls/${randomNum}`);
});

//create the url index page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

//creates user account
app.get("/register", (req,res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("createAccount", templateVars);
});

//GOES TO the long URL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//creates the final tiny URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

//JSON of all URLs
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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

// request(shortURL, function(error, response, body) {
//   if (error !== null){
//     console.log("The error value was not null, meaning the domain was not found!")
//   } else if (response.statusCode !== 200){
//     console.log("The response code is not 200 meaning the URL has an error!")
//   } else {
//   //console.log('statusCode:', response && response.statusCode);
//   }
// })
