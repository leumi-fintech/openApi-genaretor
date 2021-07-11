const fs = require('fs');

var swaggerValidator = require('swagger-object-validator');

function validateReqest(body, responseModel) {
  console.log('responseModel:', responseModel);
  console.log('body:', JSON.stringify(body));

  return new Promise(async (resolve, reject) => {
    console.log('validating schema');
    try {
      let validator = new swaggerValidator.Handler(`openApi.yaml`);

      validator.validateModel(body, responseModel, function (err, result) {
        console.log(`validating model ${JSON.stringify(responseModel)}`);
        if (err) {
          console.log(`ERROR ${JSON.stringify(err)}`);
          console.log(`result : ${JSON.stringify(result)}`);
          reject(false);
        }
        if (result) {
          console.log(
            `validateModel :  ${JSON.stringify(result.humanReadable())}`
          );
          if (result.humanReadable() !== 'Valid') {
            reject(result.humanReadable());
          } else {
            resolve(true);
          }
        }
      });
      // For yaml and/or OpenApi field order output replace above line
      // with an options object like below
      //   var  options = {syntax: 'yaml', order: 'openapi'}
      //   console.log(converted.stringify(options));
    } catch (e) {
      console.log(`ERRRO ${JSON.stringify(e)}`);
      reject(e);
    }
  });
}

exports.validateReqest = validateReqest;
