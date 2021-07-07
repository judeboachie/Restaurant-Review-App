const admin = require('firebase-admin');
const serviceAccount = require('./tutorial-47d32-firebase-adminsdk-4kuzo-dff1b09ca6.json'); // auth key... don't share this with anyone
admin.initializeApp({ // authentification with the key above
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore(); 

const express = require("express");
const app = express();
const hostname = "127.0.0.1";
const port = 3000;

app.use((req, res, next) => { // Bypass CORS policy error
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

app.get("/", (req, res) => { // Landing page that displays all restaurants
    db 
   .collection("Restaurants") // specify the collection to be queried
   .get() // get request
   .then((querySnapshot) => { // an object
        return querySnapshot.docs.map(item => {
        console.log(item.data()) // similar to .json()
        let data = item.data()
         data["id"] = item.id
         console.log(item.id)
        return data;
        })             
    })
    .then((items) => {
        res.send(items)
    }) 
    });

app.get("/restaurants/:id/reviews", (req, res) => { //the : means we are expecting a parameter called id
    db 
    .collection("Review").where("restaurantID", "==", req.params.id) //this refers to :id 
    .get() 
    .then((querySnapshot) => {
         return querySnapshot.docs.map(item => {
         console.log(item.data())   
         let data = item.data()
         data["id"] = item.id
         console.log(item.id)
         return data
         })             
     })
     .then((data) => {
         res.send(data)
     })
    });


const server = app.listen(3000, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
