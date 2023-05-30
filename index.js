require('dotenv').config();

const { spawn, exec } = require('child_process');
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
        console.log(`Killing ${lastPid}`);
        exec(`kill -9 ${lastPid}`);
    }

    console.log(`Loading ${file}`);
    const child = spawn('atariserver', ['-f', '/dev/ttyAMA0', '-C', '-s', '1', '-1', `${process.env.FILES_DIR}/hisioboot-atarisio.atr`,'-2', file, '&']);

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    }); 

    loadedFile = child.pid 

    res.send()
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})