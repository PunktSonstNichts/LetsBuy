var app = {
	BASE_URL: "http://139.59.164.70", //Because I will always love you
	lat: 0.0,
	long: 0.0,
	init: function(){
		// starting site
		// stuff not worth creating a node for

		// fill new shoppinglist form
		$("#itemholder").append(app.template("list_item"));

		// Geo stuff
		app.geo();

		//Login change view
		$(document).on("click touchstart",".change_auth_state",function(e) {
			e.stopPropagation();
			e.preventDefault();
			$("#login_form, #register_form").toggleClass("hidden");
		});
		// Login form submit
		$(".authform").submit(function(e){
			e.preventDefault();
			app.ajax("user", {name: $(this).children("*[name=name]").val(), email: $(this).children("*[name=email]").val(), password: $(this).children("*[name=password]").val()}, (function(data){

				console.log(data);
				if(data.api_token){
					localStorage.setItem("api_token", data.api_token);
					$("#content").html(app.template("home_page"));
					app.user();
				}else{
					alert("append error WIP");
				}
			}));
		});

		if(localStorage.getItem("api_token") != null){
			$("#content").html(app.template("home_page"));
		}else{
			$("#content").html(app.template("auth"));
		}

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
			$("#content").html(app.template($(this).attr("data-templatelink")));
		});
	},
	user: function(){
			app.ajax("shopping_list_overview", {}, (function(data){

				console.log(data);
				if(data.length != 0){
					
				}else{
					alert("append error WIP");
				}
			}));
		
	},
	template: function(name){
		console.log(name);
		if(name == "auth"){
			$("#app").addClass("hiddenHeading");
		}else{
			$("#app").removeClass("hiddenHeading");
		}
		html = $("*[data-template='" + name + "']").wrap('<p/>').parent().html();
		$("*[data-template='" + name + "']").unwrap('<p/>');
		return html;
	},
	ajax: function(service, data, response){
		// CHECK FOR CONNECTION HERE #TODO

		switch(service){
			case "user":
				url = app.BASE_URL + "/user";
				type = 'POST';
				break;
			case "shopping_list_overview":
				url = app.BASE_URL + "/list";
				type = 'GET';
				break;
			case "create_shopping_list":
				url = app.BASE_URL + "/list";
				type = 'POST';
				break;
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
		$.ajax({
			url: url,
			data: data,
			type: type,
			error: function(data) {
				response(data);
	            if( data.status === 422 ) {
		            //process validation errors here.
		            var errors = data.responseJSON; 

		            console.log(errors);
	            } else {

	            }
			},
			success: function(data) {
				response(data);
			}
		});
	},
	geo: function(){
		if (navigator.geolocation) {
			(function rungeo() {
			    navigator.geolocation.getCurrentPosition(updatePosition);

			    setTimeout(rungeo, 9000);
			})();
	    } else {
	    	// ERROR CLASS
	    }

	    function updatePosition(positon){
	    	app.lat = positon.coords.latitude;
	    	app.long = positon.coords.longitude;
	    }
	}

};