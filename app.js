const 
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request'),
  mongoose = require('mongoose'),
  apiai = require('apiai'),
  qr = require('qr-image'),
  userController = require('./daos/userDao'),
  pedidoController = require('./controllers/pedidoController'),
  pubController = require('./controllers/pubController'),
  carouselController = require('./controllers/carouselController'),
  beerController = require('./daos/beerDao'),
  itemPedidoController = require('./daos/pedidoItemDao'),
  snacksController = require('./controllers/snacksController'),
  merchaController = require('./controllers/merchandisingController'),
  googleMapController = require('./controllers/googleMapController');

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));
app.use("/style", express.static(__dirname + '/style'));


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
app.get('/paymentGateway', function (req, res) {
    res.render('payment'); 
});

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

app.post('/showRecibo', function(req, res) {
    var senderId = req.body.name;
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
          receivedPostback(messagingEvent);
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

    switch(quickReplyPayload){
      case "SEARCH_PATAGONIA_POINTS":
        shareLocation(senderID, "Para buscar puntos Patagonia cerca necesito conocer tu ubicación, puedes escribirla o simplemente oprimir en 'Enviar ubicación.'");
      break;
      case "SEARCH_PATAGONIA_BEERS":
        shareLocation(senderID, "Para buscar cervezas Patagonia cerca necesito conocer tu ubicación, puedes escribirla o simplemente oprimir en 'Enviar ubicación.'");
      break;
    }
  
    return;
  }

  if (messageText) {
    analyzeMessage(senderID, messageText);
  } else if (messageAttachments) {
      var attachment = messageAttachments[0];
      if(attachment.type == "location"){
          var title = attachment.title;
          var coordinates = attachment.payload.coordinates;
          //sendTextMessage(senderID, title + ": " + JSON.stringify(coordinates));
          sendPointList(senderID);
          showMoreResults(senderID);
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


function userStartPostback(senderID, userName){
    var messageData = {
      recipient: {
        id: senderID
      },
      message: {
        text:  "Hola "+ userName + " soy El Maestro cervecero, te ayudare a encontrar tu proxima experiencia cervecera superadora.",
        quick_replies:[
          {
            content_type:"text",
            title:"Puntos Patagonia",
            image_url:"https://beermaster.herokuapp.com/style/patagonia.png",
            payload:"SEARCH_PATAGONIA_POINTS"
          },
          {
            content_type:"text",
            title:"Cervezas Patagonia",
            image_url:"https://beermaster.herokuapp.com/style/beers.png",
            payload:"SEARCH_PATAGONIA_BEERS"
          }
        ]
      }
    };

  callSendAPI(messageData);
}


function showMoreResults(senderID){
    var messageData = {
               recipient:{
                    id:senderID
                  },
                  message:{
                    attachment:{
                      type:"template",
                      payload:{
                        template_type:"button",
                        text:"¡Si deseas ver mas resultados oprime sobre el boton!",
                        buttons:[
                            {
                                type:"web_url",
                                url:"https://beermaster.herokuapp.com/",
                                title:"Ver Mapa",
                                webview_height_ratio: "full" 
                            }
                        ]
                      }
                    }
                  }
    };

  callSendAPI(messageData);
}


function testQR(senderID) {
  var qr_svg = qr.image('I love QR!', { type: 'png' });
  qr_svg.pipe(require('fs').createWriteStream('./style/i_love_qr.png'));
  var svg_string = qr.imageSync('I love QR!', { type: 'png' });

  var messageData = {
    recipient: {
      id: senderID
    },
    message: {
        attachment:{
          type: "image",
          payload:{
            url: "https://beermaster.herokuapp.com/style/i_love_qr.png"
          }
        }
    }
  };
  callSendAPI(messageData);
}

function sendReceipt(senderID, itemPedidosList) {
  console.log("generando el recibo pa");
  var total = {total_cost: 0};
  var userDataPromise = userController.getUser(senderID);
  var consumoCategoria = [];

  userDataPromise.then(function(result){
    console.log("me dieron los datos de fb " + result);

      for(var i = 0; i < itemPedidosList.length; i++)
      {
        var itemToAdd = {nom : itemPedidosList[i].variedad, costoCat : itemPedidosList[i].precio};
        console.log("voy a testear con " + itemToAdd);
        consumoCategoria.indexOf(itemToAdd) === -1 ? consumoCategoria.push(itemToAdd) : console.log(consumoCategoria.indexOf(itemToAdd));
        total.total_cost += parseFloat(itemPedidosList[i].precio);
      }
  console.log("el consumo por cat quedo : " + consumoCategoria);
  var messageData = {
    recipient: {
      id: senderID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: result.apellido + ", " + result.nombre,
          order_number: "12314123",
          currency: "ARS",
          payment_method: "VISA 5494",
          summary: total,
          elements: []
        }
      }
    }
  };  

  for(var i = 0; i < itemPedidosList.length; i++)
  {
     messageData.message.attachment.payload.elements.push({
        title: itemPedidosList[i].variedad,
        price: itemPedidosList[i].precio,
        image_url: itemPedidosList[i].url
     });
  }
  callSendAPI(messageData);


  });
}

function userGetsReceipt(senderID) {
    console.log("generate receipt");
    var itemPedidoPromise = itemPedidoController.getItemPedido(senderID);
    itemPedidoPromise.then(function(result){
       console.log("encontre los siguientes items pedidos " + result);
       for(var i = 0; i < result.length; i++)
       {
          console.log("Adquiriste una " + result[i].variedad + " a $" + result[i].precio);
       }

       sendReceipt(senderID, result);
           sendTextMessage(senderID, "Acercate al bar con el código QR, y disfruta de la experiencia Patagonia de una forma más ágil!");

            var qr_svg = qr.image('HackTheWorld!', { type: 'png' });
            qr_svg.pipe(require('fs').createWriteStream('./style/i_love_hack.png'));
            var svg_string = qr.imageSync('HackTheWorld!', { type: 'png' });

            var messageDataQR = {
              recipient: {
                id: senderID
              },
              message: {
                  attachment:{
                    type: "image",
                    payload:{
                      url: "https://beermaster.herokuapp.com/style/i_love_hack.png"
                    }
                  }
              }
            };

            callSendAPI(messageDataQR); 

    });
}

function userAddsItem(senderID, variedad, precio, url) {
  console.log("LLEGO LA URL " + url);
    pedidoController.insertPedido({ userId:senderID}, function(resultado) {
      console.log("obtuve el siguiente resultado de la insert: " + resultado);

      itemPedidoController.insertarItemPedido({ userId: resultado.userId,  variedad: variedad, precio: precio, url: url});

      var messageData = {
        recipient: {
          id: senderID
        },
        message:{
                    attachment:{
                      type:"template",
                      payload:{
                        template_type:"button",
                        text:"Agrego una " + variedad + " al pedido.",
                        buttons:[
                            {
                                type:"web_url",
                                messenger_extensions: true ,
                                url:"https://beermaster.herokuapp.com/paymentGateway",
                                title:"Pagar",
                                webview_height_ratio: "tall"
                            }
                        ]
                      }
                    }
        }
      };
      
      callSendAPI(messageData);
    });
}

function sendPointList(senderID){  
  var messageData = {
    recipient: {
      id: senderID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: []
        }
      }
    }
  };  

  var promise = pubController.getAll();

  promise.then(function(pubs){
      carouselController.getPubsToCarouselElement(pubs,function(carouselPubs){
          messageData.message.attachment.payload.elements = carouselPubs;
          callSendAPI(messageData); 
      });
  });
}

function showBarDetail(senderID, idBar){
      var messageData = {
      recipient: {
        id: senderID
      },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
                     {
                      title:"Cervezas",
                      image_url:"https://beermaster.herokuapp.com/style/cervezas.jpeg",
                      buttons:[
                        {
                          type:"postback",
                          title:"Ver Cervezas",
                          payload: JSON.stringify({payload:"SHOW_BEER", barId: idBar})
                        }              
                      ]      
                    },
                    {
                      title:"Snacks",
                      image_url:"https://beermaster.herokuapp.com/style/snacks.jpeg",
                      buttons:[
                        {
                          type:"postback",
                          title:"Ver Snacks",
                          payload: JSON.stringify({payload:"SHOW_SNACKS", barId: idBar})
                        }              
                      ]      
                    },
                    {
                      title:"Merchandising",
                      image_url:"https://beermaster.herokuapp.com/style/merchandising.jpg",
                      buttons:[
                        {
                          type:"postback",
                          title:"Ver Merchandising",
                          payload: JSON.stringify({payload:"SHOW_MERCH", barId: idBar})
                        }              
                      ]      
                    }
                  ]
                }
              }
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
          botRequest.on('response', function(response) {
              var action = response.result.action;   

              switch(action){
                 case "input_welcome": 
                    var userPromise = userController.getUser(senderID);
                    userPromise.then(function(user){
                            if(!user){
                              userController.getFBInformation(senderID, function(userData){
                                  userController.insertUser({id: senderID, nombre : userData.first_name, apellido: userData.last_name, fotoPerfil: userData.profile_pic, genero: userData.gender , zona: userData.locale });
                                  userStartPostback(senderID, userData.first_name);
                              });
                            }else{
                                userStartPostback(senderID, user.nombre);
                            }
                    });
                 ;break;
                 case "obtain_receipt":
                    userGetsReceipt(senderID);
                ;break;
                 default: 
                   sendTextMessage(senderID, response.result.fulfillment.speech);
                 ;break;
              }
          });

        botRequest.on('error', function(error) {
            console.log(error);
        });

        botRequest.end();
}


function receivedPostback(messagingEvent){
      var postBackObject = {};
      console.log("recibi postback:" + JSON.stringify(messagingEvent.postback.payload));
      console.log("que tiene el payload " + messagingEvent.postback.payload);
      try {
         postBackObject =  JSON.parse(messagingEvent.postback.payload);
      } catch (e) {
        console.log("me quede en el catch");
         postBackObject.payload = messagingEvent.postback.payload;
      }

      var senderID = messagingEvent.sender.id;
      
         switch(postBackObject.payload){
            case "USER_START":
                var userPromise = userController.getUser(senderID);
                userPromise.then(function(user){
                        if(!user){
                          userController.getFBInformation(senderID, function(userData){
                              userController.insertUser({id: senderID, nombre : userData.first_name, apellido: userData.last_name, fotoPerfil: userData.profile_pic, genero: userData.gender , zona: userData.locale });
                              userStartPostback(senderID, userData.first_name);
                          });
                        }else{
                            userStartPostback(senderID, user.nombre);
                        }
                });
            ;break;
            case "VIEW_MORE": 
              console.log("voy a mostrar el detalleeee");
              showBarDetail(senderID, postBackObject.barId);
            ;break;
            case "AGREGAR":
              userAddsItem(senderID, postBackObject.variedad, postBackObject.precio, postBackObject.url);
            ;break;
            case "SHOW_BEER": 
             beerMenu(senderID, postBackObject.barId);
              ;break;
            case "SHOW_MERCH": 
             merchaMenu(senderID, postBackObject.barId);
              ;break;
            case "SHOW_SNACKS": 
              snackMenu(senderID, postBackObject.barId);
           ;break;
      }     
}

function beerMenu(senderID, local) {
  sendTextMessage(senderID, "Te doy estas opciones para el punto Patagonia elegido!");
  var postbackObject = { payload: "AGREGAR", variedad: "", precio: "" , url: ""};
  var messageData = {
    recipient: {
      id: senderID
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: []
        }
      }
    }
  };  
    beerController.getBeerPerLocal(local ,function(beer){
      console.log("obtuve " + beer);
        for(var i = 0; i < beer.length; i++){
        postbackObject.variedad = beer[i].description;
        postbackObject.precio = beer[i].price;
        postbackObject.url = beer[i].image;

        messageData.message.attachment.payload.elements.push({
          title: beer[i].description,
          subtitle: "Precio: " + beer[i].price,
          image_url: beer[i].image,
          buttons: [{
                       type: "postback",
                       title: "Agregar Item",
                       payload: JSON.stringify(postbackObject)
                      }] 
        });
      }
        callSendAPI(messageData);
    });
}


function snackMenu(senderID, barId) {
   var pubPromise = pubController.getPubById(barId);
    pubPromise.then(function(bar){
      sendTextMessage(senderID, "Estos son algunos de los snacks de " + bar.name);
      var postbackObject = { payload: "AGREGAR", variedad: "", precio: "" , url: ""};
      var messageData = {
        recipient: {
          id: senderID
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: []
            }
          }
        }
      };  

        snacksController.getSnacksByBarId(barId ,function(snacks){
            console.log("Cantidad de snacks " + snacks.length);
            for(var i = 0; i < snacks.length; i++){
              postbackObject.variedad = snacks[i].description;
              postbackObject.precio = snacks[i].price;
              postbackObject.url = snacks[i].image;

              messageData.message.attachment.payload.elements.push({
              title: snacks[i].description,
              subtitle: "Precio: " + snacks[i].price,
              image_url: snacks[i].image,
              buttons: [{
                           type: "postback",
                           title: "Agregar Item",
                           payload: JSON.stringify(postbackObject)
                          }] 
            });
          }
            callSendAPI(messageData);
        });  

    });
}


function merchaMenu(senderID, barId) {
   var pubPromise = pubController.getPubById(barId);
    pubPromise.then(function(bar){
      sendTextMessage(senderID, "Estos son algunos de los objetos que te ofrecemos para mejorar tu experiencia Patagonia en " + bar.name);
      var postbackObject = { payload: "AGREGAR", variedad: "", precio: "" , url: ""};
      var messageData = {
        recipient: {
          id: senderID
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: []
            }
          }
        }
      };  

        merchaController.getMerchaByBarId(barId ,function(merchas){
          console.log("Merchaaaaa " + merchas.length);
            for(var i = 0; i < merchas.length; i++){
              postbackObject.variedad = merchas[i].description;
              postbackObject.precio = merchas[i].price;
              postbackObject.url = merchas[i].image;

              messageData.message.attachment.payload.elements.push({
              title: merchas[i].description,
              subtitle: "Precio: " + merchas[i].price,
              image_url: merchas[i].image,
              buttons: [{
                           type: "postback",
                           title: "Agregar Item",
                           payload: JSON.stringify(postbackObject)
                          }] 
            });
          }
            callSendAPI(messageData);
        });  

    });
}


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;









