const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"]
  console.log("#1 userId", userId)
  const urlsForUser = getUserUrls(urlDatabase, userId)
  console.log("#2 urlsForUser", urlsForUser)
  // const templateVars = { urls: urlsForUser, username: req.cookies["username"]};
  const user = users[userId]
  const templateVars = {
    urls: urlsForUser,
    user
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    res.render("urls_new")
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, username:req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  if (!userID) {
    res.send('User is not logged in, cannot shorten url.')
    return;
  }
  let id = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${id}`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send('Does not exist in the database')
    return;
  }
  
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    res.send("email and password cannot be entered");
    return;
  }
  const user = getUserByEmail(users, email);
  if (!user) {
    res.redirect("/login");
    return;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).send("unauthorized")
  }
  const id = user.id;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  } else {
    res.render("urls_register");
  }
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const {email, password} = req.body;
  if(!email || !password) {
    res.statusMessage = "Enter email and password. ";
    res.status(400).end();
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
  res.cookie('user_id', id);
  console.log(users);
  res.redirect("/urls");
})

const getUserByEmail = function(userDB, email) {
  for (let userID in userDB) {
    const userObj = userDB[userID];
    if (userObj.email === email) {
      return userObj;
    } 
  }
  return false;
}

app.get("/login", (req, res) => {
  console.log(req.cookies)
  const templateVars = { urls: urlDatabase, username: req.cookies["user_id"]};
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  } else {
    res.render("urls_login", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const getUserUrls = function(urlDatabase, userId) {
  const newUrlObj = {};
  for (let shortId in urlDatabase) {
    if (urlDatabase[shortId].userID === userId) {
      newUrlObj[shortId] = urlDatabase[shortId];
    }
  }
  return newUrlObj;
}