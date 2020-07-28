const express = require("express")
const app = express.Router()

const encryptHelper = require("./encryptText")
const dbHelper = require("./dbConnect")

//would be added to .env in prod and will be added to gitignore
const secretKey = "sdasdsjdsjdsjkjkdsjksdjds"
// random key for hashing passwords


app.use((req,res,next)=>{
    //removing malformed requests
    const userName = req.body.username;
    const passwd = req.body.password;

    if(userName===undefined||passwd===undefined){
        res.status(400).send({
            "status":"error",
            "error":"invalid params"
        })
    }else{
        next()
    }
})

app.post("/",async (req,res)=>{
    const userName = req.body.username;
    const passwd = req.body.password;

    //returns me the hash and the salt used with a salt of len 16 bytes
    const saltHash = encryptHelper.hashPassword(passwd,secretKey,16)


    //not checking if user exists as it will be caught by the unique constraint on db

    dbHelper(`insert into user (username,salt,password) values("${userName}","${saltHash.salt}","${saltHash.hash}")`)
        .then((dbRes)=>{
            console.log(dbRes);
            res.status(201).send({
                "status":"account created"
            })
        }).catch((err)=>{
            console.log(err.code)
            if(err.code==="ER_DUP_ENTRY"){
                //unique constraint failed on username
                res.status(401)
                    .send({
                        "status":"error",
                        "error":"username already exists"
                    })
                return
            }
            //some other error occurred
            res.status(500).send({
                "status":"error",
                "error":"internal server error"
            })
    })

})


app.post("/auth",(req,res)=>{
    const userName = req.body.username;
    const passwd = req.body.password;

    dbHelper(`Select * from user where username = "${userName}"`).then((users)=>{
        // console.log(users)
        console.log(users.length)
        if(users.length===0){
            res.status(404).send({
                "status":"error",
                "error":"user not found"
            })
            //should not be returned in real env and should return a generic error msg saying invalid credentials
            //but for sake of this interview i am sending it
            return
        }
        const user = users[0]

        //verifying the recalculated hash and the hash in db
        const hashMatch = encryptHelper.verifyHash(passwd,secretKey,user.salt,user.password)
        if(hashMatch){
            res.send({
                "status":"success",
                "userId":user.ID
            })
        }else{
            res.status(401).send({
                "status":"error",
                "error":"invalid credentials"
            })
        }


    }).catch((err)=>{
        console.log(err)
        res.status(500).send({
            "status":"error",
            "error":"internal server error"
        })
    })




})




module.exports = app