var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

//set view engine
app.set("view engine", "ejs");
//redirect to mainpage
app.get("/", (req, res) => {
    res.render("urls_new");
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        urls: urlDatabase
    };
    res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    if (longURL == undefined) {
        res.status(404)
        .send("Not found!")// redirect short URL to Long URL
    }
    else {
        res.redirect(longURL);
    }
});

app.post("/urls/new", (req, res) => {
    console.log(req.body);  // debug statement to see POST parameters
    let shortenedURL = generateRandomString();
    urlDatabase[shortenedURL] = req.body.longURL;
    res.redirect(`http://localhost:${PORT}/urls/${shortenedURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
    console.log(req.body);  // debug statement to see POST parameters
    console.log("pressed delete");
    delete urlDatabase[req.params.id];
    res.redirect(`http://localhost:${PORT}/urls`); //redirect to updated list
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
// generate string function
function generateRandomString() {
    return Math.random().toString(36).substring(2, 8);
}