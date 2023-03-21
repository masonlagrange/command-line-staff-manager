const express = require('express')
const mysql = require('mysql2')

const PORT = 3001
const app = express()

app.use(express.urlencoded({ extended: false}))
app.use(express.json())

const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'temp46Pass71',
        database: 'staff_db'
    }
)

app.use((req, res) => {
    res.status(404).end()
})

app.listen(PORT)

module.exports = connection