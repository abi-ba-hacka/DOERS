
module.exports = {
			getPubsToCarouselElement: function(pubs, callback){
				var postbackObject = { payload: "VIEW_MORE", barId: "" };
				var carouselItems = [];
				for (var i = 0; i < (pubs.length / 2); i++) {
					var carouselItem = {buttons:[]};
					postbackObject.barId = pubs[i].id;
					carouselItem.title = pubs[i].name;
					carouselItem.subtitle = pubs[i].direction + "\n" +  pubs[i].availableTime ;
					carouselItem.image = pubs[i].image;
					carouselItem.buttons.push({type:"element_share"});
					carouselItem.buttons.push({type:"phone_number",title:"Llamar",payload:"+" + pubs[i].phone_number});
					carouselItem.buttons.push({type: "postback",title: "Ver mas",payload:  JSON.stringify(postbackObject)});
					carouselItems.push(carouselItem);
				}

			 	callback(carouselItems);
			}
}