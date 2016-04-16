var app = {
	BASE_URL: "http://139.59.164.70", //Because I will always love you
	lat: 0.0,
	long: 0.0,
	init: function(){
		// starting site
		// $("#content").html(app.template("home_page"));
		$("#content").html(app.template("login"));
		// Geo stuff
		app.geo();
		// Check for Login
		app.ajax("user", {auth: "PunktSonstNichts", password: "12345"});

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
	template: function(name){
		switch(name){
			case "login":
			case "regristation":
				$("#app").addClass("hiddenHeading");
			break;
			default:
				$("#app").removeClass("hiddenHeading");
		}
		html = $("*[data-template='" + name + "']").wrap('<p/>').parent().html();
		$("*[data-template='" + name + "']").unwrap('<p/>');
		return html;
	},
	ajax: function(service, data){
		// CHECK FOR CONNECTION HERE #TODO

		switch(service){
			case "user":
				url = app.BASE_URL + "/user";
				type = 'POST';
				break;
			case "shopping_list":
				url = app.BASE_URL + "user.php";
				type = 'POST';
				break;
			default:
				// ERROR CLASS
		}
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
	            if( data.status === 422 ) {
		            //process validation errors here.
		            var errors = data.responseJSON; 

		            console.log(errors);
	            } else {

	            }
			},
			success: function(data) {
				// PARSE DATA AND THEN RETURN
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