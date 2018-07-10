var express = require("express");
var app = express();
var PORT = 8080;

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

//set view engine
app.set("view engine", "ejs");

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id };
    res.render("urls_show", templateVars);
  });

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})