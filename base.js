$(document).ready(function () {
    var window_width = $(window).width();
    var window_height = $(window).height();
    $("#left").css("width", window_width/2);
    $(".right").css("width", window_width/2-50);
    $("#example").css("width",window_width/2);
    $('img#example').selectAreas({
    	minSize: [10, 10],
//    	onChanged: debugQtyAreas,
    	areas: [
    	  {
    	  	x: 40,
    	  	y: 40,
    	  	width: 10,
    	  	height: 10,
    	  }
    	]
    });
    $("#zoomIn").click(function(){ 
        $("#example").animate({'zoom': 2.5}, 400);
        $("img#example").css("width", window_width/2);
    });
    $("#zoomOut").click(function(){ 
        $("#example").animate({'zoom': 1.0}, 400);
        $("img#example").css("width", window_width/2);
    });
});
(function() {
  var $section = $('#left');
  var $panzoom = $section.find('.image-decorator').panzoom();
  $panzoom.parent().on('mousewheel.focal', function( e ) {
    e.preventDefault();
    var delta = e.delta || e.originalEvent.wheelDelta;
    var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
    $panzoom.panzoom('zoom', zoomOut, {
      increment: 0.1,
      focal: e
    });
  });
})();

