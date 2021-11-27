const mysql = require("mysql");
const express = require("express");
var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const server = app.listen(3005, () => console.log("Serveri pystyssä"));

const conn = mysql.createConnection({
    host:"localhost",
    user:"tapio",
    password:"kt123456",
    database: "urheilijat2",
    multipleStatements: true
});

conn.connect((err) => {
    if(err){
        console.log("Virhe yhteyttä muodostaessa.");
        return;
    }else{
        console.log("Yhteys muodostettu");
    }
});
/*CORS isn’t enabled on the server, this is due to security reasons by default,
so no one else but the webserver itself can make requests to the server.*/
// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
  
    // Request methods you wish to allow
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
  
    // Request headers you wish to allow
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
    );
  
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);
  
    res.setHeader("Content-type", "application/json");
  
    // Pass to next layer of middleware
    next();
  });

app.get("/urheilijat", (req, res) => {
    conn.query("SELECT * FROM urheilijat", (err, rows) => {
        if(err) throw err;
        return res.status(200).json(rows);
    });
});

app.get("/urheilijat/:id", (req, res) => {
    const id = Number(req.params.id);
    conn.query("SELECT * FROM urheilijat WHERE id=?", id, (err, rows) => {
        if(err){
            throw err;
        }else{
            res.end(JSON.stringify(rows[0]));
        }

    })
})

app.put("/urheilijat/:id", (req, res) => {
    const id = Number(req.params.id);
    const updatedUrheilija = req.body;
    conn.query(
        "UPDATE urheilijat SET ? WHERE id = ?;",
        [updatedUrheilija, req.params.id],
        function (error, results) {
            if (error) throw error;
            conn.query("SELECT * FROM urheilijat WHERE id=?", id, (err, rows) => {
                if (err) throw err;
                res.end(JSON.stringify(rows[0]));
            });
        }
    )
});

app.delete("/urheilijat/:id", (req, res) => {
    console.log("poiston id: ");
    const id = Number(req.params.id);
    console.log(id);

    conn.query(
        "DELETE FROM urheilijat WHERE id = ?",
        [req.params.id],
        function(error, results){
            if(error) throw error;
            res.end(JSON.stringify(results))
        }
    );
})

app.post("/lisaa", (req, res) => {
    let urheilija = req.body;
    console.log(urheilija);
    if(!urheilija) {
        return res.status(400).send({error: true, message: "Urheilijaa ei listätty"});
    }
    conn.query(
        "INSERT INTO urheilijat SET ? ", urheilija,
        function (error, results, fields) {
            if (error) throw error;
            return res.send(JSON.stringify({id:results.insertId,...urheilija}));
        }
    );
});

module.exports = app;