const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // Port to use 
const bodyParser = require("body-parser");

/*objects for storage */
const urlDatabase = { //stores urls
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = { //stores users
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
}

app.use(bodyParser.urlencoded({ extended: true })); //use body parser
app.use(cookieParser()); //use cookie parser

app.set("view engine", "ejs"); //set view engine

app.get("/", (req, res) => { //redirect to mainpage
    res.redirect("/urls/new");
});
app.get("/register", (req, res) => { //Registration Page
    let userID = req.cookies['user_id']
    let user = users[userID]
    let templateVars = {
        user: user
    };
    res.render("register", templateVars);
});
app.get("/login", (req, res) => { //Login
    let userID = req.cookies['user_id']
    let user = users[userID]
    let templateVars = {
        user: user
    };
    res.render("login", templateVars);
});
app.get("/urls", (req, res) => { //page with index of urls
    let userID = req.cookies['user_id']
    let user = users[userID]
    let templateVars = {
        user: user,
        urls: urlDatabase,
    };
    res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => { //page to make new tinyURL
    let userID = req.cookies['user_id']
    let user = users[userID]
    let templateVars = {
        user: user
    };
    res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => { //render page showing shrunk url
    let userID = req.cookies['user_id']
    let user = users[userID]
    let templateVars = {
        shortURL: req.params.id,
        urls: urlDatabase,
        user: user
    };
    res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => { // redirect short URL to Long URL
    let longURL = urlDatabase[req.params.shortURL];
    if (longURL == undefined) {
        res.status(404)
            .send("Not found!")
    }
    else {
        res.redirect(longURL);
    }
});

/* Post End-Points */
app.post("/login", (req, res) => { //recieve username POST from _header.ejs || Login
    var commit = false
    for (var ids in users) {
        if (req.body.username === users[ids]['email']) { //if username matches db
            if (req.body.password === users[ids]['password']) {
                commit = true;
                res.cookie("user_id", ids)
                res.redirect("http://localhost:8080/")
            } else {
                commit = true;
                res.status(400).send("Username and Password do not match. Please go back and try again.")
            }
        } 
    }
    if (commit === false) {
        res.status(400).send("Username does not exist. If you haven't already, please register an account at http://localhost:8080/register")
    }
});
app.post("/logout", (req, res) => { //Logout
    console.log(`Logging out ${users[req.cookies['user_id']]['email']}.\nSee you again soon.`); //log the logout
    res.clearCookie("user_id");
    res.redirect('/urls');
});
app.post("/register", (req, res) => { //register
    if (!req.body.username || !req.body.password) { //if user or password is not filled out
        res.status(400)
            .send("Username or Password were not filled out!")
    } else {
        for (var ids in users) {
            if (req.body.username === users[ids]['email']) { //if username exists
                res.status(400)
                    .send("Username already exists")
            }
        }
    }
    let newID = "user" + generateRandomString();
    users[newID] = {
        "id": newID,
        "email": req.body.username,
        "password": req.body.password,
    }
    res.status(200)
    res.cookie("user_id", users[newID].id);
    console.log(`registered ${users[newID]['email']}`);
    console.log(users)
    res.redirect(`http://localhost:${PORT}/urls`);
});
app.post("/urls/new", (req, res) => {  //receive post from urls/new
    let shortenedURL = generateRandomString();
    urlDatabase[shortenedURL] = req.body.longURL;
    console.log(`Added ${urlDatabase[shortenedURL]} to list of sites as ${shortenedURL}`) //log the addition of a new site
    res.redirect(`http://localhost:${PORT}/urls/${shortenedURL}`);         // Respond with 'Ok' (we will replace this)
});
app.post("/urls/:id/edit", (req, res) => { //recieve edited address from :id/edit
    delete urlDatabase[req.params.id];
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect(`http://localhost:${PORT}/urls/${req.params.id}`);
})
app.post("/urls/:id/delete", (req, res) => { //on delete button
    console.log(urlDatabase[req.params.id], "has been deleted");
    delete urlDatabase[req.params.id];
    res.redirect(`http://localhost:${PORT}/urls`); //redirect to updated list
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);//Logout
});
function generateRandomString() { // generate string function
    return Math.random().toString(36).substring(2, 8);
}