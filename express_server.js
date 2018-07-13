const express = require("express");
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080; // Port to use

/*objects for storage */
const urlDatabase = { //stores urls
    "b2xVn2" : { 
        'adr': "http://www.lighthouselabs.ca",
        'userID': "userRandomID",
    },
    "9sm5xK" : {
        'adr': "http://www.google.com",
        'userID': "user2RandomID",
    },  
    "9sasdxK" : {
        'adr': "http://www.gasdoogle.com",
        'userID': "user2RandomID",
    },  
    "9smasd" : {
        'adr': "http://www.goasdasdogle.com",
        'userID': "user2RandomID",
    },  
};
const users = { //stores users
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "$2b$10$fnNlhK7iFfWEaHhvHSpXWO8AWV1Teb7WUzCCgR2bJRzRtHRPYi3AW"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "$2b$10$br.go/VnjGccMBsOiPuHheAZtsYvIuHZm1YqyMvvxTfXYwVxyIqDe"
    }
}

const urlsForUser = function (id) { //function to only post users urls
    results = {};
    for (let ids in urlDatabase){
        if (urlDatabase[ids]['userID'] === id) {
            results[ids] = urlDatabase[ids]
        }
    }
    return results
}

//body and cookiepraser - view engine ejs
app.use(bodyParser.urlencoded({ extended: true })); //use body parser
app.use(cookieSession({//use cookie session app.set
    name: 'session',
    keys: ['cats and dogs'],
})); 
app.set("view engine", "ejs"); //set view engine
app.get("/", (req, res) => { //redirect to mainpage
    res.redirect("/urls/new");
});
app.get("/register", (req, res) => { //Registration Page
    let userID = req.session.user_id
    let user = users[userID]
    let templateVars = {
        user: user
    };
    res.render("register", templateVars);
});
app.get("/login", (req, res) => { //Login
    let userID = req.session.user_id
    let user = users[userID]
    let templateVars = {
        user: user
    };
    res.render("login", templateVars);
});
app.get("/urls", (req, res) => { //page with index of urls
    if (!req.session.user_id) {
        res.redirect('/register');
    } else {
        let userID = req.session.user_id
        let user = users[userID]
        let templateVars = {
            user: user,
            urls: urlsForUser(userID),
        };
        console.log(templateVars.user)
        res.render("urls_index", templateVars);
    }
});
app.get("/urls/new", (req, res) => { //page to make new tinyURL
    if (!req.session.user_id) {
        res.redirect('/register');
    } else {
        let userID = req.session.user_id
        let user = users[userID]
        let templateVars = {
            user: user
        };
        res.render("urls_new", templateVars);
    }
});
app.get("/urls/:id", (req, res) => { //render page showing shrunk url
    let userID = req.session.user_id
    let user = users[userID]
    let templateVars = {
        shortURL: req.params.id,
        urls: urlDatabase,
        user: user
    };
    res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => { // redirect short URL to Long URL
    let longURL = urlDatabase[req.params.shortURL]['adr'];
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
            if (bcrypt.compareSync(req.body.password, users[ids]['password'])) {
                commit = true;
                req.session.user_id = ids
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
    console.log(`Logging out ${users[req.session.user_id]['email']}.\nSee you again soon.`); //log the logout
    req.session = null;
    res.redirect('/urls');
});
app.post("/register", (req, res) => { //register
    if (!req.body.username || !req.body.password) { //if user or password is not filled out
        res.status(400)
            .send("Username or Password were not filled out!")
    }
    for (var ids in users) {
        if (req.body.username === users[ids]['email']) { //if username exists
            res.status(400)
                .send("Username already exists")
            
        }
    }
    let newID = "user" + generateRandomString();
    users[newID] = {
        "id": newID,
        "email": req.body.username,
        "password": bcrypt.hashSync(req.body.password, 10),
    }
    res.status(200)
    req.session.user_id = users[newID].id;
    console.log(`registered ${users[newID]['email']}`);
    console.log(users)
    res.redirect(`http://localhost:${PORT}/urls`);
});
app.post("/urls/new", (req, res) => {  //receive post from urls/new
    let shortenedURL = generateRandomString();
    urlDatabase[shortenedURL] = {
        'adr': req.body.longURL,
        'userID': req.session.user_id,
    }
    console.log(`Added ${urlDatabase[shortenedURL]} to list of sites as ${shortenedURL}`) //log the addition of a new site
    res.redirect(`http://localhost:${PORT}/urls/${shortenedURL}`);         // Respond with 'Ok' (we will replace this)
});
app.post("/urls/:id/edit", (req, res) => { //recieve edited address from :id/edit
    if (urlDatabase[req.params.id]['userID'] === req.session.user_id) {
        delete urlDatabase[req.params.id];
        urlDatabase[req.params.id] = {
            'adr': req.body.longURL,
            'userID': req.session.user_id,
        }
        res.redirect(`http://localhost:${PORT}/urls/${req.params.id}`);
    } else {
        res.status(400)
        .send("you do not have permission to edit this link.")
    }
})
app.post("/urls/:id/delete", (req, res) => { //on delete button
    if (urlDatabase[req.params.id]['userID'] === req.session.user_id) {
        console.log(urlDatabase[req.params.id], "has been deleted");
        delete urlDatabase[req.params.id];
        res.redirect(`http://localhost:${PORT}/urls`); //redirect to updated list
    } else {
        res.status(400)
        .send("you do not have permission to edit this link.")
    }
});

app.listen(PORT, () => { //Port to listen on
    console.log(`App listening on port ${PORT}`);
});
function generateRandomString() { // generate string function
    return Math.random().toString(36).substring(2, 8);
}