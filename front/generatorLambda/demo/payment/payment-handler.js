 const {lambdify,} = require('./utils/response-utils');
 const {validateReqest,} = require('./utils/validateSwaggerUtils');
 
    module.exports.paymentproduct = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'transactionStatus': 'RCVD', 'paymentId': '1234-wertiq-983', '_links': {'scaOAuth': {'href': 'https://www.testbank.com/oauth/.well-known/oauth-authorization-server'}, 'self': {'href': '/v1.0.8/payments/masav/1234-wertiq-983'}, 'status': {'href': '/v1.0.8/payments/masav/1234-wertiq-983/status'}, 'scaStatus': {'href': '/v1.0.8/payments/masav/1234-wertiq-983/authorisations/123auth456'}}})
    return response
    };
     
    module.exports.paymentId = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'examples': 'path dose not have a example response body'})
    return response
    };
     
    module.exports.paymentId = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'examples': 'path dose not have a example response body'})
    return response
    };
     
    module.exports.status = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'transactionStatus': 'ACCP'})
    return response
    };
     
    module.exports.authorisationId = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'examples': 'path dose not have a example response body'})
    return response
    };
    