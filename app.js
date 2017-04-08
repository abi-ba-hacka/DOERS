const 
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request'),
  mongoose = require('mongoose'),
  apiai = require('apiai'),
  googleMapController = require('./controllers/googleMapController');

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));


// MongoDb connection
mongoose.connect(config.get('connectionString'));

//Bot Api.ai config
var botApp = apiai(config.get('develop_access_token_apiai'));
var botOptions = {};

/***********************  InteractiBA  LOGIC     **********************************/

//checkSubwayStatus.job();

app.get('/testCoordinates', function (req, res) {
    var address = "chuquisaca 740";
    googleMapController.getCoordinatesAddress(address, function(results){
        var directionsObject = {id: '123', options: ""};
        var options = {};
        results.forEach(function(direction, index){
          options[index] = direction.geoLatLng;
        });
        res.send(JSON.stringify(directionsObject));
    });  
});



/*********************************************************************************/
// About Aboutpage
app.get('/About', function (req, res) {
    res.send('About El Maestro Cervecero webpage');
});


// Help webpage
app.get('/Help', function (req, res) {
    res.send('Help El Maestro Cervecero webpage');
});


// Server frontpage
app.get('/', function (req, res) {
    res.send('Welcome to the Beer Master! ');
});

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}
 /* WebHook */

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

app.post('/webhook', function (req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        botOptions.sessionId = messagingEvent.sender.id;
        if (messagingEvent.optin) {
          //receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          //receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          //receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          //receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          //receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});


/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;


  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    analizePayload(senderID, quickReplyPayload);

    return;
  }

  if (messageText) {
    analyzeMessage(senderID, messageText);
  } else if (messageAttachments) {
      var attachment = messageAttachments[0];
      if(attachment.type == "location"){
          var title = attachment.title;
          var coordinates = attachment.payload.coordinates;
          sendTextMessage(senderID, title + ": " + JSON.stringify(coordinates));
      }
  }
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}


function shareLocation(recipientId, speech){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: speech,
      quick_replies:[
        {
          "content_type":"location",
        }
      ]
    }
  };

  callSendAPI(messageData);
}



function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}


// Api.ai 

function analyzeMessage(senderID, messageText){
  var botRequest = botApp.textRequest(messageText, botOptions);
  var botResponse;

    switch(messageText){
      case "location":
        shareLocation(senderID, "Para buscar cervezas cerca necesitamos conocer tu ubicación, puedes pasarnos una direccion o simplemente oprimir en 'Enviar ubicación.'");
      break;
      default:
        sendTextMessage(senderID, "You said " + messageText);
    }


    botRequest.on('response', function(response) {
        console.log("BOT RESPONSE:");
        botResponse = JSON.stringify(response); 
        console.log(botResponse);
        //sendTextMessage(senderID, botResponse);
    });

    botRequest.on('error', function(error) {
        console.log(error);
    });

    botRequest.end();
}


function analizePayload(senderID, payload){

  switch(payload){
    case "USER_START":
      sendTextMessage(senderID, "User Start" );
    ;break;
  }
}


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;









