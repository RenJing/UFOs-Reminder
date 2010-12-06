	$(document).ready(function() {
		getOrdersFromServer();
		setInterval(getOrdersFromServer, DefaultConfig.checkNewIntervaInMinutes * 60 * 1000);
		bindGoToUFOsEvent();
	});
	
	function process(ordersFromServer){
		var serverOrders = createOrders(ordersFromServer);
		var cachedOrders = getCachedOrders();
		var newOrders = getNewOrders(serverOrders, cachedOrders);
		
		reminderNewOrder(newOrders);
		updateHasReminderedFlag(serverOrders, cachedOrders);
		reminderToBeFinishedOrder(serverOrders);
		cacheOrders(serverOrders);
		updateView(serverOrders);
	}
	
	function updateView(orders){
		var orderList = $(".orders");
		orderList.html("");
		var openOrders = $.grep(orders, function(order){return !order.hasFinished()});
		if(openOrders.length == 0){
			orderList.html("<li class='no-order'><span>暂时无新订餐哈~</span></li>");
		}
		$(orders).each(function(i, order){
			if(!order.hasFinished()){
				var minutes = order.deadline.getMinutes().toString();
				var deadline = order.deadline.getHours() + ":" + (minutes.length == 1 ? "0" + minutes : minutes);
				var itemClass = order.toBeFinished(10) ? "urgent" : order.toBeFinished(30) ? "normal" : "";
				
				var orderElement = $("<li><span></span></li>");
				orderElement.addClass(itemClass);
				orderElement.find("span").html(order.restaurantName + " [ 结束时间 " + deadline +  " ]");
				orderList.append(orderElement);
			}
		});
	}
	
	function reminderNewOrder(newOrders){
		if(newOrders.length != 0){
			playHasNewOrder();
		}
	}
	
	function reminderToBeFinishedOrder(orders, cachedOrders){
		var needRemind = false;
		$.each(orders, function(i, order){
			if(!order.hasRemindered && order.toBeFinished(DefaultConfig.toBeFinishTimeInMinutes)){
				order.hasRemindered = true;
				needRemind = true;
			}
		});
		if(needRemind){
			playOrderIsFinishing();
		}
	}
	
	function updateHasReminderedFlag(serverOrders, cachedOrders){
		var reminderedOrderIds = $.grep(cachedOrders, function(order){
			return order.hasRemindered;
		}).map(function(order){
			return order.id;
		});
		
		$(serverOrders).each(function(i, order){
			if($.inArray(order.id, reminderedOrderIds) != -1){
				order.hasRemindered = true;
			}
		})
	}
	
	function createOrders(ordersFromServer){
		var orders = [];
		$.each(ordersFromServer, function(i, orderFromServer){
			var deadline = orderFromServer.deadline;
			orders.push(new Order(orderFromServer.id, deadline, orderFromServer.restaurantName, false));
		});
		return orders;
	}

	function getOrdersFromServer(){
		$.ajax({
			  url: DefaultConfig.ufosUrl + "/reminder/index",
			  async: false,
			  data: {callback: "process"},
			  type: 'get',
			  dataType: "jsonp"
		});
	}
	
	function getNewOrders(ordersFromServer, ordersCached){
		var cachedOrderIds = $.map(ordersCached, function(order){
			return order.id;
		});
		var newOrders = $.grep(ordersFromServer, function(order){
			return $.inArray(order.id, cachedOrderIds) == -1 && !order.hasFinished();
		});
		return newOrders;
	}
	
	function cacheOrders(orders){
		localStorage.setItem('orders', JSON.stringify(orders));
	}
	
	function getCachedOrders(){
        var ordersString = localStorage.getItem('orders');
		if(!ordersString){
			return [];
		}
		var objects = JSON.parse(ordersString);
		return $.map(objects, function(o){return new Order(o.id, o.deadline, o.restaurantName, o.hasRemindered);});
	}
	
	function playHasNewOrder(){
		var musicElement = $('.music');
		musicElement.attr('src', DefaultConfig.startVoice);
		musicElement.trigger('play');
	}
	
	function playOrderIsFinishing(){
		var musicElement = $('.music');
		musicElement.attr('src', DefaultConfig.endVoice);
		musicElement.trigger('play');
	}
	
	function Order(id, deadline, restaurantName, hasRemindered){
		this.id = id;
		this.deadline = new Date(deadline);
		this.restaurantName = restaurantName;
		this.hasRemindered = hasRemindered;
	}
	Order.prototype = {
		hasFinished: function(){
			return this.deadline < new Date();
		},
		
		toBeFinished: function(toBeFinishTimeInMinutes){
			return !this.hasFinished() && this.deadline - new Date < toBeFinishTimeInMinutes * 60 * 1000;
		}
	}
		
	DefaultConfig = {ufosUrl: "http://10.18.8.73", checkNewIntervaInMinutes: 1, toBeFinishTimeInMinutes: 10, startVoice: "html5/start.wav", endVoice: "html5/end.wav"};
	
