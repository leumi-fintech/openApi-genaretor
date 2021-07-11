const express = require('express')
const app = express();
const cors = require('cors')
const port = 3001;
const multer  = require('multer')
const { spawn } = require('child_process');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './generatorLambda/swaggers/')
    },
    filename: function (req, file, cb) {
      cb(null, './generatorLambda/swaggers/swgger.yml');
    }
  })
   
  var upload = multer({ storage: storage })

  

app.use(cors());

app.post('/upload', upload.single('file') , (req, res) => {
    let runPy = new Promise(function(success, nosuccess) {

        const { spawn } = require('child_process');
        const pyprog = spawn('python', ['./generatorLambda/generator.py']);
    
        pyprog.stdout.on('data', function(data) {
    
            success(data);
        });
    
        pyprog.stderr.on('data', (data) => {
    
            nosuccess(data);
        });
    });
    runPy.then(function(fromRunpy) {
        console.log(fromRunpy.toString());
        res.end(fromRunpy);
    });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})