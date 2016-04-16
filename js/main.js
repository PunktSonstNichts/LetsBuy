var app = {
	BASE_URL: "127.0.0.1", //Because I will always love you
	init: function(){
		// Check for Login

		$(document).on("click","*[data-templatelink][data-templatelink!='']",function() {

			$("*[data-templatelink][data-templatelink!='']").removeClass("active");
			$(this).addClass("active");
			$("#content").html(app.template($(this).attr("data-templatelink")));

		});
	}, 
	template: function(name){
		return $("*[data-template='" + name + "']").html();
	},
	ajax: function(service, data){
		// CHECK FOR CONNECTION HERE #TODO

		switch(service){
			case "user":
				url = app.BASE_URL + "user.php";
				break;
			case "shopping_list":
				url = app.BASE_URL + "user.php";
				break;
			default:
				// ERROR CLASS
		}
		$.ajax({
			url: 'http://api.joind.in/v2.1/talks/10889',
			data: {
				format: 'json'
			},
			error: function() {
				// ERROR CLASS
			},
			dataType: 'jsonp',
			success: function(data) {
				// PARSE DATA AND THEN RETURN
			},
			type: 'GET'
		});
	}

};