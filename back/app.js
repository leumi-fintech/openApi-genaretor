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

app.get('/data', (req, res) => {

res.send(`
openapi: 3.0.1
info:
  title: NextGenPSD2 XS2A Framework
  description: |
    # Summary
    The **NextGenPSD2** *Framework Version 1.3.4* offers a modern, open, harmonised and interoperable set of 
    Application Programming Interfaces (APIs) as the safest and most efficient way to provide data securely. 
    The NextGenPSD2 Framework reduces XS2A complexity and costs, addresses the problem of multiple competing standards 
    in Europe and, aligned with the goals of the Euro Retail Payments Board,
    enables European banking customers to benefit from innovative products and services ('Banking as a Service') 
    by granting TPPs safe and secure (authenticated and authorised) access to their bank accounts and financial data.
    
    The possible Approaches are:
      * OAuth SCA Approach
      * Decoupled SCA Approach

      Not every message defined in this API definition is necessary for all approaches. 
      Furthermore this API definition does not differ between methods which are mandatory, conditional, or optional
      Therefore for a particular implementation of a Berlin Group PSD2 compliant API it is only necessary to support 
      a certain subset of the methods defined in this API definition.
    
      **Please have a look at the implementation guidelines if you are not sure 
      which message has to be used for the approach you are going to use.**
    
    ## Some General Remarks Related to this version of the OpenAPI Specification:
    * **This API definition is based on the Implementation Guidelines of the Berlin Group PSD2 API.** 
      It is not a replacement in any sense.
      The main specification is (at the moment) always the Implementation Guidelines of the Berlin Group PSD2 API.
    * **This API definition contains the REST-API for requests from the PISP to the ASPSP.**
    * **This API definition contains the messages for all different approaches defined in the Implementation Guidelines.**
    * According to the OpenAPI-Specification [https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md]
      
        "If in is "header" and the name field is "Accept", "Content-Type" or "Authorization", the parameter definition SHALL be ignored."
      
      The element "Accept" will not be defined in this file at any place.
      
      The elements "Content-Type" and "Authorization" are implicitly defined by the OpenApi tags "content" and "security".
      
    * There are several predefined types which might occur in payment initiation messages, 
      but are not used in the standard JSON messages in the Implementation Guidelines.
      Therefore they are not used in the corresponding messages in this file either.
      We added them for the convenience of the user.
      If there is a payment product, which need these field, one can easily use the predefined types.
      But the ASPSP need not to accept them in general.
      
    * **We omit the definition of all standard HTTP header elements (mandatory/optional/conditional) 
       except they are mentioned in the Implementation Guidelines.**
      Therefore the implementer might add these in his own realisation of a PSD2 comlient API in addition to the elements defined in this file.

       
    ## General Remarks on Data Types
    
       The Berlin Group definition of UTF-8 strings in context of the PSD2 API has to support at least the following characters

    
    a b c d e f g h i j k l m n o p q r s t u v w x y z
    
    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
    
    #BOI-REMARK: The Hebrew alphabt must be supported as part of the character set
    א ב ג ד ה ו ז ח ט י כ ך ל מ ם נ ן ס ע פ ף צ ץ ק ר ש ת
    
    0 1 2 3 4 5 6 7 8 9
    
    / - ? : ( ) . , ' +
    
    Space


  license:
    name: Creative Commons Attribution 4.0 International Public License
    url: https://creativecommons.org/licenses/by/4.0/
  #termsOfService: URL for Terms of Service of the API
  contact:
    name: The Berlin Group - A European Standards Initiative
    url: https://www.berlin-group.org/
    email: info@berlin-group.org

externalDocs:
  description: |
    Full Documentation of NextGenPSD2 Access to Account Interoperability Framework
    (General Introduction Paper, Operational Rules, Implementation Guidelines)
  url: https://www.berlin-group.org/nextgenpsd2-downloads

servers:
  - url: https://api.testbank.com/psd2
    description: PSD2 server
  - url: https://test-api.testbank.com/psd2
    description: Optional PSD2 test server

paths:

  #####################################################
  # Payment Information Service
  #####################################################

  /v1.0.8/{payment-service}/{payment-product}:
    post:
      summary: Payment initiation request 
      description: | 
        This method is used to initiate a payment at the ASPSP.
      
        
        There are the following **payment products**:
        
          - Payment products with payment information in *JSON* format:
            - ***masav***
            - ***zahav***
            - ***FP***
        
        Furthermore the request body depends on the **payment-service**
          * ***payments***: A single payment initiation request.
          * ***bulk-payments***: A collection of several payment iniatiation requests.
          * ***periodic-payments***: 
            Create a standing order initiation resource for recurrent i.e. periodic payments addressable under {paymentId} 
             with all data relevant for the corresponding payment product and the execution of the standing order contained in a JSON body. 

        
        This is the first step in the API to initiate the related recurring/periodic payment.
          
        ### BOI-REMARK : Multilevel SCA Approach does not supported.
        The Payment Initiation Requests are independent from the need of one or multilevel 
        SCA processing, i.e. independent from the number of authorisations needed for the execution of payments. 
        
        But the response messages are specific to either one SCA processing or multilevel SCA processing. 
        
        For payment initiation with multilevel SCA, this specification requires an explicit start of the authorisation, 
        i.e. links directly associated with SCA processing like 'scaRedirect' or 'scaOAuth' cannot be contained in the 
        response message of a Payment Initation Request for a payment, where multiple authorisations are needed. 
        Also if any data is needed for the next action, like selecting an SCA method is not supported in the response, 
        since all starts of the multiple authorisations are fully equal. 
        In these cases, first an authorisation sub-resource has to be generated following the 'startAuthorisation' link.
      operationId: initiatePayment
      tags:
        - Payment Initiation Service (PIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an OAuth2 process, which has to 
      # be included inthe HTTP header is described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommended to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/paymentService"
        #roiz_1.8 - add fp support
        - $ref: "#/components/parameters/paymentProduct"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
          #BOI-REMARK: Mandatory
        - $ref: "#/components/parameters/PSU-ID"
        - $ref: "#/components/parameters/PSU-ID-Type"
          #BOI-REMARK: not supported
        #- $ref: "#/components/parameters/PSU-Corporate-ID"
        #- $ref: "#/components/parameters/PSU-Corporate-ID-Type"
        - $ref: "#/components/parameters/consentId_HEADER_optional"
           #roiz_1.8 - changed from optinal to conditonal
        - $ref: "#/components/parameters/PSU-IP-Address_mandatory"
        #BOI-REMARK: Mandatory for ASPSP supporting Decoupled SCA approach
        - $ref: "#/components/parameters/TPP-Redirect-Preferred"
          #roiz_1.8- change to optional
        - $ref: "#/components/parameters/TPP-Redirect-URI"
        - $ref: "#/components/parameters/TPP-Nok-Redirect-URI"
        - $ref: "#/components/parameters/TPP-Explicit-Authorisation-Preferred"
        - $ref: "#/components/parameters/TPP-Rejection-NoFunds-Preferred"
          #conditional for extended service lean Push
        - $ref: "#/components/parameters/TPP-Notification-URI"
        - $ref: "#/components/parameters/TPP-Notification-Content-Preferred"
          #optional additional PSU Information in header
           #roiz_1.8 - changed from optinal to conditonal
        - $ref: "#/components/parameters/PSU-IP-Port_mandatory"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
           #roiz_1.8 - changed from optinal to conditonal
        - $ref: "#/components/parameters/PSU-Device-ID_conditional"
          #roiz_1.8 - changed from optinal to conditonal
        - $ref: "#/components/parameters/PSU-Geo-Location_conditional"
        
      requestBody:
        $ref: "#/components/requestBodies/paymentInitiation"
      
      responses:
        '201':
          $ref: "#/components/responses/CREATED_201_PaymentInitiation"
        
        '400': 
          $ref: "#/components/responses/BAD_REQUEST_400_PIS"
        '401': 
          $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
        '403': 
          $ref: "#/components/responses/FORBIDDEN_403_PIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_PIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_PIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"

  /v1.0.8/{payment-service}/{payment-product}/{paymentId}:

    get:
      summary: Get Payment Information
      description: Returns the content of a payment object
      operationId: getPaymentInformation
      tags:
        - Payment Initiation Service (PIS)
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      parameters:
      #path
        - $ref: "#/components/parameters/paymentService"
        - $ref: "#/components/parameters/paymentProduct"
        - $ref: "#/components/parameters/paymentId"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Address_optional"
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY 
      
      responses: 
        '200':
          $ref: "#/components/responses/OK_200_PaymentInitiationInformation"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_PIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_PIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_PIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_PIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"

    #BOI-REMARK: relevant just for future payment
    delete:
      summary: Payment Cancellation Request
      description: | 
         This method initiates the cancellation of a payment. 
         Depending on the payment-service, the payment-product and the ASPSP's implementation, 
         this TPP call might be sufficient to cancel a payment. 
         If an authorisation of the payment cancellation is mandated by the ASPSP, 
         a corresponding hyperlink will be contained in the response message.
       
         Cancels the addressed payment with resource identification paymentId if applicable to the payment-service, payment-product and received in product related timelines (e.g. before end of business day for scheduled payments of the last business day before the scheduled execution day). 
       
         The response to this DELETE command will tell the TPP whether the 
           * access method was rejected
           * access method was successful, or
           * access method is generally applicable, but further authorisation processes are needed.
      operationId: cancelPayment
      tags:
         - Payment Initiation Service (PIS)
     
      security:
       ##################################################### 
       # REMARKS ON SECURITY IN THIS OPENAPI FILE
       #In this file only the basic security element to transport
       # the bearer token of an an OAuth2 process, which has to 
       # be included inthe HTTP header ist described.
       #
       # WARNING:
       # If you want to use this file for a productive implementation, 
       # it is recommandes to adjust the security schemes according to 
       # your system enviroments and security policies.
       #####################################################
         - {}
         - BearerAuthOAuth: []
     
      parameters:
       #path
         - $ref: "#/components/parameters/paymentService"
         - $ref: "#/components/parameters/paymentProduct"
         - $ref: "#/components/parameters/paymentId"
       #query # NO QUERY PARAMETER
       #header
           #common header parameter
         - $ref: "#/components/parameters/X-Request-ID"
           #header to support the signature function
         - $ref: "#/components/parameters/Digest"
         - $ref: "#/components/parameters/Signature"
         - $ref: "#/components/parameters/TPP-Signature-Certificate"
           #optional additional PSU Information in header
         - $ref: "#/components/parameters/PSU-IP-Address_optional"
         - $ref: "#/components/parameters/PSU-IP-Port"
         - $ref: "#/components/parameters/PSU-Accept"
         - $ref: "#/components/parameters/PSU-Accept-Charset"
         - $ref: "#/components/parameters/PSU-Accept-Encoding"
         - $ref: "#/components/parameters/PSU-Accept-Language"
         - $ref: "#/components/parameters/PSU-User-Agent"
         - $ref: "#/components/parameters/PSU-Http-Method"
         - $ref: "#/components/parameters/PSU-Device-ID"
         - $ref: "#/components/parameters/PSU-Geo-Location"
       #NO REQUEST BODY 
     
      responses:
         '204':
           $ref: "#/components/responses/NO_CONTENT_204_PaymentInitiationCancel" 
           #If the DELETE is sufficient for cancelling the payment
         '202':
           $ref: "#/components/responses/RECEIVED_202_PaymentInitiationCancel" 
           #If the DELETE is not sufficient for cancelling the payment since an authorisation of the cancellation by the PSU is needed.
       
         '400':
           $ref: "#/components/responses/BAD_REQUEST_400_PIS"
         '401':
           $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
         '403':
           $ref: "#/components/responses/FORBIDDEN_403_PIS"
         '404':
           $ref: "#/components/responses/NOT_FOUND_404_PIS"
         '405':
           $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS_CANC"
         '406':
           $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
         '408':
           $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
         '409':
           $ref: "#/components/responses/CONFLICT_409_PIS"
         '415':
           $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
         '429':
           $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
         '500':
           $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
         '503':
           $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"

  /v1.0.8/{payment-service}/{payment-product}/{paymentId}/status:
  
    get:
      summary: Payment initiation status request
      description: Check the transaction status of a payment initiation.
      operationId: getPaymentInitiationStatus
      tags:
        - Payment Initiation Service (PIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/paymentService"
        - $ref: "#/components/parameters/paymentProduct"
        - $ref: "#/components/parameters/paymentId"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Address_optional"
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_PaymentInitiationStatus"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_PIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_PIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_PIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_PIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"
#BOI-REMARK: not supported
  # /v1.0.8/{payment-service}/{payment-product}/{paymentId}/authorisations:

  #   post: 
  #     summary: Start the authorisation process for a payment initiation
  #     description: | 
  #       ### BOI-REMARK : Multilevel SCA Approach does not supported.
  #       Create an authorisation sub-resource and start the authorisation process. 
  #       The message might in addition transmit authentication and authorisation related data. 
        
  #       This method is iterated n times for a n times SCA authorisation in a 
  #       corporate context, each creating an own authorisation sub-endpoint for 
  #       the corresponding PSU authorising the transaction.
        
  #       The ASPSP might make the usage of this access method unnecessary in case 
  #       of only one SCA process needed, since the related authorisation resource 
  #       might be automatically created by the ASPSP after the submission of the 
  #       payment data with the first POST payments/{payment-product} call.
        
  #       The start authorisation process is a process which is needed for creating a new authorisation 
  #       or cancellation sub-resource. 
        
  #       This applies in the following scenarios:
        
  #         * The ASPSP has indicated with an 'startAuthorisation' hyperlink in the preceding Payment 
  #           Initiation Response that an explicit start of the authorisation process is needed by the TPP. 
  #           The 'startAuthorisation' hyperlink can transport more information about data which needs to be 
  #           uploaded by using the extended forms.
  #           * 'startAuthorisationWithPsuIdentfication', 
  #         * The related payment initiation cannot yet be executed since a multilevel SCA is mandated.
  #         * The ASPSP has indicated with an 'startAuthorisation' hyperlink in the preceding 
  #           Payment Cancellation Response that an explicit start of the authorisation process is needed by the TPP. 
  #           The 'startAuthorisation' hyperlink can transport more information about data which needs to be uploaded 
  #           by using the extended forms as indicated above.
  #         * The related payment cancellation request cannot be applied yet since a multilevel SCA is mandate for 
  #           executing the cancellation.
  #         * The signing basket needs to be authorised yet.
  #     operationId: startPaymentAuthorisation
  #     tags: 
  #       - Payment Initiation Service (PIS)
  #       - Common Services
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/paymentService"
  #       - $ref: "#/components/parameters/paymentProduct"
  #       - $ref: "#/components/parameters/paymentId"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #method specific header elements
  #       - $ref: "#/components/parameters/PSU-ID"
  #       - $ref: "#/components/parameters/PSU-ID-Type"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
  #       - $ref: "#/components/parameters/TPP-Redirect-Preferred"
  #       - $ref: "#/components/parameters/TPP-Redirect-URI"
  #       - $ref: "#/components/parameters/TPP-Nok-Redirect-URI"
  #         #conditional for extended service lean Push
  #       - $ref: "#/components/parameters/TPP-Notification-URI"
  #       - $ref: "#/components/parameters/TPP-Notification-Content-Preferred"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"

  #     requestBody:
  #       content: 
  #         application/json:
  #           schema:
  #             oneOf: #Different Authorisation Bodies
  #               - {} 
  #               #BOI-REMARK this object contains just PSU DATA 
  #               #- $ref: "#/components/schemas/updatePsuAuthentication"
  #               - $ref: "#/components/schemas/selectPsuAuthenticationMethod"
  #               - $ref: "#/components/schemas/transactionAuthorisation" 
      
  #     responses:
  #       '201':
  #         $ref: "#/components/responses/CREATED_201_StartScaProcess"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_PIS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_PIS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_PIS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_PIS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"


  #   get:
  #     summary: Get Payment Initiation Authorisation Sub-Resources Request
  #     description: |
  #       Read a list of all authorisation subresources IDs which have been created.
        
  #       This function returns an array of hyperlinks to all generated authorisation sub-resources.
  #     operationId: getPaymentInitiationAuthorisation
  #     tags:
  #       - Payment Initiation Service (PIS)
  #       - Common Services
      
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
      
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/paymentService"
  #       - $ref: "#/components/parameters/paymentProduct"
  #       - $ref: "#/components/parameters/paymentId"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
  #     #NO REQUEST BODY
      
  #     responses:
  #       '200':
  #         $ref: "#/components/responses/OK_200_Authorisations"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_PIS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_PIS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_PIS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_PIS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"

#BOI-REMARK: This sub chapter is optional
  /v1.0.8/{payment-service}/{payment-product}/{paymentId}/authorisations/{authorisationId}:
    
    get:
      summary: Read the SCA Status of the payment authorisation
      description: |
        This method returns the SCA status of a payment initiation's authorisation sub-resource.
      operationId: getPaymentInitiationScaStatus
      tags:
        - Payment Initiation Service (PIS)
        - Common Services
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/paymentService"
        - $ref: "#/components/parameters/paymentProduct"
        - $ref: "#/components/parameters/paymentId"
        - $ref: "#/components/parameters/authorisationId"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Address_mandatory"
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_ScaStatus"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_PIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_PIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_PIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_PIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"

  #   #BOI-REMARK not supported since related to embedded
  #   # put:
  #   #   summary: Update PSU data for payment initiation
  #   #   description: |
  #   #     This methods updates PSU data on the authorisation resource if needed. 
  #   #     It may authorise a payment within the Embedded SCA Approach where needed.
        
  #   #     Independently from the SCA Approach it supports e.g. the selection of 
  #   #     the authentication method and a non-SCA PSU authentication.

  #   #     There are several possible Update PSU Data requests in the context of payment initiation services needed, 
  #   #     which depends on the SCA approach:
        
  #   #     * Redirect SCA Approach:
  #   #       A specific Update PSU Data Request is applicable for 
  #   #         * the selection of authentication methods, before choosing the actual SCA approach.
  #   #     * Decoupled SCA Approach:
  #   #       A specific Update PSU Data Request is only applicable for
  #   #       * adding the PSU Identification, if not provided yet in the Payment Initiation Request or the Account Information Consent Request, or if no OAuth2 access token is used, or
  #   #       * the selection of authentication methods.
  #   #     The SCA Approach might depend on the chosen SCA method. 
  #   #     For that reason, the following possible Update PSU Data request can apply to all SCA approaches:
        
  #   #     * Select an SCA method in case of several SCA methods are available for the customer.
      
  #   #     There are the following request types on this access path:
  #   #       * Update PSU Identification
  #   #       * Update PSU Authentication
  #   #       * Select PSU Autorization Method 
  #   #         WARNING: This method need a reduced header, 
  #   #         therefore many optional elements are not present. 
  #   #         Maybe in a later version the access path will change.
  #   #       * Transaction Authorisation
  #   #         WARNING: This method need a reduced header, 
  #   #         therefore many optional elements are not present. 
  #   #         Maybe in a later version the access path will change.
  #   #   operationId: updatePaymentPsuData
  #   #   tags:
  #   #     - Payment Initiation Service (PIS)
  #   #     - Common Services
      
  #   #   security:
  #   #   ##################################################### 
  #   #   # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #   #   #In this file only the basic security element to transport
  #   #   # the bearer token of an an OAuth2 process, which has to 
  #   #   # be included inthe HTTP header ist described.
  #   #   #
  #   #   # WARNING:
  #   #   # If you want to use this file for a productive implementation, 
  #   #   # it is recommandes to adjust the security schemes according to 
  #   #   # your system enviroments and security policies.
  #   #   #####################################################
  #   #     - {}
  #   #     - BearerAuthOAuth: []
      
  #   #   parameters:
  #   #   #path
  #   #     - $ref: "#/components/parameters/paymentService"
  #   #     - $ref: "#/components/parameters/paymentProduct"
  #   #     - $ref: "#/components/parameters/paymentId"
  #   #     - $ref: "#/components/parameters/authorisationId"
  #   #   #query # NO QUERY PARAMETER
  #   #   #header
  #   #       #common header parameter
  #   #     - $ref: "#/components/parameters/X-Request-ID"
  #   #       #header to support the signature function
  #   #     - $ref: "#/components/parameters/Digest"
  #   #     - $ref: "#/components/parameters/Signature"
  #   #     - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #   #     #method specific header elements # Not always allowed depending on the kind of update which is ask for
  #   #     - $ref: "#/components/parameters/PSU-ID"
  #   #     - $ref: "#/components/parameters/PSU-ID-Type"
  #   #     - $ref: "#/components/parameters/PSU-Corporate-ID"
  #   #     - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
  #   #       #optional additional PSU Information in header
  #   #     - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #   #     - $ref: "#/components/parameters/PSU-IP-Port"
  #   #     - $ref: "#/components/parameters/PSU-Accept"
  #   #     - $ref: "#/components/parameters/PSU-Accept-Charset"
  #   #     - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #   #     - $ref: "#/components/parameters/PSU-Accept-Language"
  #   #     - $ref: "#/components/parameters/PSU-User-Agent"
  #   #     - $ref: "#/components/parameters/PSU-Http-Method"
  #   #     - $ref: "#/components/parameters/PSU-Device-ID"
  #   #     - $ref: "#/components/parameters/PSU-Geo-Location"

  #   #   requestBody:
  #   #     content: 
  #   #       application/json:
  #   #         schema:
  #   #           oneOf: #Different Authorisation Bodies
  #   #             - {}  
  #   #             #BOI-REMARK  not supported
  #   #             # - $ref: "#/components/schemas/updatePsuAuthentication"
  #   #             - $ref: "#/components/schemas/selectPsuAuthenticationMethod"
  #   #             - $ref: "#/components/schemas/transactionAuthorisation" 
  #   #         examples:
  #   #           "Update PSU Identification (Decoupled Approach)":
  #   #             value: {}
  #   #           #BOI-REMARK not supported 
  #   #           # "Update PSU Authentication (Embedded Approach)":
  #   #           #   $ref: "#/components/examples/updatePsuAuthenticationExample_Embedded"
  #   #           # "Select PSU Authentication Method (Embedded Approach)":
  #   #           #   $ref: "#/components/examples/selectPsuAuthenticationMethodExample_Embedded"
  #   #           # "Transaction Authorisation (Embedded Approach)":
  #   #           #   $ref: "#/components/examples/transactionAuthorisationExample_Embedded"
      
  #   #   responses:
  #   #     '200':
  #   #       $ref: "#/components/responses/OK_200_UpdatePsuData"
        
  #   #     '400':
  #   #       $ref: "#/components/responses/BAD_REQUEST_400_PIS"
  #   #     '401':
  #   #       $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
  #   #     '403':
  #   #       $ref: "#/components/responses/FORBIDDEN_403_PIS"
  #   #     '404':
  #   #       $ref: "#/components/responses/NOT_FOUND_404_PIS"
  #   #     '405':
  #   #       $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
  #   #     '406':
  #   #       $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
  #   #     '408':
  #   #       $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
  #   #     '409':
  #   #       $ref: "#/components/responses/CONFLICT_409_PIS"
  #   #     '415':
  #   #       $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
  #   #     '429':
  #   #       $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
  #   #     '500':
  #   #       $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
  #   #     '503':
  #   #       $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"
  
  #BOI-REMARK: not supported

    # /v1.0.8/{payment-service}/{payment-product}/{paymentId}/cancellation-authorisations:

    # post: 
    #   summary: Start the authorisation process for the cancellation of the addressed payment
    #   description: | 
    #     Creates an authorisation sub-resource and start the authorisation process of the cancellation of the addressed payment. 
    #     The message might in addition transmit authentication and authorisation related data.
        
    #     This method is iterated n times for a n times SCA authorisation in a 
    #     corporate context, each creating an own authorisation sub-endpoint for 
    #     the corresponding PSU authorising the cancellation-authorisation.
        
    #     The ASPSP might make the usage of this access method unnecessary in case 
    #     of only one SCA process needed, since the related authorisation resource 
    #     might be automatically created by the ASPSP after the submission of the 
    #     payment data with the first POST payments/{payment-product} call.
        
    #     The start authorisation process is a process which is needed for creating a new authorisation 
    #     or cancellation sub-resource. 
        
    #     This applies in the following scenarios:
        
    #       * The ASPSP has indicated with a 'startAuthorisation' hyperlink in the preceding payment 
    #         initiation response that an explicit start of the authorisation process is needed by the TPP. 
    #         The 'startAuthorisation' hyperlink can transport more information about data which needs to be 
    #         uploaded by using the extended forms:
    #         * 'startAuthorisationWithPsuIdentfication'
    #         * 'startAuthorisationWithPsuAuthentication'
    #         * 'startAuthorisationWithAuthentciationMethodSelection' 
    #       * The related payment initiation cannot yet be executed since a multilevel SCA is mandated.
    #       * The ASPSP has indicated with a 'startAuthorisation' hyperlink in the preceding 
    #         payment cancellation response that an explicit start of the authorisation process is needed by the TPP. 
    #         The 'startAuthorisation' hyperlink can transport more information about data which needs to be uploaded 
    #         by using the extended forms as indicated above.
    #       * The related payment cancellation request cannot be applied yet since a multilevel SCA is mandate for 
    #         executing the cancellation.
    #       * The signing basket needs to be authorised yet.
    #   operationId: startPaymentInitiationCancellationAuthorisation
    #   tags:
    #     - Payment Initiation Service (PIS)
    #     - Common Services
    #   security:
    #   #####################################################
    #   # REMARKS ON SECURITY IN THIS OPENAPI FILE
    #   # In this file only the basic security element to transport
    #   # the bearer token of an OAuth2 process, which has to
    #   # be included in the HTTP header is described.
    #   #
    #   # WARNING:
    #   # If you want to use this file for a productive implementation,
    #   # it is recommended to adjust the security schemes according to
    #   # your system environments and security policies.
    #   #####################################################
    #     - {}
    #     - BearerAuthOAuth: []
    #   parameters:
    #   #path
    #     - $ref: "#/components/parameters/paymentService"
    #     - $ref: "#/components/parameters/paymentProduct"
    #     - $ref: "#/components/parameters/paymentId"
    #   #query # NO QUERY PARAMETER
    #   #header
    #       #common header parameter
    #     - $ref: "#/components/parameters/X-Request-ID"
    #       #header to support the signature function
    #     - $ref: "#/components/parameters/Digest"
    #     - $ref: "#/components/parameters/Signature"
    #     - $ref: "#/components/parameters/TPP-Signature-Certificate"
    #       #method specific header elements
    #     - $ref: "#/components/parameters/PSU-ID"
    #     - $ref: "#/components/parameters/PSU-ID-Type"
    #     - $ref: "#/components/parameters/PSU-Corporate-ID"
    #     - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
    #     - $ref: "#/components/parameters/TPP-Redirect-Preferred"
    #     - $ref: "#/components/parameters/TPP-Redirect-URI"
    #     - $ref: "#/components/parameters/TPP-Nok-Redirect-URI"
    #       #conditional for extended service lean Push
    #     - $ref: "#/components/parameters/TPP-Notification-URI"
    #     - $ref: "#/components/parameters/TPP-Notification-Content-Preferred"
    #       #optional additional PSU Information in header
    #     - $ref: "#/components/parameters/PSU-IP-Address_optional"
    #     - $ref: "#/components/parameters/PSU-IP-Port"
    #     - $ref: "#/components/parameters/PSU-Accept"
    #     - $ref: "#/components/parameters/PSU-Accept-Charset"
    #     - $ref: "#/components/parameters/PSU-Accept-Encoding"
    #     - $ref: "#/components/parameters/PSU-Accept-Language"
    #     - $ref: "#/components/parameters/PSU-User-Agent"
    #     - $ref: "#/components/parameters/PSU-Http-Method"
    #     - $ref: "#/components/parameters/PSU-Device-ID"
    #     - $ref: "#/components/parameters/PSU-Geo-Location"

    #   requestBody:
    #     content:
    #       application/json:
    #         schema:
    #           oneOf: #Different Authorisation Bodies
    #             - {}
    #             - $ref: "#/components/schemas/updatePsuAuthentication"
    #             - $ref: "#/components/schemas/selectPsuAuthenticationMethod"
    #             - $ref: "#/components/schemas/transactionAuthorisation"

    #   responses:
    #     '201':
    #       $ref: "#/components/responses/CREATED_201_StartScaProcess"

    #     '400':
    #       $ref: "#/components/responses/BAD_REQUEST_400_PIS"
    #     '401':
    #       $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
    #     '403':
    #       $ref: "#/components/responses/FORBIDDEN_403_PIS"
    #     '404':
    #       $ref: "#/components/responses/NOT_FOUND_404_PIS"
    #     '405':
    #       $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
    #     '406':
    #       $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
    #     '408':
    #       $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
    #     '409':
    #       $ref: "#/components/responses/CONFLICT_409_PIS"
    #     '415':
    #       $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
    #     '429':
    #       $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
    #     '500':
    #       $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
    #     '503':
    #       $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"


    # get:
    #   summary: Will deliver an array of resource identifications to all generated cancellation authorisation sub-resources
    #   description: |
    #     Retrieve a list of all created cancellation authorisation sub-resources.
    #   operationId: getPaymentInitiationCancellationAuthorisationInformation
    #   tags:
    #     - Payment Initiation Service (PIS)
      
    #   security:
    #   #####################################################
    #   # REMARKS ON SECURITY IN THIS OPENAPI FILE
    #   # In this file only the basic security element to transport
    #   # the bearer token of an OAuth2 process, which has to
    #   # be included in the HTTP header is described.
    #   #
    #   # WARNING:
    #   # If you want to use this file for a productive implementation,
    #   # it is recommended to adjust the security schemes according to
    #   # your system environments and security policies.
    #   #####################################################
    #     - {}
    #     - BearerAuthOAuth: []
      
    #   parameters:
    #   #path
    #     - $ref: "#/components/parameters/paymentService"
    #     - $ref: "#/components/parameters/paymentProduct"
    #     - $ref: "#/components/parameters/paymentId"
    #   #query # NO QUERY PARAMETER
    #   #header
    #       #common header parameter
    #     - $ref: "#/components/parameters/X-Request-ID"
    #       #header to support the signature function
    #     - $ref: "#/components/parameters/Digest"
    #     - $ref: "#/components/parameters/Signature"
    #     - $ref: "#/components/parameters/TPP-Signature-Certificate"
    #       #optional additional PSU Information in header
    #     - $ref: "#/components/parameters/PSU-IP-Address_optional"
    #     - $ref: "#/components/parameters/PSU-IP-Port"
    #     - $ref: "#/components/parameters/PSU-Accept"
    #     - $ref: "#/components/parameters/PSU-Accept-Charset"
    #     - $ref: "#/components/parameters/PSU-Accept-Encoding"
    #     - $ref: "#/components/parameters/PSU-Accept-Language"
    #     - $ref: "#/components/parameters/PSU-User-Agent"
    #     - $ref: "#/components/parameters/PSU-Http-Method"
    #     - $ref: "#/components/parameters/PSU-Device-ID"
    #     - $ref: "#/components/parameters/PSU-Geo-Location"
    #   #NO REQUEST BODY
      
    #   responses:
    #     '200':
    #       $ref: "#/components/responses/OK_200_Authorisations"
        
    #     '400':
    #       $ref: "#/components/responses/BAD_REQUEST_400_PIS"
    #     '401':
    #       $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
    #     '403':
    #       $ref: "#/components/responses/FORBIDDEN_403_PIS"
    #     '404':
    #       $ref: "#/components/responses/NOT_FOUND_404_PIS"
    #     '405':
    #       $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
    #     '406':
    #       $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
    #     '408':
    #       $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
    #     '409':
    #       $ref: "#/components/responses/CONFLICT_409_PIS"
    #     '415':
    #       $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
    #     '429':
    #       $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
    #     '500':
    #       $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
    #     '503':
    #       $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"

#BOI-REMARK: not supported
# /v1.0.8/{payment-service}/{payment-product}/{paymentId}/cancellation-authorisations/{authorisationId}:

  #   get:
  #     summary: Read the SCA status of the payment cancellation's authorisation
  #     description: |
  #       This method returns the SCA status of a payment initiation's authorisation sub-resource.
  #     operationId: getPaymentCancellationScaStatus
  #     tags:
  #       - Payment Initiation Service (PIS)
  #       - Common Services
      
  #     security:
  #     #####################################################
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     # In this file only the basic security element to transport
  #     # the bearer token of an OAuth2 process, which has to 
  #     # be included in the HTTP header is described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation,
  #     # it is recommended to adjust the security schemes according to
  #     # your system environments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
      
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/paymentService"
  #       - $ref: "#/components/parameters/paymentProduct"
  #       - $ref: "#/components/parameters/paymentId"
  #       - $ref: "#/components/parameters/authorisationId"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
  #     #NO REQUEST BODY
      
  #     responses:
  #       '200':
  #         $ref: "#/components/responses/OK_200_ScaStatus"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_PIS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_PIS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_PIS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_PIS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"


  #   put:
  #     summary: Update PSU data for payment initiation cancellation
  #     description: | 
  #       This method updates PSU data on the cancellation authorisation resource if needed. 
  #       It may authorise a cancellation of the payment within the Embedded SCA Approach where needed.
        
  #       Independently from the SCA Approach it supports e.g. the selection of 
  #       the authentication method and a non-SCA PSU authentication.
        
  #       This methods updates PSU data on the cancellation authorisation resource if needed. 

  #       There are several possible update PSU data requests in the context of a cancellation authorisation within the payment initiation services needed, 
  #       which depends on the SCA approach:
        
  #       * Redirect SCA Approach:
  #         A specific Update PSU data request is applicable for 
  #           * the selection of authentication methods, before choosing the actual SCA approach.
  #       * Decoupled SCA Approach:
  #         A specific Update PSU data request is only applicable for
  #         * adding the PSU Identification, if not provided yet in the payment initiation request or the Account Information Consent Request, or if no OAuth2 access token is used, or
  #         * the selection of authentication methods.
  #       * Embedded SCA Approach: 
  #         The Update PSU data request might be used 
  #         * to add credentials as a first factor authentication data of the PSU and
  #         * to select the authentication method and
  #         * transaction authorisation.
      
  #       The SCA approach might depend on the chosen SCA method. 
  #       For that reason, the following possible update PSU data request can apply to all SCA approaches:
        
  #       * Select an SCA method in case of several SCA methods are available for the customer.
      
  #       There are the following request types on this access path:
  #         * Update PSU identification
  #         * Update PSU authentication
  #         * Select PSU autorization method 
  #           WARNING: This method needs a reduced header, 
  #           therefore many optional elements are not present. 
  #           Maybe in a later version the access path will change.
  #         * Transaction Authorisation
  #           WARNING: This method needs a reduced header, 
  #           therefore many optional elements are not present. 
  #           Maybe in a later version the access path will change.
  #     operationId: updatePaymentCancellationPsuData
  #     tags:
  #       - Payment Initiation Service (PIS)
  #       - Common Services
      
  #     security:
  #     #####################################################
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     # In this file only the basic security element to transport
  #     # the bearer token of an OAuth2 process, which has to 
  #     # be included in the HTTP header is described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation,
  #     # it is recommended to adjust the security schemes according to
  #     # your system environments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
      
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/paymentService"
  #       - $ref: "#/components/parameters/paymentProduct"
  #       - $ref: "#/components/parameters/paymentId"
  #       - $ref: "#/components/parameters/authorisationId"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #       #method specific header elements # Not always allowed depending on the kind of update which is ask for
  #       - $ref: "#/components/parameters/PSU-ID"
  #       - $ref: "#/components/parameters/PSU-ID-Type"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
  #     requestBody:
  #       content: 
  #         application/json:
  #           schema:
  #             oneOf: #Different Authorisation Bodies
  #               - {}  
  #               - $ref: "#/components/schemas/updatePsuAuthentication"
  #               - $ref: "#/components/schemas/selectPsuAuthenticationMethod"
  #               - $ref: "#/components/schemas/transactionAuthorisation" 
  #               - $ref: "#/components/schemas/authorisationConfirmation"
  #           examples:
  #             "Update PSU Identification (Embedded Approach)":
  #               value: {}
  #             "Update PSU authentication (Embedded Approach)":
  #               $ref: "#/components/examples/updatePsuAuthenticationExample_Embedded"
  #             "Select PSU Authentication Method (Embedded Approach)":
  #               $ref: "#/components/examples/selectPsuAuthenticationMethodExample_Embedded"
  #             "Transaction Authorisation (Embedded Approach)":
  #               $ref: "#/components/examples/transactionAuthorisationExample_Embedded"
  #             "Authorisation confirmation (Redirect Approach)":
  #               $ref: "#/components/examples/authorisationConfirmationExample_Redirect"
      
  #     responses:
  #       '200':
  #         $ref: "#/components/responses/OK_200_UpdatePsuData"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_PIS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_PIS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_PIS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_PIS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_PIS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIS"


  #####################################################
  # Account Information Service
  #####################################################

      #####################################################
      # Accounts
      #####################################################


  /v1.0.8/accounts:
    get:
      summary: Read Account List
      description: | 
        Read the identifiers of the available payment account together with 
        booking balance information, depending on the consent granted.
        
        It is assumed that a consent of the PSU to this access is already given and stored on the ASPSP system. 
        The addressed list of accounts depends then on the PSU ID and the stored consent addressed by consentId, 
        respectively the OAuth2 access token. 
        
        Returns all identifiers of the accounts, to which an account access has been granted to through 
        the /consents endpoint by the PSU. 
        In addition, relevant information about the accounts and hyperlinks to corresponding account 
        information resources are provided if a related consent has been already granted.
        
        Remark: Note that the /consents endpoint optionally offers to grant an access on all available 
        payment accounts of a PSU. 
        In this case, this endpoint will deliver the information about all available payment accounts 
        of the PSU at this ASPSP.
        
        BOI-REMARK: TPP with PSP_IC role is authorised to much less details about accounts, all attributes that should be filtered are marked on schema AccountDetails.
        
      operationId: getAccountList
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path # NO PATH PARAMETER
      #query
        - $ref: "#/components/parameters/withBalanceQuery"
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
          #conditional elemention for AIS 
          #BOI-REMARK: Mandatory when PSU initiates the service
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
          #BOI-REMARK: Mandatory when PSU initiates the service
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
          #BOI-REMARK: Mandatory when PSU initiates the service
        - $ref: "#/components/parameters/PSU-Device-ID"
          #BOI-REMARK: Conditional when PSU initiates the service
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_AccountList"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"

  /v1.0.8/accounts/{account-id}:
    get:
      summary: Read Account Details
      description: | 
        Reads details about an account, with balances where required. 
        It is assumed that a consent of the PSU to 
        this access is already given and stored on the ASPSP system. 
        The addressed details of this account depends then on the stored consent addressed by consentId, 
        respectively the OAuth2 access token.
        
        **NOTE:** The account-id can represent a multicurrency account. 
        In this case the currency code is set to "XXX".
        
        Give detailed information about the addressed account.
        
        Give detailed information about the addressed account together with balance information
        
        
        BOI-REMARK: TPP with PSP_IC role is authorised to much less details about accounts, all attributes that should be filtered are marked on schema AccountDetails.

      operationId: readAccountDetails
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/accountId"
      #query
        - $ref: "#/components/parameters/withBalanceQuery"
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_AccountDetails"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"

  /v1.0.8/accounts/{account-id}/balances:

    get:
      summary: Read Balance
      description: |
        Reads account data from a given account addressed by "account-id". 
        
        **Remark:** This account-id can be a tokenised identification due to data protection reason since the path 
        information might be logged on intermediary servers within the ASPSP sphere. 
        This account-id then can be retrieved by the "GET Account List" call.
        
        The account-id is constant at least throughout the lifecycle of a given consent.
      operationId: getBalances
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/accountId"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_Balances"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"

  /v1.0.8/accounts/{account-id}/transactions:
    get:
      summary: Read transaction list of an account
      description: |
        Read transaction reports or transaction lists of a given account ddressed by "account-id", depending on the steering parameter 
        "bookingStatus" together with balances.
        
        For a given account, additional parameters are e.g. the attributes "dateFrom" and "dateTo". 
        The ASPSP might add balance information, if transaction lists without balances are not supported.
              
        BOI-REMARK - ASPSP shall choose between responding to read transaction list service in one step to responding in two steps as described below:
        * For 'read transaction list service', conditional attributes - attributes presented to the PSU by the ASPSP through the on-line channels at the current account transaction page.
        * For 'transaction details service' , conditional attribute - attributes presented to the PSU by the ASPSP through the on-line channels, following an added PSU's query (for example - an additional click).
        The implementation option shall be documented in the ASPSP's XS2A interface.
      operationId: getTransactionList
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/accountId"
      #query
        - $ref: "#/components/parameters/dateFrom"
        - $ref: "#/components/parameters/dateTo"
        - $ref: "#/components/parameters/entryReferenceFrom"
        - $ref: "#/components/parameters/bookingStatus"
        - $ref: "#/components/parameters/deltaList"
        - $ref: "#/components/parameters/withBalanceQuery"
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
        #- $ref: "#/components/parameters/Accept" #Can not defined in Open API. See general comments in the description attached to the top level of the file.
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_AccountsTransactions"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


  /v1.0.8/accounts/{account-id}/transactions/{transactionId}: 
    get:
      summary: Read Transaction Details
      description: |
        Reads transaction details from a given transaction addressed by "transactionId" on a given account addressed by "account-id". 
        This call is only available on transactions as reported in a JSON format.
        
        **Remark:** Please note that the PATH might be already given in detail by the corresponding entry of the response of the 
        "Read Transaction List" call within the _links subfield.
      operationId: getTransactionDetails
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/accountId"
        - $ref: "#/components/parameters/transactionId"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_TransactionDetails"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


      #####################################################
      # Card Accounts
      #####################################################
  
  #BOI-REMARK: card account endpoints are optional for all ASPSPs.
  /v1.0.8/card-accounts:
  

    get:
      summary: Reads a list of card accounts
      description: |
        Reads a list of card accounts with additional information, e.g. balance information. 
        It is assumed that a consent of the PSU to this access is already given and stored on the ASPSP system. 
        The addressed list of card accounts depends then on the PSU ID and the stored consent addressed by consentId, 
        respectively the OAuth2 access token. 
        
        
      operationId: getCardAccount 
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path # NO PATH PARAMETER
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODDY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_CardAccountList"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"
      
  /v1.0.8/card-accounts/{account-id}:
    get:
      summary: Reads details about a card account
      description: |
        Reads details about a card account. 
        It is assumed that a consent of the PSU to this access is already given 
        and stored on the ASPSP system. The addressed details of this account depends 
        then on the stored consent addressed by consentId, respectively the OAuth2 
        access token.
      operationId: ReadCardAccount
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/accountId"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODDY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_CardAccountDetails"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


  /v1.0.8/card-accounts/{account-id}/balances:
    get:
      summary: Read card account balances
      description: |
        Reads balance data from a given card account addressed by 
        "account-id". 
        

        Remark: This account-id can be a tokenised identification due 
        to data protection reason since the path information might be 
        logged on intermediary servers within the ASPSP sphere. 
        This account-id then can be retrieved by the 
        "GET Card Account List" call
        
      operationId: getCardAccountBalances
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/accountId"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODDY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_CardAccountBalances"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"



  /v1.0.8/card-accounts/{account-id}/transactions:
    get:
      summary: Read transaction list of an account
      description: |
        Reads account data from a given card account addressed by "account-id".
        ASPSP shall choose between responding to read card transaction list service in one step to responding in two steps as described below-
        * For 'read card transaction list service', conditional attributes - attributes presented to the PSU by the ASPSP through the on-line channels at the card transaction page.
        * For 'card transaction details service' , conditional attribute - attributes presented to the PSU by the ASPSP through the on-line channels, following an added PSU's query (for example - an additional click).
        The implementation option shall be documented in the ASPSP's XS2A interface.
      operationId: getCardAccountTransactionList
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/accountId"
      #query
        - $ref: "#/components/parameters/dateFrom"
        - $ref: "#/components/parameters/dateTo"
        - $ref: "#/components/parameters/entryReferenceFrom"
        - $ref: "#/components/parameters/bookingStatus"
        - $ref: "#/components/parameters/deltaList"
        - $ref: "#/components/parameters/withBalanceQuery"
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
        - $ref: "#/components/parameters/consentId_HEADER_mandatory"
        #- $ref: "#/components/parameters/Accept" #Can not defined in Open API. See general comments in the description attached to the top level of the file.
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_CardAccountsTransactions"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"

      #####################################################
      # Consents
      #####################################################

  /v1.0.8/consents:
    post:
      summary: Create consent
      description: | 
        This method create a consent resource, defining access rights to dedicated accounts of 
        a given PSU-ID. These accounts are addressed explicitly in the method as 
        parameters as a core function.
        
        **Side Effects**
        When this Consent Request is a request where the "recurringIndicator" equals "true", 
        and if it exists already a former consent for recurring access on account information 
        for the addressed PSU, then the former consent automatically expires as soon as the new 
        consent request is authorised by the PSU.
        
        
        BOI-REMARK:
        BOI is differentiating ASPSPs in the role of banks and of credit card processors.
        For banks, the detailed consent will differentiate between payment accounts and card
        accounts- payment accounts are addressed by the IBAN as offered in the generic
        NextGenPSD2 standard. If card related information is also addressed, the TPP shall not use
        PANs of a credit card. The TPP may use the IBAN with the additional cashAccountType
        "CARD". When card related information is addressed the meaning is that the consent is given
        to all credit cards related to the same IBAN.
        For credit card processors, all cards which are to be consented for account information need
        to be addressed by maskedPANs specificlly in the Detailed Consent Model. Credit card
        processors are mandated to offer in addition the Bank Offered Consent Model, i.e. in a first (or follow up) consent request, the TPP can let the PSU choose all cards to be addressed during authorisation on the ASPSP authorisation page. The TPP will retrieve the maskedPANs of all related cards in the GET /card-accounts/… calls.

        Optional Extension:
        As an option, an ASPSP might optionally accept a specific access right on the access on all psd2 related services for all available accounts. 
        
        As another option an ASPSP might optionally also accept a command, where only access rights are inserted without mentioning the addressed account. 
        The relation to accounts is then handled afterwards between PSU and ASPSP. 
        This option is not supported for the Embedded SCA Approach. 
        As a last option, an ASPSP might in addition accept a command with access rights
          * to see the list of available payment accounts or
          * to see the list of available payment accounts with balances.
      operationId: createConsent
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
        #path # NO PATH PARAMETER
        #query # NO QUERY PARAMETER
        #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #method specific header elements
          #BOI-REMARK: Mandatory
        - $ref: "#/components/parameters/PSU-ID"
        - $ref: "#/components/parameters/PSU-ID-Type"
        - $ref: "#/components/parameters/PSU-Corporate-ID"
        - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
        #BOI-REMARK MANDATORY for ASPSP supporting Decouplad SCA approach. 
        - $ref: "#/components/parameters/TPP-Redirect-Preferred"
        #########################################
        #BOI-REMARK: optional
        - $ref: "#/components/parameters/TPP-Redirect-URI"
        - $ref: "#/components/parameters/TPP-Nok-Redirect-URI"
        - $ref: "#/components/parameters/TPP-Explicit-Authorisation-Preferred"
        #########################################
          #conditional for extended service lean Push
        - $ref: "#/components/parameters/TPP-Notification-URI"
        - $ref: "#/components/parameters/TPP-Notification-Content-Preferred"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      
      requestBody:
        $ref: "#/components/requestBodies/consents"
      
      responses:
        '201':
          $ref: "#/components/responses/CREATED_201_Consents"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


  /v1.0.8/consents/{consentId}:

    get:
      summary: Get Consent Request
      description: |
        Returns the content of an account information consent object. 
        This is returning the data for the TPP especially in cases, 
        where the consent was directly managed between ASPSP and PSU e.g. in a re-direct SCA Approach.
      operationId: getConsentInformation
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/consentId_PATH"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_ConsentInformation"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


    delete:
      summary: Delete Consent
      description: The TPP can delete an account information consent object if needed.
      operationId: deleteConsent
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/consentId_PATH"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '204':
          $ref: "#/components/responses/NO_CONTENT_204_Consents"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


  /v1.0.8/consents/{consentId}/status:
    get:
      summary: Consent status request
      description: Read the status of an account information consent resource.
      operationId: getConsentStatus
      tags:
        - Account Information Service (AIS)
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/consentId_PATH"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_ConsentStatus"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


#BOI-REMARK: not supported
  # /v1.0.8/consents/{consentId}/authorisations:
  
    # post:
    #   summary: Start the authorisation process for a consent
    #   description: | 
    #     ### BOI-REMARK : Multilevel SCA Approach does not supported.
    #     Create an authorisation sub-resource and start the authorisation process of a consent. 
    #     The message might in addition transmit authentication and authorisation related data.
        
    #     his method is iterated n times for a n times SCA authorisation in a 
    #     corporate context, each creating an own authorisation sub-endpoint for 
    #     the corresponding PSU authorising the consent.
        
    #     The ASPSP might make the usage of this access method unnecessary, 
    #     since the related authorisation resource will be automatically created by 
    #     the ASPSP after the submission of the consent data with the first POST consents call.
        
    #     The start authorisation process is a process which is needed for creating a new authorisation 
    #     or cancellation sub-resource. 
        
    #     This applies in the following scenarios:
        
    #       * The ASPSP has indicated with an 'startAuthorisation' hyperlink in the preceding Payment 
    #         Initiation Response that an explicit start of the authorisation process is needed by the TPP. 
    #         The 'startAuthorisation' hyperlink can transport more information about data which needs to be 
    #         uploaded by using the extended forms.
    #         * 'startAuthorisationWithPsuIdentfication', 
    #         * 'startAuthorisationWithAuthentciationMethodSelection' 
    #       * The related payment initiation cannot yet be executed since a multilevel SCA is mandated.
    #       * The ASPSP has indicated with an 'startAuthorisation' hyperlink in the preceding 
    #         Payment Cancellation Response that an explicit start of the authorisation process is needed by the TPP. 
    #         The 'startAuthorisation' hyperlink can transport more information about data which needs to be uploaded 
    #         by using the extended forms as indicated above.
    #       * The related payment cancellation request cannot be applied yet since a multilevel SCA is mandate for 
    #         executing the cancellation.
    #       * The signing basket needs to be authorised yet.
    #   operationId: startConsentAuthorisation
    #   tags:
    #     - Account Information Service (AIS)
    #     - Common Services
    #   security:
    #   ##################################################### 
    #   # REMARKS ON SECURITY IN THIS OPENAPI FILE
    #   #In this file only the basic security element to transport
    #   # the bearer token of an an OAuth2 process, which has to 
    #   # be included inthe HTTP header ist described.
    #   #
    #   # WARNING:
    #   # If you want to use this file for a productive implementation, 
    #   # it is recommandes to adjust the security schemes according to 
    #   # your system enviroments and security policies.
    #   #####################################################
    #     - {}
    #     - BearerAuthOAuth: []
    #   parameters:
    #   #path
    #     - $ref: "#/components/parameters/consentId_PATH"
    #   #query # NO QUERY PARAMETER
    #   #header
    #       #common header parameter
    #     - $ref: "#/components/parameters/X-Request-ID"
    #       #header to support the signature function
    #     - $ref: "#/components/parameters/Digest"
    #     - $ref: "#/components/parameters/Signature"
    #     - $ref: "#/components/parameters/TPP-Signature-Certificate"
    #       #method specific header elements
    #     - $ref: "#/components/parameters/PSU-ID"
    #     - $ref: "#/components/parameters/PSU-ID-Type"
    #     - $ref: "#/components/parameters/PSU-Corporate-ID"
    #     - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
    #     - $ref: "#/components/parameters/TPP-Redirect-Preferred"
    #     - $ref: "#/components/parameters/TPP-Redirect-URI"
    #     - $ref: "#/components/parameters/TPP-Nok-Redirect-URI"
    #       #conditional for extended service lean Push
    #     - $ref: "#/components/parameters/TPP-Notification-URI"
    #     - $ref: "#/components/parameters/TPP-Notification-Content-Preferred"
    #       #conditional elemention for AIS
    #     - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
    #       #optional additional PSU Information in header
    #     - $ref: "#/components/parameters/PSU-IP-Port"
    #     - $ref: "#/components/parameters/PSU-Accept"
    #     - $ref: "#/components/parameters/PSU-Accept-Charset"
    #     - $ref: "#/components/parameters/PSU-Accept-Encoding"
    #     - $ref: "#/components/parameters/PSU-Accept-Language"
    #     - $ref: "#/components/parameters/PSU-User-Agent"
    #     - $ref: "#/components/parameters/PSU-Http-Method"
    #     - $ref: "#/components/parameters/PSU-Device-ID"
    #     - $ref: "#/components/parameters/PSU-Geo-Location"

    #   requestBody:
    #     content: 
    #       application/json:
    #         schema:
    #           oneOf: #Different Authorisation Bodies
    #             - {}  
    #             # - $ref: "#/components/schemas/updatePsuAuthentication"
    #             - $ref: "#/components/schemas/selectPsuAuthenticationMethod"
    #             - $ref: "#/components/schemas/transactionAuthorisation" 
      
    #   responses:
    #     '201':
    #       $ref: "#/components/responses/CREATED_201_StartScaProcess"
        
    #     '400':
    #       $ref: "#/components/responses/BAD_REQUEST_400_AIS"
    #     '401':
    #       $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
    #     '403':
    #       $ref: "#/components/responses/FORBIDDEN_403_AIS"
    #     '404':
    #       $ref: "#/components/responses/NOT_FOUND_404_AIS"
    #     '405':
    #       $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
    #     '406':
    #       $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
    #     '408':
    #       $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
    #     '409':
    #       $ref: "#/components/responses/CONFLICT_409_AIS"
    #     '415':
    #       $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
    #     '429':
    #       $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
    #     '500':
    #       $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
    #     '503':
    #       $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


    # get:
    #   summary: Get Consent Authorisation Sub-Resources Request
    #   description: |
    #     Return a list of all authorisation subresources IDs which have been created.
        
    #     This function returns an array of hyperlinks to all generated authorisation sub-resources.
    #   operationId: getConsentAuthorisation
    #   tags:
    #     - Account Information Service (AIS)
      
    #   security:
    #   ##################################################### 
    #   # REMARKS ON SECURITY IN THIS OPENAPI FILE
    #   #In this file only the basic security element to transport
    #   # the bearer token of an an OAuth2 process, which has to 
    #   # be included inthe HTTP header ist described.
    #   #
    #   # WARNING:
    #   # If you want to use this file for a productive implementation, 
    #   # it is recommandes to adjust the security schemes according to 
    #   # your system enviroments and security policies.
    #   #####################################################
    #     - {}
    #     - BearerAuthOAuth: []
      
    #   parameters:
    #   #path
    #     - $ref: "#/components/parameters/consentId_PATH"
    #   #query # NO QUERY PARAMETER
    #   #header
    #       #common header parameter
    #     - $ref: "#/components/parameters/X-Request-ID"
    #       #header to support the signature function
    #     - $ref: "#/components/parameters/Digest"
    #     - $ref: "#/components/parameters/Signature"
    #     - $ref: "#/components/parameters/TPP-Signature-Certificate"
    #       #conditional elemention for AIS
    #     - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
    #       #optional additional PSU Information in header
    #     - $ref: "#/components/parameters/PSU-IP-Port"
    #     - $ref: "#/components/parameters/PSU-Accept"
    #     - $ref: "#/components/parameters/PSU-Accept-Charset"
    #     - $ref: "#/components/parameters/PSU-Accept-Encoding"
    #     - $ref: "#/components/parameters/PSU-Accept-Language"
    #     - $ref: "#/components/parameters/PSU-User-Agent"
    #     - $ref: "#/components/parameters/PSU-Http-Method"
    #     - $ref: "#/components/parameters/PSU-Device-ID"
    #     - $ref: "#/components/parameters/PSU-Geo-Location"
    #   #NO REQUEST BODY
      
    #   responses:
    #     '200':
    #       $ref: "#/components/responses/OK_200_Authorisations"
        
    #     '400':
    #       $ref: "#/components/responses/BAD_REQUEST_400_AIS"
    #     '401':
    #       $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
    #     '403':
    #       $ref: "#/components/responses/FORBIDDEN_403_AIS"
    #     '404':
    #       $ref: "#/components/responses/NOT_FOUND_404_AIS"
    #     '405':
    #       $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
    #     '406':
    #       $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
    #     '408':
    #       $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
    #     '409':
    #       $ref: "#/components/responses/CONFLICT_409_AIS"
    #     '415':
    #       $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
    #     '429':
    #       $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
    #     '500':
    #       $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
    #     '503':
    #       $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


  /v1.0.8/consents/{consentId}/authorisations/{authorisationId}:

    get:
      summary: Read the SCA status of the consent authorisation.
      description: |
        This method returns the SCA status of a consent initiation's authorisation sub-resource.
      operationId: getConsentScaStatus
      tags:
        - Account Information Service (AIS)
        - Common Services
      
      security:
      ##################################################### 
      # REMARKS ON SECURITY IN THIS OPENAPI FILE
      #In this file only the basic security element to transport
      # the bearer token of an an OAuth2 process, which has to 
      # be included inthe HTTP header ist described.
      #
      # WARNING:
      # If you want to use this file for a productive implementation, 
      # it is recommandes to adjust the security schemes according to 
      # your system enviroments and security policies.
      #####################################################
        - {}
        - BearerAuthOAuth: []
      
      parameters:
      #path
        - $ref: "#/components/parameters/consentId_PATH"
        - $ref: "#/components/parameters/authorisationId"
      #query # NO QUERY PARAMETER
      #header
          #common header parameter
        - $ref: "#/components/parameters/X-Request-ID"
          #header to support the signature function
        - $ref: "#/components/parameters/Digest"
        - $ref: "#/components/parameters/Signature"
        - $ref: "#/components/parameters/TPP-Signature-Certificate"
          #conditional elemention for AIS
        - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
          #optional additional PSU Information in header
        - $ref: "#/components/parameters/PSU-IP-Port"
        - $ref: "#/components/parameters/PSU-Accept"
        - $ref: "#/components/parameters/PSU-Accept-Charset"
        - $ref: "#/components/parameters/PSU-Accept-Encoding"
        - $ref: "#/components/parameters/PSU-Accept-Language"
        - $ref: "#/components/parameters/PSU-User-Agent"
        - $ref: "#/components/parameters/PSU-Http-Method"
        - $ref: "#/components/parameters/PSU-Device-ID"
        - $ref: "#/components/parameters/PSU-Geo-Location"
      #NO REQUEST BODY
      
      responses:
        '200':
          $ref: "#/components/responses/OK_200_ScaStatus"
        
        '400':
          $ref: "#/components/responses/BAD_REQUEST_400_AIS"
        '401':
          $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
        '403':
          $ref: "#/components/responses/FORBIDDEN_403_AIS"
        '404':
          $ref: "#/components/responses/NOT_FOUND_404_AIS"
        '405':
          $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
        '406':
          $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
        '408':
          $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
        '409':
          $ref: "#/components/responses/CONFLICT_409_AIS"
        '415':
          $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
        '429':
          $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
        '500':
          $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
        '503':
          $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"

    #BOI-REMARK not supported since related to embedded
    # put:
    #   summary: Update PSU Data for consents
    #   description: |  
    #     This method update PSU data on the consents  resource if needed. 
    #     It may authorise a consent within the Embedded SCA Approach where needed.
        
    #     Independently from the SCA Approach it supports e.g. the selection of 
    #     the authentication method and a non-SCA PSU authentication.
        
    #     This methods updates PSU data on the cancellation authorisation resource if needed. 

    #     There are several possible Update PSU Data requests in the context of a consent request if needed, 
    #     which depends on the SCA approach:
        
    #     * Redirect SCA Approach:
    #       A specific Update PSU Data Request is applicable for 
    #         * the selection of authentication methods, before choosing the actual SCA approach.
    #     * Decoupled SCA Approach:
    #       A specific Update PSU Data Request is only applicable for
    #       * adding the PSU Identification, if not provided yet in the Payment Initiation Request or the Account Information Consent Request, or if no OAuth2 access token is used, or
    #       * the selection of authentication methods.
    #     #BOI-REMARK EMBEDDED is forbidden in the Israeli market
    #     #* Embedded SCA Approach: 
    #     #  The Update PSU Data Request might be used 
    #     #  * to add credentials as a first factor authentication data of the PSU and
    #     #  * to select the authentication method and
    #     #  * transaction authorisation.
      
    #     The SCA Approach might depend on the chosen SCA method. 
    #     For that reason, the following possible Update PSU Data request can apply to all SCA approaches:
        
    #     * Select an SCA method in case of several SCA methods are available for the customer.
      
    #     There are the following request types on this access path:
    #       * Update PSU Identification
    #       #BOI-REMARK dos not supported
    #       # * Update PSU Authentication
    #       * Select PSU Autorization Method 
    #         WARNING: This method need a reduced header, 
    #         therefore many optional elements are not present. 
    #         Maybe in a later version the access path will change.
    #       #BOI-REMARK not supported
    #       # * Transaction Authorisation
    #       #   WARNING: This method need a reduced header, 
    #       #   therefore many optional elements are not present. 
    #       #   Maybe in a later version the access path will change.
    #   operationId: updateConsentsPsuData
    #   tags:
    #     - Account Information Service (AIS)
    #     - Common Services
      
    #   security:
    #   ##################################################### 
    #   # REMARKS ON SECURITY IN THIS OPENAPI FILE
    #   #In this file only the basic security element to transport
    #   # the bearer token of an an OAuth2 process, which has to 
    #   # be included inthe HTTP header ist described.
    #   #
    #   # WARNING:
    #   # If you want to use this file for a productive implementation, 
    #   # it is recommandes to adjust the security schemes according to 
    #   # your system enviroments and security policies.
    #   #####################################################
    #     - {}
    #     - BearerAuthOAuth: []
      
    #   parameters:
    #   #query # NO QUERY PARAMETER
    #   #header
    #   #path
    #     - $ref: "#/components/parameters/consentId_PATH"
    #     - $ref: "#/components/parameters/authorisationId"
    #       #common header parameter
    #     - $ref: "#/components/parameters/X-Request-ID"
    #       #header to support the signature function
    #     - $ref: "#/components/parameters/Digest"
    #     - $ref: "#/components/parameters/Signature"
    #     - $ref: "#/components/parameters/TPP-Signature-Certificate"
    #     #method specific header elements # Not always allowed depending on the kind of update which is ask for
    #     - $ref: "#/components/parameters/PSU-ID"
    #     - $ref: "#/components/parameters/PSU-ID-Type"
    #     - $ref: "#/components/parameters/PSU-Corporate-ID"
    #     - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
    #       #conditional elemention for AIS
    #     - $ref: "#/components/parameters/PSU-IP-Address_conditionalForAis"
    #       #optional additional PSU Information in header
    #     - $ref: "#/components/parameters/PSU-IP-Port"
    #     - $ref: "#/components/parameters/PSU-Accept"
    #     - $ref: "#/components/parameters/PSU-Accept-Charset"
    #     - $ref: "#/components/parameters/PSU-Accept-Encoding"
    #     - $ref: "#/components/parameters/PSU-Accept-Language"
    #     - $ref: "#/components/parameters/PSU-User-Agent"
    #     - $ref: "#/components/parameters/PSU-Http-Method"
    #     - $ref: "#/components/parameters/PSU-Device-ID"
    #     - $ref: "#/components/parameters/PSU-Geo-Location"
      
    #   requestBody:
    #     content: 
    #       application/json:
    #         schema:
    #           oneOf: #Different Authorisation Bodies
    #             - {} 
    #             #BOI-REMARK not supported
    #             # - $ref: "#/components/schemas/updatePsuAuthentication"
    #             - $ref: "#/components/schemas/selectPsuAuthenticationMethod"
    #             - $ref: "#/components/schemas/transactionAuthorisation" 
    #         examples:
    #           #BOI-REMARK EMbedded does not supported
    #           # "Update PSU Identification/Additional SCA Process (Embedded Approach)":
    #             value: {}
    #           # "Update PSU Authentication (Embedded Approach)":
    #           #   $ref: "#/components/examples/updatePsuAuthenticationExample_Embedded"
    #           # "Select PSU Authentication Method (Embedded Approach)":
    #           #   $ref: "#/components/examples/selectPsuAuthenticationMethodExample_Embedded"
    #           # "Transaction Authorisation (Embedded Approach)":
    #           #   $ref: "#/components/examples/transactionAuthorisationExample_Embedded"
      
    #   responses:
    #     '200':
    #       $ref: "#/components/responses/OK_200_UpdatePsuData"
          
    #     '400':
    #       $ref: "#/components/responses/BAD_REQUEST_400_AIS"
    #     '401':
    #       $ref: "#/components/responses/UNAUTHORIZED_401_AIS"
    #     '403':
    #       $ref: "#/components/responses/FORBIDDEN_403_AIS"
    #     '404':
    #       $ref: "#/components/responses/NOT_FOUND_404_AIS"
    #     '405':
    #       $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_AIS"
    #     '406':
    #       $ref: "#/components/responses/NOT_ACCEPTABLE_406_AIS"
    #     '408':
    #       $ref: "#/components/responses/REQUEST_TIMEOUT_408_AIS"
    #     '409':
    #       $ref: "#/components/responses/CONFLICT_409_AIS"
    #     '415':
    #       $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_AIS"
    #     '429':
    #       $ref: "#/components/responses/TOO_MANY_REQUESTS_429_AIS"
    #     '500':
    #       $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_AIS"
    #     '503':
    #       $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_AIS"


  #BOI-REMARK- FUNDS CONFIRMATION- NOT YET SUPPORTED
  #####################################################
  # Funds Confirmation Service
  #####################################################

  # /v1.0.8/funds-confirmations: 
  #   post:
  #     summary: Confirmation of Funds Request
  #     description: 
  #       Creates a confirmation of funds request at the ASPSP.
  #       Checks whether a specific amount is available at point of time 
  #       of the request on an account linked to a given tuple card issuer(TPP)/card number, 
  #       or addressed by IBAN and TPP respectively.
        
  #       If the related extended services are used a conditional Consent-ID is contained in the header. 
  #       This field is contained but commented out in this specification.
  #     operationId: checkAvailabilityOfFunds
  #     tags:
  #       - Confirmation of Funds Service (PIIS)
      
  #     parameters:
  #     #path # NO PATH PARAMETER
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #method specific header elements
  #       #- $ref: "#/components/parameters/consentId_HEADER_optional" # Consent-Id for usage of extended services
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
      
  #     requestBody:
  #       $ref: "#/components/requestBodies/confirmationOfFunds"
      
  #     responses:
  #       '200':
  #         $ref: "#/components/responses/OK_200_ConfirmationOfFunds"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_PIIS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_PIIS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_PIIS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_PIIS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_PIIS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_PIIS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_PIIS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_PIIS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_PIIS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_PIIS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_PIIS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_PIIS"

  
  #BOI-REMARK- SIGNING BASKET- NOT YET SUPPORTED
  #####################################################
  # Signing Basket
  #####################################################

  # /v1.0.8/signing-baskets:

  #   post:
  #     summary: Create a signing basket resource
  #     description: |
  #       Create a signing basket resource for authorising several transactions with one SCA method. 
  #       The resource identifications of these transactions are contained in the  payload of this access method
  #     operationId: createSigningBasket
  #     tags:
  #       - Signing Baskets (SBS)
        
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
      
  #     parameters:
  #       #path # NO PATH PARAMETER
  #       #query # NO QUERY PARAMETER
  #       #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #method specific header elements
  #       - $ref: "#/components/parameters/PSU-ID"
  #       - $ref: "#/components/parameters/PSU-ID-Type"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
  #       - $ref: "#/components/parameters/consentId_HEADER_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Address_mandatory"
  #       - $ref: "#/components/parameters/TPP-Redirect-Preferred"
  #       - $ref: "#/components/parameters/TPP-Redirect-URI"
  #       - $ref: "#/components/parameters/TPP-Nok-Redirect-URI"
  #       - $ref: "#/components/parameters/TPP-Explicit-Authorisation-Preferred"
  #         #conditional for extended service lean Push
  #       - $ref: "#/components/parameters/TPP-Notification-URI"
  #       - $ref: "#/components/parameters/TPP-Notification-Content-Preferred"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
      
  #     requestBody:
  #       $ref: "#/components/requestBodies/signingBasket"
      
  #     responses:
  #       '201':
  #         $ref: "#/components/responses/CREATED_201_SigningBasket"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_SBS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_SBS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_SBS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_SBS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_SBS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_SBS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_SBS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_SBS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_SBS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_SBS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_SBS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_SBS"


  # /v1.0.8/signing-baskets/{basketId}:

  #   get:
  #     summary: Returns the content of an signing basket object. 
  #     description: 
  #       Returns the content of an signing basket object. 
  #     operationId: getSigningBasket
  #     tags:
  #       - Signing Baskets (SBS)
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
  #     parameters:
  #       #path # NO PATH PARAMETER
  #       - $ref: "#/components/parameters/basketId_PATH"
  #       #query # NO QUERY PARAMETER
  #       #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
  #       #NO REQUEST BODY 
      
  #     responses:
  #       '200':
  #         $ref: "#/components/responses/OK_200_GetSigningBasket"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_SBS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_SBS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_SBS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_SBS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_SBS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_SBS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_SBS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_SBS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_SBS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_SBS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_SBS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_SBS"

  #   delete:
  #     summary: Delete the signing basket
  #     description: |
  #       Delete the signing basket structure as long as no (partial) authorisation has yet been applied. 
  #       The undlerying transactions are not affected by this deletion.
        
  #       Remark: The signing basket as such is not deletable after a first (partial) authorisation has been applied. 
  #       Nevertheless, single transactions might be cancelled on an individual basis on the XS2A interface.
  #     operationId: deleteSigningBasket
  #     tags:
  #       - Signing Baskets (SBS)
  #       - Common Services
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/basketId_PATH"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
  #     #NO REQUEST BODY
      
  #     responses:
  #       '204':
  #         $ref: "#/components/responses/NO_CONTENT_204_SigningBasket"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_SBS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_SBS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_SBS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_SBS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_SBS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_SBS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_SBS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_SBS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_SBS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_SBS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_SBS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_SBS"


  # /v1.0.8/signing-baskets/{basketId}/status:
  
  #   get:
  #     summary: Read the status of the signing basket
  #     description: |
  #       Returns the status of a signing basket object. 
  #     operationId: getSigningBasketStatus
  #     tags:
  #       - Signing Baskets (SBS)
  #       - Common Services
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/basketId_PATH"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #method specific header elements
  #       - $ref: "#/components/parameters/PSU-ID"
  #       - $ref: "#/components/parameters/PSU-ID-Type"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
  #     #NO REQUEST BODY
      
  #     responses:
  #       '200':
  #         $ref: "#/components/responses/OK_200_SigningBasketStatus"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_SBS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_SBS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_SBS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_SBS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_SBS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_SBS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_SBS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_SBS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_SBS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_SBS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_SBS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_SBS"


  # /v1.0.8/signing-baskets/{basketId}/authorisations:

  #   post:
  #     summary: Start the authorisation process for a signing basket
  #     description: | 
  #       ### BOI-REMARK : Multilevel SCA Approach does not supported.
  #       Create an authorisation sub-resource and start the authorisation process of a signing basket. 
  #       The message might in addition transmit authentication and authorisation related data.
        
  #       This method is iterated n times for a n times SCA authorisation in a 
  #       corporate context, each creating an own authorisation sub-endpoint for 
  #       the corresponding PSU authorising the signing-baskets.
        
  #       The ASPSP might make the usage of this access method unnecessary in case 
  #       of only one SCA process needed, since the related authorisation resource 
  #       might be automatically created by the ASPSP after the submission of the 
  #       payment data with the first POST signing basket call.
        
  #       The start authorisation process is a process which is needed for creating a new authorisation 
  #       or cancellation sub-resource. 
        
  #       This applies in the following scenarios:
        
  #         * The ASPSP has indicated with an 'startAuthorisation' hyperlink in the preceding Payment 
  #           Initiation Response that an explicit start of the authorisation process is needed by the TPP. 
  #           The 'startAuthorisation' hyperlink can transport more information about data which needs to be 
  #           uploaded by using the extended forms.
  #           * 'startAuthorisationWithPsuIdentfication', 
  #           * 'startAuthorisationWithAuthentciationMethodSelection' 
  #         * The related payment initiation cannot yet be executed since a multilevel SCA is mandated.
  #         * The ASPSP has indicated with an 'startAuthorisation' hyperlink in the preceding 
  #           Payment Cancellation Response that an explicit start of the authorisation process is needed by the TPP. 
  #           The 'startAuthorisation' hyperlink can transport more information about data which needs to be uploaded 
  #           by using the extended forms as indicated above.
  #         * The related payment cancellation request cannot be applied yet since a multilevel SCA is mandate for 
  #           executing the cancellation.
  #         * The signing basket needs to be authorised yet.
  #     operationId: startSigningBasketAuthorisation
  #     tags:
  #       - Signing Baskets (SBS)
  #       - Common Services
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/basketId_PATH"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #method specific header elements
  #       - $ref: "#/components/parameters/PSU-ID"
  #       - $ref: "#/components/parameters/PSU-ID-Type"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID"
  #       - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
  #       - $ref: "#/components/parameters/TPP-Redirect-Preferred"
  #       - $ref: "#/components/parameters/TPP-Redirect-URI"
  #       - $ref: "#/components/parameters/TPP-Nok-Redirect-URI"
  #         #conditional for extended service lean Push
  #       - $ref: "#/components/parameters/TPP-Notification-URI"
  #       - $ref: "#/components/parameters/TPP-Notification-Content-Preferred"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"

  #     requestBody:
  #       content: 
  #         application/json:
  #           schema:
  #             oneOf: #Different Authorisation Bodies
  #               - {}  
  #               #BOI-REMARK not supported
  #               # - $ref: "#/components/schemas/updatePsuAuthentication"
  #               - $ref: "#/components/schemas/selectPsuAuthenticationMethod"
  #               - $ref: "#/components/schemas/transactionAuthorisation" 
      
  #     responses:
  #       '201':
  #         $ref: "#/components/responses/CREATED_201_StartScaProcess"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_SBS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_SBS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_SBS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_SBS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_SBS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_SBS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_SBS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_SBS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_SBS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_SBS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_SBS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_SBS"


  #   get:
  #     summary: Get Signing Basket Authorisation Sub-Resources Request
  #     description: |
  #       Read a list of all authorisation subresources IDs which have been created.
        
  #       This function returns an array of hyperlinks to all generated authorisation sub-resources.
  #     operationId: getSigningBasketAuthorisation
  #     tags:
  #       - Signing Baskets (SBS)
  #       - Common Services
      
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
      
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/basketId_PATH"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
  #     #NO REQUEST BODY
      
  #     responses:
  #       '200':
  #         $ref: "#/components/responses/OK_200_Authorisations"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_SBS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_SBS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_SBS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_SBS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_SBS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_SBS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_SBS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_SBS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_SBS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_SBS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_SBS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_SBS"


  # /v1.0.8/signing-baskets/{basketId}/authorisations/{authorisationId}:

  #   #BOI-REMARK not supported since related to embedded
  #   # put:
  #   #   summary: Update PSU Data for signing basket
  #   #   description: | 
  #   #     This method update PSU data on the signing basket resource if needed. 
  #   #     It may authorise a igning basket within the Embedded SCA Approach where needed.
        
  #   #     Independently from the SCA Approach it supports e.g. the selection of 
  #   #     the authentication method and a non-SCA PSU authentication.
        
  #   #     This methods updates PSU data on the cancellation authorisation resource if needed. 

  #   #     There are several possible Update PSU Data requests in the context of a consent request if needed, 
  #   #     which depends on the SCA approach:
        
  #   #     * Redirect SCA Approach:
  #   #       A specific Update PSU Data Request is applicable for 
  #   #         * the selection of authentication methods, before choosing the actual SCA approach.
  #   #     * Decoupled SCA Approach:
  #   #       A specific Update PSU Data Request is only applicable for
  #   #       * adding the PSU Identification, if not provided yet in the Payment Initiation Request or the Account Information Consent Request, or if no OAuth2 access token is used, or
  #   #       * the selection of authentication methods.
      
  #   #     The SCA Approach might depend on the chosen SCA method. 
  #   #     For that reason, the following possible Update PSU Data request can apply to all SCA approaches:
        
  #   #     * Select an SCA method in case of several SCA methods are available for the customer.
      
  #   #     There are the following request types on this access path:
  #   #       * Update PSU Identification
  #   #       * Update PSU Authentication
  #   #       * Select PSU Autorization Method 
  #   #         WARNING: This method need a reduced header, 
  #   #         therefore many optional elements are not present. 
  #   #         Maybe in a later version the access path will change.
  #   #       * Transaction Authorisation
  #   #         WARNING: This method need a reduced header, 
  #   #         therefore many optional elements are not present. 
  #   #         Maybe in a later version the access path will change.
  #   #   operationId: updateSigningBasketPsuData
  #   #   tags:
  #   #     - Signing Baskets (SBS)
  #   #     - Common Services
      
  #   #   security:
  #   #   ##################################################### 
  #   #   # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #   #   #In this file only the basic security element to transport
  #   #   # the bearer token of an an OAuth2 process, which has to 
  #   #   # be included inthe HTTP header ist described.
  #   #   #
  #   #   # WARNING:
  #   #   # If you want to use this file for a productive implementation, 
  #   #   # it is recommandes to adjust the security schemes according to 
  #   #   # your system enviroments and security policies.
  #   #   #####################################################
  #   #     - {}
  #   #     - BearerAuthOAuth: []
      
  #   #   parameters:
  #   #   #path
  #   #     - $ref: "#/components/parameters/basketId_PATH"
  #   #     - $ref: "#/components/parameters/authorisationId"
  #   #   #query # NO QUERY PARAMETER
  #   #   #header
  #   #       #common header parameter
  #   #     - $ref: "#/components/parameters/X-Request-ID"
  #   #       #header to support the signature function
  #   #     - $ref: "#/components/parameters/Digest"
  #   #     - $ref: "#/components/parameters/Signature"
  #   #     - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #   #     #method specific header elements # Not always allowed depending on the kind of update which is ask for
  #   #     - $ref: "#/components/parameters/PSU-ID"
  #   #     - $ref: "#/components/parameters/PSU-ID-Type"
  #   #     - $ref: "#/components/parameters/PSU-Corporate-ID"
  #   #     - $ref: "#/components/parameters/PSU-Corporate-ID-Type"
  #   #       #optional additional PSU Information in header
  #   #     - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #   #     - $ref: "#/components/parameters/PSU-IP-Port"
  #   #     - $ref: "#/components/parameters/PSU-Accept"
  #   #     - $ref: "#/components/parameters/PSU-Accept-Charset"
  #   #     - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #   #     - $ref: "#/components/parameters/PSU-Accept-Language"
  #   #     - $ref: "#/components/parameters/PSU-User-Agent"
  #   #     - $ref: "#/components/parameters/PSU-Http-Method"
  #   #     - $ref: "#/components/parameters/PSU-Device-ID"
  #   #     - $ref: "#/components/parameters/PSU-Geo-Location"
      
  #   #   requestBody:
  #   #     content: 
  #   #       application/json:
  #   #         schema:
  #   #           oneOf: #Different Authorisation Bodies
  #   #             - {}  
  #   #             #BOI-REMARK not supported
  #   #             # - $ref: "#/components/schemas/updatePsuAuthentication"
  #   #             - $ref: "#/components/schemas/selectPsuAuthenticationMethod"
  #   #             - $ref: "#/components/schemas/transactionAuthorisation" 
 
  #   #         examples: 
  #   #         #BOI-REMARK not supported
  #   #           # "Update PSU Identification (Embedded Approach)":
  #   #             value: {}
  #   #           # "Update PSU Authentication (Embedded Approach)":
  #   #           #   $ref: "#/components/examples/updatePsuAuthenticationExample_Embedded"
  #   #           # "Select PSU Authentication Method (Embedded Approach)":
  #   #           #   $ref: "#/components/examples/selectPsuAuthenticationMethodExample_Embedded"
  #   #           # "Transaction Authorisation (Embedded Approach)":
  #   #           #   $ref: "#/components/examples/transactionAuthorisationExample_Embedded"
      
  #   #   responses:
  #   #     '200':
  #   #       $ref: "#/components/responses/OK_200_UpdatePsuData"
          
  #   #     '400':
  #   #       $ref: "#/components/responses/BAD_REQUEST_400_SBS"
  #   #     '401':
  #   #       $ref: "#/components/responses/UNAUTHORIZED_401_SBS"
  #   #     '403':
  #   #       $ref: "#/components/responses/FORBIDDEN_403_SBS"
  #   #     '404':
  #   #       $ref: "#/components/responses/NOT_FOUND_404_SBS"
  #   #     '405':
  #   #       $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_SBS"
  #   #     '406':
  #   #       $ref: "#/components/responses/NOT_ACCEPTABLE_406_SBS"
  #   #     '408':
  #   #       $ref: "#/components/responses/REQUEST_TIMEOUT_408_SBS"
  #   #     '409':
  #   #       $ref: "#/components/responses/CONFLICT_409_SBS"
  #   #     '415':
  #   #       $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_SBS"
  #   #     '429':
  #   #       $ref: "#/components/responses/TOO_MANY_REQUESTS_429_SBS"
  #   #     '500':
  #   #       $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_SBS"
  #   #     '503':
  #   #       $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_SBS"


  #   get:
  #     summary: Read the SCA status of the signing basket authorisation
  #     description: |
  #       This method returns the SCA status of a signing basket's authorisation sub-resource.
  #     operationId: getSigningBasketScaStatus
  #     tags:
  #       - Signing Baskets (SBS)
  #       - Common Services
      
  #     security:
  #     ##################################################### 
  #     # REMARKS ON SECURITY IN THIS OPENAPI FILE
  #     #In this file only the basic security element to transport
  #     # the bearer token of an an OAuth2 process, which has to 
  #     # be included inthe HTTP header ist described.
  #     #
  #     # WARNING:
  #     # If you want to use this file for a productive implementation, 
  #     # it is recommandes to adjust the security schemes according to 
  #     # your system enviroments and security policies.
  #     #####################################################
  #       - {}
  #       - BearerAuthOAuth: []
      
  #     parameters:
  #     #path
  #       - $ref: "#/components/parameters/basketId_PATH"
  #       - $ref: "#/components/parameters/authorisationId"
  #     #query # NO QUERY PARAMETER
  #     #header
  #         #common header parameter
  #       - $ref: "#/components/parameters/X-Request-ID"
  #         #header to support the signature function
  #       - $ref: "#/components/parameters/Digest"
  #       - $ref: "#/components/parameters/Signature"
  #       - $ref: "#/components/parameters/TPP-Signature-Certificate"
  #         #optional additional PSU Information in header
  #       - $ref: "#/components/parameters/PSU-IP-Address_optional"
  #       - $ref: "#/components/parameters/PSU-IP-Port"
  #       - $ref: "#/components/parameters/PSU-Accept"
  #       - $ref: "#/components/parameters/PSU-Accept-Charset"
  #       - $ref: "#/components/parameters/PSU-Accept-Encoding"
  #       - $ref: "#/components/parameters/PSU-Accept-Language"
  #       - $ref: "#/components/parameters/PSU-User-Agent"
  #       - $ref: "#/components/parameters/PSU-Http-Method"
  #       - $ref: "#/components/parameters/PSU-Device-ID"
  #       - $ref: "#/components/parameters/PSU-Geo-Location"
  #     #NO REQUEST BODY
      
  #     responses:
  #       '200':
  #         $ref: "#/components/responses/OK_200_ScaStatus"
        
  #       '400':
  #         $ref: "#/components/responses/BAD_REQUEST_400_SBS"
  #       '401':
  #         $ref: "#/components/responses/UNAUTHORIZED_401_SBS"
  #       '403':
  #         $ref: "#/components/responses/FORBIDDEN_403_SBS"
  #       '404':
  #         $ref: "#/components/responses/NOT_FOUND_404_SBS"
  #       '405':
  #         $ref: "#/components/responses/METHOD_NOT_ALLOWED_405_SBS"
  #       '406':
  #         $ref: "#/components/responses/NOT_ACCEPTABLE_406_SBS"
  #       '408':
  #         $ref: "#/components/responses/REQUEST_TIMEOUT_408_SBS"
  #       '409':
  #         $ref: "#/components/responses/CONFLICT_409_SBS"
  #       '415':
  #         $ref: "#/components/responses/UNSUPPORTED_MEDIA_TYPE_415_SBS"
  #       '429':
  #         $ref: "#/components/responses/TOO_MANY_REQUESTS_429_SBS"
  #       '500':
  #         $ref: "#/components/responses/INTERNAL_SERVER_ERROR_500_SBS"
  #       '503':
  #         $ref: "#/components/responses/SERVICE_UNAVAILABLE_503_SBS"

components:
#####################################################
# Predefined Components
#####################################################

  securitySchemes:
  #####################################################
  # Predefined Security Schemes:
  #
  # In this file only the basic security element to transport
  # the bearer token of an an OAuth2 process, which has to 
  # be included inthe HTTP header ist described.
  #
  # WARNING:
  # If you want to use this file for a productive implementation, 
  # it is recommandes to adjust the security schemes according to 
  # your system enviroments and security policies.
  #####################################################
    BearerAuthOAuth:
      description: |
        Bearer Token. 
        
        Is contained only, if an OAuth2 based authentication was performed in a pre-step or 
        an OAuth2 based SCA was performed in an preceding AIS service in the same session.
      type: http
      scheme: bearer


  schemas:
  #####################################################
  # Predefined Schemas
  #####################################################

    paymentId:
      description: 
        Resource identification of the generated payment initiation resource.
      type: string
      example: "1234-wertiq-983"

#BOI-REMARK not in use

    # paymentIdList:
    #   description: A list of paymentIds
    #   type: array
    #   minItems: 1
    #   items:
    #     $ref: "#/components/schemas/paymentId"


    # basketId:
    #   description: 
    #     Resource identification of the generated signing basket resource.
    #   type: string
    #   example: "1234-basket-567"


    authorisationId:
      description: Resource identification of the related SCA 
      type: string
      example: "123auth456"


    authenticationMethodId:
      description: |
            An identification provided by the ASPSP for the later identification of the authentication method selection.
      type: string
      maxLength: 35
      example: "myAuthenticationID"


    accountId:
      description: This identification is denoting the addressed account, where the transaction has been performed. 
      type: string
      example: "qwer3456tzui7890"


    consentId:
      description: |
        ID of the corresponding consent object as returned by an Account Information Consent Request.
      type: string
      maxLength: 512

    authorization:
      description: |
        Authorization by OAuth2 based Protocol.
      type: string

#BOI-REMARK not yet suppported
    # consentIdList:
    #   description: A list of consentIds
    #   type: array
    #   minItems: 1
    #   items:
    #     $ref: "#/components/schemas/consentId"


    transactionId:
      description: |
        This identification is given by the attribute transactionId of the corresponding entry of a transaction list.
      type: string
      example: "3dc3d5b3-7023-4848-9853-f5400a64e80f"

    cardTransactionId:
      description: Unique end to end identity.
      type: string
      maxLength: 35


    terminalId:
      description: Identification of the Terminal, where the card has been used.
      type: string 
      maxLength: 35

#BOI-REMARK not in use
    # entryReference:
    #   description: |
    #     Is the identification of the transaction as used e.g. for reference for deltafunction on application level.
    #   type: string
    #   maxLength: 35


    transactionStatus:
      description: | 
        The transaction status is filled with codes of the ISO 20022 data table:
        - 'ACCC': 'AcceptedSettlementCompleted' -
          Settlement on the creditor's account has been completed.
        - 'ACCP': 'AcceptedCustomerProfile' - 
          Preceding check of technical validation was successful. 
          Customer profile check was also successful.
        - 'ACSC': 'AcceptedSettlementCompleted' - 
          Settlement on the debtor�s account has been completed.
          
          **Usage:** this can be used by the first agent to report to the debtor that the transaction has been completed. 
          
          **Warning:** this status is provided for transaction status reasons, not for financial information. 
          It can only be used after bilateral agreement.
        - 'ACSP': 'AcceptedSettlementInProcess' - 
          All preceding checks such as technical validation and customer profile were successful and therefore the payment initiation has been accepted for execution.
        - 'ACTC': 'AcceptedTechnicalValidation' - 
          Authentication and syntactical and semantical validation are successful.
        - 'ACWC': 'AcceptedWithChange' - 
          Instruction is accepted but a change will be made, such as date or remittance not sent.
        - 'ACWP': 'AcceptedWithoutPosting' - 
          Payment instruction included in the credit transfer is accepted without being posted to the creditor customer�s account.
        - 'RCVD': 'Received' - 
          Payment initiation has been received by the receiving agent.
        - 'PDNG': 'Pending' - 
          Payment initiation or individual transaction included in the payment initiation is pending. 
          Further checks and status update will be performed.
        - 'RJCT': 'Rejected' - 
          Payment initiation has been cancelled before execution
          Remark: This codeis accepted as new code by ISO20022.
        - 'CANC': 'Cancelled' - 
          Payment initation has been cancelled before execution.
          Remark: This code is accepted as new code by ISO20022.
        - 'ACFC': 'AcceptedFundsChecked' -
          Preceding check of technical validation and customer profile was successful and an automatic funds check was positive .
          Remark: This code is accepted as new code by ISO20022.
        - 'PATC': 'PartiallyAcceptedTechnical'
          Correct The payment initiation needs multiple authentications, where some but not yet all have been performed. Syntactical and semantical validations are successful.
          Remark: This code is accepted as new code by ISO20022.
        - 'PART': 'PartiallyAccepted' -
          A number of transactions have been accepted, whereas another number of transactions have not yet achieved 
      type: string
      enum:
        - "ACCC"
        - "ACCP"
        - "ACSC"
        - "ACSP"
        - "ACTC"
        - "ACWC"
        - "ACWP"
        - "RCVD"
        - "PDNG"
        - "RJCT"
        - "CANC"
        - "ACFC"
        - "PATC"
        - "PART"
      example: "ACCP"

#BOI-REMARK not yet supported
    # transactionStatus_SBS:
    #   description: | 
    #     The transaction status is filled with codes of the ISO 20022 data table.
    #     Only the codes RCVD, PATC, ACTC, ACWC and RJCT are used:
    #     - 'ACSP': 'AcceptedSettlementInProcess' - 
    #       All preceding checks such as technical validation and customer profile were successful and therefore the payment initiation has been accepted for execution.
    #     - 'ACTC': 'AcceptedTechnicalValidation' - 
    #       Authentication and syntactical and semantical validation are successful.
    #     - 'ACWC': 'AcceptedWithChange' - 
    #       Instruction is accepted but a change will be made, such as date or remittance not sent.
    #     - 'RCVD': 'Received' - 
    #       Payment initiation has been received by the receiving agent.
    #     - 'RJCT': 'Rejected' - 
    #       Payment initiation or individual transaction included in the payment initiation has been rejected.
    #   type: string
    #   enum:
    #     - "ACSC"
    #     - "ACTC"
    #     - "PATC"
    #     - "RCVD"
    #     - "RJCT"
    #     - "CANC"
    #   example: "RCVD"

#BOI-REMARK: sca status support is optional.
    scaStatus:
      description: |
        This data element is containing information about the status of the SCA method applied. 
        
        The following codes are defined for this data type.
        
          * 'received':
            An authorisation or cancellation-authorisation resource has been created successfully.
          * 'psuIdentified':
            The PSU related to the authorisation or cancellation-authorisation resource has been identified.
          * 'psuAuthenticated':
            The PSU related to the authorisation or cancellation-authorisation resource has been identified and authenticated e.g. by a password or by an access token.
          * 'started':
            The addressed SCA routine has been started.
          * 'finalised':
            The SCA routine has been finalised successfully.
          * 'failed':
            The SCA routine failed
          * 'exempted':
            SCA was exempted for the related transaction, the related authorisation is successful.
      type: string
      enum:
        - "received"
        - "psuIdentified"
        - "psuAuthenticated"
        - "started"
        - "finalised"
        - "failed"
        - "exempted"
        
      example: "psuAuthenticated"


    # scaAuthenticationData:
    #   description: |
    #     SCA authentication data, depending on the chosen authentication method. 
    #     If the data is binary, then it is base64 encoded.
    #   type: string

#BOI-REMARK:  "suspendedByASPSP", "blockedByASPSP" have been added. Any further codes should be cordinated in advance with BOI.
    consentStatus:
      description: |
        This is the overall lifecycle status of the consent.
        
        BOI-REMARK: Any further codes should be cordinated in advance with BOI.
        
        Valid values are:
          - 'received': The consent data have been received and are technically correct. 
            The data is not authorised yet.
          - 'rejected': The consent data have been rejected e.g. since no successful authorisation has taken place.
          - 'partiallyAuthorised': The consent is due to a multi-level authorisation, some but not all mandated authorisations have been performed yet.
          - 'valid': The consent is accepted and valid for GET account data calls and others as specified in the consent object.
          - 'revokedByPsu': The consent has been revoked by the PSU towards the ASPSP.
          - 'expired': The consent expired.
          - 'terminatedByTpp': The corresponding TPP has terminated the consent by applying the DELETE method to the consent resource.
          - 'suspendedByASPSP' : The consent has been suspended by the ASPSP, according to requirements that are detailed in BOI's directive.
          - 'blockedByASPSP' : The consent has been blocked by the ASPSP, according to requirements that are detailed in BOI's directive.
        
        The ASPSP might add further codes. These codes then shall be contained in the ASPSP's documentation of the XS2A interface 
        and has to be added to this API definition as well.
      type: string
      enum:
        - "received"
        - "rejected"
        - "partiallyAuthorised"
        - "valid"
        - "revokedByPsu"
        - "expired"
        - "terminatedByTpp"
        - "suspendedByASPSP"
        - "blockedByASPSP"


    transactionFeeIndicator:
      description: |
        If equals 'true', the transaction will involve specific transaction cost as shown by the ASPSP in
        their public price list or as agreed between ASPSP and PSU.
        If equals 'false', the transaction will not involve additional specific transaction costs to the PSU.
        If this data element is not used, there is no information about transaction fees unless the fee amount is given explicitly in the data element transactionFees and/or currencyConversionFees.

      type: boolean

    recurringIndicator:
      description: |
        "true", if the consent is for recurring access to the account data.
        
        "false", if the consent is for one access to the account data.
      type: boolean
      example: false

    combinedServiceIndicator:
      description: |
        If "true" indicates that a payment initiation service will be addressed in the same "session".
      type: boolean
      example: false

#BOI-REMARK: support
    batchBookingPreferred:
      description: |
        If this element equals 'true', the PSU prefers only one booking entry. 
        If this element equals 'false', the PSU prefers individual booking of all contained individual transactions. 
            The ASPSP will follow this preference according to contracts agreed on with the PSU.
      type: boolean
      example: false
   
    scaMethods:
      description: |
        This data element might be contained, if SCA is required and if the PSU has a choice between different
        authentication methods.
        
        Depending on the risk management of the ASPSP this choice might be offered before or after the PSU
        has been identified with the first relevant factor, or if an access token is transported.
        
        If this data element is contained, then there is also an hyperlink of type 'startAuthorisationWithAuthenticationMethodSelection'
        contained in the response body.
      
        These methods shall be presented towards the PSU for selection by the TPP.

      type: array
      items:
        $ref: "#/components/schemas/authenticationObject"

    # chosenScaMethod:
    #   # description: |
    #   #  This data element is only contained in the response if the ASPSP has chosen the Embedded SCA Approach,
    #   #  if the PSU is already identified e.g. with the first relevant factor or alternatively an access token,
    #   #  if SCA is required and if the authentication method is implicitly selected.
    #   $ref: "#/components/schemas/authenticationObject"


#BOI-REMARK: supported
    authenticationType:
      description: |
        Type of the authentication method.
      
        More authentication types might be added during implementation projects and documented in the ASPSP documentation.
      
          - 'SMS_OTP': An SCA method, where an OTP linked to the transaction to be authorised is sent to the PSU through a SMS channel.
          - 'CHIP_OTP': An SCA method, where an OTP is generated by a chip card, e.g. an TOP derived from an EMV cryptogram. 
            To contact the card, the PSU normally needs a (handheld) device. 
            With this device, the PSU either reads the challenging data through a visual interface like flickering or 
            the PSU types in the challenge through the device key pad. 
            The device then derives an OTP from the challenge data and displays the OTP to the PSU.
          - 'PHOTO_OTP': An SCA method, where the challenge is a QR code or similar encoded visual data 
            which can be read in by a consumer device or specific mobile app. 
            The device resp. the specific app than derives an OTP from the visual challenge data and displays 
            the OTP to the PSU.
          - 'PUSH_OTP': An OTP is pushed to a dedicated authentication APP and displayed to the PSU.
      
      type: string
      enum:
        - "SMS_OTP"
        - "CHIP_OTP"
        - "PHOTO_OTP"
        - "PUSH_OTP"

#BOI-REMARK: not supported      
    authenticationObject:
      description: |
        Authentication Object
      type: object
      required:
        - authenticationType
        - authenticationMethodId
      properties:
        authenticationType:
          $ref: "#/components/schemas/authenticationType"
        authenticationVersion:
          description: |
            Depending on the "authenticationType".
            This version can be used by differentiating authentication tools used within performing OTP generation in the same authentication type.
            This version can be referred to in the ASPSP?s documentation.
          type: string
        authenticationMethodId:
          $ref: "#/components/schemas/authenticationMethodId"
        name:
          description: |
            This is the name of the authentication method defined by the PSU in the Online Banking frontend of the ASPSP.
            Alternatively this could be a description provided by the ASPSP like "SMS OTP on phone +49160 xxxxx 28".
            This name shall be used by the TPP when presenting a list of authentication methods to the PSU, if available.
          type: string
          example: "SMS OTP on phone +49160 xxxxx 28"
        explanation:
          description: |
            Detailed information about the SCA method for the PSU.
          type: string
          example: Detailed information about the SCA method for the PSU.


#BOI-REMARK: not yet supported
    # signingBasket:
    #   description: |
    #     JSON Body of a establish signing basket request.
    #     The body shall contain at least one entry.
    #   type: object
    #   properties:
    #     paymentIds:
    #       $ref: "#/components/schemas/paymentIdList"
    #     consentIds:
    #       $ref: "#/components/schemas/consentIdList"

    # challengeData:
    #   description: |
    #     It is contained in addition to the data element 'chosenScaMethod' if challenge data is needed for SCA.
    #     In rare cases this attribute is also used in the context of the 'startAuthorisationWithPsuAuthentication' link.
    #   type: object
    #   properties:
    #     image:
    #       type: string
    #       format: byte
    #       description: |
    #         PNG data (max. 512 kilobyte) to be displayed to the PSU,
    #         Base64 encoding, cp. [RFC4648].
    #         This attribute is used only, when PHOTO_OTP or CHIP_OTP
    #         is the selected SCA method.
    #     data:
    #       type: array
    #       items:
    #         type: string
    #       description: A collection of strings as challenge data.
    #     imageLink:
    #       type: string
    #       format: url
    #       description: A link where the ASPSP will provides the challenge image for the TPP.
    #     otpMaxLength:
    #       type: integer
    #       description: The maximal length for the OTP to be typed in by the PSU.
    #     otpFormat:
    #       type: string
    #       description: The format type of the OTP to be typed in. The admitted values are "characters" or "integer".
    #       enum:
    #         - "characters"
    #         - "integer"
    #     additionalInformation:
    #       type: string
    #       description: |
    #         Additional explanation for the PSU to explain
    #         e.g. fallback mechanism for the chosen SCA method.
    #         The TPP is obliged to show this to the PSU.

    fundsAvailable:
      description: |
        Equals true if sufficient funds are available at the time of the request, false otherwise.
        
        This datalemenet is allways contained in a confirmation of funds response.
        
        This data element is contained in a payment status response, 
        if supported by the ASPSP, if a funds check has been performed and 
        if the transactionStatus is "ATCT", "ACWC" or "ACCP".
      type: boolean


    hrefType:
      description: Link to a resource
      type: object
      properties:
        href:
          $ref: "#/components/schemas/hrefEntry"

    hrefEntry:
      description: Link to a resource
      type: string
      example: "/v1.0.8/payments/sepa-credit-transfers/1234-wertiq-983"

    authorisationsList:
      description: An array of all authorisationIds 
      type: array
      items:
        $ref: "#/components/schemas/authorisationId"

    authorisations:
      description: An array of all authorisationIds 
      type: object
      required:
        - authorisationIds
      properties:
        authorisationIds:
          $ref: "#/components/schemas/authorisationsList"

    consentAccountReference:
      description: | 
        Reference to an account by either
          * IBAN, of a payment accounts, or
          * PAN of a card in a masked form, or
          * an alias to access a payment account via a registered mobile phone number (MSISDN).
          
          BOI-REMARK: The currency of the account is needed, where the currency is an account charactaristic identifying certain sub-accounts under one external identifier like an IBAN. Once the currency wasn't defined, a specific IBAN includes all the currencies relates to this IBAN.
          
      type: object
      properties:
        iban: #BOI-REMARK: IBAN field is mandatory for banks - for banks: The IBAN should always be specified. Foe bank accounts- only IBAN, for payment cards- IBAN and 'card' as a cashAccountType. 
          $ref: "#/components/schemas/iban"
        maskedPan: 
          $ref: "#/components/schemas/maskedPan"
        msisdn: 
          $ref: "#/components/schemas/msisdn"
        currency:
          $ref: "#/components/schemas/consentCurrencyCode"
        #BOI Remarks: added by BOI - taken from 1.3.9  
        other:
         $ref: "#/components/schemas/otherType"

        #BOI-REMARK: This field might only be used in the Israeli market. It may only be used in the context of card-accounts in case where under the same account reference payment accounts are offered as well as card accounts. Since a card related code is not existing in ISO20022, this specification mandates to use the code "CARD" for this attribute usage.
        cashAccountType:
          $ref: "#/components/schemas/cashAccountType"


    accountReference:
      description: | 
        Reference to an account by either
          * IBAN, of a payment accounts, or
          * BBAN, for payment accounts if there is no IBAN, or 
          * PAN of a card in a masked form, or
          * an alias to access a payment account via a registered mobile phone number (MSISDN).
          
          BOI-REMARK: The currency of the account is needed, where the currency is an account charactaristic identifying certain sub-accounts under one external identifier like an IBAN. Once the currncy wasn't defined, a specific IBAN includes all the currencies relates to this IBAN.
          
      type: object
      properties:
        iban: #BOI-REMARK: IBAN field is mandatory for banks 
          $ref: "#/components/schemas/iban"
        bban: 
          $ref: "#/components/schemas/bban"
        #BOI-REMARK:forbidden
        # pan: 
        #   $ref: "#/components/schemas/pan"
       #BOI-REMARK: maskedPan field is mandatory for credit card company- for credit cards company: the maskedPan should always be specified for payment cards.
        maskedPan: 
          $ref: "#/components/schemas/maskedPan"      
        other:
         $ref: "#/components/schemas/otherType"
        msisdn: 
          $ref: "#/components/schemas/msisdn"
        currency:
          $ref: "#/components/schemas/currencyCode"
        #roiz_1.8 - changed to conditional.
        #BOI-REMARK:  Conditional.
        cashAccountType:
          $ref: "#/components/schemas/cashAccountType"

#    accountReferenceIban:
#      type: object
#      description: |
#        Reference to an account by the Primary Account Number (PAN) of a card, 
#        can be tokenised by the ASPSP due to PCI DSS requirements.
#      required:
#        - iban
#      properties:
#        iban: 
#          $ref: "#/components/schemas/iban"
#        currency:
#          $ref: "#/components/schemas/currencyCode"

#    accountReferenceBban:
#      type: object
#      description: |
#        Reference to an Account.
#        
#        This data elements is used for payment accounts which have no IBAN.
#      required:
#        - bban
#      properties:
#        bban: 
#          $ref: "#/components/schemas/bban"
#        currency:
#          $ref: "#/components/schemas/currencyCode"

#    accountReferencePan:
#      type: object
#      description: |
#        Reference to an account by the Primary Account Number (PAN) of a card, 
#        can be tokenised by the ASPSP due to PCI DSS requirements. 
#      required:
#        - pan
#      properties:
#        pan: 
#          $ref: "#/components/schemas/pan"
#        currency:
#          $ref: "#/components/schemas/currencyCode"

#    accountReferenceMaskedPan:
#      type: object
#      description: |
#        Reference to an account by the Primary Account Number (PAN) of a card in a masked form.
#      required:
#        - maskedPan
#      properties:
#        maskedPan: 
#          $ref: "#/components/schemas/maskedPan"
#        currency:
#          $ref: "#/components/schemas/currencyCode"
#
#    accountReferenceMsisdn:
#      type: object
#      description: |
#        An alias to access a payment account via a registered mobile phone number.
#      required:
#        - msisdn
#      properties:
#        msisdn: 
#          $ref: "#/components/schemas/msisdn"
#        currency:
#          $ref: "#/components/schemas/currencyCode"

    balanceType:
      description: |
        The following balance types are defined:
          - "closingBooked": #BOI-REMARK: THIS TYPE IS MANDATORY
            Balance of the account at the end of the pre-agreed account reporting period. 
            It is the sum of the opening booked balance at the beginning of the period and all entries booked 
            to the account during the pre-agreed account reporting period.
            
            For card-accounts, this is composed of
            
              - invoiced, but not yet paid entries
          - "expected": #BOI-REMARK: THIS TYPE IS CONDITIONAL
            Balance composed of booked entries and pending items known at the time of calculation, 
            which projects the end of day balance if everything is booked on the account and no other entry is posted.
            
            For card accounts, this is composed of 
              - invoiced, but not yet paid entries, 
              - not yet invoiced but already booked entries and
              - pending items (not yet booked)
            
            
            For card-accounts:
            
            "money to spend with the value of a pre-approved credit limit on the card account"
            
          - "openingBooked":  #BOI-REMARK: THIS TYPE IS OPTIONAL
            Book balance of the account at the beginning of the account reporting period. 
            It always equals the closing book balance from the previous report.
          - "interimAvailable":  #BOI-REMARK: THIS TYPE IS CONDITIONAL
            Available balance calculated in the course of the account ?servicer?s business day, 
            at the time specified, and subject to further changes during the business day. 
            The interim balance is calculated on the basis of booked credit and debit items during the calculation 
            time/period specified.
            
            For card-accounts, this is composed of
              - invoiced, but not yet paid entries, 
              - not yet invoiced but already booked entries
          - "interimBooked": #BOI-REMARK: THIS TYPE IS CONDITIONAL
            Balance calculated in the course of the account servicer's business day, at the time specified, 
            and subject to further changes during the business day. 
            The interim balance is calculated on the basis of booked credit and debit items during the calculation time/period 
            specified.
          - "forwardAvailable": #BOI-REMARK: THIS TYPE IS CONDITIONAL
            Forward available balance of money that is at the disposal of the account owner on the date specified.
          - "nonInvoiced":  #BOI-REMARK: THIS TYPE IS CONDITIONAL
            Only for card accounts, to be checked yet. 
      type: string
      enum:
          - "closingBooked"
          - "expected"
          - "openingBooked"
          - "interimAvailable"
          - "interimBooked"
          - "forwardAvailable"
          - "nonInvoiced"


    accountAccess:
      description: |
        Requested access services for a consent.
      type: object
      properties:
        accounts:
          description: |
            Is asking for detailed account information. 
            
            If the array is empty, the TPP is asking for an accessible account list. 
            This may be restricted in a PSU/ASPSP authorization dialogue.
            If the array is empty, also the arrays for balances or transactions shall be empty, if used
          type: array
          items:
            $ref: "#/components/schemas/consentAccountReference"
        balances:
          description: |
            Is asking for balances of the addressed accounts.
            
            If the array is empty, the TPP is asking for the balances of all accessible account lists. 
            This may be restricted in a PSU/ASPSP authorization dialogue.
            If the array is empty, also the arrays for accounts or transactions shall be empty, if used.
            
          type: array
          items:
            $ref: "#/components/schemas/accountReference"
        transactions:
          description: |
            Is asking for transactions of the addressed accounts. 
            
            If the array is empty, the TPP is asking for the transactions of all accessible account lists. 
            This may be restricted in a PSU/ASPSP authorization dialogue.
            If the array is empty, also the arrays for accounts or balances shall be empty, if used.
            
          type: array
          items:
            $ref: "#/components/schemas/accountReference"

        availableAccounts:
          description: |
            Optional.
            
            Only the value "allAccounts" is admitted.
          type: string
          enum:
            - "allAccounts"

        availableAccountsWithBalance:
          description: |
            Optional if supported by API provider.            
            Only the value "allAccounts" is admitted.
          type: string
          enum:
            - "allAccounts"

        allPsd2:
          description: |
            Optional if supported by API provider.
            
            Only the value "allAccounts" is admitted.
          type: string
          enum:
            - "allAccounts"

    #roiz_1.8 - change boi remark
    cashAccountType:
      description: |
        ExternalCashAccountType1Code from ISO 20022.
        BOI-REMARK - The API provider may restrict the accepted values further (e.g. only "CARD" and "CACC" may be supported).
        The TPP includes this element, if the account reference may identify several accounts of different types, but the TPP only requests access to a specific type (e.g. card accounts).

      type: string
      enum:
        - "CARD"
        - "CACC"
        # - "CASH"
        # - "CHAR"
        # - "CISH"
        # - "COMM"
        # - "CPAC"
        # - "LLSV"
        # - "LOAN"
        # - "MGLD"
        # - "MOMA"
        # - "NREX"
        # - "ODFT"
        # - "ONDP"
        # - "OTHR"
        # - "SACC"
        # - "SLRY"
        # - "SVGS"
        # - "TAXE"
        # - "TRAN"
        # - "TRAS"

    accountStatus:
      description: |
        Account status. The value is one of the following:
          - "enabled": account is available
          - "deleted": account is terminated
          - "blocked": account is blocked e.g. for legal reasons
        If this field is not used, than the account is available in the sense of this specification.
      type: string
      enum:
        - "enabled"
        - "deleted"
        - "blocked"


    accountDetails:
      description: |
        The ASPSP shall give at least one of the account reference identifiers:
          - iban
          - bban
          - maskedPan
          - msisdn
          - other
        If the account is a multicurrency account currency code in "currency" is set to "XXX".
      type: object
      required:
        - currency
      properties:
        resourceId:
          description: This shall be filled, if addressable resource are created by the ASPSP on the /accounts or /card-accounts endpoint.
          type: string
          #BOI-REMARK: IBAN is mandatory for Banks.
        iban:
          $ref: "#/components/schemas/iban"
        bban:
           $ref: "#/components/schemas/bban"
        #BOI-REMARK: This field should be empty for PSP_IC role unless necessary to identify the account
        msisdn: 
          $ref: "#/components/schemas/msisdn"
        currency:
          $ref: "#/components/schemas/currencyCode"
        #BOI-REMARK: Conditional This field should be empty for PSP_IC role unless necessary to identify the account
        #For the Israeli market there is no need in explicit consent to this specific additional account information
        ownerName:
          description: Name of the legal account owner. If there is more than one owner then e.g. two names might be noted here. For a corporate account, the corporate name is used for this attribute.
          type: string
          maxLength: 140
        #BOI-REMARK: Conditional This field should be empty for PSP_IC role unless necessary to identify the account
        #Should be empty For PSP_IC role unless necessary to identify the account
        name:
          description: Name of the account given by the bank or the PSU in online-banking.
          type: string
          maxLength: 70
        #roiz_1.8 - added new field.
        #BOI-REAMRK Conditional Name of the account as defined by the PSU within online channels.
        displayName:
          $ref: "#/components/schemas/displayName"
        #BOI-REMARK: Conditional This field should be empty for PSP_IC role unless necessary to identify the account
        product:
          description: Product name of the bank for this account, proprietary definition.
          type: string
          maxLength: 35
        #BOI-REMARK: This field should be empty for PSP_IC role unless necessary to identify the account
        cashAccountType:
          $ref: "#/components/schemas/cashAccountType"
        status:
          $ref: "#/components/schemas/accountStatus"
        bic:
          $ref: "#/components/schemas/bicfi"
        #BOI-REMARK: This field should be empty for PSP_IC role unless necessary to identify the account
        linkedAccounts:
          description: Case of a set of pending card transactions, the APSP will provide the relevant cash account the card is set up on.
          type: string
          maxLength: 70
        #BOI-REMARK: This field should be empty for PSP_IC role unless necessary to identify the account
        usage:
          description: |
            Specifies the usage of the account
              * PRIV: private personal account
              * ORGA: professional account
          type: string
          maxLength: 4
          enum:
            - "PRIV"
            - "ORGA"
        #BOI-REMARK: Conditional, this field should be empty for PSP_IC role
        details:
          description: |
            Specifications that might be provided by the ASPSP
              - characteristics of the account
              - characteristics of the relevant card
          type: string
          maxLength: 500
        #BOI-REMARK: Optional
        balances:
          $ref: "#/components/schemas/balanceList"
        #BOI-REMARK: This field should be empty for PSP_IC role
        _links:
          $ref: "#/components/schemas/_linksAccountDetails"
        other:
          $ref: "#/components/schemas/otherType"

    cardAccountDetails:
      description: |
        Card account details.
      type: object
      required:
        - maskedPan
        - currency
      properties:
        resourceId:
          description: |
            This is the data element to be used in the path when retrieving data from a dedicated account.
            This shall be filled, if addressable resource are created by the ASPSP on the /card-accounts endpoint.
          type: string
        maskedPan:
          $ref: "#/components/schemas/maskedPan"
        currency:
          $ref: "#/components/schemas/currencyCode"
          #BOI-REMARK: This field is Conditional.
        ownerName:
          $ref: "#/components/schemas/ownerName"
          #BOI-REMARK: This field is Conditional.
        name:
          description: |
            Name of the card / card account, as assigned by the ASPSP, 
            in agreement with the account owner in order to provide an additional means of identification of the account.
          type: string
          maxLength: 70
          #BOI-REMARK: This field is Conditional.
        displayName:
          $ref: "#/components/schemas/displayName"
        #BOI-REMARK: This field is Conditional.
        product:
          description: |
            Product Name of the Bank for this card / card account, proprietary definition.
          type: string
          maxLength: 35
        debitAccounting:
          $ref: "#/components/schemas/debitAccounting"
        #BOI-REMARK: This field is Conditional.
        status:
          $ref: "#/components/schemas/accountStatus"
        #BOI-REMARK: This field is Conditional.
        usage:
          description: |
            Specifies the usage of the card / card account:
              * PRIV: private personal card / card account
              * ORGA: professional card / card account
          type: string
          maxLength: 4
          enum:
            - "PRIV"
            - "ORGA"
        #BOI-REMARK: This field is Conditional.
        details:
          description: |
            Specifications that might be provided by the ASPSP:
              - characteristics of the account
              - characteristics of the relevant card
              BOI REMARK:
              For example
              - charactaristic of the creditLimit level.
              - charactaristic of the monthly billing date.
          type: string
          maxLength: 1000
        #BOI-REMARK: This field is Conditional.
        creditLimit:
          $ref: "#/components/schemas/amount"
        balances:
          $ref: "#/components/schemas/balanceList"
        _links:
          #$ref: "#/components/schemas/_linksAccountDetails"
          $ref: "#/components/schemas/_linksAccountDetails"

    accountList:
      description: |
        List of accounts with details.
      type: object
      required:
        - accounts
      properties:
        accounts:
          type: array
          items:
            $ref: "#/components/schemas/accountDetails"


    cardAccountList:
      description: |
        List of card accounts with details.
      type: object
      required:
        - cardAccounts
      properties:
        cardAccounts:
          type: array
          items:
            $ref: "#/components/schemas/cardAccountDetails"


    otherType:
      description: In cases where the specifically defined criteria (IBAN, BBAN, MSISDN)
        are not provided to identify an instance of the respective account type (e.g. a savings account), 
        the ASPSP shall include a proprietary ID of the respective account that uniquely identifies the account for this ASPSP.
      type: object
      required: 
        - identification
      properties:
        identification:
          description: Proprietary identification of the account.
          type: string
          maxLength: 35
        schemeNameCode:
          description: An entry provided by an external ISO code list. 
          type: string
          maxLength: 35
        schemeNameProprietary:
          description: A scheme name defined in a proprietary way.
          type: string
          maxLength: 35
        issuer:
          description: Issuer of the identification.
          type: string
          maxLength: 35

    accountReport:
      description: |
        JSON based account report.
        This account report contains transactions resulting from the query parameters.
        
        'booked' shall be contained if bookingStatus parameter is set to "booked" or "both".
        
        'pending' is not contained if the bookingStatus parameter is set to "booked".
      type: object
      required:
        - _links
      properties:
        booked:
          $ref: "#/components/schemas/transactionList"
        pending:
          $ref: "#/components/schemas/transactionList"
        #roiz_1.8 - added information
        information:
          $ref: "#/components/schemas/transactionList"
        _links:
          $ref: "#/components/schemas/_linksAccountReport"


    cardAccountReport:
      description: |
        JSON based card account report.
        
        This card account report contains transactions resulting from the query parameters.
      type: object
      required:
        - booked
        - _links
      properties:
        booked:
          $ref: "#/components/schemas/cardTransactionList"
        pending:
          $ref: "#/components/schemas/cardTransactionList"
        _links:
          $ref: "#/components/schemas/_linksCardAccountReport"


    transactionList:
      description: Array of transaction details
      type: array
      items: 
        $ref: "#/components/schemas/transactions"
        
    transactionDetailsBody:
      description: Transaction details.
      type: object
      required:
        - transactionDetails
      properties:
        transactionDetails:
          $ref: "#/components/schemas/transactions"
  
    cardTransactionList:
      description: Array of transaction details
      type: array
      items: 
        $ref: "#/components/schemas/cardTransaction"


    transactions:
      description: Transaction details.
      type: object
      required:
        - transactionAmount
      properties:
      #BOI-REMARK: This field is Mandatory for two steps implemantation as described in Implemantation guidelines 
        transactionId:
          description: |
            the Transaction Id can be used as access-ID in the API, where more details on an transaction is offered. 
            If this data attribute is provided this shows that the AIS can get access on more details about this 
            transaction using the GET Transaction Details Request 
          type: string
      #BOI-REMARK this field is conditional
        entryReference:
          description: |
            Is the identification of the transaction as used e.g. for reference for deltafunction on application level. 
            The same identification as for example used within camt.05x messages.
          type: string
          maxLength: 35
        #roiz_1.8 - new attribuite
        batchIndicator:
          description: |
            If this indicator equals true, then the related entry is a batch entry.
          type: boolean
        #roiz_1.8 - new attribuite
        batchNumberOfTransactions:
          description: |
            Shall be used if and only if the batchIndicator is contained and equals true.
          type: integer
      #BOI-REMARK this field is conditional
        endToEndId:
         $ref: "#/components/schemas/endToEndId"
      #BOI-REMARK this field is conditional
        mandateId:
          description: Identification of Mandates.
          type: string
          maxLength: 35
      #BOI-REMARK this field is conditional
        checkId:
         $ref: "#/components/schemas/checkId"
      #BOI-REMARK this field is conditional
        creditorId:
          $ref: "#/components/schemas/creditorId"

      #BOI-REMARK this field is conditional
        bookingDate:
          $ref: "#/components/schemas/bookingDate"
      #BOI-REMARK this field is conditional
        valueDate:
          $ref: "#/components/schemas/valueDate"
        transactionAmount:
          $ref: "#/components/schemas/amount"
      #BOI-REMARK this field is conditional
        currencyExchange:
          $ref: "#/components/schemas/reportExchangeRateList"
      #BOI-REMARK this field is conditional
        creditorName:
          $ref: "#/components/schemas/creditorName"
        creditorAccount:
          $ref: "#/components/schemas/accountReference"
         #roiz_1.8 - new attribuite
        creditorAgent:
          $ref: "#/components/schemas/bicfi"
      #BOI-REMARK this field is conditional
        ultimateCreditor:
          $ref: "#/components/schemas/ultimateCreditor"
      #BOI-REMARK this field is conditional
        debtorName:
          $ref: "#/components/schemas/debtorName"
        debtorAccount:
          $ref: "#/components/schemas/accountReference"
        #roiz_1.8 - new attribuite
        debtorAgent:
          $ref: "#/components/schemas/bicfi"
      #BOI-REMARK this field is conditional
        ultimateDebtor:
          $ref: "#/components/schemas/ultimateDebtor"
      #BOI-REMARK this field is conditional
        remittanceInformationUnstructured: 
          $ref: "#/components/schemas/remittanceInformationUnstructured"
        #roiz_1.8 - new attribuite
        remittanceInformationUnstructuredArray: 
          $ref: "#/components/schemas/remittanceInformationUnstructuredArray"        
        #remittanceInformationStructured:
         # $ref: "#/components/schemas/remittanceInformationStructuredMax140"
        #roiz_1.8 - new attribuite
        remittanceInformationStructuredArray:
          $ref: "#/components/schemas/remittanceInformationStructuredArray"
        #roiz_1.8 - new attribuite
        #BOI-REAMRK this field is conditional
        entryDetails:
          $ref: "#/components/schemas/entryDetails"
      #BOI-REMARK Not supported
        # remittanceInformationStructured:
        #   description: |
        #     Reference as contained in the structured remittance reference structure (without the surrounding XML structure).
            
        #     Different from other places the content is containt in plain form not in form of a structered field.
        #   type: string
        #   maxLength: 140
      #BOI-REMARK this field is conditional
        additionalInformation:
          $ref: "#/components/schemas/additionalInformation"  
      #BOI-REMARK this field is conditional
        additionalInformationStructured:
          $ref: "#/components/schemas/additionalInformationStructured"
      #BOI-REMARK this field is conditional
        purposeCode:
          $ref: "#/components/schemas/purposeCode"
      #BOI-REMARK this field is conditional
        bankTransactionCode:
          $ref: "#/components/schemas/bankTransactionCode"
      #BOI-REMARK this field is conditional
        proprietaryBankTransactionCode:
          $ref: "#/components/schemas/proprietaryBankTransactionCode"
        #roiz_1.8 - new attribuite
        balanceAfterTransaction: 
          $ref: "#/components/schemas/balance"
        _links:
          $ref: "#/components/schemas/_linksTransactionDetails"


    cardTransaction:
      description: Card transaction information
      type: object
      required: 
        - transactionAmount
      properties:
        cardTransactionId:
          $ref: "#/components/schemas/cardTransactionId"
        terminalId:
          $ref: "#/components/schemas/terminalId"
        transactionDate:
          $ref: "#/components/schemas/transactionDate"
        #roiz_1.8 - added new attribuite.
        acceptorTransactionDateTime:
          description: Timestamp of the actual card transaction within the acceptance system
          type: string
          format: date-time
        bookingDate:
          $ref: "#/components/schemas/bookingDate"
        transactionAmount:
          $ref: "#/components/schemas/amount"
        currencyExchange:
          $ref: "#/components/schemas/reportExchangeRateList"
        originalAmount:
          $ref: "#/components/schemas/amount"
        markupFee:
          $ref: "#/components/schemas/amount"
        markupFeePercentage:
          #description: Percentage of the involved transaction fee in relation to the billing amount.
          type: string
          example: "0.3"
        cardAcceptorId:
          #description: Identification of the Card Acceptor (e.g. merchant) as given in the related card transaction.
          type: string
          maxLength: 35
        cardAcceptorAddress:
          $ref: "#/components/schemas/address" 
        #roiz_1.8 - added new attribuite.
        cardAcceptorPhone:
          $ref: "#/components/schemas/cardAcceptorPhone"
        merchantCategoryCode:
          $ref: "#/components/schemas/merchantCategoryCode" 
        maskedPAN:
          $ref: "#/components/schemas/maskedPan"
        transactionDetails:
          type: string
          maxLength: 140
        invoiced:
          type: boolean
        proprietaryBankTransactionCode:
          $ref: "#/components/schemas/proprietaryBankTransactionCode"

    reportExchangeRateList:
      description: Array of exchange rates
      type: array
      items: 
        $ref: "#/components/schemas/reportExchangeRate"


    reportExchangeRate:
      description: Exchange Rate
      type: object
      required:
        - sourceCurrency
        - exchangeRate
        - unitCurrency
        - targetCurrency
        - quotationDate
      properties:
        sourceCurrency:
          $ref: "#/components/schemas/currencyCode"
        exchangeRate:
          type: string
        unitCurrency:
          type: string
        targetCurrency:
          $ref: "#/components/schemas/currencyCode"
        quotationDate:
          type: string
          format: date
        contractIdentification:
          type: string

#BOI-REMARK not in use

    # paymentExchangeRate:  
    #   description: Exchange Rate
    #   type: object
    #   properties:
    #     unitCurrency:
    #       type: string
    #     exchangeRate:
    #       type: string
    #     contractIdentification:
    #       type: string
    #     rateType:
    #       type: string
    #       enum:
    #         - "SPOT"
    #         - "SALE"
    #         - "AGRD"


    balance:
      description: |
        A single balance element
      type:
        object
      required:
        - balanceAmount
        - balanceType
        - creditLimitIncluded
        - referenceDate
      properties:
        balanceAmount:
          $ref: "#/components/schemas/amount"
        balanceType:
          $ref: "#/components/schemas/balanceType"
        creditLimitIncluded:
          description: |
            A flag indicating if the credit limit of the corresponding account 
            is included in the calculation of the balance, where applicable.
          type: boolean
          example: false
        lastChangeDateTime:
          description: |
            This data element might be used to indicate e.g. with the expected or booked balance that no action is known 
            on the account, which is not yet booked.
          type: string
          format: date-time
        referenceDate:
          description: Reference date of the balance
          type: string
          format: date
        lastCommittedTransaction:
          description: |
            "entryReference" of the last commited transaction to support the TPP in identifying whether all 
            PSU transactions are already known.
          type: string
          maxLength: 35


    balanceList:
      description: |
        A list of balances regarding this account, e.g. the current balance, the last booked balance.
        The list migght be restricted to the current ballance.
      type: array
      items:
        $ref: "#/components/schemas/balance"




    bicfi: 
      description: |
        BICFI
      type: string
      pattern: "[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}"
      example: "AAAADEBBXXX"

#BOI-REMARK forbidden in Israel
    # pan:
    #   description: |
    #     Primary Account Number according to ISO/IEC 7812.
    #   type: string
    #   maxLength: 35
    #   #According to ISO the following should be valid.
    #   #maxLength: 19
    #   #minLength: 8
    #   #pattern: "[0-9]{8,19}"
    #   example: "5409050000000000"


    maskedPan:
      description: |
        Masked Primary Account Number
      type: string
      maxLength: 35
      example: "123456xxxxxx1234"

    bban:
      description: |
        Basic Bank Account Number (BBAN) Identifier
        
        This data element can be used in the body of the Consent Request
          Message for retrieving Account access Consent from this Account. This
          data elements is used for payment Accounts which have no IBAN.
          ISO20022: Basic Bank Account Number (BBAN). 
          
          Identifier used nationally by financial institutions, i.e., in individual countries, 
          generally as part of a National Account Numbering Scheme(s), 
          which uniquely identifies the account of a customer.
          BOI REMARK - This field is used for accounts which  have no IBAN or for accounts that are not a part of the consent.
          
      type: string
      #BOI-REMARK - This pattern is not final and may be changed.
      pattern: "[0-9]{2}-[0-9]{3}-[0-9]{4,10}" 
      example: "11-111-11111"


    msisdn:
      type: string
      maxLength: 35
      description: Mobile phone number.
      example: "+49 170 1234567"


    iban:
      type: string
      description: IBAN of an account
      pattern: "[A-Z]{2,2}[0-9]{2,2}[a-zA-Z0-9]{1,30}"
      example: "FR7612345987650123456789014"


    address:
      type: object
      required:
        - country
      properties:
        streetName:
          type: string
          maxLength: 70
        buildingNumber:
          type: string
          maxLength: 10
        townName:
          type: string
          maxLength: 70
        postCode:
          type: string
          maxLength: 10
        country:
          $ref: "#/components/schemas/countryCode"
      example: 
        {
          streetName: "rue blue",
          buildingnNumber: "89",
          townName: "Paris",
          postCode: "75000",
          country: "FR"
        }


    countryCode:
      description: ISO 3166 ALPHA2 country code
      type: string
      pattern: "[A-Z]{2}"
      example: "SE"

    ownerName:
      description: |
        Name of the legal account owner. 
        If there is more than one owner, then e.g. two names might be noted here.
        
        For a corporate account, the corporate name is used for this attribute.
        Even if supported by the ASPSP, the provision of this field might depend on the fact whether an explicit consent to this specific additional account information has been given by the PSU.
        
      type: string
      maxLength: 140
      example: "John Doe"

    debitAccounting:
      description: >
        If true, the amounts of debits on the reports are quoted positive with
        the related consequence for balances.

        If false, the amount of debits on the reports are quoted negative.
      type: boolean

    cardAcceptorPhone:
      description: |
        Merchant phone number
        It consists of a "+" followed by the country code (from 1 to 3 characters) then a "-" and finally, any
        combination of numbers, "(", ")", "+" and "-" (up to 30 characters).
        pattern according to ISO20022 \+[0-9]{1,3}-[0-9()+\-]{1,30}
      type: string
      pattern: '\+[0-9]{1,3}\-[0-9()+\-]{1,30}'


    displayName:
      description: |
        Name of the account as defined by the PSU within online channels.
      type: string
      maxLength: 70

#BOI-REMARK: not in use
    # creditorNameAndAddress:
    #   description: Creditor Name and Address in a free text field
    #   type: string
    #   maxLength: 140
    #   example: "Max Masters, Main Street 1, 12345 City, Example Country"

    amount:
      type: object
      required:
        - currency
        - amount
      properties:
        currency:
          $ref: "#/components/schemas/currencyCode"
        amount:
          $ref: "#/components/schemas/amountValue"
      example: 
        {
          "currency": "EUR", 
          "amount": "123"
        }

    consentCurrencyCode:
      description: |
        In the Israeli market there is only one option for currency code in post consent- 
         * "ILS" - consent just for the ILS local currency.
         
        If the user want a multicurrency consent, this field should be empty.
      type: string
      enum:
        - "ILS"
      example: "ILS"
      

    currencyCode:
      description: |
        ISO 4217 Alpha 3 currency code 
        BOI REMARK - XXX for multicurrency account. 
      type: string
      pattern: "[A-Z]{3}"
      example: "EUR"

    amountValue:
      description: |
        The amount given with fractional digits, where fractions must be compliant to the currency definition.
        Up to 14 significant figures. Negative amounts are signed by minus.
        The decimal separator is a dot.
        
        **Example:**
        Valid representations for EUR with up to two decimals are:
        
          * 1056
          * 5768.2
          * -1.50
          * 5877.78
      type: string
      pattern: "-?[0-9]{1,14}(\\.[0-9]{1,3})?"
      example: "5877.78"
      
#BOI-REMARK added by BOI for checks
    checkId:
      description: Identification of a Cheque.
      type: string
      maxLength: 35
      
    endToEndId:
      description: Unique end to end identity.
      type: string
      maxLength: 35
      
    creditorId:
      description: Identification of Creditors.
      type: string
      maxLength: 35 
      
    valueDate:
      description: The Date at which assets become available to the account owner in case of a credit.
      type: string
      format: date
      example: "2017-09-26"

    additionalInformation:
      description: |
        Might be used by the ASPSP to transport additional transaction related information to the PSU.
      type: string
      maxLength: 512
#BOI-REMARK not in use

    # chargeBearer:
    #   description: Charge Bearer. ChargeBearerType1Code from ISO20022
    #   type: string
    #   enum:
    #     - "DEBT"
    #     - "CRED"
    #     - "SHAR"
    #     - "SLEV"

#BBOI-REMARK: NOT SUPPORTED
    # remittanceInformationStructured: 
    #   description: |
    #     Structured remittance information
    #   type: object
    #   required:
    #     - reference
    #   properties:
    #     reference:
    #       type: string
    #       maxLength: 35
    #     referenceType:
    #       type: string
    #       maxLength: 35
    #     referenceIssuer:
    #       type: string
    #       maxLength: 35


    remittanceInformationUnstructured:
      description: |
        Unstructured remittance information
      type: string
      maxLength: 28
      example: "Ref Number Merchant"

    remittanceInformationStructured: 
      description: |
        Structured remittance information.
      type: object
      required:
        - reference
      properties:
        reference:
          type: string
          maxLength: 35
        referenceType:
          type: string
          maxLength: 35
        referenceIssuer:
          type: string
          maxLength: 35

    remittanceInformationStructuredArray:
      description: |
        Array of structured remittance information.
      type: array
      items:
        $ref: "#/components/schemas/remittanceInformationStructured"

#BOI-REMARK support
    remittanceInformationUnstructuredArray:
      description: |
        Array of unstructured remittance information
      type: array
      items:
        $ref: "#/components/schemas/remittanceInformationUnstructured"
      example: ["Ref Number Merchant", "Some Other Text"]

    #roiz - added new element
    EntryDetailsElement:
      type: object
      required:
        - transactionAmount
      properties:
        #BOI-REAMRK this field is conditional.
        endToEndId:
          description: Unique end to end identity.
          type: string
          maxLength: 35
        #BOI-REAMRK this field is conditional.
        mandateId:
          description: Identification of Mandates, e.g. a SEPA Mandate ID.
          type: string
          maxLength: 35
        #BOI-REAMRK this field is conditional.
        checkId:
          description: Identification of a Cheque.
          type: string
          maxLength: 35
        #BOI-REAMRK this field is conditional.
        creditorId:
          $ref: "#/components/schemas/creditorId"
        transactionAmount:
           $ref: "#/components/schemas/amount"
        #BOI-REAMRK this field is conditional.
        currencyExchange:
          $ref: "#/components/schemas/reportExchangeRateList"
        #BOI-REAMRK this field is conditional.
        creditorName:
          $ref: "#/components/schemas/creditorName"
        creditorAccount:
          $ref: "#/components/schemas/accountReference"
        creditorAgent:
          $ref: "#/components/schemas/bicfi"
        ultimateCreditor:
          $ref: "#/components/schemas/ultimateCreditor"
        #BOI-REAMRK this field is conditional.
        debtorName:
          $ref: "#/components/schemas/debtorName"
        debtorAccount:
          $ref: "#/components/schemas/accountReference"
        debtorAgent:
          $ref: "#/components/schemas/bicfi"
        ultimateDebtor:
          $ref: "#/components/schemas/ultimateDebtor"
        #BOI-REAMRK this field is conditional.
        remittanceInformationUnstructured:
          $ref: "#/components/schemas/remittanceInformationUnstructured"
        remittanceInformationUnstructuredArray:
          $ref: "#/components/schemas/remittanceInformationUnstructuredArray"
        #BOI-REAMRK this field is not supported.
        #remittanceInformationStructured:
          #$ref: "#/components/schemas/remittanceInformationStructured"
        remittanceInformationStructuredArray:
          $ref: "#/components/schemas/remittanceInformationStructuredArray"
        purposeCode:
          $ref: "#/components/schemas/purposeCode"

    #roiz_1.8 - added new element
    entryDetails:
      description: |
        Might be used by the ASPSP to transport details about transactions within a batch.
      type: array
      items:
        $ref: "#/components/schemas/EntryDetailsElement"

#BOI-REMARK: For checks and transfer
    additionalInformationStructured:
      description: |
       Additional information for multiple transfers or multiple checks undor one transaction 
      type: object
      items:
        oneOf:
          - $ref: "#/components/schemas/checkList"
          - $ref: "#/components/schemas/transferList"

         
         
#BOI-REMARK: For checks
    checkList:
      description: |
       Array of Check Details 
      type: array
      items:
        $ref: "#/components/schemas/checkDetails"

         
    checkDetails:
      description: Details of underlying checks.
      type: object
      required:
        - checkId
        - transactionAmount
      properties:
        checkId:
          $ref: "#/components/schemas/checkId"
      #BOI-REMARK this field is conditional
        endToEndId:
         $ref: "#/components/schemas/endToEndId"
      #BOI-REMARK this field is conditional
        creditorId:
         $ref: "#/components/schemas/creditorId"
      #BOI-REMARK this field is conditional
        creditorName:
         $ref: "#/components/schemas/creditorName"
      #BOI-REMARK this field is conditional
        debtorName:
          $ref: "#/components/schemas/debtorName"
      #BOI-REMARK this field is conditional
        debtorAccount:
          $ref: "#/components/schemas/accountReference"
      #BOI-REMARK this field is conditional
        bankTransactionCode:
         $ref: "#/components/schemas/bankTransactionCode"
      #BOI-REMARK this field is conditional
        proprietaryBankTransactionCode:
         $ref: "#/components/schemas/proprietaryBankTransactionCode"
      #BOI-REMARK this field is conditional
        bookingDate:
          $ref: "#/components/schemas/bookingDate"
      #BOI-REMARK this field is conditional
        valueDate:
          $ref: "#/components/schemas/valueDate"          
        transactionAmount:
          $ref: "#/components/schemas/amount"
      #BOI-REMARK this field is conditional
        currencyExchange:
          $ref: "#/components/schemas/reportExchangeRateList"    
      #BOI-REMARK this field is conditional
        additionalInformation:
          $ref: "#/components/schemas/additionalInformation"             
 
 #BOI-REMARK: For transfers
    transferList:
      description: |
       Array of Transfer Details 
      type: array
      items:
        $ref: "#/components/schemas/transferDetails"

    transferDetails:
      type: object
      required:
        - transactionAmount
      properties:
      #BOI-REMARK: This field is Mandatory for two steps implemantation as described in Implemantation guidelines 14.23
        transactionId:
          description: |
            the Transaction Id can be used as access-ID in the API, where more details on an transaction is offered. 
            If this data attribute is provided this shows that the AIS can get access on more details about this 
            transaction using the GET Transaction Details Request 
          type: string
      #BOI-REMARK this field is conditional
        entryReference:
          description: |
            Is the identification of the transaction as used e.g. for reference for deltafunction on application level. 
            The same identification as for example used within camt.05x messages.
          type: string
          maxLength: 35
      #BOI-REMARK this field is conditional
        endToEndId:
         $ref: "#/components/schemas/endToEndId"
      #BOI-REMARK this field is conditional
        mandateId:
          description: Identification of Mandates.
          type: string
          maxLength: 35
      #BOI-REMARK this field is conditional
        creditorId:
          $ref: "#/components/schemas/creditorId"

      #BOI-REMARK this field is conditional
        bookingDate:
          $ref: "#/components/schemas/bookingDate"
      #BOI-REMARK this field is conditional
        valueDate:
          $ref: "#/components/schemas/valueDate"
        transactionAmount:
          $ref: "#/components/schemas/amount"
      #BOI-REMARK this field is conditional
        currencyExchange:
          $ref: "#/components/schemas/reportExchangeRateList"
      #BOI-REMARK this field is conditional
        creditorName:
          $ref: "#/components/schemas/creditorName"
      #BOI-REMARK this field is conditional
        creditorAccount:
          $ref: "#/components/schemas/accountReference"
      #BOI-REMARK this field is conditional
        ultimateCreditor:
          $ref: "#/components/schemas/ultimateCreditor"

      #BOI-REMARK this field is conditional
        remittanceInformationUnstructured: 
          $ref: "#/components/schemas/remittanceInformationUnstructured"
      #BOI-REMARK this field is conditional
        additionalInformation:
          $ref: "#/components/schemas/additionalInformation"  
      #BOI-REMARK this field is conditional
        purposeCode:
          $ref: "#/components/schemas/purposeCode"
      #BOI-REMARK this field is conditional
        bankTransactionCode:
          $ref: "#/components/schemas/bankTransactionCode"
      #BOI-REMARK this field is conditional
        proprietaryBankTransactionCode:
          $ref: "#/components/schemas/proprietaryBankTransactionCode"


        
      
    #####################################################
    # Predefined Text Formats
    #####################################################

    purposeCode:
      description: |
        ExternalPurpose1Code from ISO 20022.
        
        Values from ISO 20022 External Code List ExternalCodeSets_1Q2018 June 2018.
        
      type: string
      enum:
        - "BKDF"
        - "BKFE"
        - "BKFM"
        - "BKIP"
        - "BKPP"
        - "CBLK"
        - "CDCB"
        - "CDCD"
        - "CDCS"
        - "CDDP"
        - "CDOC"
        - "CDQC"
        - "ETUP"
        - "FCOL"
        - "MTUP"
        - "ACCT"
        - "CASH"
        - "COLL"
        - "CSDB"
        - "DEPT"
        - "INTC"
        - "LIMA"
        - "NETT"
        - "BFWD"
        - "CCIR"
        - "CCPC"
        - "CCPM"
        - "CCSM"
        - "CRDS"
        - "CRPR"
        - "CRSP"
        - "CRTL"
        - "EQPT"
        - "EQUS"
        - "EXPT"
        - "EXTD"
        - "FIXI"
        - "FWBC"
        - "FWCC"
        - "FWSB"
        - "FWSC"
        - "MARG"
        - "MBSB"
        - "MBSC"
        - "MGCC"
        - "MGSC"
        - "OCCC"
        - "OPBC"
        - "OPCC"
        - "OPSB"
        - "OPSC"
        - "OPTN"
        - "OTCD"
        - "REPO"
        - "RPBC"
        - "RPCC"
        - "RPSB"
        - "RPSC"
        - "RVPO"
        - "SBSC"
        - "SCIE"
        - "SCIR"
        - "SCRP"
        - "SHBC"
        - "SHCC"
        - "SHSL"
        - "SLEB"
        - "SLOA"
        - "SWBC"
        - "SWCC"
        - "SWPT"
        - "SWSB"
        - "SWSC"
        - "TBAS"
        - "TBBC"
        - "TBCC"
        - "TRCP"
        - "AGRT"
        - "AREN"
        - "BEXP"
        - "BOCE"
        - "COMC"
        - "CPYR"
        - "GDDS"
        - "GDSV"
        - "GSCB"
        - "LICF"
        - "MP2B"
        - "POPE"
        - "ROYA"
        - "SCVE"
        - "SERV"
        - "SUBS"
        - "SUPP"
        - "TRAD"
        - "CHAR"
        - "COMT"
        - "MP2P"
        - "ECPG"
        - "ECPR"
        - "ECPU"
        - "EPAY"
        - "CLPR"
        - "COMP"
        - "DBTC"
        - "GOVI"
        - "HLRP"
        - "HLST"
        - "INPC"
        - "INPR"
        - "INSC"
        - "INSU"
        - "INTE"
        - "LBRI"
        - "LIFI"
        - "LOAN"
        - "LOAR"
        - "PENO"
        - "PPTI"
        - "RELG"
        - "RINP"
        - "TRFD"
        - "FORW"
        - "FXNT"
        - "ADMG"
        - "ADVA"
        - "BCDM"
        - "BCFG"
        - "BLDM"
        - "BNET"
        - "CBFF"
        - "CBFR"
        - "CCRD"
        - "CDBL"
        - "CFEE"
        - "CGDD"
        - "CORT"
        - "COST"
        - "CPKC"
        - "DCRD"
        - "DSMT"
        - "DVPM"
        - "EDUC"
        - "FACT"
        - "FAND"
        - "FCPM"
        - "FEES"
        - "GOVT"
        - "ICCP"
        - "IDCP"
        - "IHRP"
        - "INSM"
        - "IVPT"
        - "MCDM"
        - "MCFG"
        - "MSVC"
        - "NOWS"
        - "OCDM"
        - "OCFG"
        - "OFEE"
        - "OTHR"
        - "PADD"
        - "PTSP"
        - "RCKE"
        - "RCPT"
        - "REBT"
        - "REFU"
        - "RENT"
        - "REOD"
        - "RIMB"
        - "RPNT"
        - "RRBN"
        - "RVPM"
        - "SLPI"
        - "SPLT"
        - "STDY"
        - "TBAN"
        - "TBIL"
        - "TCSC"
        - "TELI"
        - "TMPG"
        - "TPRI"
        - "TPRP"
        - "TRNC"
        - "TRVC"
        - "WEBI"
        - "ANNI"
        - "CAFI"
        - "CFDI"
        - "CMDT"
        - "DERI"
        - "DIVD"
        - "FREX"
        - "HEDG"
        - "INVS"
        - "PRME"
        - "SAVG"
        - "SECU"
        - "SEPI"
        - "TREA"
        - "UNIT"
        - "FNET"
        - "FUTR"
        - "ANTS"
        - "CVCF"
        - "DMEQ"
        - "DNTS"
        - "HLTC"
        - "HLTI"
        - "HSPC"
        - "ICRF"
        - "LTCF"
        - "MAFC"
        - "MARF"
        - "MDCS"
        - "VIEW"
        - "CDEP"
        - "SWFP"
        - "SWPP"
        - "SWRS"
        - "SWUF"
        - "ADCS"
        - "AEMP"
        - "ALLW"
        - "ALMY"
        - "BBSC"
        - "BECH"
        - "BENE"
        - "BONU"
        - "CCHD"
        - "COMM"
        - "CSLP"
        - "GFRP"
        - "GVEA"
        - "GVEB"
        - "GVEC"
        - "GVED"
        - "GWLT"
        - "HREC"
        - "PAYR"
        - "PEFC"
        - "PENS"
        - "PRCP"
        - "RHBS"
        - "SALA"
        - "SSBE"
        - "LBIN"
        - "LCOL"
        - "LFEE"
        - "LMEQ"
        - "LMFI"
        - "LMRK"
        - "LREB"
        - "LREV"
        - "LSFL"
        - "ESTX"
        - "FWLV"
        - "GSTX"
        - "HSTX"
        - "INTX"
        - "NITX"
        - "PTXP"
        - "RDTX"
        - "TAXS"
        - "VATX"
        - "WHLD"
        - "TAXR"
        - "B112"
        - "BR12"
        - "TLRF"
        - "TLRR"
        - "AIRB"
        - "BUSB"
        - "FERB"
        - "RLWY"
        - "TRPT"
        - "CBTV"
        - "ELEC"
        - "ENRG"
        - "GASB"
        - "NWCH"
        - "NWCM"
        - "OTLC"
        - "PHON"
        - "UBIL"
        - "WTER"


    bankTransactionCode: 
      description: |
        Bank transaction code as used by the ASPSP and using the sub elements of this structured code defined by ISO 20022. 
        
        This code type is concatenating the three ISO20022 Codes 
          * Domain Code, 
          * Family Code, and 
          * SubFamiliy Code 
        by hyphens, resulting in �DomainCode�-�FamilyCode�-�SubFamilyCode�.
      type: string
      example: "PMNT-RCDT-ESCT"


    proprietaryBankTransactionCode:
      description: |
        Proprietary bank transaction code as used within a community or within an ASPSP e.g. 
        for MT94x based transaction reports.
      type: string
      maxLength: 35

    merchantCategoryCode:
      description: Merchant category code
      type: string
      maxLength: 4
      minLength: 4
 
      

#BOI-REMARK: not supported
    frequencyCode:
      description: |
        The following codes from the "EventFrequency7Code" of ISO 20022 are supported.
        - "Daily"
        - "Weekly"
        - "EveryTwoWeeks"
        - "Monthly"
        - "EveryTwoMonths"
        - "Quarterly"
        - "SemiAnnual"
        - "Annual"
      type: string
      enum:
        - "Daily"
        - "Weekly"
        - "EveryTwoWeeks"
        - "Monthly"
        - "EveryTwoMonths"
        - "Quarterly"
        - "SemiAnnual"
        - "Annual"


    frequencyPerDay:
      description: |
        This field indicates the requested maximum frequency for an access without PSU involvement per day.
        
        BOI-REMARK:
        This attribute always set to "100" and has no legal significance.
        
        Any other values are premitted only if agreed bilaterally between TPP and ASPSP. 
      type: integer
      example: 100
      enum:
        - 100

    #BOI-REMARK not in use
    dayOfExecution:
      description: |
        Day of execution as string.
      
        This string consists of up two characters.
        Leading zeroes are not allowed.
      
        31 is ultimo of the month.
      type: string
      maxLength: 2
      enum: 
        - "1"
        - "2"
        - "3"
        - "4"
        - "5"
        - "6"
        - "7"
        - "8"
        - "9"
        - "10"
        - "11"
        - "12"
        - "13"
        - "14"
        - "15"
        - "16"
        - "17"
        - "18"
        - "19"
        - "20"
        - "21"
        - "22"
        - "23"
        - "24"
        - "25"
        - "26"
        - "27"
        - "28"
        - "29"
        - "30"
        - "31"


    executionRule:
      description: |
        "following" or "preceding" supported as values. 
        This data attribute defines the behaviour when recurring payment dates falls on a weekend or bank holiday. 
        The payment is then executed either the "preceding" or "following" working day.
        ASPSP might reject the request due to the communicated value, if rules in Online-Banking are not supporting 
        this execution rule.
      type: string
      enum:
        - "following"
        - "preceding"


    # psuData:
    #   description: PSU Data for Update PSU Authentication.
    #   type: object
    #   minProperties: 1
    #   properties:
    #   #BOI-REMARK EMBEDDED is forbidden in the Israeli market
    #   #  password:
    #   #    description: Password
    #   #    type: string
    #   #  encryptedPassword:
    #   #    description: Encrypted password. 
    #   #    type: string
    #     additionalPassword:
    #       description: Additional password in plaintext
    #       type: string
    #     additionalEncryptedPassword:
    #       description: Additional encrypted password
    #       type: string

    psuMessageText:
      description: Text to be displayed to the PSU
      type: string
      maxLength: 500
    
    creditorName:
      description: Creditor Name
      type: string
      maxLength: 70
      example: "Creditor Name"

    creditorAgentName:
      description: Creditor Agent Name
      type: string
      maxLength: 70
      example: "Creditor Agent Name"

    debtorName:
      description: Debtor Name
      type: string
      maxLength: 70
      example: "Debtor Name"

    ultimateDebtor:
      description: Ultimate Debtor
      type: string
      maxLength: 70
      example: "Ultimate Debtor"

    # debtorId:
    #   description: Debtor Id
    #   type: string
    #   maxLength: 35
    #   example: "Debtor Id 1234"

    ultimateCreditor:
      description: Ultimate Creditor
      type: string
      maxLength: 70
      example: "Ultimate Creditor"

    #####################################################
    # Predefined Date and Time Related Formats
    #####################################################

    transactionDate:
      description: Date of the actual card transaction
      type: string
      format: date

#BOI-REMARK: support
    startDate:
      description: |
        The first applicable day of execution starting from this date is the first payment.
      type: string
      format: date

    endDate:
      description: |
        The last applicable day of execution
        If not given, it is an infinite standing order.
      type: string
      format: date

    bookingDate:
      description: |
        The Date when an entry is posted to an account on the ASPSPs books.
      type: string
      format: date

    validUntil:
      description: |
        This parameter is requesting a valid until date for the requested consent. 
        The content is the local ASPSP date in ISO-Date Format, e.g. 2017-10-30. 
        
        Future dates might get adjusted by ASPSP. 
        
        If a maximal available date is requested, a date in far future is to be used: "9999-12-31". 
        
        In both cases the consent object to be retrieved by the GET Consent Request will contain the adjusted date.
        
        BOI-REMARK: The minimum value can be the current date. In case of exception a message code PERIOD_INVALID is returned.
      type: string
      format: date
      example: "2020-12-31"

    lastActionDate:
      description: |
        This date is containing the date of the last action on the consent object either through 
        the XS2A interface or the PSU/ASPSP interface having an impact on the status.
      type: string
      format: date
      example: "2018-07-01"
      
      
#####################################################
# Content of Request Bodies
#####################################################



    #####################################################
    # Content of Request Bodies - JSON
    #####################################################

#BOI-REMARK: payment products: masav, zahav and FP are supported
    paymentInitiation_json: 
      description: |
        Generic Body for a payment initation via JSON.
        
        This generic JSON body can be used to represent valid payment initiations for the following JSON based payment product, 
        which where defined in the Implementation Guidelines:
           * masav
           * zahav
           * FP

        For the convenience of the implementer additional which are already predefinded in the Implementation Guidelines 
        are included (but commented in source code), such that an ASPSP may add them easily.
        
        Take care: Since the format is intended to fit for all payment products 
        there are additional conditions which are NOT covered by this specification.
        Please check the Implementation Guidelines for detailes.

        
        The following data element are depending on the actual payment product available (in source code):
                  
         <table style="width:100%">
         <tr><th>Data Element</th><th>Type</th><th>masav</th><th>zahav</th><th>fp</th></tr>
         <tr><td>endToEndIdentification</td><td> Max35Text</td><td> optional</td> <td>optional</td><td>optional</td> </tr>
         <tr><td>debtorAccount</td><td> Account Reference</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td> </tr>
         <tr><td>debtorId</td><td> Max35Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
         <tr><td>ultimateDebtor</td> <td>Max70Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
         <tr><td>instructedAmount</td> <td>Amount</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td></tr>
         <tr><td>CurrencyOfTransfer</td> <td>CurrencyCode</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
         <tr><td>exchangeRateInformation</td> <td>Payment Exchange Rate</td> <td>n.a.</td><td>n.a.</td><td>n.a.</td></tr>
         <tr><td>creditorAccount</td> <td>Account Reference</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td>  </tr>
         <tr><td>creditorAgent</td> <td>BICFI</td> <td>optional</td> <td>optional</td><td>optional</td>  </tr>
         <tr><td>creditorAgentName</td> <td>Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
         <tr><td>creditorName</td> <td>Max70Text</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td>  </tr>
         <tr><td>creditorId</td> <td>Max35Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
         <tr><td>creditorAddress</td>Address</td> <td>optional</td> <td>optional</td><td>optional</td> </tr>
         <tr><td>creditorNameAndAddress</td> <td>Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
         <tr><td>ultimateCreditor</td> <td>Max70Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
         <tr><td>purposeCode</td> <td>Purpose Code</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
         <tr><td>chargeBearer</td> <td>Charge Bearer</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
         <tr><td>serviceLevel</td> <td>Service Level Code</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
         <tr><td>remittanceInformationUnstructured</td> <td>Max28Text</td> <td>mandatory</td> <td> mandatory</td><td> mandatory</td>  </tr>
         <tr><td>remittanceInformationUnstructuredArray</td> <td>Array of Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
         <tr><td>remittanceInformationStructured</td> <td>Remmitance</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
         <tr><td>requestedExecutionDate</td> <td>ISODate</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
         <tr><td>requestedExecutionTime</td> <td>ISODateTime</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
            </td></tr>
          </table>
          
        IMPORTANT: In this API definition the following holds:
          *  All data elements mentioned above are defined, but some of them are commented, 
            i.e. they are only visible in the source code and can be used by uncommenting them.
          * Data elements which are mandatory in the table above for all payment products 
            are set to be mandatory in this specification.
          * Data elements which are indicated in the table above as n.a. for all payment products are commented in the source code.
          * Data elements which are indicated to be option, conditional or mandatory for at least one payment product 
            in the table above are set to be optional in the s specification except the case where all are definde to be mandatory. 
          * Data element which are inticated to be n.a. can be used by the ASPS if needed. 
            In this case uncomment tthe the relatetd lines in the source code.
          * If one uses this data types for some payment products he has to ensure that the used data type is 
            valid according to the underlying payment product, e.g. by some appropriate validations.
      type: object
      required:
        - debtorAccount
        - instructedAmount
        - creditorAccount
        - creditorName
        - remittanceInformationUnstructured
      properties:
        endToEndIdentification:
          type: string
          maxLength: 35
        debtorAccount: 
          $ref: "#/components/schemas/accountReference"
        instructedAmount:
          $ref: "#/components/schemas/amount"
        creditorAccount: 
          $ref: "#/components/schemas/accountReference"
        creditorAgent:
          $ref: "#/components/schemas/bicfi"
        creditorAgentName:
          $ref: "#/components/schemas/creditorAgentName"
        creditorName:
          $ref: "#/components/schemas/creditorName"
        creditorAddress:
          $ref: "#/components/schemas/address"
        remittanceInformationUnstructured:
          $ref: "#/components/schemas/remittanceInformationUnstructured"


#BOI-REMARK : optional
    paymentInitiationBulkElement_json:
      description: |
        Generic body for a bulk payment initation entry.
        
        The bulk entry type is a type which follows the JSON formats for the supported products for single payments
        excluding the data elements (if supported):
           * debtorAccount
           * requestedExecutionDate,
           * requestedExecutionTime.
        These data elements may not be contained in any bulk entry.
        This data object can be used to represent valid bulk payment initiations entry for the following JSON based payment product, 
        which where defined in the Implementation Guidelines:

          * masav
          * zahav
          * FP

        For the convenience of the implementer additional which are already predefinded in the Implementation Guidelines 
        are included (but commented in source code), such that an ASPSP may add them easily.

        Take care: Since the format is intended to fit for all payment products 
        there are additional conditions which are NOT covered by this specification.
        Please check the Implementation Guidelines for detailes.

        The following data element are depending on the actual payment product available (in source code):
                  
        <table style="width:100%">
        <tr><th>Data Element</th><th>Type</th><th>masav</th><th>zahav</th><th>fp</th></tr>
        <tr><td>endToEndIdentification</td><td> Max35Text</td><td> optional</td> <td>optional</td><td>optional</td> </tr>
        <tr><td>debtorAccount</td><td> Account Reference</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td> </tr>
        <tr><td>debtorId</td><td> Max35Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>ultimateDebtor</td> <td>Max70Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>instructedAmount</td> <td>Amount</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td></tr>
        <tr><td>CurrencyOfTransfer</td> <td>CurrencyCode</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>exchangeRateInformation</td> <td>Payment Exchange Rate</td> <td>n.a.</td><td>n.a.</td><td>n.a.</td></tr>
        <tr><td>creditorAccount</td> <td>Account Reference</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td>  </tr>
        <tr><td>creditorAgent</td> <td>BICFI</td> <td>optional</td> <td>optional</td><td>optional</td>  </tr>
        <tr><td>creditorAgentName</td> <td>Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
        <tr><td>creditorName</td> <td>Max70Text</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td>  </tr>
        <tr><td>creditorId</td> <td>Max35Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>creditorAddress</td>Address</td> <td>optional</td> <td>optional</td><td>optional</td> </tr>
        <tr><td>creditorNameAndAddress</td> <td>Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
        <tr><td>ultimateCreditor</td> <td>Max70Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
        <tr><td>purposeCode</td> <td>Purpose Code</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
        <tr><td>chargeBearer</td> <td>Charge Bearer</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
        <tr><td>serviceLevel</td> <td>Service Level Code</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
        <tr><td>remittanceInformationUnstructured</td> <td>Max28Text</td> <td>mandatory</td> <td> mandatory</td><td> mandatory</td>  </tr>
        <tr><td>remittanceInformationUnstructuredArray</td> <td>Array of Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>remittanceInformationStructured</td> <td>Remmitance</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
        <tr><td>requestedExecutionDate</td> <td>ISODate</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
        <tr><td>requestedExecutionTime</td> <td>ISODateTime</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
           </td></tr>
        </table>
          
        IMPORTANT: In this API definition the following holds:
          *  All data elements mentioned above are defined, but some of them are commented, 
             i.e. they are only visible in the source code and can be used by uncommenting them.
          * Data elements which are mandatory in the table above for all payment products 
             are set to be mandatory in this specification.
          * Data elements which are indicated in the table above as n.a. for all payment products are commented in the source code.
          * Data elements which are indicated to be option, conditional or mandatory for at least one payment product 
             in the table above are set to be optional in the s specification except the case where all are definde to be mandatory. 
          * Data element which are inticated to be n.a. can be used by the ASPS if needed. 
             In this case uncomment tthe the relatetd lines in the source code.
          * If one uses this data types for some payment products he has to ensure that the used data type is 
             valid according to the underlying payment product, e.g. by some appropriate validations.
      type: object
      required:
        - instructedAmount
        - creditorAccount
        - creditorName
      properties:
        endToEndIdentification:
          type: string
          maxLength: 35
        instructedAmount:
          $ref: "#/components/schemas/amount"
        creditorAccount: 
          $ref: "#/components/schemas/accountReference"
        creditorAgent:
          $ref: "#/components/schemas/bicfi"
        creditorAgentName:
          $ref: "#/components/schemas/creditorAgentName"
        creditorName:
          $ref: "#/components/schemas/creditorName"
        creditorAddress:
          $ref: "#/components/schemas/address"
        remittanceInformationUnstructured:
          $ref: "#/components/schemas/remittanceInformationUnstructured"


#BOI-REMARK: optional
    periodicPaymentInitiation_json: 
      description: |
        Generic Body for a periodic payment initation via JSON.
      
        This generic JSON body can be used to represent valid periodic payment initiations for the following JSON based payment product, 
        which where defined in the Implementation Guidelines:
      
          * masav
          * zahav
          * FP
          
        For the convenience of the implementer additional which are already predefinded in the Implementation Guidelines 
        are included (but commented in source code), such that an ASPSP may add them easily.
      
        Take care: Since the format is intended to fit for all payment products 
        there are additional conditions which are NOT covered by this specification.
        Please check the Implementation Guidelines for detailes.

      
        The following data element are depending on the actual payment product available (in source code):
                
        <table style="width:100%">
        <tr><th>Data Element</th><th>Type</th><th>masav</th><th>zahav</th><th>fp</th></tr>
        <tr><td>endToEndIdentification</td><td> Max35Text</td><td> optional</td> <td>optional</td><td>optional</td> </tr>
        <tr><td>debtorAccount</td><td> Account Reference</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td> </tr>
        <tr><td>debtorId</td><td> Max35Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>ultimateDebtor</td> <td>Max70Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>instructedAmount</td> <td>Amount</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td></tr>
        <tr><td>CurrencyOfTransfer</td> <td>CurrencyCode</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>exchangeRateInformation</td> <td>Payment Exchange Rate</td> <td>n.a.</td><td>n.a.</td><td>n.a.</td></tr>
        <tr><td>creditorAccount</td> <td>Account Reference</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td>  </tr>
        <tr><td>creditorAgent</td> <td>BICFI</td> <td>optional</td> <td>optional</td><td>optional</td>  </tr>
        <tr><td>creditorAgentName</td> <td>Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
        <tr><td>creditorName</td> <td>Max70Text</td> <td>mandatory</td> <td>mandatory</td><td>mandatory</td>  </tr>
        <tr><td>creditorId</td> <td>Max35Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>creditorAddress</td>Address</td> <td>optional</td> <td>optional</td><td>optional</td> </tr>
        <tr><td>creditorNameAndAddress</td> <td>Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
        <tr><td>ultimateCreditor</td> <td>Max70Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
        <tr><td>purposeCode</td> <td>Purpose Code</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
        <tr><td>chargeBearer</td> <td>Charge Bearer</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
        <tr><td>serviceLevel</td> <td>Service Level Code</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td>  </tr>
        <tr><td>remittanceInformationUnstructured</td> <td>Max28Text</td> <td>mandatory</td> <td> mandatory</td><td> mandatory</td>  </tr>
        <tr><td>remittanceInformationUnstructuredArray</td> <td>Array of Max140Text</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td></tr>
        <tr><td>remittanceInformationStructured</td> <td>Remmitance</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
        <tr><td>requestedExecutionDate</td> <td>ISODate</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
        <tr><td>requestedExecutionTime</td> <td>ISODateTime</td> <td>n.a.</td> <td>n.a.</td><td>n.a.</td> </tr>
          </td></tr>
        </table>
        
        IMPORTANT: In this API definition the following holds:
        *  All data elements mentioned above are defined, but some of them are commented, 
            i.e. they are only visible in the source code and can be used by uncommenting them.
        * Data elements which are mandatory in the table above for all payment products 
            are set to be mandatory in this specification.
        * Data elements which are indicated in the table above as n.a. for all payment products are commented in the source code.
        * Data elements which are indicated to be option, conditional or mandatory for at least one payment product 
            in the table above are set to be optional in the s specification except the case where all are definde to be mandatory. 
        * Data element which are inticated to be n.a. can be used by the ASPS if needed. 
            In this case uncomment tthe the relatetd lines in the source code.
        * If one uses this data types for some payment products he has to ensure that the used data type is 
            valid according to the underlying payment product, e.g. by some appropriate validations.
      type: object
      required:
        - debtorAccount
        - creditorAccount
        - creditorName
        - startDate
        - frequency
      properties:
        endToEndIdentification: 
          type: string
          maxLength: 35
        debtorAccount: 
          $ref: "#/components/schemas/accountReference"
        instructedAmount:
          $ref: "#/components/schemas/amount"
        creditorAccount: 
          $ref: "#/components/schemas/accountReference"
        creditorAgent:
          $ref: "#/components/schemas/bicfi"
        creditorName:
          $ref: "#/components/schemas/creditorName"
        creditorAddress:
          $ref: "#/components/schemas/address"
        remittanceInformationUnstructured:
          $ref: "#/components/schemas/remittanceInformationUnstructured"
        #Additional Information for periodic payments
        startDate:
          $ref: "#/components/schemas/startDate"
        endDate:
          $ref: "#/components/schemas/endDate"
        executionRule:
          $ref: "#/components/schemas/executionRule"
        frequency:
          $ref: "#/components/schemas/frequencyCode"
        dayOfExecution:
          $ref: "#/components/schemas/dayOfExecution"


    bulkPaymentInitiation_json: 
      description: |
        Generic Body for a bulk payment initation via JSON.
      
        paymentInformationId is contained in code but commented since it is n.a. 
        and not all ASPSP are able to support this field now.
        In a later version the field will be mandatory.
      type: object
      required:
        - payments
        - debtorAccount     
      properties:
        batchBookingPreferred:
          $ref: "#/components/schemas/batchBookingPreferred"
        debtorAccount:
          $ref: "#/components/schemas/accountReference"
        requestedExecutionDate:
          type: string
          format: date
        requestedExecutionTime:
          type: string
          format: date-time
        payments:
          description: |
            A list of generic JSON bodies payment initations for bulk payments via JSON.           
            Note: Some fields from single payments do not occcur in a bulk payment element
          type: array
          items:
            $ref: "#/components/schemas/paymentInitiationBulkElement_json"

    # confirmationOfFunds:
    #   description: |
    #     JSON Request body for the "Confirmation of Funds Service"
        
    #     <table> 
    #     <tr> 
    #       <td>cardNumber</td> 
    #       <td>String </td>
    #       <td>Optional</td>
    #       <td>Card Number of the card issued by the PIISP. Should be delivered if available.</td>
    #     </tr> 
    #     <tr>
    #       <td>account</td>
    #       <td> Account Reference</td>
    #       <td>Mandatory</td>
    #       <td>PSU's account number.</td>
    #     </tr> 
    #     <tr> 
    #       <td>payee</td>
    #       <td>Max70Text</td>
    #       <td>Optional</td>
    #       <td>The merchant where the card is accepted as an information to the PSU.</td>
    #     </tr> 
    #     <tr>
    #       <td>instructedAmount</td>
    #       <td>Amount</td>
    #       <td>Mandatory</td>
    #       <td>Transaction amount to be checked within the funds check mechanism.</td>
    #     </tr> 
    #     </table>
    #   type: object
    #   required:
    #     - account
    #     - instructedAmount
    #   properties:
    #     cardNumber:
    #       description: |
    #         Card Number of the card issued by the PIISP. 
    #         Should be delivered if available.
    #       type: string
    #       maxLength: 35
    #     account:
    #       $ref: "#/components/schemas/accountReference"
    #     payee:
    #       description: Name payee
    #       type: string
    #       maxLength: 70
    #     instructedAmount:
    #       $ref: "#/components/schemas/amount"


    consents:
      description: |
        Content of the body of a consent request.
      type: object
      required:
        - access
        - recurringIndicator
        - validUntil
        - frequencyPerDay
        - combinedServiceIndicator
      properties:
        access:
          $ref: "#/components/schemas/accountAccess"
        recurringIndicator:
          $ref: "#/components/schemas/recurringIndicator"
        validUntil:
          $ref: "#/components/schemas/validUntil"
        frequencyPerDay:
          $ref: "#/components/schemas/frequencyPerDay"
        combinedServiceIndicator:
          $ref: "#/components/schemas/combinedServiceIndicator"

    #BOI-REMARK not supported
    # updatePsuAuthentication: 
    #   description: |
    #     Content of the body of a Update PSU Authentication Request
        
    #     Password subfield is used.
    #   type: object
    #   required: 
    #     - psuData
    #   properties:
    #     psuData:
    #       $ref: "#/components/schemas/psuData"


    # selectPsuAuthenticationMethod:
    #   description: |
    #     Content of the body of a Select PSU Authentication Method Request
    #   type: object
    #   required: 
    #     - authenticationMethodId
    #   properties:
    #     authenticationMethodId:
    #       $ref: "#/components/schemas/authenticationMethodId"


    # transactionAuthorisation:
    #   description: |
    #     Content of the body of a Transaction Authorisation Request
    #   type: object
    #   required: 
    #     - scaAuthenticationData
    #   properties:
    #     scaAuthenticationData:
    #       $ref: "#/components/schemas/scaAuthenticationData"

#BOI-REMARK: not  supported
    # periodicPaymentInitiationMultipartBody:
    #   description: |
    #   The multipart message definition for the initiation of a periodic payment initiation 
    #   where the information of the payment is contained in an pain.001 message (Part 1) and 
    #   the additional informations related to the periodic payment is an additional JSON message (Part 2).
    #   type: object
    #   properties:
    #     xml_sct: #PART 1
    #       oneOf: #The same schemas are used for single and bulk payment in case of a pain.001
    #         - $ref: "#/components/schemas/paymentInitiationSct_pain.001"
    #         - $ref: "#/components/schemas/paymentInitiationSctInst_pain.001"
    #         - $ref: "#/components/schemas/paymentInitiationTarget2_pain.001"
    #         - $ref: "#/components/schemas/paymentInitiationCrossBorder_pain.001"
    #     json_standingorderType: #PART 2
    #       $ref: "#/components/schemas/periodicPaymentInitiation_xml-Part2-standingorderType_json"

    # periodicPaymentInitiation_xml-Part2-standingorderType_json:
    #   description: |
    #     The body part 2 of a periodic payment initation request containes the execution related informations 
    #     of the periodic payment.
    #   type: object
    #   required:
    #     - startDate
    #     - frequency
    #   properties:
    #     startDate:
    #       $ref: "#/components/schemas/startDate"
    #     endDate:
    #       $ref: "#/components/schemas/endDate"
    #     executionRule:
    #       $ref: "#/components/schemas/executionRule"
    #     frequency:
    #       $ref: "#/components/schemas/frequencyCode"
    #     dayOfExecution:
    #       $ref: "#/components/schemas/dayOfExecution"





#####################################################
# Content of Response Bodies
#####################################################


    paymentInitiationStatusResponse-200_json:
      description: Body of the response for a successful payment initiation status request in case of an JSON based endpoint.
      type: object
      required:
        - transactionStatus
      properties:
        transactionStatus:
          $ref: "#/components/schemas/transactionStatus"
        fundsAvailable:
          $ref: "#/components/schemas/fundsAvailable"

#BOI-REMARK not in use

    # paymentInitiationStatusResponse-200_xml:
    #   description: |
    #     Body of the response for a successful payment initiation status request in case of an XML based endpoint.
        
    #     The status is returned as a pain.002 structure. 
        
    #     urn:iso:std:iso:20022:tech:xsd:pain.002.001.03
        
    #     The chosen XML schema of the Status Request is following the XML schema definitions of the original pain.001 schema.
    #   type: string


    paymentInitationRequestResponse-201:
      description: Body of the response for a successful payment initiation request.
      type: object
      required:
        - transactionStatus
        - paymentId
        - _links
      
      properties:
        transactionStatus:
          $ref: "#/components/schemas/transactionStatus"
        paymentId:
          $ref: "#/components/schemas/paymentId"
        
        #roiz_1.8 - changed from conditional to optional
        #BOI-REMARK: Optional
        transactionFees:
          # description: Can be used by the ASPSP to transport transaction fees relevant for the underlying payments.
          $ref: "#/components/schemas/amount"
        #roiz_1.8 - support currencyConversionFee
        #BOI-REMARK: Optional
        currencyConversionFee:
          # description: Might be used by the ASPSP to transport specific currency conversion fees related to the initiated credit transfer.
          $ref: "#/components/schemas/amount" 
        #roiz_1.8 - support estimatedTotalAmount      
        estimatedTotalAmount:
          # description: The amount which is estimated to be debted from the debtor account. Note: This amount includes fees.
          $ref: "#/components/schemas/amount"
        #roiz_1.8 - support estimatedInterbankSettlementAmount      
        estimatedInterbankSettlementAmount:
          # description: The estimated amount to be transferred to the payee.
          $ref: "#/components/schemas/amount"
        #roiz_1.8 - support transactionFeeIndicator      
        transactionFeeIndicator:
          $ref: "#/components/schemas/transactionFeeIndicator"                     
        #scaMethods:
        # # $ref: "#/components/schemas/scaMethods"
        # chosenScaMethod:
        #   $ref: "#/components/schemas/chosenScaMethod"
        # challengeData:
        #   $ref: "#/components/schemas/challengeData"
        _links:
          $ref: "#/components/schemas/_linksPaymentInitiation"
        psuMessage:
          $ref: "#/components/schemas/psuMessageText"
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage2XX"

    #BOI REMARK: not supported
    paymentInitiationCancelResponse-202:
      description: Body of the response for a successful cancel payment request.
      type: object
      required:
        - transactionStatus
      properties:
        transactionStatus:
          $ref: "#/components/schemas/transactionStatus"
        #BOI-REMARK EMBEDDED does not supported 
        scaMethods:
          $ref: "#/components/schemas/scaMethods"
        # chosenScaMethod:
        #   $ref: "#/components/schemas/chosenScaMethod"
        # challengeData:
        #   $ref: "#/components/schemas/challengeData"
        # BOI-REMARK: All the links in this section are not supported
        # _links:
        #   $ref: "#/components/schemas/_linksPaymentInitiationCancel"


    paymentInitiationWithStatusResponse: 
      description: |
        Generic JSON response body consistion of the corresponding payment initation JSON body together with an optional transaction status field.
      type: object
      required:
        - debtorAccount
        - instructedAmount
        - creditorAccount
        - creditorName
      properties:
        endToEndIdentification:
          type: string
          maxLength: 35
        debtorAccount: 
          $ref: "#/components/schemas/accountReference"
#       debtorId: # N.A. for all, but can be used by ASPSP if needed
#          $ref: "#/components/schemas/ultimateDebtor"
#        ultimateDebtor: # N.A.
#          $ref: "#/components/schemas/ultimateDebtor"
        instructedAmount:
          $ref: "#/components/schemas/amount"
        creditorAccount: 
          $ref: "#/components/schemas/accountReference"
        creditorAgent:
          $ref: "#/components/schemas/bicfi"
        creditorName:
          $ref: "#/components/schemas/creditorName"
        creditorAddress:
          $ref: "#/components/schemas/address"
#        ultimateCreditor: # N.A.
#          $ref: "#/components/schemas/ultimateCreditor"
#        purposeCode: # N.A.
#          $ref: "#/components/schemas/purposeCode"
        remittanceInformationUnstructured:
          $ref: "#/components/schemas/remittanceInformationUnstructured"
#        remittanceInformationUnstructuredArray:
#          $ref: "#/components/schemas/remittanceInformationUnstructuredArray"
#        remittanceInformationStructured: # N.A.
#          $ref: "#/components/schemas/remittanceInformationStructured"
#        requestedExecutionDate: # N.A.
#          type: string
#          format: date
#        requestedExecutionTime: # N.A.
#          type: string
#          format: date-time
        transactionStatus:
          $ref: "#/components/schemas/transactionStatus"

#BOI-REMARK not yet supported

#     periodicPaymentInitiationWithStatusResponse: 
#       description: |
#         Generic JSON response body consistion of the corresponding periodic payment initation JSON body together with an optional transaction status field.
#       type: object
#       required:
#         - debtorAccount
#         - instructedAmount
#         - creditorAccount
#         - creditorName
#         - startDate
#         - frequency
#       properties:
#         endToEndIdentification:
#           type: string
#           maxLength: 35
#         debtorAccount: 
#           $ref: "#/components/schemas/accountReference"
# #        ultimateDebtor: # N.A.
# #          $ref: "#/components/schemas/ultimateDebtor"
#         instructedAmount:
#           $ref: "#/components/schemas/amount"
#         creditorAccount: 
#           $ref: "#/components/schemas/accountReference"
#         creditorAgent:
#           $ref: "#/components/schemas/bicfi"
#         creditorName:
#           $ref: "#/components/schemas/creditorName"
#         creditorAddress:
#           $ref: "#/components/schemas/address"
# #        ultimateCreditor: # N.A.
# #          $ref: "#/components/schemas/ultimateCreditor"
# #        purposeCode: # N.A.
# #          $ref: "#/components/schemas/purposeCode"
#         remittanceInformationUnstructured:
#           $ref: "#/components/schemas/remittanceInformationUnstructured"
# #        remittanceInformationUnstructuredArray:
# #          $ref: "#/components/schemas/remittanceInformationUnstructuredArray"
# #        remittanceInformationStructured: # N.A.
# #          $ref: "#/components/schemas/remittanceInformationStructured"
# #        requestedExecutionDate:
# #          type: string
# #          format: date
# #        requestedExecutionTime:
# #          type: string
# #          format: date-time
#         #Additional Information for periodic payments
#         startDate:
#           $ref: "#/components/schemas/startDate"
#         endDate:
#           $ref: "#/components/schemas/endDate"
#         executionRule:
#           $ref: "#/components/schemas/executionRule"
#         frequency:
#           $ref: "#/components/schemas/frequencyCode"
#         dayOfExecution:
#           $ref: "#/components/schemas/dayOfExecution"
#         transactionStatus:
#           $ref: "#/components/schemas/transactionStatus"

#BOI-REMARK not yet supported
    # bulkPaymentInitiationWithStatusResponse: 
    #   description: |
    #     Generic JSON response body consistion of the corresponding bulk payment initation JSON body together with an optional transaction status field.
    #   type: object
    #   required:
    #     - payments
    #     - debtorAccount
    #   properties:
    #     batchBookingPreferred:
    #       $ref: "#/components/schemas/batchBookingPreferred"
    #     requestedExecutionDate:
    #       type: string
    #       format: date
    #     debtorAccount:
    #       $ref: "#/components/schemas/accountReference"
    #     payments:
    #       description: |
    #         A list of generic JSON bodies payment initations for bulk payments via JSON.
            
    #         Note: Some fields from single payments do not occcur in a bulk payment element
    #       type: array
    #       items:
    #         $ref: "#/components/schemas/paymentInitiationBulkElement_json"
    #     transactionStatus:
    #       $ref: "#/components/schemas/transactionStatus"


    scaStatusResponse:
      description: Body of the JSON response with SCA Status
      type: object
      properties:
        scaStatus:
          $ref: "#/components/schemas/scaStatus"


    startScaprocessResponse:
      description: Body of the JSON response for a Start SCA authorisation request.
      type: object
      required:
        - scaStatus
        - authorisationId
        - _links
      properties:
        scaStatus:
          $ref: "#/components/schemas/scaStatus"
        authorisationId:
          $ref: "#/components/schemas/authorisationId"
        #BOI-REMARK EMBEDDED does not supported
        # scaMethods:
        #   $ref: "#/components/schemas/scaMethods"
        # chosenScaMethod:
        #   $ref: "#/components/schemas/chosenScaMethod"
        # challengeData:
        #   $ref: "#/components/schemas/challengeData"
        _links:
           $ref: "#/components/schemas/_linksStartScaProcess"
        psuMessage:
          $ref: "#/components/schemas/psuMessageText"

    #BOI-REMARK: not supported
    # updatePsuIdenticationResponse:
    #   description: Body of the JSON response for a successful update PSU Identification request.
    #   type: object
    #   required:
    #     - _links
    #     - scaStatus
    #   properties:
    #     #BOI-REMARK EMBEDDED does not supported
    #      scaMethods:
    #        $ref: "#/components/schemas/scaMethods"
    #     _links:
    #       $ref: "#/components/schemas/_linksUpdatePsuIdentification"
    #     scaStatus:
    #       $ref: "#/components/schemas/scaStatus"
    #     psuMessage:
    #       $ref: "#/components/schemas/psuMessageText"


    # updatePsuAuthenticationResponse:
    #   description: Body of the JSON response for a successful update PSU Authentication request.
    #   type: object
    #   required:
    #     - scaStatus
    #   properties:
    #     #BOI-REMARK EMBEDDED does not supported
    #     # chosenScaMethod:
    #     #   $ref: "#/components/schemas/chosenScaMethod"
    #     # challengeData:
    #     #   $ref: "#/components/schemas/challengeData"
    #      scaMethods:
    #        $ref: "#/components/schemas/scaMethods"
    #     # _links:
    #       # $ref: "#/components/schemas/_linksUpdatePsuAuthentication"
    #     scaStatus:
    #       $ref: "#/components/schemas/scaStatus"
    #     psuMessage:
    #       $ref: "#/components/schemas/psuMessageText"


    # selectPsuAuthenticationMethodResponse:
    #   description: Body of the JSON response for a successful select PSU Authentication Method request.
    #   type: object
    #   required:
    #     - scaStatus
    #   properties:
    #     #BOI-REMARK EMBEDDED does not supported
    #     # chosenScaMethod:
    #     #   $ref: "#/components/schemas/chosenScaMethod"
    #     # challengeData:
    #     #   $ref: "#/components/schemas/challengeData"
    #     _links:
    #       $ref: "#/components/schemas/_linksSelectPsuAuthenticationMethod"
    #     scaStatus:
    #       $ref: "#/components/schemas/scaStatus"
    #     psuMessage:
    #       $ref: "#/components/schemas/psuMessageText"

#BOI-REMARK not yet supported

    # signingBasketResponse-200:
    #   description: |
    #     Body of the JSON response for a successful get signing basket request.
        
    #       * 'payments': payment initiations which shall be authorised through this signing basket.
    #       * 'consents': consent objects which shall be authorised through this signing basket.
    #       * 'transactionStatus': Only the codes RCVD, ACTC, RJCT are used.
    #       * '_links': The ASPSP might integrate hyperlinks to indicate next (authorisation) steps to be taken.
        
    #   type: object
    #   required:
    #     - transactionStatus
    #   properties:
    #     payments:
    #       $ref: "#/components/schemas/paymentIdList"
    #     consents:
    #       $ref: "#/components/schemas/consentIdList"
    #     transactionStatus:
    #       $ref: "#/components/schemas/transactionStatus_SBS"
    #     _links:
    #       $ref: "#/components/schemas/_linksSigningBasket"


    # signingBasketStatusResponse-200:
    #   type: object
    #   required:
    #     - transactionStatus
    #   properties:
    #     transactionStatus:
    #       $ref: "#/components/schemas/transactionStatus_SBS"


    # signingBasketResponse-201:
    #   description: Body of the JSON response for a successful create signing basket request.
    #   type: object
    #   required:
    #     - transactionStatus
    #     - basketId
    #     - _links
    #   properties:
    #     transactionStatus:
    #       $ref: "#/components/schemas/transactionStatus_SBS"
    #     basketId:
    #       $ref: "#/components/schemas/basketId"
    #     #BOI-REMARK EMBEDDED does not supported
    #      scaMethods:
    #        $ref: "#/components/schemas/scaMethods"
    #     # chosenScaMethod:
    #     #   $ref: "#/components/schemas/chosenScaMethod"
    #     # challengeData:
    #     #   $ref: "#/components/schemas/challengeData"
    #     _links:
    #       $ref: "#/components/schemas/_linksSigningBasket"
    #     psuMessage:
    #       $ref: "#/components/schemas/psuMessageText"
    #     tppMessages:
    #       type: array
    #       items:
    #         $ref: "#/components/schemas/tppMessage2XX"


    consentsResponse-201:
      description: Body of the JSON response for a successful conset request.
      type: object
      required:
        - consentStatus
        - consentId
        - _links
      properties:
        consentStatus:
          $ref: "#/components/schemas/consentStatus"
        consentId:
          $ref: "#/components/schemas/consentId"
        #BOI-REMARK EMBEDDED does not supported
        # scaMethods:
        #   $ref: "#/components/schemas/scaMethods"
        #chosenScaMethod:
         # $ref: "#/components/schemas/chosenScaMethod"
        #challengeData:
         # $ref: "#/components/schemas/challengeData"
        _links:
          $ref: "#/components/schemas/_linksConsents"
        message:
          description: Text to be displayed to the PSU, e.g. in a Decoupled SCA Approach.
          type: string
          maxLength: 512


    consentStatusResponse-200:
      description: Body of the JSON response for a successful get status request for a consent.
      type: object
      required:
        - consentStatus
      properties:
        consentStatus:
          $ref: "#/components/schemas/consentStatus"

    consentInformationResponse-200_json:
      description: Body of the JSON response for a successfull get consent request.
      type: object
      required:
        - access
        - recurringIndicator
        - validUntil
        - frequencyPerDay
        - lastActionDate
        - consentStatus
      properties:
        access:
          $ref: "#/components/schemas/accountAccess"
        recurringIndicator:
          $ref: "#/components/schemas/recurringIndicator"
        validUntil:
          $ref: "#/components/schemas/validUntil"
        frequencyPerDay:
          $ref: "#/components/schemas/frequencyPerDay"
        lastActionDate:
          $ref: "#/components/schemas/lastActionDate"
        consentStatus:
          $ref: "#/components/schemas/consentStatus"
        _links: 
          $ref: "#/components/schemas/_linksGetConsent"


    readAccountBalanceResponse-200:
      description: Body of the response for a successful read balance for an account request.
      type: object
      required:
        - account
        - balances
      properties:
        account:
          $ref: "#/components/schemas/accountReference"
        balances:
          $ref: "#/components/schemas/balanceList"


    readCardAccountBalanceResponse-200:
      description: Body of the response for a successful read balance for a card account request.
      type: object
      required:
        - balances
      properties:
        cardAccount:
          $ref: "#/components/schemas/accountReference"
        balances:
          $ref: "#/components/schemas/balanceList"


    transactionsResponse-200_json:
      description: |
        Body of the JSON response for a successful read transaction list request.
        This account report contains transactions resulting from the query parameters.
      type: object
      required:
        - account
        - transactions
      properties:
        account:
          $ref: "#/components/schemas/accountReference"
        transactions:
          $ref: "#/components/schemas/accountReport"
        balances:
          $ref: "#/components/schemas/balanceList"
      #BOI-REMARK "download" link does not supported
      #  _links:
      #    $ref: "#/components/schemas/_linksDownload"


    cardAccountsTransactionsResponse200:
      description: |
        Body of the JSON response for a successful read card account transaction list request.
        This card account report contains transactions resulting from the query parameters.
      type: object
      required:
        - cardAccount
        - cardTransactions
      properties:
        cardAccount:
          $ref: "#/components/schemas/accountReference"
        cardTransactions:
          $ref: "#/components/schemas/cardAccountReport"
        balances:
          $ref: "#/components/schemas/balanceList"
      #BOI-REMARK "download" link does not supported
      #  _links:
      #    $ref: "#/components/schemas/_linksDownload"

#####################################################
# _links
#####################################################

    _linksAll:
      description: |
        A _link object with all availabel link types
      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      properties:
         #BOI-REMARK not supported
        # scaRedirect:
        #   $ref: "#/components/schemas/hrefType"
        scaOAuth:
          $ref: "#/components/schemas/hrefType"
         #BOI-REMARK not supported
        # startAuthorisation:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithPsuIdentification:
        #   $ref: "#/components/schemas/hrefType"
        # updatePsuIdentification:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithProprietaryData:
        #   $ref: "#/components/schemas/hrefType"
        # updateProprietaryData:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # updatePsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithEncryptedPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # updateEncryptedPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # updateAdditionalPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # updateAdditionalEncryptedPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithAuthenticationMethodSelection:
        #   $ref: "#/components/schemas/hrefType"
        # selectAuthenticationMethod:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithTransactionAuthorisation:
        #   $ref: "#/components/schemas/hrefType"
        #authoriseTransaction:
        #  $ref: "#/components/schemas/hrefType"
        self:
          $ref: "#/components/schemas/hrefType"
        status:
          $ref: "#/components/schemas/hrefType"
        scaStatus:
          $ref: "#/components/schemas/hrefType"
        account:
          $ref: "#/components/schemas/hrefType"
        balances:
          $ref: "#/components/schemas/hrefType"
        transactions:
          $ref: "#/components/schemas/hrefType"
        transactionDetails:
          $ref: "#/components/schemas/hrefType"
        cardAccount:
          $ref: "#/components/schemas/hrefType"
        cardTransactions:
          $ref: "#/components/schemas/hrefType"
        first:
          $ref: "#/components/schemas/hrefType"
        next:
          $ref: "#/components/schemas/hrefType"
        previous:
          $ref: "#/components/schemas/hrefType"
        last:
          $ref: "#/components/schemas/hrefType"
        #BOI-REMARK not supported
        # download:
        #   $ref: "#/components/schemas/hrefType"


    _linksPaymentInitiation: 
      description: |
        A list of hyperlinks to be recognised by the TPP.
        The actual hyperlinks used in the response depend on the dynamical decisions of the ASPSP when
        processing the request.
        
        **Remark:** All links can be relative or full links, to be decided by the ASPSP.
        
        Type of links admitted in this response, (further links might be added for ASPSP defined extensions):
        
        * 'scaOAuth': 
          In case of a SCA OAuth2 Approach, the ASPSP is transmitting the URI where the configuration of the Authorisation
        * 'confirmation': 
          Might be added by the ASPSP if either the "scaRedirect" or "scaOAuth" hyperlink is returned 
          in the same response message. 
          This hyperlink defines the URL to the resource which needs to be updated with 
            * a confirmation code as retrieved after the plain redirect authentication process with the ASPSP authentication server or
            * an access token as retrieved by submitting an authorization code after the integrated OAuth based authentication process with the ASPSP authentication server.           
        * 'self': 
          The link to the payment initiation resource created by this request.
          This link can be used to retrieve the resource data.
        * 'status': 
          The link to retrieve the transaction status of the payment initiation.
        * 'scaStatus': 
          The link to retrieve the scaStatus of the corresponding authorisation sub-resource. 
          This link is only contained, if an authorisation sub-resource has been already created.

      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      properties:
        #BOI-REMARK not supported
        # scaRedirect:
        #   $ref: "#/components/schemas/hrefType"
        scaOAuth:
          $ref: "#/components/schemas/hrefType"
        #BOI-REMARK not supported
        # startAuthorisation:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithPsuIdentification:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithEncryptedPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithAuthenticationMethodSelection:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithTransactionAuthorisation:
        #   $ref: "#/components/schemas/hrefType"
        self:
          $ref: "#/components/schemas/hrefType"
        status:
          $ref: "#/components/schemas/hrefType"
        scaStatus:
          $ref: "#/components/schemas/hrefType"
      example: 
        {
        # "scaRedirect": {"href": "https://www.testbank.com/asdfasdfasdf"},
        "self": {"href": "/v1.0.8/payments/sepa-credit-transfers/1234-wertiq-983"}
        }

    
    # _linksPaymentInitiationCancel:
    #   description: |
    #     A list of hyperlinks to be recognised by the TPP. The actual hyperlinks used in the response depend on the 
    #     dynamical decisions of the ASPSP when processing the request.
      
    #     Remark: All links can be relative or full links, to be decided by the ASPSP.
      
    #     Type of links admitted in this response, (further links might be added for ASPSP defined extensions):
      
    #       # * 'startAuthorisation': 
    #       #   In case, where just the authorisation process of the cancellation needs to be started, 
    #       #   but no additional data needs to be updated for time being (no authentication method to be selected, 
    #       #   no PSU identification nor PSU authentication data to be uploaded).
    #       # * 'startAuthorisationWithPsuIdentification': 
    #       #   In case where a PSU Identification needs to be updated when starting the cancellation authorisation: 
    #       #   The link to the cancellation-authorisations end-point, where the cancellation sub-resource has to be 
    #       #   generated while uploading the PSU identification data.
    #       # * 'startAuthorisationWithAuthenticationMethodSelection':
    #       #   The link to the authorisation end-point, where the cancellation-authorisation sub-resource has to be 
    #       #   generated while selecting the authentication method. This link is contained under exactly the same 
    #       #   conditions as the data element 'scaMethods'
    #   type: object
    #   additionalProperties: 
    #       $ref: "#/components/schemas/hrefType"
    #   properties:
    #     # startAuthorisation:
    #     #   $ref: "#/components/schemas/hrefType"
    #     # startAuthorisationWithPsuIdentification:
    #     #   $ref: "#/components/schemas/hrefType"
    #     #BOI-REMARK not supported
    #     # startAuthorisationWithPsuAuthentication:
    #     #   $ref: "#/components/schemas/hrefType"
    #     # startAuthorisationWithEncryptedPsuAuthentication:
    #     #   $ref: "#/components/schemas/hrefType"
    #     # startAuthorisationWithAuthenticationMethodSelection:
    #     #  $ref: "#/components/schemas/hrefType"


    # _linksUpdatePsuIdentification:
    #   description: |
    #     A list of hyperlinks to be recognised by the TPP. The actual hyperlinks used in the response depend on the dynamical decisions of the ASPSP when processing the request.
        
    #     **Remark:** All links can be relative or full links, to be decided by the ASPSP.
        
    #     Type of links admitted in this response, (further links might be added for ASPSP 
    #     defined extensions):
        
    #     - 'scaStatus': The link to retrieve the scaStatus of the corresponding authorisation sub-resource.
    #     - 'selectAuthenticationMethod': This is a link to a resource, where the TPP can select the applicable second factor authentication methods for the PSU, if there are several available authentication methods and if the  PSU is already sufficiently authenticated.. If this link is contained, then there is also the data element "scaMethods" contained in the response body
    #   type: object
    #   additionalProperties: 
    #     $ref: "#/components/schemas/hrefType"
    #   properties:
    #     scaStatus:
    #       $ref: "#/components/schemas/hrefType"
    #     selectAuthenticationMethod:
    #       $ref: "#/components/schemas/hrefType"

#BOI-REMARK: not supported
    # _linksUpdatePsuAuthentication:
    #   description: |
    #     A list of hyperlinks to be recognised by the TPP. Might be contained, if several authentication methods 
    #     are available for the PSU.
    #     Type of links admitted in this response:
    #       * 'updateAdditionalPsuAuthentication':
    #         The link to the payment initiation or account information resource, 
    #         which needs to be updated by an additional PSU password. 
    #         This link is only contained in rare cases, 
    #         where such additional passwords are needed for PSU authentications.
    #       * 'updateAdditionalEncryptedPsuAuthentication': 
    #         The link to the payment initiation or account information resource, 
    #         which needs to be updated by an additional encrypted PSU password. 
    #         This link is only contained in rare cases, where such additional passwords are needed for PSU authentications.
    #       * 'selectAuthenticationMethod': 
    #         This is a link to a resource, where the TPP can select the applicable second factor authentication 
    #         methods for the PSU, if there were several available authentication methods. 
    #         This link is only contained, if the PSU is already identified or authenticated with the first relevant 
    #         factor or alternatively an access token, if SCA is required and if the PSU has a choice between different 
    #         authentication methods. 
    #         If this link is contained, then there is also the data element 'scaMethods' contained in the response body.
    #       #BOI-REMARK this link does not supported (embedded)
    #       #* 'authoriseTransaction': 
    #       #The link to the resource, where the "Transaction Authorisation Request" is sent to. 
    #       #This is the link to the resource which will authorise the transaction by checking the SCA authentication 
    #       #data within the Embedded SCA approach.
    #       * 'scaStatus': 
    #         The link to retrieve the scaStatus of the corresponding authorisation sub-resource.
    #   type: object
    #   additionalProperties: 
    #     $ref: "#/components/schemas/hrefType"
    #   properties:
    #     updateAdditionalPsuAuthentication:
    #       $ref: "#/components/schemas/hrefType"
    #     updateAdditionalEncryptedPsuAuthentication:
    #       $ref: "#/components/schemas/hrefType"
    #     selectAuthenticationMethod:
    #       $ref: "#/components/schemas/hrefType"
    #     #BOI-REMARK this link does not supported (embedded)
    #     # authoriseTransaction:
    #     #   $ref: "#/components/schemas/hrefType"
    #     scaStatus:
    #       $ref: "#/components/schemas/hrefType"


    # _linksSelectPsuAuthenticationMethod:
    #   description: |
    #     A list of hyperlinks to be recognised by the TPP. The actual hyperlinks used in 
    #     the response depend on the dynamical decisions of the ASPSP when processing the request.
        
    #     **Remark:** All links can be relative or full links, to be decided by the ASPSP. 
       
    #     **Remark:** This method can be applied before or after PSU identification. 
    #     This leads to many possible hyperlink responses.
    #     Type of links admitted in this response, (further links might be added for ASPSP defined 
    #     extensions):
        
    #     - 'scaRedirect': 
    #       In case of an SCA Redirect Approach, the ASPSP is transmitting the link to which to 
    #       redirect the PSU browser.
    #     - 'scaOAuth': 
    #       In case of a SCA OAuth2 Approach, the ASPSP is transmitting the URI where the 
    #       configuration of the Authorisation Server can be retrieved. 
    #       The configuration follows the OAuth 2.0 Authorisation Server Metadata specification.
    #     - 'updatePsuIdentification': 
    #       The link to the authorisation or cancellation authorisation sub-resource, 
    #       where PSU identification data needs to be uploaded.
    #     #BOI-REMARK not supported 
    #     #- 'updatePsuAuthentication':
    #     #The link to the authorisation or cancellation authorisation sub-resource, 
    #     #where PSU authentication data needs to be uploaded.
    #     #- 'updateEncryptedPsuAuthentication':
    #     #The link to the authorisation or cancellation authorisation sub-resource, 
    #     #where PSU authentication encrypted data needs to be uploaded.
    #     #- 'updateAdditionalPsuAuthentication':
    #     #The link to the payment initiation or account information resource, 
    #     #which needs to be updated by an additional PSU password. 
    #     #- 'updateAdditionalEncryptedPsuAuthentication': 
    #     #The link to the payment initiation or account information resource, 
    #     #which needs to be updated by an additional encrypted PSU password. 
    #     #- 'authoriseTransaction':
    #     #The link to the authorisation or cancellation authorisation sub-resource, 
    #     #where the authorisation data has to be uploaded, e.g. the TOP received by SMS. 
    #     - 'scaStatus': 
    #       The link to retrieve the scaStatus of the corresponding authorisation sub-resource.
    #   type: object
    #   additionalProperties: 
    #     $ref: "#/components/schemas/hrefType"
    #   properties:
    #     scaRedirect:
    #       $ref: "#/components/schemas/hrefType"
    #     scaOAuth:
    #       $ref: "#/components/schemas/hrefType"
    #     updatePsuIdentification:
    #       $ref: "#/components/schemas/hrefType"
    #     #BOI-REMARK not supported 
    #     # updatePsuAuthentication:
    #     #   $ref: "#/components/schemas/hrefType"
    #     # updateAdditionalPsuAuthentication:
    #     #   $ref: "#/components/schemas/hrefType"
    #     # updateAdditionalEncryptedPsuAuthentication:
    #     #   $ref: "#/components/schemas/hrefType"
    #     # authoriseTransaction:
    #     #   $ref: "#/components/schemas/hrefType"
    #     scaStatus:
    #       $ref: "#/components/schemas/hrefType"


    _linksStartScaProcess: 
      description: |
        A list of hyperlinks to be recognised by the TPP. The actual hyperlinks used in the 
        response depend on the dynamical decisions of the ASPSP when processing the request.
        
        **Remark:** All links can be relative or full links, to be decided by the ASPSP.
        
        Type of links admitted in this response, (further links might be added for ASPSP defined 
        extensions):

        - 'scaOAuth': 
          In case of a SCA OAuth2 Approach, the ASPSP is transmitting the URI where the configuration of the Authorisation Server can be retrieved. The configuration follows the OAuth 2.0 Authorisation Server Metadata specification.
        - 'scaStatus': 
          The link to retrieve the scaStatus of the corresponding authorisation sub-resource. 
        
      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      properties:
        #BOI-REMARK not supported
        # scaRedirect:
        #   $ref: "#/components/schemas/hrefType"
        scaOAuth: 
          $ref: "#/components/schemas/hrefType"
        #BOI-REMARK not supported
        # updatePsuIdentification: 
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithEncryptedPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # selectAuthenticationMethod:
        #   $ref: "#/components/schemas/hrefType"
        #BOI-REMARK this link does not supported (embedded)
        # authoriseTransaction:
        #   $ref: "#/components/schemas/hrefType"
        scaStatus: 
          $ref: "#/components/schemas/hrefType"

  #BOI-REMARK "download" link does not supported
  #  _linksDownload:
  #    description: |
  #      A list of hyperlinks to be recognised by the TPP.
  #      
  #      Type of links admitted in this response:
  #        - "download": a link to a resource, where the transaction report might be downloaded from in 
  #        case where transaction reports have a huge size.
        
  #      Remark: This feature shall only be used where camt-data is requested which has a huge size.

  #    type: object
  #    additionalProperties: 
  #      $ref: "#/components/schemas/hrefType"
  #    required:
  #      - download
  #    properties:
  #      download:
  #        $ref: "#/components/schemas/hrefType"



    _linksConsents:
      description: |
        A list of hyperlinks to be recognised by the TPP.
        
        Type of links admitted in this response (which might be extended by single ASPSPs as indicated in its XS2A 
        documentation):
          - 'scaOAuth': 
            In case of an OAuth2 based Redirect Approach, the ASPSP is transmitting the link where the configuration 
            of the OAuth2 Server is defined. 
            The configuration follows the OAuth 2.0 Authorisation Server Metadata specification. 
          - 'self': 
            The link to the Establish Account Information Consent resource created by this request. 
            This link can be used to retrieve the resource data. 
          - 'status': 
            The link to retrieve the status of the account information consent.
          - 'scaStatus': The link to retrieve the scaStatus of the corresponding authorisation sub-resource. 
            This link is only contained, if an authorisation sub-resource has been already created.

      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      properties:
        #BOI-REMARK not supported
        # scaRedirect: 
        #   $ref: "#/components/schemas/hrefType"
        scaOAuth:
          $ref: "#/components/schemas/hrefType"
        #BOI-REMARK not supported
        # startAuthorisation:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithPsuIdentification:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithEncryptedPsuAuthentication:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithAuthenticationMethodSelection:
        #   $ref: "#/components/schemas/hrefType"
        # startAuthorisationWithTransactionAuthorisation: 
        #   $ref: "#/components/schemas/hrefType"
        self:
          $ref: "#/components/schemas/hrefType"
        status:
          $ref: "#/components/schemas/hrefType"
        scaStatus:
          $ref: "#/components/schemas/hrefType"


    _linksGetConsent:
      description: |
        A list of hyperlinks to be recognised by the TPP.
        
        Links of type "account" and/or "cardAccount", depending on the nature of the consent.

      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      properties:
        account:
          $ref: "#/components/schemas/hrefType"
        card-account:
          $ref: "#/components/schemas/hrefType"

#BOI-REMARK not yet supported
    # _linksSigningBasket:
    #   description: |
    #     A list of hyperlinks to be recognised by the TPP. The actual hyperlinks used in the 
    #     response depend on the dynamical decisions of the ASPSP when processing the request.
        
    #     Remark: All links can be relative or full links, to be decided by the ASPSP.
    #     Type of links admitted in this response, (further links might be added for ASPSP defined 
    #     extensions):
        
    #       * 'scaRedirect': 
    #         In case of an SCA Redirect Approach, the ASPSP is transmitting the link to 
    #         which to redirect the PSU browser.
    #       * 'scaOAuth': 
    #         In case of a SCA OAuth2 Approach, the ASPSP is transmitting the URI where the configuration of 
    #         the Authorisation Server can be retrieved. The configuration follows the 
    #         OAuth 2.0 Authorisation Server Metadata specification.
    #       * 'startAuthorisation': 
    #         In case, where an explicit start of the transaction authorisation is needed, 
    #         but no more data needs to be updated (no authentication method to be selected, 
    #         no PSU identification nor PSU authentication data to be uploaded).
    #       * 'startAuthorisationWithPsuIdentification': 
    #         The link to the authorisation end-point, where the authorisation sub-resource 
    #         has to be generated while uploading the PSU identification data.
    #       * 'startAuthorisationWithAuthenticationMethodSelection':
    #         The link to the authorisation end-point, where the authorisation sub-resource 
    #         has to be generated while selecting the authentication method. 
    #         This link is contained under exactly the same conditions as the data element 'scaMethods' 
    #      #* 'startAuthorisationWithTransactionAuthorisation':
    #      #The link to the authorisation end-point, where the authorisation sub-resource 
    #      #has to be generated while authorising the transaction e.g. by uploading an 
    #      #OTP received by SMS.
    #       * 'self': 
    #         The link to the payment initiation resource created by this request. 
    #         This link can be used to retrieve the resource data. 
    #       * 'status': 
    #         The link to retrieve the transaction status of the payment initiation.
    #       * 'scaStatus': 
    #         The link to retrieve the scaStatus of the corresponding authorisation sub-resource. 
    #         This link is only contained, if an authorisation sub-resource has been already created.
        
    #   type: object
    #   properties:
    #     scaRedirect: 
    #       $ref: "#/components/schemas/hrefType"
    #     scaOAuth: 
    #       $ref: "#/components/schemas/hrefType"
    #     startAuthorisation: 
    #       $ref: "#/components/schemas/hrefType"
    #     startAuthorisationWithPsuIdentification: 
    #       $ref: "#/components/schemas/hrefType"
    #     #BOI-REMARK not supported
    #     # startAuthorisationWithPsuAuthentication:
    #     #   $ref: "#/components/schemas/hrefType"
    #     # startAuthorisationWithEncryptedPsuAuthentication:
    #     #   $ref: "#/components/schemas/hrefType"
    #     # startAuthorisationWithAuthenticationMethodSelection:
    #     #  $ref: "#/components/schemas/hrefType"
    #     startAuthorisationWithTransactionAuthorisation:
    #       $ref: "#/components/schemas/hrefType"
    #     self: 
    #       $ref: "#/components/schemas/hrefType"
    #     status: 
    #       $ref: "#/components/schemas/hrefType"
    #     scaStatus: 
    #       $ref: "#/components/schemas/hrefType"


    _linksAccountReport:
      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      required:
        - account
      properties:
        account:
          $ref: "#/components/schemas/hrefType"
        first:
          $ref: "#/components/schemas/hrefType"
        next:
          $ref: "#/components/schemas/hrefType"
        previous:
          $ref: "#/components/schemas/hrefType"
        last:
          $ref: "#/components/schemas/hrefType"


    _linksCardAccountReport:
      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      required:
        - cardAccount
      properties:
        cardAccount:
          $ref: "#/components/schemas/hrefType"
        first:
          $ref: "#/components/schemas/hrefType"
        next:
          $ref: "#/components/schemas/hrefType"
        previous:
          $ref: "#/components/schemas/hrefType"
        last:
          $ref: "#/components/schemas/hrefType"


    _linksTransactionDetails:
      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      required:
        - transactionDetails
      properties:
        transactionDetails:
          $ref: "#/components/schemas/hrefType"
      
    _linksAccountDetails:
      description: |
        Links to the account, which can be directly used for retrieving account information from this dedicated account.
        
        Links to "balances" and/or "transactions"
        
        These links are only supported, when the corresponding consent has been already granted.
      type: object
      additionalProperties: 
        $ref: "#/components/schemas/hrefType"
      properties:
        balances:
          $ref: "#/components/schemas/hrefType"
        transactions:
          $ref: "#/components/schemas/hrefType"

#####################################################
# Tpp-Messages to Communicate Error Information
#####################################################


  #####################################################
  # Generic Elements
  #####################################################

    tppMessageCategory:
      description: Category of the TPP message category
      type: string
      enum:
        - "ERROR"
        - "WARNING"

    MessageCode2XX: 
      description: Message codes for HTTP Error codes 2XX.
      type: string
      enum: 
        - "WARNING"


    MessageCode400_AIS: 
      description: Message codes defined for AIS for HTTP Error code 400 (BAD_REQUEST).
      type: string
      enum: 
        - "FORMAT_ERROR"              #gen
        - "PARAMETER_NOT_CONSISTENT"  #gen
        - "PARAMETER_NOT_SUPPORTED"   #gen #BOI-REMARK: This code should only be used for parameters that are described as "optional if supported by API provider" or "not suported".
        - "SERVICE_INVALID"           #gen
        - "RESOURCE_UNKNOWN"          #gen
        - "RESOURCE_EXPIRED"          #gen
        - "RESOURCE_BLOCKED"          #gen
        - "TIMESTAMP_INVALID"         #gen
        - "PERIOD_INVALID"            #gen
        - "SCA_METHOD_UNKNOWN"        #gen
        - "SCA_INVALID"               #gen
        - "CONSENT_UNKNOWN"           #gen
        - "SESSIONS_NOT_SUPPORTED"    #AIS


    MessageCode400_PIS: 
      description: Message codes defined for PIS for HTTP Error code 400 (BAD_REQUEST).
      type: string
      enum: 
        - "FORMAT_ERROR"              #gen
        - "PARAMETER_NOT_CONSISTENT"  #gen
        - "PARAMETER_NOT_SUPPORTED"   #gen #BOI-REMARK: This code should only be used for parameters that are described as "optional if supported by API provider" or "not suported".
        - "SERVICE_INVALID"           #gen
        - "RESOURCE_UNKNOWN"          #gen
        - "RESOURCE_EXPIRED"          #gen
        - "RESOURCE_BLOCKED"          #gen
        - "TIMESTAMP_INVALID"         #gen
        - "PERIOD_INVALID"            #gen
        - "SCA_METHOD_UNKNOWN"        #gen
        - "SCA_INVALID"               #gen
        - "CONSENT_UNKNOWN"           #gen
        - "PAYMENT_FAILED"            #PIS
        - "EXECUTION_DATE_INVALID"    #PIS


    # MessageCode400_PIIS: 
    #   description: Message codes defined for PIIS for HTTP Error code 400 (BAD_REQUEST).
    #   type: string
    #   enum: 
    #     - "FORMAT_ERROR"              #gen
    #     - "PARAMETER_NOT_CONSISTENT"  #gen
    #     - "PARAMETER_NOT_SUPPORTED"   #gen #BOI-REMARK: This code should only be used for parameters that are described as "optional if supported by API provider" or "not suported".
    #     - "SERVICE_INVALID"           #gen
    #     - "RESOURCE_UNKNOWN"          #gen
    #     - "RESOURCE_EXPIRED"          #gen
    #     - "RESOURCE_BLOCKED"          #gen
    #     - "TIMESTAMP_INVALID"         #gen
    #     - "PERIOD_INVALID"            #gen
    #     - "SCA_METHOD_UNKNOWN"        #gen
    #     - "CONSENT_UNKNOWN"           #gen
    #     - "CARD_INVALID"              #PIIS
    #     - "NO_PIIS_ACTIVATION"        #PIIS


    # MessageCode400_SBS: 
    #   description: Message codes defined for signing baskets for HTTP Error code 400 (BAD_REQUEST).
    #   type: string
    #   enum: 
    #     - "FORMAT_ERROR"              #gen
    #     - "PARAMETER_NOT_CONSISTENT"  #gen
    #     - "PARAMETER_NOT_SUPPORTED"   #gen #BOI-REMARK: This code should only be used for parameters that are described as "optional if supported by API provider" or "not suported".
    #     - "SERVICE_INVALID"           #gen
    #     - "RESOURCE_UNKNOWN"          #gen
    #     - "RESOURCE_EXPIRED"          #gen
    #     - "RESOURCE_BLOCKED"          #gen
    #     - "TIMESTAMP_INVALID"         #gen
    #     - "PERIOD_INVALID"            #gen
    #     - "SCA_METHOD_UNKNOWN"        #gen
    #     - "CONSENT_UNKNOWN"           #gen
    #     - "REFERENCE_MIX_INVALID"     #SBS


    MessageCode401_PIS: 
      description: Message codes defined for PIS for HTTP Error code 401 (UNAUTHORIZED).
      type: string
      enum: 
        - "CERTIFICATE_INVALID"       #gen
        - "ROLE_INVALID"              #gen
        - "CERTIFICATE_EXPIRED"       #gen
        - "CERTIFICATE_BLOCKED"       #gen
        - "CERTIFICATE_REVOKE"        #gen
        - "CERTIFICATE_MISSING"       #gen
        - "SIGNATURE_INVALID"         #gen
        - "SIGNATURE_MISSING"         #gen
        - "CORPORATE_ID_INVALID"      #gen
        - "PSU_CREDENTIALS_INVALID"   #gen
        - "CONSENT_INVALID"           #gen, AIS
        - "CONSENT_EXPIRED"           #gen
        - "TOKEN_UNKNOWN"             #gen
        - "TOKEN_INVALID"             #gen
        - "TOKEN_EXPIRED"             #gen
        - "REQUIRED_KID_MISSING"      #PIS


    MessageCode401_AIS: 
      description: Message codes defined for AIS for HTTP Error code 401 (UNAUTHORIZED).
      type: string
      enum: 
        - "CERTIFICATE_INVALID"       #gen
        - "ROLE_INVALID"              #gen
        - "CERTIFICATE_EXPIRED"       #gen
        - "CERTIFICATE_BLOCKED"       #gen
        - "CERTIFICATE_REVOKE"        #gen
        - "CERTIFICATE_MISSING"       #gen
        - "SIGNATURE_INVALID"         #gen
        - "SIGNATURE_MISSING"         #gen
        - "CORPORATE_ID_INVALID"      #gen
        - "PSU_CREDENTIALS_INVALID"   #gen
        - "CONSENT_INVALID"           #gen, AIS
        - "CONSENT_EXPIRED"           #gen
        - "TOKEN_UNKNOWN"             #gen
        - "TOKEN_INVALID"             #gen
        - "TOKEN_EXPIRED"             #gen


    MessageCode401_PIIS: 
      description: Message codes defined for PIIS for HTTP Error code 401 (UNAUTHORIZED).
      type: string
      enum: 
        - "CERTIFICATE_INVALID"       #gen
        - "ROLE_INVALID"              #gen
        - "CERTIFICATE_EXPIRED"       #gen
        - "CERTIFICATE_BLOCKED"       #gen
        - "CERTIFICATE_REVOKE"        #gen
        - "CERTIFICATE_MISSING"       #gen
        - "SIGNATURE_INVALID"         #gen
        - "SIGNATURE_MISSING"         #gen
        - "CORPORATE_ID_INVALID"      #gen
        - "PSU_CREDENTIALS_INVALID"   #gen
        - "CONSENT_INVALID"           #gen, AIS
        - "CONSENT_EXPIRED"           #gen
        - "TOKEN_UNKNOWN"             #gen
        - "TOKEN_INVALID"             #gen
        - "TOKEN_EXPIRED"             #gen


    MessageCode401_SBS: 
      description: Message codes defined for signing baskets for HTTP Error code 401 (UNAUTHORIZED).
      type: string
      enum: 
        - "CERTIFICATE_INVALID"       #gen
        - "ROLE_INVALID"              #gen
        - "CERTIFICATE_EXPIRED"       #gen
        - "CERTIFICATE_BLOCKED"       #gen
        - "CERTIFICATE_REVOKE"        #gen
        - "CERTIFICATE_MISSING"       #gen
        - "SIGNATURE_INVALID"         #gen
        - "SIGNATURE_MISSING"         #gen
        - "CORPORATE_ID_INVALID"      #gen
        - "PSU_CREDENTIALS_INVALID"   #gen
        - "CONSENT_INVALID"           #gen, AIS
        - "CONSENT_EXPIRED"           #gen
        - "TOKEN_UNKNOWN"             #gen
        - "TOKEN_INVALID"             #gen
        - "TOKEN_EXPIRED"             #gen
        
        
    MessageCode403_PIS: 
      description: Message codes defined defined for PIS for PIS for HTTP Error code 403 (FORBIDDEN).
      type: string
      enum: 
        - "CONSENT_UNKNOWN"           #gen
        - "SERVICE_BLOCKED"           #gen
        - "RESOURCE_UNKNOWN"          #gen
        - "RESOURCE_EXPIRED"          #gen
        - "PRODUCT_INVALID"           #PIS

    MessageCode403_AIS: 
      description: Message codes defined for AIS for HTTP Error code 403 (FORBIDDEN).
      type: string
      enum: 
        - "CONSENT_UNKNOWN"           #gen
        - "SERVICE_BLOCKED"           #gen
        - "RESOURCE_UNKNOWN"          #gen
        - "RESOURCE_EXPIRED"          #gen


    MessageCode403_PIIS: 
      description: Message codes defined for PIIS for HTTP Error code 403 (FORBIDDEN).
      type: string
      enum: 
        - "CONSENT_UNKNOWN"           #gen
        - "SERVICE_BLOCKED"           #gen
        - "RESOURCE_UNKNOWN"          #gen
        - "RESOURCE_EXPIRED"          #gen


    MessageCode403_SBS: 
      description: Message codes defined for signing baskets for HTTP Error code 403 (FORBIDDEN).
      type: string
      enum: 
        - "CONSENT_UNKNOWN"           #gen
        - "SERVICE_BLOCKED"           #gen
        - "RESOURCE_UNKNOWN"          #gen
        - "RESOURCE_EXPIRED"          #gen


    MessageCode404_PIS: 
      description: Message codes defined for PIS for HTTP Error code 404 (NOT FOUND).
      type: string
      enum: 
        - "RESOURCE_UNKNOWN"          #gens
        - "PRODUCT_UNKNOWN"           #PIS


    MessageCode404_AIS: 
      description: Message codes defined for AIS for HTTP Error code 404 (NOT FOUND).
      type: string
      enum: 
        - "RESOURCE_UNKNOWN"          #gens


    MessageCode404_PIIS: 
      description: Message codes defined for PIIS for HTTP Error code 404 (NOT FOUND).
      type: string
      enum: 
        - "RESOURCE_UNKNOWN"          #gens


    MessageCode404_SBS: 
      description: Message codes defined for signing baskets for HTTP Error code 404 (NOT FOUND).
      type: string
      enum: 
        - "RESOURCE_UNKNOWN"          #gens


    MessageCode405_PIS: 
      description: Message codes defined for payment cancelations PIS for HTTP Error code 405 (METHOD NOT ALLOWED).
      type: string
      enum: 
        - "SERVICE_INVALID"           #gens

    
    MessageCode405_PIS_CANC: 
      description: Message codes defined for payment cancelations PIS for HTTP Error code 405 (METHOD NOT ALLOWED).
      type: string
      enum: 
        - "CANCELLATION_INVALID"      #PIS
        - "SERVICE_INVALID"           #gens

    MessageCode405_AIS: 
      description: Message codes defined for AIS for HTTP Error code 405 (METHOD NOT ALLOWED).
      type: string
      enum: 
        - "SERVICE_INVALID"           #gens

    MessageCode405_PIIS: 
      description: Message codes defined for PIIS for HTTP Error code 405 (METHOD NOT ALLOWED).
      type: string
      enum: 
        - "SERVICE_INVALID"           #gens

    MessageCode405_SBS: 
      description: Message codes defined for SBS for HTTP Error code 405 (METHOD NOT ALLOWED).
      type: string
      enum: 
        - "SERVICE_INVALID"           #gens


    MessageCode406_AIS: 
      description: Message codes defined for AIS for HTTP Error code 406 (NOT ACCEPTABLE).
      type: string
      enum: 
        - "REQUESTED_FORMATS_INVALID"  #AIS


    MessageCode409_AIS: 
      description: Message codes defined for AIS for HTTP Error code 409 (CONFLICT).
      type: string
      enum: 
        - "STATUS_INVALID"            #gen

    MessageCode409_PIS: 
      description: Message codes defined for PIS for HTTP Error code 409 (CONFLICT).
      type: string
      enum: 
        - "STATUS_INVALID"            #gen

    MessageCode409_PIIS: 
      description: Message codes defined for PIIS for HTTP Error code 409 (CONFLICT).
      type: string
      enum: 
        - "STATUS_INVALID"            #gen

    MessageCode409_SBS: 
      description: Message codes defined for signing baskets for HTTP Error code 409 (CONFLICT).
      type: string
      enum: 
        - "REFERENCE_STATUS_INVALID"  #SBS
        - "STATUS_INVALID"            #gen


    MessageCode429_AIS: 
      description: Message codes for HTTP Error code 429 (TOO MANY REQUESTS).
      type: string
      enum: 
        - "ACCESS_EXCEEDED"           #AIS



  #####################################################
  # Next Gen propriatary Tpp-Messages
  #####################################################


    tppMessageText:
      description: Additional explaining text to the TPP.
      type: string
      maxLength: 500


    tppMessage2XX: 
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode2XX"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage400_AIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode400_AIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage400_PIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode400_PIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"

#BOI-REMARK not supported
    # tppMessage400_PIIS:
    #   type: object
    #   required:
    #     - category
    #     - code
    #   properties:
    #     category:
    #       $ref: "#/components/schemas/tppMessageCategory"
    #     code:
    #       $ref: "#/components/schemas/MessageCode400_PIIS"
    #     path:
    #       type: string
    #     text:
    #       $ref: "#/components/schemas/tppMessageText"


    # tppMessage400_SBS:
    #   type: object
    #   required:
    #     - category
    #     - code
    #   properties:
    #     category:
    #       $ref: "#/components/schemas/tppMessageCategory"
    #     code:
    #       $ref: "#/components/schemas/MessageCode400_SBS"
    #     path:
    #       type: string
    #     text:
    #       $ref: "#/components/schemas/tppMessageText"


    tppMessage401_PIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode401_PIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"

    tppMessage401_AIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode401_AIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage401_PIIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode401_PIIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage401_SBS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode401_SBS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage403_PIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode403_PIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage403_AIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode403_AIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage403_PIIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode403_PIIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage403_SBS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode403_SBS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage404_PIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode404_PIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage404_AIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode404_AIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage404_PIIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode404_PIIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage404_SBS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode404_SBS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage405_PIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode405_PIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"
    
    tppMessage405_PIS_CANC:
      type: object
      required:
        - category
        - code
      properties:
        category:
          $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode405_PIS_CANC"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage405_AIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode405_AIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage405_PIIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode405_PIIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage405_SBS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode405_SBS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage409_PIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode409_PIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"
      example:
        {
          "category": "ERROR",
          "code": "STATUS_INVALID",
          "text": "additional text information of the ASPSP up to 512 characters"
        }



    tppMessage406_AIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode406_AIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"


    tppMessage409_AIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode409_AIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"
      example:
        {
          "category": "ERROR",
          "code": "STATUS_INVALID",
          "text": "additional text information of the ASPSP up to 512 characters"
        }


    tppMessage409_PIIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode409_PIIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"
      example:
        {
          "category": "ERROR",
          "code": "STATUS_INVALID",
          "text": "additional text information of the ASPSP up to 512 characters"
        }

    tppMessage409_SBS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode409_SBS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"
      example:
        {
          "category": "ERROR",
          "code": "STATUS_INVALID",
          "text": "additional text information of the ASPSP up to 512 characters"
        }

    tppMessage429_AIS:
      type: object
      required:
        - category
        - code
      properties:
        category:
           $ref: "#/components/schemas/tppMessageCategory"
        code:
          $ref: "#/components/schemas/MessageCode429_AIS"
        path:
          type: string
        text:
          $ref: "#/components/schemas/tppMessageText"
      example:
        {
          "category": "ERROR",
          "code": "ACCESS_EXCEEDED",
          "text": "additional text information of the ASPSP up to 512 characters"
        }
        
#BOI-REMARK: Standarised Additional Error Information is not supported

  #####################################################
  # RFC7807 Messages
  #####################################################

    # tppErrorTitle:
    #   description: |
    #     Short human readable description of error type. 
    #     Could be in local language. 
    #     To be provided by ASPSPs.
    #   type: string
    #   maxLength: 70

    # tppErrorDetail:
    #   description: |
    #     Detailed human readable text specific to this instance of the error. 
    #     XPath might be used to point to the issue generating the error in addition.
    #     Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #   type: string
    #   maxLength: 512



#BOI-REMARK: Standarised Additional ErroR Information is not supported

  #####################################################
  # RFC7807 Messages
  #####################################################


    # Error400_PIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 400 for PIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode400_PIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode400_PIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error400_AIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 400 for AIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode400_AIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode400_AIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error400_PIIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 400 for PIIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode400_PIIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode400_PIIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error400_SBS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 400 for signing baskets.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode400_SBS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode400_SBS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error401_PIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 401 for PIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode401_PIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode401_PIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error401_AIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 401 for AIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode401_AIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode401_AIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error401_PIIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 401 for PIIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode401_PIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode401_PIIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error401_SBS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 401 for signing baskets.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode401_SBS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode401_SBS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error403_PIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 403 for PIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode403_PIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode403_PIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error403_AIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 403 for AIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode403_AIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode403_AIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error403_PIIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 403 for PIIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode403_PIIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode403_PIIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error403_SBS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 403 for signing baskets.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode403_SBS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode403_SBS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error404_PIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 404 for PIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode404_PIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode404_PIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error404_AIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 404 for AIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode404_AIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode404_AIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error404_PIIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 404 for PIIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode404_PIIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode404_PIIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error404_SBS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 404 for signing baskets.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode404_SBS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode404_SBS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error405_PIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 405 for PIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode405_PIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode405_PIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error405_PIS_CANC: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 405 for a pament cancelation (PIS).
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode405_PIS_CANC"
    #     # additionalErrors:
    #     #   description: |
    #     #     Array of Error Information Blocks.
            
    #     #     Might be used if more than one error is to be communicated
    #     #   type: array
    #     #   items: #ErrorInformation
    #     #     description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #     #     type: object
    #     #     required:
    #     #       - code
    #     #     properties:
    #     #       title:
    #     #         $ref: "#/components/schemas/tppErrorTitle"
    #     #       detail:
    #     #         $ref: "#/components/schemas/tppErrorDetail"
    #     #       code:
    #     #         $ref: "#/components/schemas/MessageCode405_PIS_CANC"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error405_AIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 405 for AIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode405_AIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode405_AIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error405_PIIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 405 for PIIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode405_PIIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode405_PIIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error405_SBS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 405 for signing baskets.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode405_SBS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode405_SBS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error406_AIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 406 for AIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode406_AIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode406_AIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error409_PIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 409 for PIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode409_PIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode409_PIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error409_AIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 409 for AIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode409_AIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode409_AIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error409_PIIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 409 for PIIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode409_PIIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode409_PIIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error409_SBS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 409 for signing baskets.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode409_SBS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: This is a data element to support the declaration of additional errors in the context of [RFC7807]. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode409_SBS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error429_AIS: 
    #   description: |
    #     Standardised definition of reporting error information according to [RFC7807] 
    #     in case of a HTTP error code 429 for AIS.
    #   type: object
    #   required:
    #     - type
    #     - code
    #   properties:
    #     type: 
    #       description: |
    #         A URI reference [RFC3986] that identifies the problem type. 
    #         Remark For Future: These URI will be provided by NextGenPSD2 in future.
    #       type: string
    #       format: uri
    #       maxLength: 70
    #     title:
    #       description: |
    #         Short human readable description of error type. 
    #         Could be in local language. 
    #         To be provided by ASPSPs.
    #       type: string
    #       maxLength: 70
    #     detail:
    #       description: |
    #         Detailed human readable text specific to this instance of the error. 
    #         XPath might be used to point to the issue generating the error in addition.
    #         Remark for Future: In future, a dedicated field might be introduced for the XPath.
    #       type: string
    #       maxLength: 512
    #     code:
    #       $ref: "#/components/schemas/MessageCode429_AIS"
    #     additionalErrors:
    #       description: |
    #         Array of Error Information Blocks.
            
    #         Might be used if more than one error is to be communicated
    #       type: array
    #       items: #ErrorInformation
    #         description: |
    #           This is a data element to support the declaration of additional errors in the context of [RFC7807] 
    #           in case of a HTTP error code 429 for. 
    #         type: object
    #         required:
    #           - code
    #         properties:
    #           title:
    #             $ref: "#/components/schemas/tppErrorTitle"
    #           detail:
    #             $ref: "#/components/schemas/tppErrorDetail"
    #           code:
    #             $ref: "#/components/schemas/MessageCode429_AIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"
    #   #example: 
    #     #$ref: "#/components/examples/RFC7807_ErrorInfoBody"


    Error400_NG_PIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 400.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage400_PIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error400_NG_AIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 400.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage400_AIS"
        _links:
          $ref: "#/components/schemas/_linksAll"

#BOI-REMARK not in use

    # Error400_NG_PIIS: 
    #   description: |
    #     NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 400.
    #   type: object
    #   properties:
    #     tppMessages:
    #       type: array
    #       items:
    #         $ref: "#/components/schemas/tppMessage400_PIIS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"


    # Error400_NG_SBS: 
    #   description: |
    #     NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 400.
    #   type: object
    #   properties:
    #     tppMessages:
    #       type: array
    #       items:
    #         $ref: "#/components/schemas/tppMessage400_SBS"
    #     _links:
    #       $ref: "#/components/schemas/_linksAll"



    Error401_NG_PIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage401_PIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error401_NG_AIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage401_AIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error401_NG_PIIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage401_PIIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error401_NG_SBS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage401_SBS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error403_NG_PIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 403.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage403_PIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error403_NG_AIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 403.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage403_AIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error403_NG_PIIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 403.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage403_PIIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error403_NG_SBS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 403.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage403_SBS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error404_NG_PIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 404.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage404_PIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error404_NG_AIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 404.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage404_AIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error404_NG_PIIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 404.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage404_PIIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error404_NG_SBS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 404.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage404_SBS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error405_NG_PIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage405_PIS"
        _links:
          $ref: "#/components/schemas/_linksAll"

    

    Error405_NG_PIS_CANC: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage405_PIS_CANC"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error405_NG_AIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage405_AIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error405_NG_PIIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage405_PIIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error405_NG_SBS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 401.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage405_SBS"
        _links:
          $ref: "#/components/schemas/_linksAll"
          

    Error406_NG_AIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 406.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage406_AIS"
        _links:
          $ref: "#/components/schemas/_linksAll"


    Error409_NG_PIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 409.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage409_PIS"
        _links:
          $ref: "#/components/schemas/_linksAll"
     

    Error409_NG_AIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 409.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage409_AIS"
        _links:
          $ref: "#/components/schemas/_linksAll"
     


    Error409_NG_PIIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 409.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage409_PIIS"
        _links:
          $ref: "#/components/schemas/_linksAll"



    Error409_NG_SBS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 409.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage409_SBS"
        _links:
          $ref: "#/components/schemas/_linksAll"



    Error429_NG_AIS: 
      description: |
        NextGenPSD2 specific definition of reporting error information in case of a HTTP error code 429.
      type: object
      properties:
        tppMessages:
          type: array
          items:
            $ref: "#/components/schemas/tppMessage429_AIS"
        _links:
          $ref: "#/components/schemas/_linksAll"



  parameters:
  #####################################################
  # Predefined Parameters
  #####################################################

#BOI-REMARK: BULK AND PERIODIC PAYMENTS ARE OPTIONAL
#roiz_1.8 - added bulk-payments and periodic-payments
    paymentService:
      name: payment-service
      in: path
      description: |
        Payment service:
        
        Possible values are:
        * payments
        * bulk-payments
        * periodic-payments
      required: true
      schema:
        type: string
        enum:
          - "payments"
          #BOI-REAMRK - optional
          - "bulk-payments"
          #BOI-REAMRK - optional
          - "periodic-payments"

#BOI-REMARK: just "masav" and "zahav" and "FP"  are supported
    paymentProduct:
      name: payment-product
      in: path
      description: |
        The addressed payment product endpoint.
        The ASPSP will publish which of the payment products/endpoints will be supported.
        
        The following payment products are supported:
          - masav
          - zahav
          - FP – relevant also for transfers on the same bank.

      required: true
      schema:
        type: string
        enum:
          - "masav"
          - "zahav"
          - "fp"


    paymentId:
      name: paymentId
      in: path
      description: Resource identification of the generated payment initiation resource.
      required: true
      schema:
        $ref: "#/components/schemas/paymentId"


    authorisationId:
      name: authorisationId
      in: path
      description: Resource identification of the related SCA.
      required: true
      schema:
        $ref: "#/components/schemas/authorisationId"


    accountId:
      name: account-id
      in: path
      description: |
        This identification is denoting the addressed account. 
        The account-id is retrieved by using a "Read Account List" call. 
        The account-id is the "id" attribute of the account structure. 
        Its value is constant at least throughout the lifecycle of a given consent.
      required: true
      schema:
        $ref: "#/components/schemas/accountId"


    transactionId:
      name: transactionId
      in: path
      description: |
        This identification is given by the attribute transactionId of the corresponding entry of a transaction list.
      required: true
      schema:
        $ref: "#/components/schemas/transactionId"

#BOI-REMARK not in use

    # basketId_PATH:
    #   name: basketId
    #   in: path
    #   description: |
    #     This identification of the corresponding signing basket object.
    #   required: true
    #   schema:
    #     $ref: "#/components/schemas/basketId"


    consentId_PATH:
      name: consentId
      in: path
      description: |
        ID of the corresponding consent object as returned by an Account Information Consent Request.
      required: true
      schema:
        $ref: "#/components/schemas/consentId"


    consentId_HEADER_optional:
      name: Consent-ID
      in: header
      description: |
        This data element may be contained, if the payment initiation transaction is part of a session, i.e. combined AIS/PIS service.
        This then contains the consentId of the related AIS consent, which was performed prior to this payment initiation.
      required: false
      schema:
        $ref: "#/components/schemas/consentId"

    Authorization:
      name: Authorization
      in: header
      description: |
        This field  might be used in case where a consent was agreed between ASPSP and PSU through an OAuth2 based protocol, 
        facilitated by the TPP.
      required: false
      schema:
        $ref: "#/components/schemas/authorization"

    consentId_HEADER_mandatory:
      name: Consent-ID
      in: header
      description: |
        This then contains the consentId of the related AIS consent, which was performed prior to this payment initiation.
      required: true
      schema:
        $ref: "#/components/schemas/consentId"


    withBalanceQuery:
      name: withBalance
      in: query
      description: |
        If contained, this function reads the list of accessible payment accounts including the booking balance, 
        if granted by the PSU in the related consent and available by the ASPSP. 
        This parameter might be ignored by the ASPSP. 
      required: false
      schema:
        type: boolean

#BOI-REMARK: set to mandatory by BOI.
    dateFrom:
      name: dateFrom
      in: query
      description: |
        Conditional: Starting date (inclusive the date dateFrom) of the transaction list, mandated if no delta access is required.
        
        For booked transactions, the relevant date is the booking date. 
        
        For pending transactions, the relevant date is the entry date, which may not be transparent 
        neither in this API nor other channels of the ASPSP.
         BOI-REMARK: the minimum value can be 12 month prior to "now". In case of exception from the minimum value a message code PERIOD_INVALID should returned.
      required: true
      schema:
        type: string
        format: date


    dateTo:
      name: dateTo
      in: query
      description: |
        End date (inclusive the data dateTo) of the transaction list, default is "now" if not given. 
        
        Might be ignored if a delta function is used.
        
        For booked transactions, the relevant date is the booking date. 
        
        For pending transactions, the relevant date is the entry date, which may not be transparent 
        neither in this API nor other channels of the ASPSP.
        BOI-REMARK: ASPSP must support this option for account-id/transactions

      required: false
      schema:
        type: string
        format: date


    entryReferenceFrom:
      name: entryReferenceFrom
      in: query
      description: |
        This data attribute is indicating that the AISP is in favour to get all transactions after 
        the transaction with identification entryReferenceFrom alternatively to the above defined period. 
        This is a implementation of a delta access. 
        If this data element is contained, the entries "dateFrom" and "dateTo" might be ignored by the ASPSP 
        if a delta report is supported.
        
        Optional if supported by API provider.
      required: false
      schema:
        type: string


    bookingStatus:
      name: bookingStatus
      in: query
      description: |
        Permitted codes are 
          * "booked",
          * "pending" and 
          * "both"
        "booked" shall be supported by the ASPSP.
        To support the "pending" and "both" feature is optional for the ASPSP, 
        Error code if not supported in the online banking frontend
      required: true
      schema:
        type: string
        enum:
          - "booked"
          - "pending"
          - "both"


    deltaList:
      name: deltaList
      in: query
      description: 
        This data attribute is indicating that the AISP is in favour to get all transactions after the last report access 
        for this PSU on the addressed account. 
        This is another implementation of a delta access-report.
        
        This delta indicator might be rejected by the ASPSP if this function is not supported.
        
        Optional if supported by API provider
      schema:
        type: boolean

#BOI-REMARK- mandate this field
    deltaList_mandatory:
      name: deltaList
      in: query
      description: 
        This data attribute is indicating that the AISP is in favour to get all transactions after the last report access 
        for this PSU on the addressed account. 
        This is another implementation of a delta access-report.
        
        This delta indicator might be rejected by the ASPSP if this function is not supported.
        
      schema:
        type: boolean
      required: true


    X-Request-ID:
      name: X-Request-ID
      in: header
      description: ID of the request, unique to the call, as determined by the initiating party.
      required: true
      example: "99391c7e-ad88-49ec-a2ad-99ddcb1f7721"
      schema:
        type: string
        format: uuid


    #BOI-REMARK: signing request messages is mandatory for TPP on all requests. The TPPhas to use QSEALC certificate issued by Gov CA in order to sign request messages.
    Digest:
      name: Digest
      in: header
      description: Is contained if and only if the "Signature" element is contained in the header of the request.
      schema:
        type: string
        maxLength: 1024
      required: true 
      example: "SHA-256=hl1/Eps8BEQW58FJhDApwJXjGY4nr1ArGDHIT25vq6A="

    #BOI-REMARK: signing request messages is mandatory for TPP on all requests. The TPPhas to use QSEALC certificate issued by Gov CA in order to sign request messages.
    Signature:
      name: Signature
      in: header
      description: |
        A signature of the request by the TPP on application level. This might be mandated by ASPSP.
      schema:
        type: string
        maxLength: 4096
      required: true 
      example: >
        keyId="SN=9FA1,CA=CN=D-TRUST%20CA%202-1%202015,O=D-Trust%20GmbH,C=DE",algorithm="rsa-sha256",
        headers="Digest X-Request-ID PSU-ID TPP-Redirect-URI Date",
        signature="Base64(RSA-SHA256(signing string))"

    #BOI-REMARK: signing request messages is mandatory for TPP on all requests. The TPPhas to use QSEALC certificate issued by Gov CA in order to sign request messages.
    TPP-Signature-Certificate:
      name: TPP-Signature-Certificate
      in: header
      description: |
        The certificate used for signing the request, in base64 encoding. 
        Must be contained if a signature is contained.
      schema:
        type: string
        format: byte
      required: true 


    TPP-Redirect-Preferred:
      name: TPP-Redirect-Preferred
      in: header
      description: |
         BOI-REMARK- If it equals "false" , the ASPSP has to choose Decoupled SCA approach if supported by the ASPSP for the related PSU, because Embedded does not supported.
         ASPSP not supporting Decoupled SCA approach can ignore this attribute.
      schema:
        type: string
        enum:
          - "true"
          - "false"
        #type: boolean
      required: false


    TPP-Redirect-URI:
      name: TPP-Redirect-URI
      in: header
      description: |
        URI of the TPP, where the transaction flow shall be redirected to after a Redirect.
        
        Mandated for the Redirect SCA Approach, specifically 
        when TPP-Redirect-Preferred equals "true".
        It is recommended to always use this header field.
        
        **Remark for Future:** 
        This field might be changed to mandatory in the next version of the specification.
      schema:
        type: string
        format: uri
        maxLength: 2048
      required: false # optional


    TPP-Nok-Redirect-URI:
      name: TPP-Nok-Redirect-URI
      in: header
      description: |
        If this URI is contained, the TPP is asking to redirect the transaction flow to this address instead of the TPP-Redirect-URI in case
        of a negative result of the redirect SCA method. This might be ignored by the ASPSP.
      schema:
        type: string
        format: uri
        maxLength: 2048
      required: false


    TPP-Explicit-Authorisation-Preferred:
      name: TPP-Explicit-Authorisation-Preferred
      in: header
      description: |
        If it equals "true", the TPP prefers to start the authorisation process separately, 
        e.g. because of the usage of a signing basket. 
        This preference might be ignored by the ASPSP, if a signing basket is not supported as functionality.
        
        If it equals "false" or if the parameter is not used, there is no preference of the TPP. 
        This especially indicates that the TPP assumes a direct authorisation of the transaction in the next step, 
        without using a signing basket.
      schema:
        type: string
        enum:
          - "true"
          - "false"
        #type: boolean
      required: false

    TPP-Rejection-NoFunds-Preferred:
      name: TPP-Rejection-NoFunds-Preferred
      in: header
      description: |
        If it equals "true" then the TPP prefers a rejection of the payment initiation in case the ASPSP is 
        providing an integrated confirmation of funds request an the result of this is that not sufficient 
        funds are available.
        
        If it equals "false" then the TPP prefers that the ASPSP is dealing with the payment initiation like 
        in the ASPSPs online channel, potentially waiting for a certain time period for funds to arrive to initiate the payment.

        This parameter might be ignored by the ASPSP.

      schema:
        type: string
        enum:
          - "true"
          - "false"
        #type: boolean
      required: false


    TPP-Notification-URI:
      name: TPP-Notification-URI
      in: header
      description: |
        URI for the Endpoint of the TPP-API to which the status of the payment initiation should be sent.
        This header field may by ignored by the ASPSP.
        
        For security reasons, it shall be ensured that the TPP-Notification-URI as introduced above is secured by the TPP eIDAS QWAC used for identification of the TPP. The following applies:
        
        URIs which are provided by TPPs in TPP-Notification-URI shall comply with the domain secured by the eIDAS QWAC certificate of the TPP in the field CN or SubjectAltName of the certificate. Please note that in case of example-TPP.com as certificate entry TPP- Notification-URI like www.example-TPP.com/xs2a-client/v1.0.8/ASPSPidentifcation/mytransaction- id/notifications or notifications.example-TPP.com/xs2a-client/v1.0.8/ASPSPidentifcation/mytransaction- id/notifications would be compliant.
        
        Wildcard definitions shall be taken into account for compliance checks by the ASPSP.
         ASPSPs may respond with ASPSP-Notification-Support set to false, if the provided URIs do not comply.
      schema:
        type: string
        format: uri
        maxLength: 2048
      required: false


    TPP-Notification-Content-Preferred:
      name: TPP-Notification-Content-Preferred
      in: header
      description: |
        The string has the form 
        
        status=X1, ..., Xn
        
        where Xi is one of the constants SCA, PROCESS, LAST and where constants are not
        repeated.
        The usage of the constants supports the of following semantics:

          SCA: A notification on every change of the scaStatus attribute for all related authorisation processes is preferred by the TPP.
        
          PROCESS: A notification on all changes of consentStatus or transactionStatus attributes is preferred by the TPP.
          LAST: Only a notification on the last consentStatus or transactionStatus as available in the XS2A interface is preferred by the TPP.

        This header field may be ignored, if the ASPSP does not support resource notification services for the related TPP.
      schema:
        type: string
        maxLength: 2048
      required: false


    PSU-ID: 
      name: PSU-ID
      in: header
      description: | 
        BOI-REMARK - The PSU id number or passport number.
        Possible values are:
        * ID = only digits.
        * Passport =  2 characters ISO 3166 country code + '-' + Passport number.
      schema:
        type: string
        pattern: "^([0-9]{9}|[A-Za-z]{2}-([A-Za-z0-9]){1,16})$"
      required: true
      example: "IL-12345678945"


    PSU-ID-Type: 
      name: PSU-ID-Type
      in: header
      description: |
        BOI-REMARK - Specific brands or channels of the ASPSP only in case there is more than one.
        Possible values should be found in ASPSP's documentation and get approved in advance by BOI.
      schema:
        type: string
        maxLength: 512
      required: false

    PSU-Corporate-ID: 
      name: PSU-Corporate-ID
      in: header
      description: |
        Might be mandated in the ASPSP's documentation. Only used in a corporate context.
      schema:
        type: string
        pattern: "[A-Z]{2}[-]\\d{9,10}|\\d{9,10}"
      required: false

    PSU-Corporate-ID-Type: 
      name: PSU-Corporate-ID-Type
      in: header
      description: |
        Might be mandated in the ASPSP's documentation. Only used in a corporate context.
      schema:
        type: string
        maxLength: 512
      required: false


    PSU-IP-Address_mandatory:
      name: PSU-IP-Address
      in: header
      description: |
        The forwarded IP Address header field consists of the corresponding http request IP Address field between PSU and TPP.
      schema:
        type: string
        format: ipv4
      required: true
      example: 192.168.8.78


    PSU-IP-Address_optional:
      name: PSU-IP-Address
      in: header
      description: |
        The forwarded IP Address header field consists of the corresponding http request IP Address field between PSU and TPP.
      schema:
        type: string
        format: ipv4
      required: false
      example: 192.168.8.78


    PSU-IP-Address_conditionalForAis:
      name: PSU-IP-Address
      in: header
      description: |
        The forwarded IP Address header field consists of the corresponding HTTP request 
        IP Address field between PSU and TPP. 
        It shall be contained if and only if this request was actively initiated by the PSU.
      schema:
        type: string
        format: ipv4
      required: false
      example: 192.168.8.78

    PSU-IP-Port:
      name: PSU-IP-Port
      in: header
      description: |
        The forwarded IP Port header field consists of the corresponding HTTP request IP Port field between PSU and TPP, if available.
      schema:
        type: string
        maxLength: 5
      required: false
      example: "1234"

    PSU-IP-Port_mandatory:
      name: PSU-IP-Port
      in: header
      description: |
        The forwarded IP Port header field consists of the corresponding HTTP request IP Port field between PSU and TPP, if available.
      schema:
        type: string
        maxLength: 5
      required: false
      example: "1234"


    PSU-Accept:
      name: PSU-Accept
      in: header
      description: |
        The forwarded IP Accept header fields consist of the corresponding HTTP request Accept header fields between PSU and TPP, if available.
      schema:
        type: string
        maxLength: 1024
      required: false


    PSU-Accept-Charset:
      name: PSU-Accept-Charset
      in: header
      description: |
        The forwarded IP Accept header fields consist of the corresponding HTTP request Accept header fields between PSU and TPP, if available.
      schema:
        type: string
        maxLength: 1024
      required: false


    PSU-Accept-Encoding:
      name: PSU-Accept-Encoding
      in: header
      description: |
        The forwarded IP Accept header fields consist of the corresponding HTTP request Accept header fields between PSU and TPP, if available.
      schema:
        type: string
        maxLength: 1024
      required: false


    PSU-Accept-Language:
      name: PSU-Accept-Language
      in: header
      description: |
        The forwarded IP Accept header fields consist of the corresponding HTTP request Accept header fields between PSU and TPP, if available.
      schema:
        type: string
        maxLength: 1024
      required: false


    PSU-User-Agent:
      name: PSU-User-Agent
      in: header
      description: |
        The forwarded Agent header field of the HTTP request between PSU and TPP, if available.
      schema:
        type: string
        maxLength: 1024
      required: false


    PSU-Http-Method:
      name: PSU-Http-Method
      in: header
      description: |
        HTTP method used at the PSU ? TPP interface, if available.
        Valid values are:
        * GET
        * POST
        * PUT
        * PATCH
        * DELETE
      schema:
        type: string
        enum:
          - "GET"
          - "POST"
          - "PUT"
          - "PATCH"
          - "DELETE"
      required: false


    PSU-Device-ID:
      name: PSU-Device-ID
      in: header
      description: |
        UUID (Universally Unique Identifier) for a device, which is used by the PSU, if available.
        UUID identifies either a device or a device dependant application installation.
        In case of an installation identification this ID need to be unaltered until removal from device.
      schema:
        type: string
        format: uuid
      required: false
      example: "99435c7e-ad88-49ec-a2ad-99ddcb1f5555"

    PSU-Device-ID_conditional:
      name: PSU-Device-ID
      in: header
      description: |
        UUID (Universally Unique Identifier) for a device, which is used by the PSU, if available.
        UUID identifies either a device or a device dependant application installation.
        In case of an installation identification this ID need to be unaltered until removal from device.
      schema:
        type: string
        format: uuid
      required: false
      example: "99435c7e-ad88-49ec-a2ad-99ddcb1f5555"

    PSU-Geo-Location:
      name: PSU-Geo-Location
      in: header
      description: |
        The forwarded Geo Location of the corresponding http request between PSU and TPP if available.
      schema:
        type: string
        pattern: 'GEO:-?[0-9]{1,2}\.[0-9]{6};-?[0-9]{1,3}\.[0-9]{6}'
      required: false
      example: GEO:52.506931;13.144558

    PSU-Geo-Location_conditional:
      name: PSU-Geo-Location
      in: header
      description: |
        The forwarded Geo Location of the corresponding http request between PSU and TPP if available.
      schema:
        type: string
        pattern: 'GEO:-?[0-9]{1,2}\.[0-9]{6};-?[0-9]{1,3}\.[0-9]{6}'
      required: false
      example: GEO:52.506931;13.144558




  requestBodies:
  #####################################################
  # Reusable Request Bodies
  #####################################################
  
    paymentInitiation:
      description: |
        JSON request body for a payment inition request message 
        
        There are the following payment-products supported:
          * "masav" with JSON-Body
          * "zahav" with JSON-Body
          * "FP" with JSON-Body
          
        There are the following payment-services supported:
          * "payments" 
          * "bulk-payments" - optional
          * "periodic-payments" - optional

        
        All optional, conditional and predefined but not yet used fields are defined.
      required: true
      content: 
        application/json:
          schema:
            oneOf: #Different Payment products in JSON
              - $ref: "#/components/schemas/paymentInitiation_json"
             #BOI-REMARK: optional
              - $ref: "#/components/schemas/periodicPaymentInitiation_json"
              - $ref: "#/components/schemas/bulkPaymentInitiation_json"
              
              
          examples:
            "Example 1: 'payments' ":
              $ref: "#/components/examples/paymentInitiationSctBody_payments_json"
             #BOI-REMARK: optional
            "Example 2: 'periodic-payments' - 'masav'":
               $ref: "#/components/examples/paymentInitiationSctBody_periodic-payments_json"
            "Example 3: 'bulk-payments' - 'masav'":
               $ref: "#/components/examples/paymentInitiationSctBody_bulk-payments_json"

        #BOI-REMARK not supported
        # application/xml:
        #   schema:
        #     oneOf: #The same schemas are used for single and bulk payment in case of a pain.001
        #       - $ref: "#/components/schemas/paymentInitiationSct_pain.001"
        #       - $ref: "#/components/schemas/paymentInitiationSctInst_pain.001"
        #       - $ref: "#/components/schemas/paymentInitiationTarget2_pain.001"
        #       - $ref: "#/components/schemas/paymentInitiationCrossBorder_pain.001"
        #   examples:
        #     "Example 1: 'payments' - 'pain.001-sepa-credit-transfers'":
        #       $ref: "#/components/examples/pain.001.001_SCT_singleTransaction"
        
        # multipart/form-data: #For periodic-payments with pain.001
        #   schema:
        #     $ref: "#/components/schemas/periodicPaymentInitiationMultipartBody"

#BOI-REMARK: NOT YET SUPPORTED
    # signingBasket:
    #   description: |
    #     Request body for a confirmation of an establishing signing basket request
    #   content:
    #     application/json:
    #       schema:
    #         $ref: "#/components/schemas/signingBasket"
    #       examples:
    #         Example:
    #           $ref: "#/components/examples/signingBasketExample"


    # confirmationOfFunds:
    #   description: |
    #     Request body for a confirmation of funds request.
    #   content: 
    #     application/json:
    #       schema:
    #         $ref: "#/components/schemas/confirmationOfFunds"
    #       examples:
    #         "Example":
    #           $ref: "#/components/examples/confirmationOfFundsExample"
    #   required: true


    consents:
      description: |
        Requestbody for a consents request
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/consents"
          examples:
            "Consent Request on Dedicated Accounts": 
              $ref: "#/components/examples/consentsExample_DedicatedAccounts"
            "Consent on Account List of Available Accounts":
              $ref: "#/components/examples/consentsExample_AccountList"
            "Consent Request on Account List or without Indication of dedicated Accounts":
              $ref: "#/components/examples/consentsExample_without_Accounts"
            # #BOI-REMARK: Examples added by BOI 
            # "Consent Request with payment account and credit cards addressed for Banks":
            #   $ref: "#/components/examples/consentsExample_with_paymentAccount_and_creditCards_Banks"
            # "Consent Request with payment account and credit cards addressed for Credit Cards Processors":
            #   $ref: "#/components/examples/consentsExample_with_paymentAccount_and_creditCards_CreditCardsProcessors"

  headers:
  #####################################################
  # Reusable Response Header Elements
  #####################################################
  
    X-Request-ID:
      description: ID of the request, unique to the call, as determined by the initiating party.
      required: true
      example: "99391c7e-ad88-49ec-a2ad-99ddcb1f7721"
      schema:
        type: string
        format: uuid

#BOI-REMARK "EMBEDDED" VALUE does NOT SUPPORTED
    ASPSP-SCA-Approach:
      description: |
        This data element must be contained, if the SCA Approach is already fixed.
        Possible values are
          * DECOUPLED
          * REDIRECT
        The OAuth SCA approach will be subsumed by REDIRECT.
      schema:
        type: string
        enum:
        #BOI-REMARK "EMBEDDED" VALUE DOES NOT SUPPORTED
        #  - "EMBEDDED"
          - "DECOUPLED"
          - "REDIRECT"
        example: "REDIRECT"
      required: false

    Location:
      description: |
        Location of the created resource.
      schema:
        type: string
        format: url
      required: false
      
    #conditional for extended service lean push
    ASPSP-Notification-Support:
      description: |
        true if the ASPSP supports resource status notification services.
    
        false if the ASPSP supports resource status notification in general, but not for the current request.
    
        Not used, if resource status notification services are generally not supported by the ASPSP.
    
        Shall be supported if the ASPSP supports resource status notification services.
      schema:
        type: boolean       
      required: false
    
    ASPSP-Notification-Content:
      description: |
        The string has the form
        status=X1, ג€¦, Xn
        where Xi is one of the constants SCA, PROCESS, LAST and where constants are not repeated.
        The usage of the constants supports the following semantics
        SCA - Notification on every change of the scaStatus attribute for all related authorisation processes is provided by the ASPSP for the related resource.
        PROCESS - Notification on all changes of consentStatus or transactionStatus attributes is provided by the ASPSP for the related resource
        LAST - Notification on the last consentStatus or transactionStatus as available in the XS2A interface is provided by the ASPSP for the related resource.
        This field must be provided if the ASPSP-Notification-Support=true. The ASPSP might consider the notification content as preferred by the TPP, but can also respond independently of the preferred request    
      schema:
        type: string        
      required: false
  responses:
  #####################################################
  # Reusabale Responses
  #####################################################
    #####################################################
    # Positive Responses
    #####################################################

    OK_200_PaymentInitiationInformation: 
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      content:
      #BOI-REAMRK: periodic and bulk payment not yet supported
        application/json:
           schema:
            oneOf:  #Different Payment Products with status
              - $ref: "#/components/schemas/paymentInitiationWithStatusResponse"
              #- $ref: "#/components/schemas/periodicPaymentInitiationWithStatusResponse"
              #- $ref: "#/components/schemas/bulkPaymentInitiationWithStatusResponse"
        #BOI-REMARK not supported      
        # application/xml:
        #   schema:
        #     oneOf: #The same schemas are used for single and bulk payment in case of a pain.001
        #       - $ref: "#/components/schemas/paymentInitiationSct_pain.001"
        #       - $ref: "#/components/schemas/paymentInitiationSctInst_pain.001"
        #       - $ref: "#/components/schemas/paymentInitiationTarget2_pain.001"
        #       - $ref: "#/components/schemas/paymentInitiationCrossBorder_pain.001"
        #   examples:
        #     "Example 1: 'payments' - 'pain.001-sepa-credit-transfers'":
        #       $ref: "#/components/examples/pain.001.001_SCT_singleTransaction"
        
        # multipart/form-data: #For periodic-payments with pain.001
        #   schema:
        #     $ref: "#/components/schemas/periodicPaymentInitiationMultipartBody"


    OK_200_PaymentInitiationStatus:
      description: OK
      
      headers: 
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/paymentInitiationStatusResponse-200_json"
          examples:
            simple:
              $ref: "#/components/examples/paymentInitiationStatusResponse_json_Simple"
            extended:
              $ref: "#/components/examples/paymentInitiationStatusResponse_json_Extended"
        #BOI-REMARK not supported
        # application/xml:
        #   schema:
        #     $ref: "#/components/schemas/paymentInitiationStatusResponse-200_xml"
        #   examples: 
        #     "Payment Initiation Status Response Body XML for SCT":
        #       $ref: "#/components/examples/pain.002.001_SCT_singleTransaction"


    OK_200_Authorisations:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"

      content:
        application/json:
          schema:
            $ref: "#/components/schemas/authorisations"
          examples:
            Example:
              $ref: "#/components/examples/authorisationListExample"


    OK_200_ScaStatus:
      description: OK
      
      headers: 
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/scaStatusResponse"


    OK_200_AccountList:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/accountList"
          examples:
            "Example 1":
              $ref: "#/components/examples/accountListExample1"
            "Example 2":
              $ref: "#/components/examples/accountListExample2"
            "Example 3":
              $ref: "#/components/examples/accountListExample3"


    OK_200_CardAccountList:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/cardAccountList"
          examples:
            "Example 1":
              $ref: "#/components/examples/cardAccountListExample1"


    OK_200_AccountDetails:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            type: object
            required:
              - account
            properties:
              account:
                $ref: "#/components/schemas/accountDetails"
          examples:
            "Regular Account": 
              $ref: "#/components/examples/accountDetailsRegularAccount"
            "Multicurrency Account":
              $ref: "#/components/examples/accountDetailsMulticurrencyAccount"


    OK_200_CardAccountDetails:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/cardAccountDetails"
          examples:
            "Card Account": 
              $ref: "#/components/examples/cardAccountDetailsExample"


    OK_200_TransactionDetails:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/transactionDetailsBody"
          examples:
            Example:
              $ref: "#/components/examples/transactionDetailsExample"


    OK_200_Balances:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/readAccountBalanceResponse-200"
          examples:
            "Example 1: Regular Account":
              $ref: "#/components/examples/balancesExample1_RegularAccount"
            "Example 2: Multicurrency Account":
              $ref: "#/components/examples/balancesExample2_MulticurrencyAcount"


    OK_200_CardAccountBalances:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/readCardAccountBalanceResponse-200"
          examples: 
            "Example:":
              $ref: "#/components/examples/balancesExample_CardAccount"

    OK_200_AccountsTransactions:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/transactionsResponse-200_json"
          examples:
            "Example 1":
              $ref: "#/components/examples/transactionsExample1_RegularAccount_json"
          #BOI-REMARK "download" does not supported, pagination should be used instead.
            # "Example 2":
            #   $ref: "#/components/examples/transactionsExample2_Download_json"
            #BOI-REMARK: this example added by BOI
            "Example 2":
               $ref: "#/components/examples/transactionsExample2_paging_json"
            "Example 3":
              $ref: "#/components/examples/transactionsExample3_MulticurrencyAccount_json"
            #BOI-REMARK: this example added by BOI
            "Example 4":
              $ref: "#/components/examples/transactionsExample4_checkDepositTransaction_json"

#BOI-REMARK only application/json value is supported
      #  application/xml:
      #    schema:
      #      description: 
      #        Body of the XML response for a successful read transaction list request.
              
      #        The body has the structure of a either a camt.052 or camt.053 message.
              
      #        The camt.052 may include pending payments which are not yet finally booked. 
      #       The ASPSP will decide on the format due to the chosen parameters, 
      #        specifically on the chosen dates relative to the time of the request. 
      #        In addition the ASPSP might offer camt.054x structure e.g. in a corporate setting.
      #      oneOf: #Different camt messages
      #        - $ref: "#/components/schemas/camt.052"
      #        - $ref: "#/components/schemas/camt.053"
      #        - $ref: "#/components/schemas/camt.054"
        
      #  application/text:
      #    schema:
      #      description:
      #        Body of the Text response for a successful read transaction list request.
              
      #        The body has the structure of a MT94x message.
              
      #        The response body consists of an MT940 or MT942 format in a text structure. 
      #        The MT942 may include pending payments which are not yet finally booked. 
      #        The ASPSP will decide on the format due to the chosen parameters, 
      #        specifically on the chosen dates relative to the time of the request.
      #      oneOf: #Different MT94x
      #        - $ref: "#/components/schemas/mt940"
      #        - $ref: "#/components/schemas/mt942"


    OK_200_CardAccountsTransactions:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/cardAccountsTransactionsResponse200"
          examples:
           "EExample 1":
              $ref: "#/components/examples/cardAccountsTransactionsExample1_RegularAccount_json"
          
    OK_200_ConsentInformation:
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/consentInformationResponse-200_json"
          examples:
            Example:
              $ref: "#/components/examples/consentsInformationResponseExample"


    OK_200_ConsentStatus: 
      description: OK
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/consentStatusResponse-200"
          examples:
            Example:
              $ref: "#/components/examples/consentStatusResponseExample1"

    #BOI-REMARK not supported
    # OK_200_UpdatePsuData:
    #   description: OK 
      
    #   headers: 
    #     X-Request-ID:
    #       $ref: "#/components/headers/X-Request-ID"
    #     ASPSP-SCA-Approach:
    #       $ref: "#/components/headers/ASPSP-SCA-Approach"
      
    #   content:
    #     application/json:
    #       schema:
          
    #         oneOf: #Different Authorisation Bodies
    #           - $ref: "#/components/schemas/updatePsuIdenticationResponse" #Update PSU Identification
    #           - $ref: "#/components/schemas/updatePsuAuthenticationResponse" #Update PSU Authentication
    #           - $ref: "#/components/schemas/selectPsuAuthenticationMethodResponse" #Select Authentication Method
    #           - $ref: "#/components/schemas/scaStatusResponse" #Transaction Authorisation
    #       examples: 
    #         "Update PSU Identification - Payment Initiation (Decoupled Approach)":
    #           $ref: "#/components/examples/updatePsuIdentificationResponseExample_Decoupled_payments"
    #         #BOI-REMARK EMBEDDED does not supported 
    #         #"Update PSU Authentication - Payment Initiation (Embedded Approach)":
    #         #  $ref: "#/components/examples/updatePsuAuthenticationResponseExample_Embedded_payments"
    #         #"Select PSU Authentication - Payment Initiation Method (Embedded Approach)":
    #         #  $ref: "#/components/examples/selectPsuAuthenticationMethodResponseExample_Embedded_payments"
    #         #"Transaction Authorisation (Embedded Approach)":
    #         #  $ref: "#/components/examples/transactionAuthorisationResponseExample"


#BOI-REMARK: not in use
    # OK_200_GetSigningBasket:
    #   description: OK

    #   headers:
    #     X-Request-ID:
    #       $ref: "#/components/headers/X-Request-ID"
      
    #   content:
    #     application/json:
    #       schema:
    #         $ref: "#/components/schemas/signingBasketResponse-200"
    #       examples:
    #         Example:
    #           $ref: "#/components/examples/getSigningBasketResponseExample1"

    # OK_200_SigningBasketStatus:
    #   description: OK

    #   headers:
    #     X-Request-ID:
    #       $ref: "#/components/headers/X-Request-ID"
      
    #   content:
    #     application/json:
    #       schema:
    #         $ref: "#/components/schemas/signingBasketStatusResponse-200"

    # OK_200_ConfirmationOfFunds:
    #   description: OK
      
    #   headers:
    #     Location:
    #       $ref: "#/components/headers/Location"
    #     X-Request-ID:
    #       $ref: "#/components/headers/X-Request-ID"
      
    #   content:
    #     application/json:
    #       schema:
    #         description: |
    #           Equals "true" if sufficient funds are available at the time of the request, 
    #           "false" otherwise.
    #         type: object
    #         required: 
    #           - fundsAvailable
    #         properties:
    #           fundsAvailable:
    #             $ref: "#/components/schemas/fundsAvailable"
    #       examples:
    #         "Example":
    #           $ref: "#/components/examples/confirmationOfFundsResponseExample"


    # CREATED_201_SigningBasket:
    #   description: Created

    #   headers:
    #     Location:
    #       $ref: "#/components/headers/Location"
    #     X-Request-ID:
    #       $ref: "#/components/headers/X-Request-ID"
    #     ASPSP-SCA-Approach:
    #       $ref: "#/components/headers/ASPSP-SCA-Approach"
    #     #conditional for extended service lean Push
    #     ASPSP-Notification-Support:
    #       $ref: "#/components/headers/ASPSP-Notification-Support"
    #     ASPSP-Notification-Content:
    #       $ref: "#/components/headers/ASPSP-Notification-Content"
          
    #   content:
    #     application/json:
    #       schema:
    #         $ref: "#/components/schemas/signingBasketResponse-201"
    #       examples:
    #         "Response (always with explicit authorization start)":
    #           $ref: "#/components/examples/createSigningBasketResponseExample1"


    CREATED_201_PaymentInitiation:
      description: CREATED
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
        Location:
          $ref: "#/components/headers/Location"
        ASPSP-SCA-Approach:
          $ref: "#/components/headers/ASPSP-SCA-Approach"
        #conditional for extended service lean Push
        ASPSP-Notification-Support:
          $ref: "#/components/headers/ASPSP-Notification-Support"
        ASPSP-Notification-Content:
          $ref: "#/components/headers/ASPSP-Notification-Content"

      content:
        application/json:
          schema:
            $ref: "#/components/schemas/paymentInitationRequestResponse-201"
          examples:
          #BOI-REMARK: not supported
            # "Response in case of a redirect with an implicitly created authorisation sub-resource":
            #   $ref: "#/components/examples/paymentInitiationExample_json_Redirect"
            # "Response in case of a redirect where an explicit authorisation start is needed":
            #   $ref: "#/components/examples/paymentInitiationExample_json__RedirectExplicitAuthorisation"
            "Response in case of an OAuth2 SCA approach approach with implicitly creating an authorisation sub-resource":
              $ref: "#/components/examples/paymentInitiationExample_json_OAuth2"
            "Response in case of the decoupled approach with explicit start of authorisation needed (will be done with the update PSU identification function)":
              $ref: "#/components/examples/paymentInitiationExample_json_Decoupled"
          #BOI-REMARK: not supported
            # "Response in case of the embedded approach with explicit start of authorisation":
            #   $ref: "#/components/examples/paymentInitiationExample_json_Embedded"


    CREATED_201_StartScaProcess:
      description: Created
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
        ASPSP-SCA-Approach:
          $ref: "#/components/headers/ASPSP-SCA-Approach"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/startScaprocessResponse"
          examples: 
            "Example 1: payments - Decoupled Approach": 
               $ref: "#/components/examples/startScaProcessResponseExample1"


    CREATED_201_Consents:
      description: Created
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
        ASPSP-SCA-Approach:
          $ref: "#/components/headers/ASPSP-SCA-Approach"
        #conditional for extended service lean Push
        ASPSP-Notification-Support:
          $ref: "#/components/headers/ASPSP-Notification-Support"
        ASPSP-Notification-Content:
          $ref: "#/components/headers/ASPSP-Notification-Content"

      content:
        application/json:
          schema:
            $ref: "#/components/schemas/consentsResponse-201"
          
          examples:
            #BOI-REMARK: redirect not supported
            # "Response in case of a redirect":
            #   $ref: "#/components/examples/consentResponseExample1a_Redirect"
            # "Response in case of a redirect with a dedicated start of the authorisation process":
            #   $ref: "#/components/examples/consentResponseExample1b_Redirect"
            "Response in case of the OAuth2 approach with an implicit generated authorisation resource": 
              $ref: "#/components/examples/consentResponseExample2_OAuth2"
            "Response in case of the decoupled approach": 
              $ref: "#/components/examples/consentResponseExample3_Decoupled"
            #BOI REMARK: not supported
            #"Response in case of the embedded approach": 
             # $ref: "#/components/examples/consentResponseExample4_Embedded"

    
    RECEIVED_202_PaymentInitiationCancel:
      description: Received
    
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
    
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/paymentInitiationCancelResponse-202"
          examples:
            Example:
              $ref: "#/components/examples/paymentInitiationCancelResponse-202"


    NO_CONTENT_204_PaymentInitiationCancel:
      description:  No Content
    
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
    #NO RESPONSE BODY


    NO_CONTENT_204_Consents:
      description: No Content
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #NO RESPONSE BODY


    NO_CONTENT_204_SigningBasket:
      description: No Content
      
      headers:
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #NO RESPONSE BODY

    #####################################################
    # Negative Responses
    #####################################################

    BAD_REQUEST_400_AIS:
      description: Bad Request
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error400_NG_AIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error400_AIS" 


    BAD_REQUEST_400_PIS:
      description: Bad Request
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error400_NG_PIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error400_PIS" 


    BAD_REQUEST_400_PIIS:
      description: Bad Request
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error400_NG_AIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error400_AIS" 

#BOI-REMARK: NOT SUPPORTED in current version
    # BAD_REQUEST_400_SBS:
    #   description: Bad Request
    #   headers:
    #     Location:
    #       $ref: "#/components/headers/Location"
    #     X-Request-ID:
    #       $ref: "#/components/headers/X-Request-ID"
      
    #   content:
    #     application/json:
    #       schema:
    #         $ref: "#/components/schemas/Error400_NG_SBS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error400_SBS" 


    UNAUTHORIZED_401_PIS:
      description: Unauthorized
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error401_NG_PIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error401_PIS" 

    UNAUTHORIZED_401_AIS:
      description: Unauthorized
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error401_NG_AIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error401_AIS" 

    UNAUTHORIZED_401_PIIS:
      description: Unauthorized
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error401_NG_PIIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error401_PIIS" 

    UNAUTHORIZED_401_SBS:
      description: Unauthorized
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error401_NG_SBS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error401_SBS" 
            

    FORBIDDEN_403_PIS:
      description: Forbidden
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error403_NG_PIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error403_PIS" 


    FORBIDDEN_403_AIS:
      description: Forbidden
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error403_NG_AIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error403_AIS" 


    FORBIDDEN_403_PIIS:
      description: Forbidden
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error403_NG_PIIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error403_PIIS" 


    FORBIDDEN_403_SBS:
      description: Forbidden
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error403_NG_SBS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error403_SBS" 


    NOT_FOUND_404_PIS:
      description: Not found
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error404_NG_PIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error404_PIS" 


    NOT_FOUND_404_AIS:
      description: Not found
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error404_NG_AIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error404_AIS" 


    NOT_FOUND_404_PIIS:
      description: Not found
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error404_NG_PIIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error404_PIIS" 


    NOT_FOUND_404_SBS:
      description: Not found
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error404_NG_SBS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error404_SBS" 


    METHOD_NOT_ALLOWED_405_PIS:
      description: Method Not Allowed
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error405_NG_PIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error405_PIS" 

    #BOI REMARK: not supported
    METHOD_NOT_ALLOWED_405_PIS_CANC:
      description: Method Not Allowed
    
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
    
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error405_NG_PIS_CANC"         
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error405_PIS_CANC" 


    METHOD_NOT_ALLOWED_405_AIS:
      description: Method Not Allowed
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error405_NG_AIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error405_AIS" 


    METHOD_NOT_ALLOWED_405_PIIS:
      description: Method Not Allowed
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error405_NG_PIIS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error405_PIIS" 


    METHOD_NOT_ALLOWED_405_SBS:
      description: Method Not Allowed
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error405_NG_SBS" 

#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error405_SBS" 


    NOT_ACCEPTABLE_406_PIS:
      description: Not Acceptable
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIS in case of HTTP code 406



    NOT_ACCEPTABLE_406_AIS:
      description: Not Acceptable
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error406_NG_AIS" 
#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error406_AIS" 


    NOT_ACCEPTABLE_406_PIIS:
      description: Not Acceptable
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIIS in case of HTTP code 406


    NOT_ACCEPTABLE_406_SBS:
      description: Not Acceptable
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for signing in case of HTTP code 406


    REQUEST_TIMEOUT_408_PIS: 
      description: Request Timeout
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIS in case of HTTP code 408


    REQUEST_TIMEOUT_408_AIS: 
      description: Request Timeout
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for AIS in case of HTTP code 408


    REQUEST_TIMEOUT_408_PIIS: 
      description: Request Timeout
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIIS in case of HTTP code 408


    REQUEST_TIMEOUT_408_SBS: 
      description: Request Timeout
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for signing baskets in case of HTTP code 408 


    CONFLICT_409_PIS: 
      description: Conflict
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      content:
        application/json:
          schema:
             $ref: "#/components/schemas/Error409_NG_PIS"
          
#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error409_PIS"


    CONFLICT_409_AIS: 
      description: Conflict
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      content:
        application/json:
          schema:
             $ref: "#/components/schemas/Error409_NG_AIS"
#BOI-REMARK: NOT SUPPORTED          
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error409_AIS"


    CONFLICT_409_PIIS: 
      description: Conflict
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      content:
        application/json:
          schema:
             $ref: "#/components/schemas/Error409_NG_PIIS"
          
#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error409_PIIS"


    CONFLICT_409_SBS: 
      description: Conflict
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      content:
        application/json:
          schema:
             $ref: "#/components/schemas/Error409_NG_SBS"
#BOI-REMARK: NOT SUPPORTED          
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error409_SBS"


    UNSUPPORTED_MEDIA_TYPE_415_AIS:
      description: Unsupported Media Type
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for AIS in case of HTTP code 415 


    UNSUPPORTED_MEDIA_TYPE_415_PIS:
      description: Unsupported Media Type
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for AIS in case of HTTP code 415 


    UNSUPPORTED_MEDIA_TYPE_415_PIIS:
      description: Unsupported Media Type
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIIS in case of HTTP code 415 


    UNSUPPORTED_MEDIA_TYPE_415_SBS:
      description: Unsupported Media Type
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for signing baskets in case of HTTP code 415 


    TOO_MANY_REQUESTS_429_PIS:
      description: Too Many Requests
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      #No Response body because there are no valid message codes for PIS in case of HTTP code 429 


    TOO_MANY_REQUESTS_429_AIS:
      description: Too Many Requests
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error429_NG_AIS" 
#BOI-REMARK: NOT SUPPORTED
        # application/problem+json:
        #   schema:
        #     $ref: "#/components/schemas/Error429_AIS" 


    TOO_MANY_REQUESTS_429_PIIS:
      description: Too Many Requests
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      #No Response body because there are no valid message codes for PIIS in case of HTTP code 429 


    TOO_MANY_REQUESTS_429_SBS:
      description: Too Many Requests
      
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      
      #No Response body because there are no valid message codes for signing baskets in case of HTTP code 429 


    INTERNAL_SERVER_ERROR_500_PIS:
      description: Internal Server Error
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIS in case of HTTP code 500 


    INTERNAL_SERVER_ERROR_500_AIS:
      description: Internal Server Error
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for AIS in case of HTTP code 500 


    INTERNAL_SERVER_ERROR_500_PIIS:
      description: Internal Server Error
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIIS in case of HTTP code 500 


    INTERNAL_SERVER_ERROR_500_SBS:
      description: Internal Server Error
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for signing baskets in case of HTTP code 500 


    SERVICE_UNAVAILABLE_503_PIS:
      description: Service Unavailable
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIS in case of HTTP code 503


    SERVICE_UNAVAILABLE_503_AIS:
      description: Service Unavailable
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for AIS in case of HTTP code 503


    SERVICE_UNAVAILABLE_503_PIIS:
      description: Service Unavailable
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for PIIS in case of HTTP code 503


    SERVICE_UNAVAILABLE_503_SBS:
      description: Service Unavailable
      headers:
        Location:
          $ref: "#/components/headers/Location"
        X-Request-ID:
          $ref: "#/components/headers/X-Request-ID"
      #No Response body because there are no valid message codes for signing baskets in case of HTTP code 503

  examples:
  #####################################################
  # Predefined Examples
  #####################################################

    ibanExampleDe_01:
      value: "DE02100100109307118603"


    ibanExampleDe_02:
      value: "DE23100120020123456789"


    ibanExampleDe_03:
      value: "DE40100100103307118608"


    ibanExampleDe_04:
      value: "DE67100100101306118605"


    ibanExampleDe_05:
      value: "DE87200500001234567890"


    ibanExampleFr_01:
      value: "FR7612345987650123456789014"


    ibanExampleNl_01:
      value: "NL76RABO0359400371"


    ibanExampleSe_01:
      value: "SE9412309876543211234567"


    maskedPanExample:
      value: "123456xxxxxx1234"


    uuidExample:
      value: "99391c7e-ad88-49ec-a2ad-99ddcb1f7721"


#BOI-REMARK: PAIN.001 does not supported
    # pain.001.001_SCT_singleTransaction:
    #   description: A pain.001.001.03 message in case of SCT
    #   value: >
    #     <Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
    #       <CstmrCdtTrfInitn>
    #         <GrpHdr>
    #           <MsgId>MIPI-123456789RI-123456789</MsgId>
    #           <CreDtTm>2017-02-14T20:23:34.000Z</CreDtTm>
    #           <NbOfTxs>1</NbOfTxs>
    #           <CtrlSum>123</CtrlSum>
    #           <InitgPty>
    #             <Nm>PaymentInitiator</Nm>
    #             <Id><OrgId><Othr><Id>DE10000000012</Id>
    #               <SchmeNm><Prptry>PISP</Prptry></SchmeNm></Othr></OrgId></Id>
    #           </InitgPty>
    #         </GrpHdr> 
    #         <PmtInf> 
    #           <PmtInfId>BIPI-123456789RI-123456789</PmtInfId>
    #           <PmtMtd>TRF</PmtMtd> 
    #           <NbOfTxs>1</NbOfTxs>
    #           <CtrlSum>123</CtrlSum>
    #           <PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf>
    #           <ReqdExctnDt>2017-02-15</ReqdExctnDt>
    #           <Dbtr><Nm>PSU Name</Nm></Dbtr>
    #           <DbtrAcct><Id><IBAN>DE87200500001234567890</IBAN></Id></DbtrAcct>
    #           <ChrgBr>SLEV</ChrgBr>
    #           <CdtTrfTxInf>
    #             <PmtId><EndToEndId>RI-123456789</EndToEndId></PmtId> 
    #             <Amt><InstdAmt Ccy="EUR">123</InstdAmt></Amt>
    #             <Cdtr><Nm>Merchant123</Nm></Cdtr>
    #             <CdtrAcct><Id><IBAN> DE23100120020123456789</IBAN></Id></CdtrAcct>
    #             <RmtInf><Ustrd>Ref Number Merchant-123456</Ustrd></RmtInf>
    #           </CdtTrfTxInf>
    #         </PmtInf>
    #       </CstmrCdtTrfInitn>
    #     </Document>


    # pain.002.001_SCT_singleTransaction:
    #   description: A pain.002.001.03 message in case of SCT
    #   value: >
    #     <Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.002.001.03">
    #       <CstmrPmtStsRpt>
    #         <GrpHdr>
    #           <MsgId>4572457256725689726906</MsgId>
    #           <CreDtTm>2017-02-14T20:24:56.021Z</CreDtTm>
    #           <DbtrAgt><FinInstnId><BIC>ABCDDEFF</BIC></FinInstnId></DbtrAgt>
    #           <CdtrAgt><FinInstnId><BIC>DCBADEFF</BIC></FinInstnId></CdtrAgt>
    #         </GrpHdr>
    #         <OrgnlGrpInfAndSts>
    #           <OrgnlMsgId>MIPI-123456789RI-123456789</OrgnlMsgId>
    #           <OrgnlMsgNmId>pain.001.001.03</OrgnlMsgNmId>
    #           <OrgnlCreDtTm>2017-02-14T20:23:34.000Z</OrgnlCreDtTm>
    #           <OrgnlNbOfTxs>1</OrgnlNbOfTxs>
    #           <OrgnlCtrlSum>123</OrgnlCtrlSum>
    #           <GrpSts>ACCT</GrpSts>
    #         </OrgnlGrpInfAndSts>
    #         <OrgnlPmtInfAndSts>
    #           <OrgnlPmtInfId>BIPI-123456789RI-123456789</OrgnlPmtInfId>
    #           <OrgnlNbOfTxs>1</OrgnlNbOfTxs>
    #           <OrgnlCtrlSum>123</OrgnlCtrlSum>
    #           <PmtInfSts>ACCT</PmtInfSts>
    #         </OrgnlPmtInfAndSts>
    #       </CstmrPmtStsRpt>
    #     </Document>


    paymentInitiationSctBody_payments_json:
      value:
        {    
          "instructedAmount": {"currency": "EUR", "amount": "123.50"},
          "debtorAccount": {"iban": "DE40100100103307118608"},
          "creditorName": "Merchant123",
          "creditorAccount": {"iban": "DE02100100109307118603"},
          "remittanceInformationUnstructured": "Ref Number Merchant"
        }


#BOI-REMARK : PERIODIC AND BULK PAYMENT NOT YET SUPPORTED
    paymentInitiationSctBody_periodic-payments_json:
      value:
        {
        "instructedAmount": {"currency": "EUR", "amount": "123"},
        "debtorAccount": {"iban": "DE40100100103307118608"},
        "creditorName": "Merchant123",
        "creditorAccount": {"iban": "DE23100120020123456789"},
        "remittanceInformationUnstructured": "Ref Number Abonnement",
        "startDate": "2018-03-01",
        "executionRule": "preceding",
        "frequency": "monthly",
        "dayOfExecution": "01"
        }
        
    paymentInitiationSctBody_bulk-payments_json:
      value:
        {
        "batchBookingPreferred": "true",
        "debtorAccount": {"iban": "DE40100100103307118608"},
        "paymentInformationId": "my-bulk-identification-1234",
        "requestedExecutionDate": "2018-08-01",
        "payments": 
          [
            {
            instructedAmount": {"currency": "EUR", "amount": "123.50"},
            "creditorName": "Merchant123",
            "creditorAccount": {"iban": "DE02100100109307118603"},
            "remittanceInformationUnstructured": "Ref Number Merchant 1"
            }, {
            instructedAmount": {"currency": "EUR", "amount": "34.10"},
            "creditorName": "Merchant456",
            "creditorAccount": {"iban": "FR7612345987650123456789014"},
            "remittanceInformationUnstructured": "Ref Number Merchant 2"
            }]
        }


    accountDetailsRegularAccount:
      description: Account Details for a regular Account
      value:
        {
          "account":
            {
              "resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e80f",
              "iban": "FR7612345987650123456789014", 
              "currency": "EUR",
              "product": "Girokonto",
              "cashAccountType": "CACC",
              "name": "Main Account",
              "_links": 
                {
                  "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/balances"},
                  "transactions": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/transactions"}
                 }
            }
        }


    accountDetailsMulticurrencyAccount:
      description: Account Details for a multicurrency Account
      value:
        {
          "account":
            {
              "resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e80f",
              "iban": "FR7612345987650123456789014", 
              "currency": "XXX",
              "product": "Multicurrency Account",
              "cashAccountType": "CACC",
              "name": "Aggregation Account",
              "_links": 
                {
                  "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/balances"},
                  "transactions": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/transactions"}
                }
            }
        }


    accountListExample1:
      summary: Account list Example 1
      description: Response in case of an example, where the consent has been given on two different IBANs
      value:
        {"accounts":
           [
              {"resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e80f",
               "iban": "DE2310010010123456789", 
               "currency": "EUR",
               "product": "Girokonto",
               "cashAccountType": "CACC",
               "name": "Main Account",
               "_links": {
            "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/balances"},
            "transactions": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/transactions"}}
              },
              {"resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e81g",
               "iban": "DE2310010010123456788",
               "currency": "USD",
               "product": "Fremdwֳ₪hrungskonto",
               "cashAccountType": "CACC",
               "name": "US Dollar Account",
               "_links": {
            "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e81g/balances" }}
               } 
        ]}


    accountListExample2:
      summary: Account list Example 2
      description: |
        Response in case of an example where consent on transactions and balances has been given to a multicurrency account which has two sub-accounts with currencies EUR and USD, and where the ASPSP is giving the data access only on sub-account level
      value:
        {"accounts":
           [
              {"resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e80f",
               "iban": "DE2310010010123456788", 
               "currency": "EUR",
               "product": "Girokonto",
               "cashAccountType": "CACC",
               "name": "Main Account",
               "_links": {
            "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/balances"},
            "transactions": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/transactions"}}
              },
              {"resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e81g",
               "iban": "DE2310010010123456788",
               "currency": "USD",
               "product": "Fremdwֳ₪hrungskonto",
               "cashAccountType": "CACC",
               "name": "US Dollar Account",
               "_links": {
                 "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e81g/balances"},
                 "transactions": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e81g/transactions"} }
               } 
        ]}


    accountListExample3:
      summary: Account list Example 3
      description: |
        Account list response in case of an example where consent on balances and transactions has been given to 
        a multicurrency account which has two sub-accounts with currencies EUR and USD and where the ASPSP is giving 
        the data access on aggregation level and on sub-account level
      value:
        {"accounts":
           [
              {"resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e80f",
               "iban": "DE2310010010123456788", 
               "currency": "XXX",
               "product": "Multi currency account",
               "cashAccountType": "CACC",
               "name": "Aggregation Account",
               "_links": {
            "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e333/balances"},
            "transactions": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e333/transactions"}}
              },
        {"resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e80f",
               "iban": "DE2310010010123456788", 
               "currency": "EUR",
               "product": "Girokonto",
               "cashAccountType": "CACC",
               "name": "Main Account",
               "_links": {
            "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/balances"},
            "transactions": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f/transactions"}}
              },
              {"resourceId": "3dc3d5b3-7023-4848-9853-f5400a64e81g",
               "iban": "DE2310010010123456788",
               "currency": "USD",
               "product": "Fremdwֳ₪hrungskonto",
               "cashAccountType": "CACC",
               "name": "US Dollar Account",
               "_links": {
            "balances": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e81g/balances"},
            "transactions": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e81g/transactions"} }
               } 
        ]}


    cardAccountListExample1:
      summary: Card account list example 1
      description: |
        Card account list example
      value:
        {
        "cardAccounts": [
          {
            "resourceId": "3d9a81b3-a47d-4130-8765-a9c0ff861b99",
            "maskedPan": "525412******3241",
            "currency": "EUR",
            "name": "Main",
            "product": "Basic Credit",
            "status": "enabled",
            "creditLimit": { "currency": "EUR", "amount": "15000" },
            "balances": [
              {
                "balanceType": "interimBooked",
                "balanceAmount": { "currency": "EUR", "amount": "14355.78" }
              },{
                "balanceType": "nonInvoiced",
                "balanceAmount": { "currency": "EUR", "amount": "4175.86" }
              }
            ],
            "_links": {
              "transactions": {
                "href": "/v1.0.8/card-accounts/3d9a81b3-a47d-4130-8765-a9c0ff861b99/transactions"
              }
            }
          }
        ]
      }


    cardAccountDetailsExample:
      summary: Card account details example 1
      description: |
        Card account details example
      value:
        {
          "cardAccount":
          {
            "resourceId": "3d9a81b3-a47d-4130-8765-a9c0ff861b99",
            "maskedPan": "525412******3241",
            "currency": "EUR",
            "name": "Main",
            "ownerName": "Gil Gila",
            "product": "Basic Credit",
            "status": "enabled",
            "creditLimit": { "currency": "EUR", "amount": "15000" },
            "balances": [
              {
                "balanceType": "interimBooked",
                "balanceAmount": { "currency": "EUR", "amount": "14355.78" }
              },{
                "balanceType": "nonInvoiced",
                "balanceAmount": { "currency": "EUR", "amount": "4175.86" }
              }
            ],

          }
        }
        
    cardAccountsTransactionsExample1_RegularAccount_json:
      description: Response in JSON format for an access on a regular account.
      value:
        {
        "cardAccount":
          {
            "maskedPan": "525412******3241"
          },
        "cardTransactions":
          {
            "booked": [
 {
 "cardTransactionId": "201710020036959",
 "transactionAmount": { "currency": "EUR", "amount": "256.67" },
 "transactionDate": "2017-10-25",
 "bookingDate": "2017-10-26",
 "originalAmount": { "currency": "SEK", "amount": "2499" },
 "cardAcceptorAddress": {
 "city" : "STOCKHOLM",
 "country" : "SE"
 },
 "maskedPan": "525412******3241",
 "proprietaryBankTransactionCode" : "PURCHASE",
 "invoiced": false,
 "transactionDetails": "WIFIMARKET.SE"
 }, {
 "cardTransactionId": "201710020091863",
 "transactionAmount": { "currency": "EUR", "amount": "10.72" },
 "transactionDate": "2017-10-25",
 "bookingDate": "2017-10-26",
 "originalAmount": { "currency": "SEK", "amount": "99" },
 "cardAcceptorAddress": {
 "city" : "STOCKHOLM",
 "country" : "SE"
 },
 "maskedPan": "525412******8999",
 "proprietaryBankTransactionCode" : "PURCHASE",
 "invoiced": false,
 "transactionDetails": "ICA SUPERMARKET SKOGHA"
 }
 ],
 "pending": [ ],
 "_links": {
 "cardAccount": {
 "href": "/v1.0.8/card-accounts/3d9a81b3-a47d-4130-8765-a9c0ff861b99"
 }
 }
 }
}
    startScaProcessResponseExample1:
      value:
        { 
           "scaStatus": "received",
           "authorisationId": "123auth456",
           "psuMessage": "Please use your BankApp for transaction Authorisation.",
           "_links":
            {
              "scaStatus":  {"href":"/v1.0.8/payments/qwer3456tzui7890/authorisations/123auth456"}
            }
        }
      


#BOI-REMARK: NOT SUPPORTED IN THIS VERSION
    # signingBasketExample:
    #   description: "JSON Body of a signing basket request"
    #   value:
    #     {    
    #       "paymentIds": ["123qwert456789", "12345qwert7899"]
    #     }


    # createSigningBasketResponseExample1:
    #   description: 
    #     Response (always with explicit authorisation start)
    #   value:
    #     {
    #       "transactionStatus": "RCVD",
    #       "basketId": "1234-basket-567",
    #       "_links": 
    #             {
    #             "self": {"href": "/v1.0.8/signing-baskets/1234-basket-567"},
    #             "status": {"href": "/v1.0.8/signing-baskets/1234-basket-567/status"},
    #             "startAuthorisation": {"href": "/v1.0.8/signing-baskets/1234-basket-567/authorisations"}
    #             }
    #     }


    # getSigningBasketResponseExample1:
    #   value:
    #     {   
    #       "payments": ["1234pay567","1234pay568","1234pay888"],
    #       "transactionStatus": "ACTC"
    #     }


    consentsExample_DedicatedAccounts:
      description: Consent request on dedicated accounts
      value:
        {
        "access": 
          {
            "balances": [
                { "iban": "DE40100100103307118608" },
                {  
                  "iban": "DE02100100109307118603",
                  "currency": "ILS"
                },
                { "iban": "DE67100100101306118605" }
              ],
            "transactions": [
                { "iban": "DE40100100103307118608" },
                { "maskedPan": "123456xxxxxx1234" }
              ]
           },
        "recurringIndicator": "true",
        "validUntil": "2017-11-01",
        "frequencyPerDay": 100
       }
      


    consentsExample_AccountList:
      description: Consent on Account List of Available Accounts
      value:
        {"access": 
          {"availableAccounts": "allAccounts"},
         "recurringIndicator": "false",
         "validUntil": "2017-08-06",
         "frequencyPerDay": 100
        }


    consentsExample_without_Accounts:
      description: Consent request on account list or without indication of accounts
      value:
        {"access": 
        {
          "balances": [],
          "transactions": []
        },
        "recurringIndicator": "true",
        "validUntil": "2017-11-01",
        "frequencyPerDay": 100
        }
    
    # #BOI-REMARK: added by BOI   
    # consentsExample_with_paymentAccount_and_creditCards_Banks:
    #   description:  |
    #     Consent request with a payment account and credit cards addressed for banks.
    #     For IBAN ILYYBBBSSSAAAAAAAAAAAA1 – balances and Transactions of the account.
    #     For IBAN ILYYBBBSSSAAAAAAAAAAAA2 - balances for all credit cards connected to the account
    #   value:
    #   {
    #     "access": {
    #       "balances": [
    #       { "iban": "ILYYBBBSSSAAAAAAAAAAAA1" },
    #       { "iban": "ILYYBBBSSSAAAAAAAAAAAA2",
    #         "cashAccountType": "CARD"} 
    #       ],
    #       "transactions": [
    #       { "iban": "ILYYBBBSSSAAAAAAAAAAAA1" }
    #       ]
          
    #     },
    #     "recurringIndicator": true,
    #     "validUntil": "2017-11-01",
    #     "frequencyPerDay": 100
    #   }
    
    # consentsExample_with_paymentAccount_and_creditCards_CreditCardsProcessors:
    #   description:  |
    #     Consent request regarding the maskedPan specified.
    #     For maskedPan 123456xxxxxx1234 –Transactions of the specify credit card maskedPan.
    #   value:
    #   {
    #     "access": {
    #       "transactions": [
    #       { "maskedPan": "123456xxxxxx1234" } 
    #       ]},
    #     "recurringIndicator": true,
    #     "validUntil": "2017-11-01",
    #     "frequencyPerDay": 100
    #   }

    #BOI-REMARK not supported 

    # updatePsuAuthenticationExample_Embedded:
    #   description: Update PSU Authentication request body for the embedded approach.
    #   value:
    #     {
    #       "psuData": {"password": "start12"}
    #     }


    # selectPsuAuthenticationMethodExample_Embedded:
    #   description: Select PSU Authentication Method request body for the embedded approach.
    #   value:
    #     {
    #       authenticationMethodId: "myAuthenticationID"
    #     }


    # transactionAuthorisationExample_Embedded:
    #   description: Transaction Authorisation request body for the embedded approach.
    #   value:
    #     {
    #     "scaAuthenticationData": "123456"
    #     }


    consentsInformationResponseExample:
      description: Consent request on account list or without indication of accounts
      value:
        {
          "access": {
            "balances": [
              {"iban": "DE2310010010123456789"}
                ], 
            "transactions": 
              [
              {"iban": "DE2310010010123456789"},
              {"maskedPan": "123456xxxxxx3457"}
              ]
            },
          "recurringIndicator": "true",
          "validUntil": "2017-11-01",
          "frequencyPerDay": 100,
          "lastActionDate": "2017-10-09",
          "consentStatus": "valid",
          "_links": {"account": {"href": "/v1.0.8/accounts"}}
        }

    #BOI-REMARK: redirect does not supported
    # consentResponseExample1a_Redirect:
    #   description: Consent request Response in case of a redirect
    #   value: 
    #     { 
    #       "consentStatus": "received",
    #       "consentId": "1234-wertiq-983",
    #       "_links": 
    #         {
    #         "scaRedirect": {"href": "https://www.testbank.com/authentication/1234-wertiq-983"},
    #         "status": {"href": "/v1.0.8/consents/1234-wertiq-983/status"},
    #         "scaStatus": {"href": "v1.0.8/consents/1234-wertiq-983/authorisations/123auth567"}
    #         }
    #     }


    # consentResponseExample1b_Redirect:
    #   description: Consent request Response in case of a redirect with a dedicated start of the authorisation process
    #   value: 
    #     { 
    #       "consentStatus": "received",
    #       "consentId": "1234-wertiq-983",
    #       "_links": 
    #         {
    #         "startAuthorisation": {"href": "v1.0.8/consents/1234-wertiq-983/authorisations"}
    #         }
    #   }


    consentResponseExample2_OAuth2:
      description: Response in case of the OAuth2 approach with an implicit generated authorisation resource
      value: 
        { 
        "consentStatus": "received",
        "consentId": "1234-wertiq-983",
        "_links": 
          {
            "self": {"href": "/v1.0.8/consents/1234-wertiq-983"},
            "scaStatus": {"href": "v1.0.8/consents/1234-wertiq-983/authorisations/123auth567"},
            "scaOAuth": {"href": "https://www.testbank.com/oauth/.well-known/oauth-authorization-server"}
          }
        } 


    consentResponseExample3_Decoupled:
      description: Response in case of the decoupled approach
      value: 
        { 
          "consentStatus": "received",
          "consentId": "1234-wertiq-983",
          "_links": 
            {
            "self": {"href": "/v1.0.8/consents/1234-wertiq-983"}
            }
        } 

    #BOI-REMARK
    #consentResponseExample4_Embedded:
    #  description: Response in case of the embedded approach
    #  value: 
    #    { 
    #      "consentStatus": "received",
    #      "consentId": "1234-wertiq-983",
    #      "_links": 
    #        {
    #        "startAuthorisationWithPsuAuthentication": {"href": "/v1.0.8/consents/1234-wertiq-983/authorisations"}
    #        }
    #    }


    consentStatusResponseExample1:
      description: Response for a consent status request.
      value:
        { 
          "consentStatus": "valid",
        }

#BOI-REMARK: not supported
    # paymentInitiationExample_json_Redirect:
    #   description: "Response in case of a redirect with an implicitly created authorisation sub-resource"
    #   value:
    #     {
    #       "transactionStatus": "RCVD",
    #       "paymentId": "1234-wertiq-983",
    #       "_links": 
    #         {
    #         "scaRedirect": {"href": "https://www.testbank.com/asdfasdfasdf"},
    #         "self": {"href": "/v1.0.8/payments/sepa-credit-transfers/1234-wertiq-983"},
    #         "status": {"href": "/v1.0.8/payments/1234-wertiq-983/status"},
    #         "scaStatus": {"href": "/v1.0.8/payments/1234-wertiq-983/authorisations/123auth456"}
    #         }
    #     }


    # paymentInitiationExample_json__RedirectExplicitAuthorisation:
    #   description: "Response in case of a redirect with an explicit authorisation start"
    #   value:
    #     {
    #       "transactionStatus": "RCVD",
    #       "paymentId": "1234-wertiq-983",
    #       "_links": 
    #         {
    #         "self": {"href": "/v1.0.8/payments/1234-wertiq-983"},
    #         "status": {"href": "/v1.0.8/payments/1234-wertiq-983/status"},
    #         "startAuthorisation": {"href": "/v1.0.8/payments1234-wertiq-983/authorisations"}
    #         }
    #     }



    paymentInitiationExample_json_OAuth2:
      description: "Response in case of an OAuth2 SCA approach approach with implicitly creating an authorisation sub-resource"
      value:
        { 
          "transactionStatus": "RCVD",
          "paymentId": "1234-wertiq-983",
          "_links": 
            {
            "scaOAuth": {"href": "https://www.testbank.com/oauth/.well-known/oauth-authorization-server"},
            "self": {"href": "/v1.0.8/payments/masav/1234-wertiq-983"},
            "status": {"href": "/v1.0.8/payments/masav/1234-wertiq-983/status"},
            "scaStatus": {"href": "/v1.0.8/payments/masav/1234-wertiq-983/authorisations/123auth456"}
            }
        }



    paymentInitiationExample_json_Decoupled:
      description: "Response in case of the decoupled approach with explicit start of authorisation needed"
      value:
        { 
          "transactionStatus": "RCVD",
          "paymentId": "1234-wertiq-983",
          "_links": 
            {
            # "startAuthorisationWithPsuIdentification": {"href":"/v1.0.8/payments/1234-wertiq-983/authorisations"},
            "self": {"href": "/v1.0.8/payments/masav/1234-wertiq-983"}
            }
        } 

#BOI-REMARK: NOT SUPPORTED
    # paymentInitiationExample_json_Embedded:
    #   description: "Response in case of the embedded approach with explicit start of authorisation"
    #   value:
    #     { 
    #       "transactionStatus": "RCVD",
    #       "paymentId": "1234-wertiq-983",
    #       "_links": 
    #         {
    #         "startAuthenticationWithPsuAuthentication": {"href": "/v1.0.8/payments/1234-wertiq-983/authorisations"},
    #         "self": {"href": "/v1.0.8/payments/1234-wertiq-983"}
    #         }
    #     }


    paymentInitiationStatusResponse_json_Simple:
      value:
        { 
        "transactionStatus": "ACCP"
        }

    #BOI REMARK: supported
    paymentInitiationCancelResponse-202:
      value:
        {
          "transactionStatus": "ACTC",
          "_links": 
            {
            "self": {"href": "/v1.0.8/payments/123456scheduled789"},
            "status": {"href": "/v1.0.8/payments/123456scheduled789/status"},
            "startAuthorisation": {"href": "/v1.0.8/payments/123456scheduled789/cancellation-authorisations"}
            }
        }


    paymentInitiationStatusResponse_json_Extended:
      value: |
        { 
          "transactionStatus": "ACCP",
          "scaStatus": "Some SCA Status"
        }


    updatePsuIdentificationResponseExample_Decoupled_payments:
      description: Response of an Update PSU Identification for a payment initiation request for the decoupled approach.
      value:
        { 
          "scatransactionStatus": "psuIdentified",
          "psuMessage": "Please use your BankApp for transaction Authorisation.",
          "_links":
            {
              "scaStatus":  {"href":"/v1.0.8/payments/qwer3456tzui7890/authorisations/123auth456"}
            }
        }

#BOI-REMARK EMBEDDED does not supported
#    updatePsuAuthenticationResponseExample_Embedded_payments:
#      description: Response of an Update PSU Authentication for a consent request for the embedded approach.
#      value:
#        { 
#          "scaStatus": "psuAuthenticated",
#          _links: {
#           "authoriseTransaction": {"href": "/v1.0.8/payments/1234-wertiq-983/authorisations/123auth456"}
#          }
#        }


#    selectPsuAuthenticationMethodResponseExample_Embedded_payments:
#      description: Response of a Select PSU Authentication Method payment initiation request for the embedded approach
#      value:
#        { 
#          "scaStatus": "scaMethodSelected",
#          "chosenScaMethod": {
#          "authenticationType": "SMS_OTP",
#          "authenticationMethodId": "myAuthenticationID"},
#          "challengeData": {
#          "otpMaxLength": "6",
#          "otpFormat": "integer"},
#          "_links": {
#             "authoriseTransaction": {"href": "/v1.0.8/payments/1234-wertiq-983/authorisations/123auth456"}
#          }
#        }


    transactionAuthorisationResponseExample:
      description: Response of a Transaction Authorisation request for the embedded approach.
      value:
        { 
          "scaStatus": "finalised"
        }


    confirmationOfFundsExample:
      description: Request body for a confirmation of funds.
      value:
        {  
          "cardNumber": "12345678901234", 
          "account": {"iban": "DE23100120020123456789"},
          "instructedAmount": {"currency": "EUR", "amount": "123"}
        }


    confirmationOfFundsResponseExample:
      description: Response for a confirmation of funds request.
      value:
        {
          "fundsAvailable": "true"
        }


    balancesExample1_RegularAccount:
      description: Response for a read balance request in case of a regular account.
      value: 
        {
          "account": {"iban": "FR7612345987650123456789014"},
          "balances":
              [{"balanceType": "closingBooked",
            "balanceAmount": {"currency": "EUR", "amount": "500.00"},
                "referenceDate": "2017-10-25"
                   },
               {"balanceType": "expected", 
                "balanceAmount": {"currency": "EUR","amount": "900.00"},
               "lastChangeDateTime": "2017-10-25T15:30:35.035Z"
               }]
        }


    balancesExample2_MulticurrencyAcount:
      description: |
        Response in case of a multicurrency account with one account in EUR, 
        one in USD, where the ASPSP has delivered a link to the balance endpoint relative to the aggregated 
        multicurrency account (aggregation level).
      value: 
        {
          "balances":
              [{"balanceType": "closingBooked",
                "balanceAmount": {"currency": "EUR", "amount": "500.00"},
                "referenceDate": "2017-10-25"
                   },
              {"balanceType": "expected",
              "balanceAmount": {"currency": "EUR", "amount": "900.00"},
              "lastChangeDateTime": "2017-10-25T15:30:35.035Z"
              },
           {"balanceType": "closingBooked", 
                "balanceAmount": {"currency": "USD", "amount": "350.00"},
                "referenceDate": "2017-10-25"
                   },
              {"balanceType": "expected",
               "balanceAmount": {"currency": "USD", "amount": "350.00"},
               "lastChangeDateTime": "2017-10-24T14:30:21Z"
                   }]
        }

    balancesExample_CardAccount:
      description: |
        Response in case of card Acoount balance request
      value: 
        {
          "cardAccount": {"maskedPan": "525412******3241"},
          "balances":[
            {
              "balanceType": "interimBooked",
              "balanceAmount": { "currency": "EUR", "amount": "14355.78" }
            },{
              "balanceType": "nonInvoiced",
              "balanceAmount": { "currency": "EUR", "amount": "4175.86" }
            }
          ]
        }


    transactionsExample1_RegularAccount_json:
      description: Response in JSON format for an access on a regular account
      value:
        {
          "account": {"iban": "DE2310010010123456788" },
          "transactions":
            {
            "booked":
              [{
              "transactionId": "1234567",
              "creditorName": "John Miles",
              "creditorAccount": {"iban": "DE67100100101306118605"},
              "transactionAmount": {"currency": "EUR", "amount": "256.67"},
              "bookingDate": "2017-10-25",
              "valueDate": "2017-10-26", 
              "remittanceInformationUnstructured": "Example 1" 
                },{
                 "transactionId": "1234568",
                 "debtorName": "Paul Simpson",
                 "debtorAccount": {"iban": "NL76RABO0359400371"},
                 "transactionAmount": {"currency": "EUR", "amount": "343.01"},
                 "bookingDate": "2017-10-25",
                 "valueDate": "2017-10-26", 
                 "remittanceInformationUnstructured": "Example 2"
                }],
            "pending":
              [{
                 "transactionId": "1234569",
                 "creditorName": "Claude Renault",
                 "creditorAccount": {"iban": "FR7612345987650123456789014"},
                 "transactionAmount": {"currency": "EUR", "amount": "-100.03"},
                 "valueDate": "2017-10-26", 
                 "remittanceInformationUnstructured": "Example 3"
                }],
            "_links": {"account": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f"}}
             }
        }


  #BOI-REMARK "download" does not supported
  #  transactionsExample2_Download_json:
  #    description: Response in case of huge data amount as a download.
  #    value:
  #      { 
  #        "_links": {"download": {"href": "www.test-api.com/xs2a/v1.0.8/accounts/12345678999/transactions/download/"}}
  #      }

    #BOI-REMARK: Added by BOI
    transactionsExample2_paging_json:
      description: Response in case of data paging.
      value:
        { 
          "_links": { 
              "first": { "href": "/v1.0.8/accounts/12345678999/transactions"},
              "next": { "href": "/v1.0.8/accounts/12345678999/transactions"},
              "previous": {"href": "/v1.0.8/accounts/12345678999/transactions"},
              "last": {"href": "/v1.0.8/accounts/12345678999/transactions"}
          }
        }


    transactionsExample3_MulticurrencyAccount_json:
      description: Response in JSON format for an access on a multicurrency account on aggregation level
      value:
        {
        "account": {"iban": "DE40100100103307118608"},
         "transactions":
           {"booked": 
             [{
               "transactionId": "1234567",
               "creditorName": "John Miles",
               "creditorAccount": {"iban": "DE67100100101306118605"},
               "transactionAmount": {"currency": "EUR", "amount": "-256.67"},
               "bookingDate": "2017-10-25",
               "valueDate": "2017-10-26", 
               "remittanceInformationUnstructured": "Example 1"
              },{
               "transactionId": "1234568",
               "debtorName": "Paul Simpson",
               "debtorAccount": {"iban": "NL76RABO0359400371"},
               "transactionAmount": {"currency": "EUR", "amount": "343.01"},
               "bookingDate": "2017-10-25",
               "valueDate": "2017-10-26", 
               "remittanceInformationUnstructured": "Example 2"
              },{
               "transactionId": "1234569",
               "debtorName": "Pepe Martin",
               "debtorAccount": {"iban": "SE9412309876543211234567"},
               "transactionAmount": {"currency": "USD", "amount": "100"},
               "bookingDate": "2017-10-25",
               "valueDate": "2017-10-26", 
               "remittanceInformationUnstructured": "Example 3"
              }],
           "pending":
             [{
               "transactionId": "1234570",
               "creditorName": "Claude Renault",
               "creditorAccount": {"iban": "FR7612345987650123456789014"},
               "transactionAmount": {"currency": "EUR", "amount": "-100.03"},
               "valueDate": "2017-10-26", 
               "remittanceInformationUnstructured": "Example 4"
              }],
           "_links": {"account": {"href": "/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f"}}
           }
        }
    
    transactionsExample4_checkDepositTransaction_json:
      description: Response in json format in case of checks deposit transaction.
      value:
       {"account": {"iban": "DE40100100103307118608"},
         "transactions":
           {"booked": 
             [{
               "transactionId": "1234567",
               "creditorName": "John Miles",
               "creditorAccount": {"iban": "DE67100100101306118605"},
               "transactionAmount": {"currency": "EUR", "amount": "-256.67"},
               "bookingDate": "2017-10-25",
               "valueDate": "2017-10-26", 
               "remittanceInformationUnstructured": "Example 1"
              },{
                "transactionId": "1234568",
               "transactionAmount": {"currency": "EUR", "amount": "343.01"},
               "bookingDate": "2017-10-25",
               "valueDate": "2017-10-26", 
               "remittanceInformationUnstructured": "Example 2- checks",
               "additionalInformationStructured":
                {
                  "checksDetails":
                  [{
                    "checkId": "111",
                    "bookingDate": "2017-7-25",
                    "valueDate": "2017-7-26",
                    "transactionAmount": {"currency": "ILS", "amount": "250"}
                   },{
                    "checkId": "222",
                    "bookingDate": "2017-7-25",
                    "valueDate": "2017-7-26",
                    "transactionAmount": {"currency": "ILS", "amount": "450"}
                  },{
                    "checkId": "333",
                    "bookingDate": "2017-7-25",
                    "valueDate": "2017-7-26",
                    "transactionAmount": {"currency": "ILS", "amount": "300"}
                  }]
                }
          }]},
          "_links":
            {"account": {"href":"/v1.0.8/accounts/3dc3d5b3-7023-4848-9853-f5400a64e80f"}}
        }

    transactionDetailsExample:
      description: Example for transaction details
      value:
        {
          "transactionsDetails":
             {
               "transactionId": "1234567",
               "creditorName": "John Miles",
               "creditorAccount": {"iban": "DE67100100101306118605"},
               "mandateId": "Mandate-2018-04-20-1234",
               "transactionAmount": {"currency": "EUR", "amount": "-256.67"},
               "bookingDate": "2017-10-25",
               "valueDate": "2017-10-26", 


             }
        }
        


    authorisationListExample:
      value:
        { 
          "authorisationIds": ["123auth456"]
        }


security:
#####################################################
# Global security options
#####################################################
  - {}


tags:
#####################################################
# Predefined Tags to Group Methods
#####################################################

  - name: Payment Initiation Service (PIS)
    description: |
      The Decription for Payment Initiation Service (PIS) offers the following services:
        * Initiation and update of a payment request
        * Status information of a payment
  - name: Confirmation of Funds Service (PIIS)
    description: |
      Confirmation of Funds Service (PIIS) returns a confirmation of funds request at the ASPSP.
  - name: Account Information Service (AIS)
    description: |
      The Account Information Service (AIS) offers the following services
        * Transaction reports for a given account or card account including balances if applicable.
        * Balances of a given account or card account ,
        * A list of available accounts or card account ,
        * Account details of a given account or card account or of the list of all accessible accounts or card account  relative to a granted consent
  - name: Signing Baskets Service (SBS)
    description: |
      Signing basket methods are used for authorising several transactions and resp. or consents with one SCA operation. 
  - name: Common Services
    description: |
      Processes on starting authorisations, update PSU identification or PSU authentication data and explicit 
      authorisation of transactions by using SCA are very similar in PIS and AIS and signing baskets services. 
      The API calls supporting these processes are described in the following independently from the service/endpoint. 
      For reasons of clarity, the endpoints are defined always for the Payment Initiation Service, the Payment Cancellation, 
      the Account Information Service (Consents), and Signing Baskets separately. 
      These processes usually are used following a hyperlink of the ASPSP.
`)

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})