 const {lambdify,} = require('./utils/response-utils');
 const {validateReqest,} = require('./utils/validateSwaggerUtils');
 
    module.exports.accounts = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'accounts': [{'resourceId': '3dc3d5b3-7023-4848-9853-f5400a64e80f', 'iban': 'DE2310010010123456789', 'currency': 'EUR', 'product': 'Girokonto', 'cashAccountType': 'CACC', 'name': 'Main Account', '_links': {'balances': {'href': '/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/balances'}, 'transactions': {'href': '/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/transactions'}}}, {'resourceId': '3dc3d5b3-7023-4848-9853-f5400a64e81g', 'iban': 'DE2310010010123456788', 'currency': 'USD', 'product': 'Fremdwֳ₪hrungskonto', 'cashAccountType': 'CACC', 'name': 'US Dollar Account', '_links': {'balances': {'href': '/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e81g/balances'}}}]})
    return response
    };
     
    module.exports.accountid = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'account': {'resourceId': '3dc3d5b3-7023-4848-9853-f5400a64e80f', 'iban': 'FR7612345987650123456789014', 'currency': 'EUR', 'product': 'Girokonto', 'cashAccountType': 'CACC', 'name': 'Main Account', '_links': {'balances': {'href': '/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/balances'}, 'transactions': {'href': '/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/transactions'}}}})
    return response
    };
     
    module.exports.balances = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'account': {'iban': 'FR7612345987650123456789014'}, 'balances': [{'balanceType': 'closingBooked', 'balanceAmount': {'currency': 'EUR', 'amount': '500.00'}, 'referenceDate': '2017-10-25'}, {'balanceType': 'expected', 'balanceAmount': {'currency': 'EUR', 'amount': '900.00'}, 'lastChangeDateTime': '2017-10-25T15:30:35.035Z'}]})
    return response
    };
     
    module.exports.transactions = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'account': {'iban': 'DE2310010010123456788'}, 'transactions': {'booked': [{'transactionId': '1234567', 'creditorName': 'John Miles', 'creditorAccount': {'iban': 'DE67100100101306118605'}, 'transactionAmount': {'currency': 'EUR', 'amount': '256.67'}, 'bookingDate': '2017-10-25', 'valueDate': '2017-10-26', 'remittanceInformationUnstructured': 'Example 1'}, {'transactionId': '1234568', 'debtorName': 'Paul Simpson', 'debtorAccount': {'iban': 'NL76RABO0359400371'}, 'transactionAmount': {'currency': 'EUR', 'amount': '343.01'}, 'bookingDate': '2017-10-25', 'valueDate': '2017-10-26', 'remittanceInformationUnstructured': 'Example 2'}], 'pending': [{'transactionId': '1234569', 'creditorName': 'Claude Renault', 'creditorAccount': {'iban': 'FR7612345987650123456789014'}, 'transactionAmount': {'currency': 'EUR', 'amount': '-100.03'}, 'valueDate': '2017-10-26', 'remittanceInformationUnstructured': 'Example 3'}], '_links': {'account': {'href': '/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f'}}}})
    return response
    };
     
    module.exports.transactionId = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'transactionsDetails': {'transactionId': '1234567', 'creditorName': 'John Miles', 'creditorAccount': {'iban': 'DE67100100101306118605'}, 'mandateId': 'Mandate-2018-04-20-1234', 'transactionAmount': {'currency': 'EUR', 'amount': '-256.67'}, 'bookingDate': '2017-10-25', 'valueDate': '2017-10-26'}})
    return response
    };
     
    module.exports.cardaccounts = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'cardAccounts': [{'resourceId': '3d9a81b3-a47d-4130-8765-a9c0ff861b99', 'maskedPan': '525412******3241', 'currency': 'EUR', 'name': 'Main', 'product': 'Basic Credit', 'status': 'enabled', 'creditLimit': {'currency': 'EUR', 'amount': '15000'}, 'balances': [{'balanceType': 'interimBooked', 'balanceAmount': {'currency': 'EUR', 'amount': '14355.78'}}, {'balanceType': 'nonInvoiced', 'balanceAmount': {'currency': 'EUR', 'amount': '4175.86'}}], '_links': {'transactions': {'href': '/v1.0.8/card-accounts/3d9a81b3-a47d-4130-8765-a9c0ff861b99/transactions'}}}]})
    return response
    };
     
    module.exports.accountid = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'cardAccount': {'resourceId': '3d9a81b3-a47d-4130-8765-a9c0ff861b99', 'maskedPan': '525412******3241', 'currency': 'EUR', 'name': 'Main', 'ownerName': 'Gil Gila', 'product': 'Basic Credit', 'status': 'enabled', 'creditLimit': {'currency': 'EUR', 'amount': '15000'}, 'balances': [{'balanceType': 'interimBooked', 'balanceAmount': {'currency': 'EUR', 'amount': '14355.78'}}, {'balanceType': 'nonInvoiced', 'balanceAmount': {'currency': 'EUR', 'amount': '4175.86'}}]}})
    return response
    };
     
    module.exports.balances = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'cardAccount': {'maskedPan': '525412******3241'}, 'balances': [{'balanceType': 'interimBooked', 'balanceAmount': {'currency': 'EUR', 'amount': '14355.78'}}, {'balanceType': 'nonInvoiced', 'balanceAmount': {'currency': 'EUR', 'amount': '4175.86'}}]})
    return response
    };
     
    module.exports.transactions = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'cardAccount': {'maskedPan': '525412******3241'}, 'cardTransactions': {'booked': [{'cardTransactionId': '201710020036959', 'transactionAmount': {'currency': 'EUR', 'amount': '256.67'}, 'transactionDate': '2017-10-25', 'bookingDate': '2017-10-26', 'originalAmount': {'currency': 'SEK', 'amount': '2499'}, 'cardAcceptorAddress': {'city': 'STOCKHOLM', 'country': 'SE'}, 'maskedPan': '525412******3241', 'proprietaryBankTransactionCode': 'PURCHASE', 'invoiced': False, 'transactionDetails': 'WIFIMARKET.SE'}, {'cardTransactionId': '201710020091863', 'transactionAmount': {'currency': 'EUR', 'amount': '10.72'}, 'transactionDate': '2017-10-25', 'bookingDate': '2017-10-26', 'originalAmount': {'currency': 'SEK', 'amount': '99'}, 'cardAcceptorAddress': {'city': 'STOCKHOLM', 'country': 'SE'}, 'maskedPan': '525412******8999', 'proprietaryBankTransactionCode': 'PURCHASE', 'invoiced': False, 'transactionDetails': 'ICA SUPERMARKET SKOGHA'}], 'pending': [], '_links': {'cardAccount': {'href': '/v1.0.8/card-accounts/3d9a81b3-a47d-4130-8765-a9c0ff861b99'}}}})
    return response
    };
     
    module.exports.consents = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'consentStatus': 'received', 'consentId': '1234-wertiq-983', '_links': {'self': {'href': '/v1.0.8/consents/1234-wertiq-983'}, 'scaStatus': {'href': 'v1.0.8/consents/1234-wertiq-983/authorisations/123auth567'}, 'scaOAuth': {'href': 'https://www.testbank.com/oauth/.well-known/oauth-authorization-server'}}})
    return response
    };
     
    module.exports.consentId = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'access': {'balances': [{'iban': 'DE2310010010123456789'}], 'transactions': [{'iban': 'DE2310010010123456789'}, {'maskedPan': '123456xxxxxx3457'}]}, 'recurringIndicator': 'true', 'validUntil': '2017-11-01', 'frequencyPerDay': 100, 'lastActionDate': '2017-10-09', 'consentStatus': 'valid', '_links': {'account': {'href': '/v1.0.8/accounts'}}})
    return response
    };
     
    module.exports.consentId = async (event) => {
    let response = {
        statusCode: 200,
        body: ""
    }
    /***
    Set your code here! 
    ***/
    response.body = JSON.stringify( {'access': {'balances': [{'iban': 'DE2310010010123456789'}], 'transactions': [{'iban': 'DE2310010010123456789'}, {'maskedPan': '123456xxxxxx3457'}]}, 'recurringIndicator': 'true', 'validUntil': '2017-11-01', 'frequencyPerDay': 100, 'lastActionDate': '2017-10-09', 'consentStatus': 'valid', '_links': {'account': {'href': '/v1.0.8/accounts'}}})
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
    response.body = JSON.stringify( {'consentStatus': 'valid'})
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
    