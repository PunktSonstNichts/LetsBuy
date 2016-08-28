var app = {
	//BASE_URL: "http://139.59.164.70", //Because I will always love you
	BASE_URL: "http://127.0.0.1/LetzBuyServer",
	lat: 0.0,
	long: 0.0,
	init: function(){
		// starting site
		// stuff not worth creating a node for
		// fill new shoppinglist form
		$("#itemholder").append(app.template("list_item"));
		//TEMP
		$(document).on("click touchstart", "#logout", function(){
			localStorage.removeItem("api_token");
			location.reload();
		});
		$("*[data-templateautoload][data-templateautoload!='']").each(function(){
			$(this).html(app.template($(this).attr("data-templateautoload"), $(this).attr("data-templatefullpage")));
		});
		var autocomplete_cache = {};
		$(document).on('unblur keyup', '.item', function(e){
			//should create a new one if everything is full
			target = $(this);
			console.log("Background check");
			everything_full = false;
			var query = $(this).find(".nlname_input").val();
			console.log(query);
			if(query != ""){
				if($(this).find(".nlquantity_input").val() != "" && !$(this).hasClass("line_added")){
					everything_full = true;
					$(this).addClass("line_added");
				}
				// autocomplete stuff
				if(query.length >= 2){
						//Check if we've searched for this term before
						if(query in autocomplete_cache){
								results = autocomplete_cache[query];
						}else{
								//Case insensitive search for our people array
								var results = $.grep(JSON.parse(localStorage.getItem("products")), function(item){
										return item.product_name.search(RegExp(query, "i")) != -1;
								});
								//Add results to cache
								autocomplete_cache[query] = results;
						}
						var autocomplete_box = $(this).find(".item_autocomplete");
						autocomplete_box.html("");
						for(key in results){
							autocomplete_box.append(app.templatelist.autocomplete_item(results[key]));
						}
				}
			}
			console.log(everything_full);
			if(everything_full){
				$("#itemholder").append(app.template("list_item", "keep"));
			}
			target.focus();
		});
		//submit
		$(document).on('submit', "#new_list_form", function(e){
			e.preventDefault();
			console.log($(this).serializeObject());
			data = $(this).serializeObject();
			data.latitude = app.lat;
			data.longitude = app.long;
			app.ajax("create_shopping_list", data, (function(data){
				if(data.status == "ok"){
					$("#content").html(app.template("home_page"));
					app.user(data);
				}else{

				}
			}));
		});

		app.update();

		// Geo stuff
		app.geo();

		//Login change view
		$(document).on("click touchstart",".change_auth_state",function(e) {
			e.stopPropagation();
			e.preventDefault();
			$("#login_form, #register_form").toggleClass("hidden");
		});
		// Login form submit
		$(document).on('submit', 'form.authform', function(e) {
			e.preventDefault();
			app.ajax("user", {name: $(this).children("*[name=name]").val(), email: $(this).children("*[name=email]").val(), password: $(this).children("*[name=password]").val()}, (function(response){

				console.log(response);
				console.log(response.user);
				if(response.success && response.status == "ok" && response.user.api_token){
					localStorage.setItem("api_token", response.user.api_token);
					if(response.user.last_heartbeat == '0000-00-00 00:00:00'){
						$("#content").html(app.template("welcome_page", true));
					}else{
						$("#content").html(app.template("home_page"));
					}
					app.user(response.user);
				}else{
					app.error(response.msg);
				}
			}));
		});

		// For the main 3 areas
		$(document).on("click touchstart",".navigation_item[data-pagelink][data-pagelink!='']",function() {
			 // remove back button
			$(".navigation_item[data-pagelink][data-pagelink!='']").removeClass("active");
			$(this).addClass("active");
			$("#back_btn").hide();
			$("#content").html(app.template($(this).attr("data-pagelink")));

		});
		// For the Back btn
		$("#back_btn").hide();
		$(document).on("click touchstart","#back_btn",function() {
			// append back button
			$("#back_btn").hide();
			// follow link
			$("#content").html(app.template($(".navigation_item.active[data-pagelink][data-pagelink!='']").attr("data-pagelink")));
		});
		// For the rest
		$(document).on("click touchstart","*[data-templatelink][data-templatelink!='']",function() {
			// append back button
			$("#back_btn").show();
			// follow link
			$("#content").html(app.template($(this).attr("data-templatelink"), $(this).attr("data-templatefullpage")));
		});

	},
	update: function(){
		if(localStorage.getItem("api_token") != null){
			console.log("request data from api_token");
			app.ajax("user", {}, function(response){
				console.log(response);
				if(response.success && response.status == "ok" && response.user.api_token){
					console.log("Auto Login");
					localStorage.setItem("api_token", response.user.api_token);
					app.user(response.user);
					$("#content").html(app.template("home_page"));
				}else{
					$("#content").html(app.template("auth", true));
				}
			});
		}else{
			$("#content").html(app.template("auth", true));
		}
	},
	user: function(data){
		if(data){
			if(data.image){
				$("*[data-refresh='avatar']").attr("src", data.image.src).attr("alt", data.image.name);
			}
			if(data.first_name && data.last_name){
				$("*[data-refresh='username_first']").html(data.first_name);
				$("*[data-refresh='username_last']").html(data.last_name);
			}
			if(data.description){
				$("*[data-refresh='userdescription']").html(data.description);
			}
		}
		app.ajax("product_overview", {}, (function(data){
			localStorage.setItem("products", JSON.stringify(data.products));
			console.log(data);
		}));
		app.ajax("shopping_list_overview", {}, (function(data){
			list = data.list;
			console.log(list);
			if(list != null && list.length > 0){
				$(document).on('click', '.list', function(){
					app.ajax("shopping_list", {id : $(this).attr("data-elemid")}, (function(data){
						console.log(data);
					}));
				});
				$.each(list, function( index, value ) {
					console.log(value);
					$(".currentlists").append(app.templatelist.list(value));
				});
			}else{
				//alert("no lists created yet");
			}
		}));

	},
	template: function(name, fullscreen = false){

		console.log("Building template for '" + name + "'");
		if(fullscreen != "keep"){
			if(fullscreen){
				$("#app").addClass("hiddenHeading");
			}else{
				$("#app").removeClass("hiddenHeading");
			}
		}

		html = $("#templates *[data-template='" + name + "']").wrap('<p/>').parent().html();
		$("#templates *[data-template='" + name + "']").unwrap('<p/>');
		return html;
	},
	templatelist: {
		list : function(value){
			return '<div class="list" data-elemid="' + value.id + '">'
					+ '<div class="list_first_row">' + value.title + '</div>'
					+ '<div class="list_last_row">' + value.duedate + ' <span class="list_distance">' + app.distancetoString(value.lat, value.long, app.lat,app.long) + '</span></div>'
				+ '</div>';
		},
		match: function(value){
			return '<div id="match" data-template="match">'
					+ '<div id="user_info">'
						+ '<div id="user_general">'
							+ '<img src="" id="match_avatar" data-refresh="avatar"/>'
							+ '<span id="match_name" data-refresh="name"></span>'
						+ '</div>'
						+ '<div id="user_description">'
							+ '<p>I love broccoli pizza!</p>'
						+ '</div>'
					+ '</div>'
				+ '</div>';
		},
		autocomplete_item: function(value){
			return '<div class="item_ac_card">' +
									'<div class="item_ac_card_head">' + value.product_name + '</div>' +
									'<span>meistens werden ' + value.standard_quantity + ' ' + ((value.quantity_name != null) ? value.quantity_name : '')  + ' gekauft</span>' +
						 '</div>';
		}
	},
	error: function(msg, duration = 1000){
		console.error(msg);
		$("#error_msg").html(msg);
		$("#error").show(0).delay(5000).fadeOut(1);
	},
	ajax: function(service, data, response){
		if(navigator.onLine){
			cache = JSON.parse(localStorage.getItem(service));
			console.log(cache);
			console.log(Date.now());
			if(cache && cache.received + (60000 * 60 * 24) > Date.now()){ // cache lasts a day
				response(cache);
			}else{
				response({success: false, msg: "Connection to the internet needed, but not possible"});
			}
		}else{
			switch(service){
				case "user":
					url = app.BASE_URL + "/user.php";
					type = 'POST';
					break;
				case "shopping_list_overview":
					url = app.BASE_URL + "/list.php";
					type = 'GET';
					break;
				case "create_shopping_list":
					url = app.BASE_URL + "/create_list.php";
					type = 'POST';
					break;
				case "shopping_list":
					url = app.BASE_URL + "/list/" + data.id;
					type = 'GET';
					break;
				case "product_overview":
					url = app.BASE_URL + "/products.php";
					type = 'GET';
				default:
					// ERROR CLASS
			}
			//needs to be there on every call
			data.api_token = localStorage.getItem("api_token");

			$.ajaxSetup({
				beforeSend: function(xhr) {
			        xhr.withCredentials = true;
			        xhr.setRequestHeader('Accept', 'application/json');
			    }
			});
			console.log("Sending data");
			$.ajax({
				url: url,
				data: data,
				type: type,
				dataType: "jsonp",
				error: function(data) {
								response({success: false, msg: "Sorry, something went wrong. Seems like there is an http error somewhere."});
				},
				success: function(data, textStatus, jqXHR) {
					//data = data.responseText;
					console.log(data);
					data.received = Date.now();
					data.success = true;

					response(data);
					if(data.status == "ok"){
						localStorage.setItem(service, JSON.stringify(data));
					}else if(data.status == "error"){
						app.error(data.msg);
					}
				}
			});
		}

		//app.update();
	},
	geo: function(){
		if (navigator.geolocation) {
			(function rungeo() {
			    navigator.geolocation.getCurrentPosition(updatePosition);

			    setTimeout(rungeo, 900000);
			})();
	    } else {
	    	// ERROR CLASS
	    }

	    function updatePosition(positon){
	    	app.lat = positon.coords.latitude;
	    	app.long = positon.coords.longitude;
	    }
	},
	distancetoString: function(lat1, lon1, lat2, lon2) {
		var p = 0.017453292519943295;    // Math.PI / 180
		var c = Math.cos;
		var a = 0.5 - c((lat2 - lat1) * p)/2 +
			c(lat1 * p) * c(lat2 * p) *
			(1 - c((lon2 - lon1) * p))/2;
		var d = 12742 * Math.asin(Math.sqrt(a));
		if(d < 1){
			return "very close";
		}
		if(d < 10){
			return "nearby";
		}
		return "far, far away...";
	}

};


//HELPER

// for current timestamp
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

// For serializing Objects
$.fn.serializeObject = function()
{
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};
