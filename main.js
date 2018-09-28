require('dotenv').config()

//Load libraries
const express = require('express');
const path = require('path');
const mysql = require('mysql');
var cors = require('cors');


//create an instance of express
const app=express();
app.use(cors());

const sqlFindAll = "SELECT * FROM grocery_list";

const sqlFindByID = "SELECT id, brand, name FROM grocery_list WHERE id=?"; //"?" is subtituted by args, passed in line 74 through filmId

const sqlFindByBrand = "SELECT id, brand, name FROM grocery_list WHERE brand LIKE ?"; 

const sqlFindByName = "SELECT id, brand, name FROM grocery_list WHERE name LIKE ?"; 

const sqlUpdateItem = "UPDATE grocery_list SET brand=?, name=? WHERE id=?"; 

const sqlInsertItem = "INSERT INTO grocery_list (upc12,brand,name) VALUES(?, ?,?)"; 

 

//Takes value from .env file
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT
})


//Create a reuseable function to query MySQL, wraps around with Promise
var makeQuery = (sql, pool)=>{
    console.log("SQL statement >>> ",sql);

    return  (args)=>{
        let queryPromise = new Promise((resolve,reject)=>{
            pool.getConnection((err,connection)=>{
                if(err){
                    reject(err);
                    return;
                }
                console.log("args>>> ", args);
                connection.query(sql, args || {}, (err,results)=>{
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results);
                })
            });

        });
        return queryPromise;

    }
}

var findAll = makeQuery(sqlFindAll, pool);
var findByID = makeQuery(sqlFindByID, pool);
var findByBrand = makeQuery(sqlFindByBrand, pool);
var findByName = makeQuery(sqlFindByName, pool);
var updateItem = makeQuery(sqlUpdateItem, pool);
var insertItem = makeQuery(sqlInsertItem, pool);



//create routes
app.get('/grocer',(req,res)=>{

        let brand = req.query.brand;
        console.log("Brand search>>> ", brand);
        findByBrand(brand).then((results)=>{
            res.json(results);
        }).catch((error)=>{
            console.log(error);
            res.status(500).json(error);
        });
    
/*
    allFilms().then((results)=>{
        res.json(results);
    }).catch((error)=>{
        console.log(error);
        res.status(500).json(error);
    });
*/
});


app.get("/grocer/:id", (req, res)=>{
    console.log("/ID !");
    let id = req.params.id;
    console.log(id);
    findByID([parseInt(id)]).then((results)=>{
        console.log(results);
        res.json(results);
    }).catch((error)=>{
        res.status(500).json(error);
    })
    
})


//Start web server
//start server on port 3000 if undefined on command line
const PORT=parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000

app.listen(PORT, ()=>{
    console.info(`Application started on port ${PORT} at ${new Date()}`);
});
