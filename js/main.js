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
		//Should get moved
		$(document).on("click touchstart", "#logout", function(){
			localStorage.removeItem("api_token");
			localStorage.removeItem("user");
			location.reload();
		});

		$(document).on('unblur keyup', '.item > *', function(e){
			//should create a new one if everything is full
			target = $(this);
			console.log("Background check");
			everything_full = true;
			$("#itemholder").children(".item").each(function(){
				console.log($(this).children(".nlname_input").val());
				console.log($(this).children(".nlquantity_input").val());
				if($(this).children(".nlname_input").val() == "" || $(this).children(".nlquantity_input").val() == ""){
					everything_full = false;
				}
			});
			console.log(everything_full);
			if(everything_full){
				$("#itemholder").append(app.template("list_item"));
			}
			target.focus();
		});
		//submit
		$(document).on('submit', "#new_list_form", function(e){
			e.preventDefault();
			console.log($(this).serializeObject());
			data = $(this).serializeObject();
			app.ajax("create_shopping_list", data, (function(data){
				if(data.success){
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
			alert("sending data");
			app.ajax("user", {name: $(this).children("*[name=name]").val(), email: $(this).children("*[name=email]").val(), password: $(this).children("*[name=password]").val()}, (function(response){
				alert("received data");
				user = response.user;
				console.log(response);
				console.log(user);
				
				alert(user.api_token);
				alert(user.name);
				if(user.api_token){
					localStorage.setItem("api_token", user.api_token);
					$("#content").html(app.template("home_page"));
					app.user(user);
				}else{
					alert(response.msg);
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
			//check vor fullscreen
			fullscreen = $(this).attr("data-fullscreen") ? $(this).attr("data-fullscreen") : false;
			console.log(fullscreen);
			// append back button
			$("#back_btn").show();
			// follow link
			$("#content").html(app.template($(this).attr("data-templatelink"), fullscreen));
		});

	},
	update: function(){
		$("*[data-refresh='bgimg']").css('background-image', 'url(http://192.168.1.8/LetzBuyServer/images/background/1.jpg)');
		
		
		if(localStorage.getItem("api_token") != null){
			console.log("request data from api_token");
			app.ajax("user", {api_token: localStorage.getItem("api_token")}, function(response){
				console.log(response);
				if(response.user.api_token){
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
		console.log("update user");
		console.log(data);
		if(data){
			if(data.image){
				console.log("refreshed user avatar: " + data.image.src);
				$("*[data-refresh='avatar']").attr("src", data.image.src);
			}
			if(data.first_name && data.last_name){
				$("*[data-refresh='username']").html(data.first_name + " " + data.last_name);
				$("*[data-refresh='username_first']").html(data.first_name);
				$("*[data-refresh='username_last']").html(data.last_name);
			}
		}
		app.ajax("shopping_list_overview", {}, (function(data){
			console.log(data);
			if(data.length > 0){
				$(document).on('click', '.list', function(){
					app.ajax("shopping_list", {id : $(this).attr("data-elemid")}, (function(data){
						console.log(data);
					}));
				});
				$.each(data, function( index, value ) {
					console.log(value);
					$(".currentlists").append(app.templatelist.list(value));
				});
			}else{
				alert("no lists created yet");
			}
		}));
		
	},
	template: function(name, fullscreen = false){

		console.log("Building template for '" + name + "' ");
		if(fullscreen){
			$("#app").addClass("hiddenHeading");
			console.log("FULLSCREEN");
		}else{
			$("#app").removeClass("hiddenHeading");
			console.log("NO FULLSCREEN");
		}

		html = $("*[data-template='" + name + "']").wrap('<p/>').parent().html();
		$("*[data-template='" + name + "']").unwrap('<p/>');
				
		return html;
	},
	templatelist: {
		list : function(value){
			return '<div class="list" data-elemid="' + value.id + '">'
					+ '<div class="list_first_row">' + value.title + '</div>'
					+ '<div class="list_last_row">' + value.due_date + ' <span class="list_distance">' + app.distancetoString(value.latitude, value.longitude, app.lat,app.long) + '</span></div>'
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
		}
	},
	ajax: function(service, data, response){
		// CHECK FOR CONNECTION HERE #TODO
		if(!navigator.onLine){
			cache = JSON.parse(localStorage.getItem(service));
			if(cache && cache.received + 1000 > Date.now()){
				response(cache);
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
					url = app.BASE_URL + "/list";
					type = 'POST';
					break;
				case "shopping_list":
					url = app.BASE_URL + "/list/" + data.id;
					type = 'GET';
					break;
				default:
					// ERROR CLASS
			}
			//needs to be there on every call
			data.api_token = localStorage.getItem("api_token");
			//needed for all list features
			data.latitude = app.lat;
			data.longitude = app.long;

			$.ajaxSetup({
				dataType: 'json', 
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
				error: function(data) {
		            if( data.status === 422 ) {
			            //process validation errors here.
			            var errors = data.responseJSON; 

			            console.log(errors);
		            } else {

		            }
					response(data);
				},
				success: function(data, textStatus, jqXHR) {
					console.log(data);
					data.received = Date.now();

					response(data);
					localStorage.setItem(service, JSON.stringify(data));
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

// for lat-long distances
