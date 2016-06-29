$(document).ready(function () {
    var window_width = $(window).width();
    var window_height = $(window).height();

    $("#left").css("width", window_width/2);
    $(".right").css("width", window_width/2-50);
    $("#example").css("width",window_width/2-50);
    $("#zoomIn").click(function(){ 
        $("#example").animate({'zoom': 2.5}, 400);
        $("img#example").css("width", window_width/2);
    });
    $("#zoomOut").click(function(){ 
        $("#example").animate({'zoom': 1.0}, 400);
        $("img#example").css("width", window_width/2);
    });
    $(document.body).on("click",".output_display", function(){
        var row_id =  $(this).attr("id");
        var box_id = row_id.substring(3,row_id.length);
        $(".select-areas-background-area").css("border-color","black");
        $("#" + box_id).css("border", "1px solid red");
        $(".output_display").css("background-color","transparent");
        $("#"+row_id).css("background-color","red");
    });
});


