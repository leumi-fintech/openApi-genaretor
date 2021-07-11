function lambdify(statusCode, body, requestId) {
  return {
    statusCode: statusCode,
    isBase64Encoded: false,
    headers: requestId
      ? {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
          'X-Request-ID': requestId,
        }
      : {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
        },
    body: body === undefined ? JSON.stringify({}) : JSON.stringify(body),
  };
}
exports.lambdify = lambdify;

function lambdifyLocation(statusCode, body, Location, sca) {
  return {
    statusCode: statusCode,
    isBase64Encoded: false,
    headers: sca
      ? {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
          'LOCATION': Location,
          'ASPSP-SCA-Approach': sca,
        }
      : {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
          'LOCATION': Location,
        },
    body: body === undefined ? JSON.stringify({}) : JSON.stringify(body),
  };
}
exports.lambdifyLocation = lambdifyLocation;
