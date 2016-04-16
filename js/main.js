var app = {
	BASE_URL: "127.0.0.1", //Because I will always love you
	init: function(){
		// starting site
		$("#content").html(app.template("home_page"));

		// Check for Login

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
		html = $("*[data-template='" + name + "']").wrap('<p/>').parent().html();
		$("*[data-template='" + name + "']").unwrap('<p/>');
		return html;
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