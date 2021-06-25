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

const restaurants = db 
   .collection("Restaurants") // specify the collection to be queried
   .get() // get request
   .then((querySnapshot) => { // an object
        return querySnapshot.docs.map(item => {
        console.log(item.data()) // similar to .json()
        return item.data()
        })             
    })

const KK = db  // Krusty Krab reviews
        .collection("Review").where("restaurant", "==", "Krusty Krab") 
        .get() 
        .then((querySnapshot) => {
            return querySnapshot.docs.map(item => {
            console.log(item.data())
            return item.data() 
            })             
        })

const McD = db // McDonald's reviews
    .collection("Review").where("restaurant", "==", "McDonald's") 
    .get() 
    .then((querySnapshot) => { 
            return querySnapshot.docs.map(item => {
            console.log(item.data())
            return item.data() 
            })             
        })

const Timmies = db // Tim Hortons reviews
        .collection("Review").where("restaurant", "==", "Tim Hortons") 
        .get() 
        .then((querySnapshot) => { 
            return querySnapshot.docs.map(item => {
            console.log(item.data())
            return item.data() 
            })             
        });

app.get("/", (req, res) => { // Landing page that displays all restaurants
    res.send(restaurants);
    });

app.get("/krustykrab", (req, res) => { // Page with all Krusty Krab reviews
        res.send(KK);
    });
    
app.get("/mcdonalds", (req, res) => { // Page with all McDonald's reviews
        res.send(McD);
    });

app.get("/timhortons", (req, res) => { // Page with all Tim Hortons reviews
        res.send(Timmies);
    });

const server = app.listen(3000, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
