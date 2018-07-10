var express = require("express");
var app = express();
var PORT = 8080;

var urlDatabase = {};

app.set("view engine", "ejs");

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})