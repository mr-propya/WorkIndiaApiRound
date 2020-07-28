const express = require("express")
const app = express.Router()

const db_helper = require("./dbConnect")
const encryptHelper = require("./encryptText")

//would be added to .env in prod and will be added to gitignore
const secretKey = "67a491e598902b19e7afb75ee76bbb048529f3eb43031cce9abd58ff6a5bcc62"
//secret key for aes256 algo used to encrypt notes
//initialization vector is randomly generated and stored in db along with the note itself


app.use((req,res,next)=>{
    // checking if the request has uid so no need to check in consecutive functions
    const userId = req.query.user

    if(userId===undefined){
        res.status(400).send({
            "status":"error",
            "error":"invalid params"
        })
    }else{
        next()
    }
})


app.post("/",(req,res)=>{
    const userId = req.query.user
    const noteBody  = req.body.note
    if(noteBody===undefined){
        res.status(400).send({
            "status":"error",
            "error":"Note data not found"
        })
        return
    }

    const encrypt = encryptHelper.encryptText(noteBody,secretKey)

    console.log(encrypt)

    db_helper(`insert into Notes ( userId , body ,iv ) values ( ${userId} , "${encrypt.data}" , "${encrypt.iv}")`)
        .then((dbResponse)=>{
            console.log(dbResponse)
            res.send({
                "status":"success"
            })
        }).catch((err)=>{
            console.log(err)
            res.status(500).send({
                "status":"error",
                "error":"internal server error"
            })
    })




})


app.get("/list",(req,res)=>{
    const userId = req.query.user

    db_helper(`select noteId from Notes where userId = "${userId}"`).then((notes)=>{
        console.log(notes)
        res.send(notes)
    }).catch((err)=>{
        console.log(err)
        res.status(500).send({
            "status":"error",
            "error":"internal server error"
        })
    })


})


app.get("/view",(req,res)=>{
    const note = req.query.noteId;
    const userId = req.query.user;

    if(note===undefined){
        res.status(400).send({
            "status":"error",
            "error":"Note data not found"
        })
        return
    }

    //checks uid as well as note id so no one else can access the notes
    db_helper(`select body , iv from Notes where userId = ${userId} and noteId = ${note}`).then((noteBody)=>{
        if(noteBody.length === 0){
            res.status(401).send({
                "status":"error",
                "error":"note not found or you don't have permissions to view them"
            })
            return
        }
        const note = noteBody[0]
        try{
            console.log(note)
            const body = encryptHelper.decryptText(note.body,secretKey,note.iv)
            res.send({
                "status":"success",
                "note":body
            })
        }catch (e) {
            //will be captured by the outer catch block
            throw e;
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