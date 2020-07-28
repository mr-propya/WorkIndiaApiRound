const express = require("express")
const app = express()

const bodyParse = require("body-parser")

const dotenv = require("dotenv")

dotenv.config()

app.use(express.json())
app.use(bodyParse.urlencoded({extended:true}))


const userRouter = require("./Helpers/userAuth")
const notesRouter = require("./Helpers/notesHelper")

app.use("/app/user",userRouter)
app.use("/app/sites",notesRouter)


app.use("/",(req,res)=>{
    res.status(404).send("Please use a valid endpoint")
})


app.listen(process.env.SERVER_PORT,()=>{
    console.log(`listening on ${process.env.SERVER_PORT}`)
})