const express = require('express')
const app = express();
const cors = require('cors')
const port = 3001;
const multer  = require('multer')


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
  const {file} = req.body;

  // run the sctipt 
  res.send(file);

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})