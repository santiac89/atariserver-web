require('dotenv').config();

const { spawn, exec } = require('child_process');
const multer  = require('multer')
const express = require('express');
const fs = require('fs');

const app = express()
const port = process.env.PORT;

app.use(express.static('./public'));
app.use(express.json());

let lastChild = null;
let loadingDrive = false;

const upload = multer({ dest: process.env.FILES_DIR })

app.get('/', (req, res) => {
    const html = fs.readFileSync('./public/client/index.html');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

app.get('/files', (req, res) => {
  const files = fs.readdirSync(process.env.FILES_DIR);
  const regexp = /(.*)(\.atr|\.xex)/i;
  res.json(files.filter((f) => f.match(regexp)).map(file => ({ name: file, path: `${process.env.FILES_DIR}/${file}` })));
})

app.post('/load', (req, res) => {
    loadingDrive = true;
    const { file, highspeed } = req.body;

    if (lastChild && !lastChild.killed) {
        console.log(`Killing ${lastChild.pid}`);
        exec(`kill -9 ${lastChild.pid}`);
    }

    console.log(`Loading ${file}`);

    const arguments = ['-f', '/dev/ttyAMA0', '-C'];

    if (highspeed)  {
        arguments.push('s', '1', '-S', '2', '-1', `${process.env.FILES_DIR}/hisioboot-atarisio.atr`,'-2', file);
    } else {
        arguments.push( '-1', file);
    }

    try {
        lastChild = spawn('atariserver', arguments);

        lastChild.on('error', function(err) {
            lastChild = null;
            res.status(500).json({ error: err });
        });

        lastChild.stdout.on('data', (data) => {
            if (loadingDrive) {
                res.json({ pid: lastChild.pid, file, highspeed });
                loadingDrive = false;
            }
        });

        lastChild.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    } catch (e) {
        res.status(500).json({ error: e });
    }
});

app.post('/upload', upload.single('file'), function (req, res, next) {
    fs.renameSync(req.file.path, `${process.env.FILES_DIR}/${req.file.originalname}`);
    res.send();
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})