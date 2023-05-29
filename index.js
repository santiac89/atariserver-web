require('dotenv').config();

const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');

const app = express()
const port = process.env.PORT;

app.use(express.json());

let lastPid = null;

app.get('/files', (req, res) => {
  const files = fs.readdirSync(process.env.FILES_DIR);
  res.json(files.map(file => `${process.env.FILES_DIR}/${file}`));
})

app.post('/load', (req, res) => {
    const { file } = req.body;

    if (lastPid) {
        exec(`kill -9 ${lastPid}`);
    }

    loadedFile = exec(`atariserver -f /dev/ttyAMA0 -C -s 1 ${file} &`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      }).pid; 

    res.send()
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})