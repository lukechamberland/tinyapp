// requirements:

const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const PORT = 8080; 
const bcrypt = require("bcryptjs");
const { getUserByEmail, getUserUrls, generateRandomString } = require('./helpers');
const { users, urlDatabase } = require("./databases");


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["test"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// routes:

//main route
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if(!userId) {
    return res.redirect("/login");
  }
  const urlsForUser = getUserUrls(urlDatabase, userId);
  const user = users[userId];
  const templateVars = {
    urls: urlsForUser,
    user,
    userId
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const user = users[userId];
    const templateVars = {user}
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {

  const userId = req.session.user_id;
  const shortId = req.params.id
  //1. Check whether the user is logged in 
  if(!userId){
    return res.send("Please login to view the details");
  }
  if (!urlDatabase[shortId]) {
    res.send('Error occured, invalid URL')
    return;
  }
  //2. The user session is there. Ensure that the shortURL belongs 
  //to the signed in USER
  if(urlDatabase[shortId].userID === userId){
      const user = users[userId];
      const templateVars = { 
        id: shortId, 
        longURL: urlDatabase[shortId].longURL, 
        user, 
      }
      res.render("urls_show", templateVars);
  } else {
    //3. Means the Url didn't belong to the logged in User
    return res.send("The ShortURL does not belong to you!")
  }
 
});

app.get("/u/:id", (req, res) => {
  const shortId = req.params.id
  if (!urlDatabase[shortId]) {
    res.send('Does not exist in the database');
    return;
  }
  
  const longURL = urlDatabase[shortId].longURL;
  return res.redirect(longURL);
});
// allows users to signup
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  if (userId) {
    res.redirect("/urls");
  } else {
    const templateVars = {user}
    res.render("urls_register", templateVars);
  }
});
//if registration exists in url database users can login
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { user: null };
  if (userId) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});
// forces user to login
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  if (!user) {
    res.send('User is not logged in, cannot shorten url.');
    return;
  }

  let id = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL,
    userID: userId
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.send('User is not logged in, cannot shorten url.');
    return;
  }
  const shortUrl = req.params.id
  if (urlDatabase[shortUrl].userID !== userId) {
    res.send("Cannot delete URL that doesn't belong to you.")
    return;
  }
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
  
});

app.post("/urls/:id", (req, res) => {
  // checking login
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.send('User is not logged in, cannot shorten url.');
    return;
  }
  // check if they own url
  const shortUrl = req.params.id
  if (urlDatabase[shortUrl].userID !== userId) {
    res.send("Cannot edit URL that doesn't belong to you.")
    return;
  }
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});
// ensures empty email and password wont login
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    res.send("email and password cannot be entered");
    return;
  }
  const user = getUserByEmail(users, email);
  if (!user) {
    return res.status(401).send("Email not found, please register.");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).send("unauthorized");
  }
  const id = user.id;
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if(!email || !password) {
    res.status(400).send("Enter email and password. ");;
    return;
  }
  
  const user = getUserByEmail(users, email);
  if (user) {
    res.send('User already exists, use another email');
    return;
  }
  const id = generateRandomString();
  users[id] = {
    id, 
    email, 
    password: bcrypt.hashSync(password, 10),
  }
  req.session.user_id = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});