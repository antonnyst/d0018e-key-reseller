const express = require('express')
const proxy = require('express-http-proxy');
const app = express()
const port = 80


app.use('/api', proxy('http://localhost:3333'));

app.use(express.static('public'))

app.listen(port, () => {
    console.log(`web hosting on port ${port}`)
})