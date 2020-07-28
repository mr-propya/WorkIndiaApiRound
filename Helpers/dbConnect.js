const mysql = require("mysql")
const dotenv = require("dotenv")

dotenv.config()

let selfDebug=()=>{
    //just for debugging purposes
    sqlQuery("show databases").then(console.log)
}

let sqlQuery= (query)=>{
    //wrapped the whole query in a promise so the code becomes easier and also closed the connection as soon as query has been executed
    return new Promise((resolve,reject)=>{
        createConnection().then((connection)=>{
            connection.query(query,(err,response)=>{
                if(err)
                    reject(err)
                else{
                    connection.end()
                    resolve(JSON.parse(JSON.stringify(response)))
                }
            })
        }).catch((err)=>reject(err))
    })
}

let createConnection=()=>{
    //creating a connection but the lib for sql uses callbacks so to simplify further uses wrapping it in a promise
    return new Promise((resolve,reject)=>{
        const connection = mysql.createConnection({
            host:process.env.IP,
            port:process.env.PORT,
            user:process.env.DB_USERNAME,
            password:process.env.PASSWORD,
            database:process.env.DB
        })

        connection.connect({},(err)=>{
            if(err){
                console.log("error connecting "+err.code)
                reject(err.code)
            }
        else{
                console.log("success connecting")
                resolve(connection)
            }
        })

    })

}


if(!module.parent){
    //will run only if debugging
    selfDebug()
}

module.exports = sqlQuery