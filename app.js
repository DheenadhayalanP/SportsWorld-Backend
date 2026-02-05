require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbSession = require('connect-mongodb-session')(session);
const RegRouter = require('./Routers/RegRouter');
const ProRouter = require('./Routers/ProRouter');
const OrderRouter = require('./Routers/OrderRouter');
const cors = require('cors');
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://sports-world-9cbu.vercel.app"
    ],
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({extended:true}));

mongoose.connect(process.env.MONGODB)
.then(()=> console.log("MongoDb connect Successful"))
.catch(err => console.log("Error in connect",err))


app.use("/upload", express.static(path.join(__dirname, "upload")));


const Store = new MongoDbSession({
    uri :process.env.MONGODB,
    collection: 'Session'
})

app.use(session({
    secret: process.env.Key,
    resave:false,
    saveUninitialized:false,
    store: Store,
    // cookie:{
    //     httpOnly:true,
    //     secure: true,
    //     sameSite:'none'
    // }
}))


app.use(RegRouter);
app.use(ProRouter);
app.use(OrderRouter);



app.listen(port, () =>console.log("Server running on port", port))





// fetch('/register',{
//       method:'POST',
//       credientials:'incude',
//       headers:{
//         'Content-Type':'application/json',
//         'Accept':'application/json'
//       },
//       body:JSON.stringify({name:formData.name,email,password})
//     }).then(res => res.json())
//     .then(datas =>{
//       if(data.success)
//       {
//         alert(data.meassage)
//       }
//       else
//       {
//         alert(data.meassage)

//       }
//     })
//     .catch(err =>{
//       alert("Trouble in connecting to server")
//       // alert(data.meassage)

//     })
//   };