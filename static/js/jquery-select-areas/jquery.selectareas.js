/* global window, Image, jQuery */
/**
 * @author 360Learning
 * @author Catalin Dogaru (https://github.com/cdog - http://code.tutsplus.com/tutorials/how-to-create-a-jquery-image-cropping-plugin-from-scratch-part-i--net-20994)
 * @author Adrien David-Sivelle (https://github.com/AdrienDS - Refactoring, Multiselections & Mobile compatibility)
 */

//Use the following function to get the keys of object from their values. 
/*Object.prototype.getKeyFromValue = function( value ) {
    for( var prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
             if( this[ prop ] === value )
                 return prop;
        }
    }
}
*/
function output_coordinates(action){
  $('.panzoom').animate({
    transform: 'scale(1) rotate(0deg)'
  });
  var elements_used = JSON.parse(localStorage.getItem("elements_used"));
  var elements_available = JSON.parse(localStorage.getItem("elements_available"));
  var element_rectangle = JSON.parse(localStorage.getItem("element_rectangle"));
  
  var all_outlines = $(".select-areas-outline");
  var image_width = $("#example").width();
  var image_height = $("#example").height();
  var rectangles =  [];

  $("#output").html("");
  $("#output").append("<tr><th>Object</th><th>A</th><th>Width</th><th>Height</th></tr>");
  
  //get resolution of image
  var image = $("img#example")[0];
  var image_resolution_x = image.naturalWidth;
  var image_resolution_y = image.naturalHeight;            
  
  for(i =0;i<all_outlines.length;i++)
  {
      var box_id = all_outlines[i].id;
      rectangles.push(box_id);

      var width  = $("#" + box_id).width();
      var height = $("#"+box_id).height();

      var a_x = Math.round($("#"+box_id).position().left*image_resolution_x / image_width);
      var a_y = Math.round($("#"+box_id).position().top*image_resolution_y / image_height);        
      //var c_x = ($("#"+box_id).position().left + width) / image_width;
      //var c_y = ($("#"+box_id).position().top + height) / image_height;        

      var height_ratio = height/image_height;
      var width_ratio = width/image_width;
      var width  = Math.round(width_ratio * image_resolution_x);
      var height = Math.round(height_ratio * image_resolution_y );
      console.log("rec = ", element_rectangle);

      var key_name = Object.keys(element_rectangle).filter(function(key) {
        return element_rectangle[key] === box_id + "_entry";
      })[0];

      if (key_name == null)
      {
          $("#output").append("<tr id = 'id_" + box_id+ "_ent'><td class = 'rectangle_entry' id = '"+ box_id + "_entry'>" + box_id+ "</td><td>" + a_x + "," + a_y + "</td><td>"  + width  + "</td><td>" +  height + "</td></tr>");
      }
      else{
          $("#output").append("<tr id = 'id_" + box_id+ "_ent'><td class = 'rectangle_entry' id = '"+ box_id + "_entry'>" + key_name+ "</td><td>" + a_x + "," + a_y + "</td><td>"  + width  + "</td><td>" +  height + "</td></tr>");

      }
      console.log("key name = ", key_name);
  
  }

  function update_elements_tables(array_name, id){
    var all_options = "<option value='----'>-----</option> ";
    $.each(array_name, function(key, value){
        var option_string = "<option value='" + value  + "'>" + value + "</option> " ;
        all_options += option_string ;
        $("#"+ id).html(all_options);
    });
  }  

  if (action == "delete")
  {     
        /*
            for every ( key, value ) in rectangle_binding, 
            if the key is not in rectangles array, get element name for the key 
            pop the element_name from elements_used and add element_name in elements_available
        */
        $.each(element_rectangle, function(key, value){
            //element_rectangle = {"element_name" : "rectangle_box"}
            //rectangles = ["rectangle_box1", "rectangle_box2" ]
            if ($.inArray(value, rectangles) == -1){
                var element_name  = Object.keys(element_rectangle).filter(function(key) {return element_rectangle[key] === value})[0]
                //var element_name = element_rectangle.getKeyFromValue(value);                
                var index = elements_used.indexOf(element_name);
                elements_used.splice(index, 1);
                elements_available.push( element_name ) ;
            }
        });

        update_elements_tables(elements_available, "elements_available");
        update_elements_tables(elements_used, "elements_used");
      
        localStorage.setItem("elements_available", JSON.stringify(elements_available));
        localStorage.setItem("elements_used", JSON.stringify(elements_used));
        localStorage.setItem("element_rectangle", JSON.stringify(element_rectangle));         
  }
  else{        
        update_elements_tables(elements_used, "elements_used");
        update_elements_tables(elements_available, "elements_available");
  }
}
function map_the_coordinates(real_x, real_y){
    var string = $(".panzoom").css("transform");
    if (string == "none")
    {
        //console.log("not yet zoomed");
        return [real_x, real_y]  ;
    }
    else{
        var transform_metrics = string.substring(7, string.length - 1).split(",")
        var zoom_level = Number(transform_metrics[0]);
        var x_center = Number(transform_metrics[4]);
        var y_center = Number(transform_metrics[5]);
        var image_width = $("#example").width();
        var image_height = $("#example").height();
        var original_x_center = image_width/2;
        var original_y_center = image_height/2;
        //console.log("x_center and y_center = " + x_center + ", " + y_center);
        //console.log("original_x_center and original_y_center = " + original_x_center + ", " + original_y_center);        
        var new_image_width  = zoom_level * image_width ; 
        var new_image_height = zoom_level * image_height ; 
        
        var current_x_center = original_x_center + x_center;
        var current_y_center = original_y_center + y_center;
        var left_new_image = current_x_center - (new_image_width/2);
        var top_new_image = current_y_center - (new_image_height/2);    
        var new_x = (real_x - left_new_image ) / zoom_level ;
        var new_y = (real_y - top_new_image ) / zoom_level ;        
        return [new_x, new_y];
    }
    
}
(function($) {
    //console.log("parent = ",$(this).parent());
    $.imageArea = function(parent, id) {
        var options = parent.options,
            $image = parent.$image,
            $trigger = parent.$trigger,
            $outline,
            $selection,
            $resizeHandlers = {},
            $btDelete,
            resizeHorizontally = true,
            resizeVertically = true,
            selectionOffset = [0, 0],
            selectionOrigin = [0, 0],
            area = {
                id: id,
                x: 0,
                y: 0,
                z: 0,
                height: 0,
                width: 0
            },
            focus = function () {
                //console.log("focus called");
                area.z = 100;
                refresh();
            },
            getData = function () {
                //console.log("getData called");            
                return area;
            },
            fireEvent = function (event) {
                //console.log("fireEvent called");            
                $image.trigger(event, [area.id, parent.areas()]);
            },
            cancelEvent = function (e) {
                //console.log("cancelEvent called");            
                var event = e || window.event || {};
                event.cancelBubble = true;
                event.returnValue = false;
                event.stopPropagation && event.stopPropagation(); // jshint ignore: line
                event.preventDefault && event.preventDefault(); // jshint ignore: line
            },
            off = function() {
                //console.log("off called");    
                $.each(arguments, function (key, val) {
                    on(val);
                });
            },
            on = function (type, handler) {
                //console.log("on called");            
                var browserEvent, mobileEvent;
                switch (type) {
                    case "start":
                        browserEvent = "mousedown";
                        mobileEvent = "touchstart";
                        break;
                    case "move":
                        browserEvent = "mousemove";
                        mobileEvent = "touchmove";
                        break;
                    case "stop":
                        browserEvent = "mouseup";
                        mobileEvent = "touchend";
                        break;
                    default:
                        return;
                }
                if (handler && jQuery.isFunction(handler)) {
                    $(window.document).on(browserEvent, handler).on(mobileEvent, handler);
                } else {
                    $(window.document).off(browserEvent).off(mobileEvent);
                }
            },
            updateSelection = function () {
                //console.log("updateSelection called");            
                // Update the outline layer
                $outline.css({
                    cursor: "default",
                    width: area.width,
                    height: area.height,
                    left: area.x,
                    top: area.y,
                    "z-index": area.z
                });

                // Update the selection layer
                $selection.css({
                    backgroundPosition : ( - area.x - 1) + "px " + ( - area.y - 1) + "px",
                    cursor : options.allowMove ? "move" : "default",
                    width: (area.width - 2 > 0) ? (area.width - 2) : 0,
                    height: (area.height - 2 > 0) ? (area.height - 2) : 0,
                    left : area.x + 1,
                    top : area.y + 1,
                    "z-index": area.z + 2
                });
            },
            updateResizeHandlers = function (show) {

                if (! options.allowResize) {
                    return;
                }
                if (show) {
                    $.each($resizeHandlers, function(name, $handler) {
                        var top,
                            left,
                            semiwidth = Math.round($handler.width() / 2),
                            semiheight = Math.round($handler.height() / 2),
                            vertical = name[0],
                            horizontal = name[name.length - 1];

                        if (vertical === "n") {             // ====== North* ======
                            top = - semiheight;

                        } else if (vertical === "s") {      // ====== South* ======
                            top = area.height - semiheight - 1;

                        } else {                            // === East & West ===
                            top = Math.round(area.height / 2) - semiheight - 1;
                        }

                        if (horizontal === "e") {           // ====== *East ======
                            left = area.width - semiwidth - 1;

                        } else if (horizontal === "w") {    // ====== *West ======
                            left = - semiwidth;

                        } else {                            // == North & South ==
                            left = Math.round(area.width / 2) - semiwidth - 1;
                        }

                        $handler.css({
                            display: "block",
                            left: area.x + left,
                            top: area.y + top,
                            "z-index": area.z + 1
                        });
                    });
                } else {
                    $(".select-areas-resize-handler").each(function() {
                        $(this).css({ display: "none" });
                    });
                }
            },
            updateBtDelete = function (visible) {
                if ($btDelete) {
                    $btDelete.css({
                        display: visible ? "block" : "none",
                        left: area.x + area.width + 1,
                        top: area.y - $btDelete.outerHeight() - 1,
                        "z-index": area.z + 1
                    });
                }
            },
            updateCursor = function (cursorType) {
                //console.log("updateCursor called");                
                $outline.css({
                    cursor: cursorType
                });

                $selection.css({
                    cursor: cursorType
                });
            },
            refresh = function(sender) {
                //console.log("refresh called")
                switch (sender) {
                    case "startSelection":
                        parent._refresh();
                        updateSelection();
                        updateResizeHandlers();
                        updateBtDelete(true);
                        break;

                    case "pickSelection":
                    case "pickResizeHandler":
                        updateResizeHandlers();
                        break;

                    case "resizeSelection":
                        updateSelection();
                        updateResizeHandlers();
                        updateCursor("crosshair");
                        updateBtDelete(true);
                        break;

                    case "moveSelection":
                        updateSelection();
                        updateResizeHandlers();
                        updateCursor("move");
                        updateBtDelete(true);
                        break;

                    //case "releaseSelection":
                    default:
                        updateSelection();
                        updateResizeHandlers(true);
                        updateBtDelete(true);
                }
            },
            startSelection  = function (event) {
                //console.log("startSelection called");                
                cancelEvent(event);

                // Reset the selection size
                area.width = options.minSize[0];
                area.height = options.minSize[1];
                focus();
                on("move", resizeSelection);
                on("stop", releaseSelection);

                // Get the selection origin
                selectionOrigin = getMousePosition(event);
                if (selectionOrigin[0] + area.width > $image.width()) {
                    selectionOrigin[0] = $image.width() - area.width;
                }
                if (selectionOrigin[1] + area.height > $image.height()) {
                    selectionOrigin[1] = $image.height() - area.height;
                }
                // And set its position
                area.x = selectionOrigin[0];
                area.y = selectionOrigin[1];

                refresh("startSelection");
            },
            pickSelection = function (event) {
                //console.log("pickSelection called");            
                cancelEvent(event);
                focus();
                on("move", moveSelection);
                on("stop", releaseSelection);

                var mousePosition = getMousePosition(event);

                // Get the selection offset relative to the mouse position
                selectionOffset[0] = mousePosition[0] - area.x;
                selectionOffset[1] = mousePosition[1] - area.y;

                refresh("pickSelection");
            },
            pickResizeHandler = function (event) {
                //console.log("pickResizeHandler called");
                cancelEvent(event);
                focus();

                var card = event.target.className.split(" ")[1];
                if (card[card.length - 1] === "w") {
                    selectionOrigin[0] += area.width;
                    area.x = selectionOrigin[0] - area.width;
                }
                if (card[0] === "n") {
                    selectionOrigin[1] += area.height;
                    area.y = selectionOrigin[1] - area.height;
                }
                if (card === "n" || card === "s") {
                    resizeHorizontally = false;
                } else if (card === "e" || card === "w") {
                    resizeVertically = false;
                }

                on("move", resizeSelection);
                on("stop", releaseSelection);

                refresh("pickResizeHandler");
            },
            resizeSelection = function (event) {
                //console.log("resizeSelection called");            
                cancelEvent(event);
                focus();

                var mousePosition = getMousePosition(event);

                // Get the selection size
                var height = mousePosition[1] - selectionOrigin[1],
                    width = mousePosition[0] - selectionOrigin[0];

                // If the selection size is smaller than the minimum size set it to minimum size
                if (Math.abs(width) < options.minSize[0]) {
                    width = (width >= 0) ? options.minSize[0] : - options.minSize[0];
                }
                if (Math.abs(height) < options.minSize[1]) {
                    height = (height >= 0) ? options.minSize[1] : - options.minSize[1];
                }
                // Test if the selection size exceeds the image bounds
                if (selectionOrigin[0] + width < 0 || selectionOrigin[0] + width > $image.width()) {
                    width = - width;
                }
                if (selectionOrigin[1] + height < 0 || selectionOrigin[1] + height > $image.height()) {
                    height = - height;
                }
                // Test if the selection size is bigger than the maximum size (ignored if minSize > maxSize)
                if (options.maxSize[0] > options.minSize[0] && options.maxSize[1] > options.minSize[1]) {
                    if (Math.abs(width) > options.maxSize[0]) {
                        width = (width >= 0) ? options.maxSize[0] : - options.maxSize[0];
                    }

                    if (Math.abs(height) > options.maxSize[1]) {
                        height = (height >= 0) ? options.maxSize[1] : - options.maxSize[1];
                    }
                }

                // Set the selection size
                if (resizeHorizontally) {
                    area.width = width;
                }
                if (resizeVertically) {
                    area.height = height;
                }
                // If any aspect ratio is specified
                if (options.aspectRatio) {
                    // Calculate the new width and height
                    if ((width > 0 && height > 0) || (width < 0 && height < 0)) {
                        if (resizeHorizontally) {
                            height = Math.round(width / options.aspectRatio);
                        } else {
                            width = Math.round(height * options.aspectRatio);
                        }
                    } else {
                        if (resizeHorizontally) {
                            height = - Math.round(width / options.aspectRatio);
                        } else {
                            width = - Math.round(height * options.aspectRatio);
                        }
                    }
                    // Test if the new size exceeds the image bounds
                    if (selectionOrigin[0] + width > $image.width()) {
                        width = $image.width() - selectionOrigin[0];
                        height = (height > 0) ? Math.round(width / options.aspectRatio) : - Math.round(width / options.aspectRatio);
                    }

                    if (selectionOrigin[1] + height < 0) {
                        height = - selectionOrigin[1];
                        width = (width > 0) ? - Math.round(height * options.aspectRatio) : Math.round(height * options.aspectRatio);
                    }

                    if (selectionOrigin[1] + height > $image.height()) {
                        height = $image.height() - selectionOrigin[1];
                        width = (width > 0) ? Math.round(height * options.aspectRatio) : - Math.round(height * options.aspectRatio);
                    }

                    // Set the selection size
                    area.width = width;
                    area.height = height;
                }

                if (area.width < 0) {
                    area.width = Math.abs(area.width);
                    area.x = selectionOrigin[0] - area.width;
                } else {
                    area.x = selectionOrigin[0];
                }
                if (area.height < 0) {
                    area.height = Math.abs(area.height);
                    area.y = selectionOrigin[1] - area.height;
                } else {
                    area.y = selectionOrigin[1];
                }

                fireEvent("changing");
                refresh("resizeSelection");
            },
            moveSelection = function (event) {
                //console.log("moveSelection called");            
                cancelEvent(event);
                if (! options.allowMove) {
                    return;
                }
                focus();

                var mousePosition = getMousePosition(event);
                moveTo({
                    x: mousePosition[0] - selectionOffset[0],
                    y: mousePosition[1] - selectionOffset[1]
                });

                fireEvent("changing");

            },
            moveTo = function (point) {
                //console.log("moveTo called");            
                // Set the selection position on the x-axis relative to the bounds
                // of the image
                if (point.x > 0) {
                    if (point.x + area.width < $image.width()) {
                        area.x = point.x;
                    } else {
                        area.x = $image.width() - area.width;
                    }
                } else {
                    area.x = 0;
                }
                // Set the selection position on the y-axis relative to the bounds
                // of the image
                if (point.y > 0) {
                    if (point.y + area.height < $image.height()) {
                        area.y = point.y;
                    } else {
                        area.y = $image.height() - area.height;
                    }
                } else {
                    area.y = 0;
                }
                refresh("moveSelection");
            },
            releaseSelection = function (event) {
                //console.log("releaseSelection called");            
                cancelEvent(event);
                off("move", "stop");

                // Update the selection origin
                selectionOrigin[0] = area.x;
                selectionOrigin[1] = area.y;

                // Reset the resize constraints
                resizeHorizontally = true;
                resizeVertically = true;

                fireEvent("changed");

                refresh("releaseSelection");
            output_coordinates("");
                    
            },
            deleteSelection = function (event) {
                cancelEvent(event);
                $selection.remove();
                $outline.remove();
                $.each($resizeHandlers, function(card, $handler) {
                    $handler.remove();
                });
                $btDelete.remove();
                parent._remove(id);
                output_coordinates("delete");
                //console.log(area);
                //$("#output").append("<tr><td>" + area.x + "</td><td> " + area.y  + "</td></tr>");
                //$(".right").append("<br>x = " + area.x + "<br>y = " + area.y );
                fireEvent("changed");
            },
            getElementOffset = function (object) {
                //console.log("getElementOffset called");            
                var offset = $(object).offset();

                return [offset.left, offset.top];
            },
            getMousePosition = function (event) {
                var imageOffset = getElementOffset($image);

                if (! event.pageX) {
                    if (event.originalEvent) {
                        event = event.originalEvent;
                    }

                    if(event.changedTouches) {
                        event = event.changedTouches[0];
                    }

                    if(event.touches) {
                        event = event.touches[0];
                    }
                }
                
                var x = event.pageX,
                    y = event.pageY;
                    
                return map_the_coordinates(x,y);
                y =  y;
            };


        // Initialize an outline layer and place it above the trigger layer
        console.log("storage = ", localStorage.getItem("boxes_count"));
        var count_selected_areas = parseInt(localStorage.getItem("boxes_count"));
        console.log("boxes count = ", boxes_count);
        if(count_selected_areas == 0 && $(".select-areas-outline").length == 1)
        {
            count_selected_areas += 1;
        }

        //var count_selected_areas = parseInt(boxes_count) + 1;

        //console.log("count " , count_selected_areas);
        localStorage.setItem("boxes_count", count_selected_areas +1); 
        //console.log("storage = ", localStorage.getItem("boxes_count"));
        count_selected_areas += 1;
        element_rectangle["rectangle_box"+count_selected_areas ] = "rectangle_box"+count_selected_areas ;
        $outline = $("<div class=\"select-areas-outline\" id ='rectangle_box" + count_selected_areas + 
         "'  />").css({
                opacity : options.outlineOpacity,
                position : "absolute"
            })
            .insertAfter($trigger);

        // Initialize a selection layer and place it above the outline layer
        var selection_id = "rectangle_box" + count_selected_areas.toString() +  "_ent"
        $selection = $("<div />")
            .attr("id", "rectangle_box" + count_selected_areas  + "_ent")
            .addClass("select-areas-background-area")
            .css({
                background : "#fff url(" + $image.attr("src") + ") no-repeat",
                backgroundSize : $image.width() + "px",
                position : "absolute"
            })
            .insertAfter($outline);

        // Initialize all handlers
        if (options.allowResize) {
            $.each(["nw", "n", "ne", "e", "se", "s", "sw", "w"], function (key, card) {
                $resizeHandlers[card] =  $("<div class=\"select-areas-resize-handler " + card + "\"/>")
                    .css({
                        opacity : 0.5,
                        position : "absolute",
                        cursor : card + "-resize"
                    })
                    .insertAfter($selection)
                    .mousedown(pickResizeHandler)
                    .bind("touchstart", pickResizeHandler);
            });
        }
        // initialize delete button
        if (options.allowDelete) {
            var bindToDelete = function ($obj) {
                $obj.click(deleteSelection)
                    .bind("touchstart", deleteSelection)
                    .bind("tap", deleteSelection);
                return $obj;
            };
            $btDelete = bindToDelete($("<div class=\"delete-area\" id = 'delete_button" + count_selected_areas+ "'/>"))
                .append(bindToDelete($("<div class=\"select-areas-delete-area\" />")))
                .insertAfter($selection);
        }

        if (options.allowMove) {
            $selection.mousedown(pickSelection).bind("touchstart", pickSelection);
        }

        focus();

        return {
            getData: getData,
            startSelection: startSelection,
            deleteSelection: deleteSelection,
            options: options,
            focus: focus,
            nudge: function (point) {
                point.x = area.x;
                point.y = area.y;
                if (point.d) {
                    point.y = area.y + point.d;
                }
                if (point.u) {
                    point.y = area.y - point.u;
                }
                if (point.l) {
                    point.x = area.x - point.l;
                }
                if (point.r) {
                    point.x = area.x + point.r;
                }
                moveTo(point);
                fireEvent("changed");
            },
            set: function (dimensions, silent) {
                area = $.extend(area, dimensions);
                selectionOrigin[0] = area.x;
                selectionOrigin[1] = area.y;
                if (! silent) {
                    fireEvent("changed");
                }
            },
            contains: function (point) {
                return (point.x >= area.x) && (point.x <= area.x + area.width) &&
                       (point.y >= area.y) && (point.y <= area.y + area.height);
            }
        };
    };

    $.imageSelectAreas = function() { };

    $.imageSelectAreas.prototype.init = function (object, customOptions) {
        //console.log("Line 572, imageSelectAreas");
        var that = this,
            defaultOptions = {
                allowEdit: true,
                allowMove: true,
                allowResize: true,
                allowSelect: true,
                allowDelete: true,
                allowNudge: true,
                aspectRatio: 0,
                minSize: [10, 10],
                maxSize: [0, 0],
                width: 0,
                maxAreas: 0,
                outlineOpacity: 0.5,
                overlayOpacity: 0.5,
                areas: [],
                onChanging: null,
                onChanged: null
            };

        this.options = $.extend(defaultOptions, customOptions);

        if (! this.options.allowEdit) {
            this.options.allowSelect = this.options.allowMove = this.options.allowResize = this.options.allowDelete = false;
        }

        this._areas = {};

        // Initialize the image layer
        this.$image = $(object);

        this.ratio = 1;
        if (this.options.width && this.$image.width() && this.options.width !== this.$image.width()) {
            this.ratio = this.options.width / this.$image.width();
            this.$image.width(this.options.width);
        }

        if (this.options.onChanging) {
            this.$image.on("changing", this.options.onChanging);
        }
        if (this.options.onChanged) {
            this.$image.on("changed", this.options.onChanged);
        }
        if (this.options.onLoaded) {
            this.$image.on("loaded", this.options.onLoaded);
        }

        // Initialize an image holder
        this.$holder = $("<div />")
            .css({
                position : "relative",
                width: this.$image.width(),
                height: this.$image.height()
            });

        // Wrap the holder around the image
        this.$image.wrap(this.$holder)
            .css({
                position : "absolute"
            });

        // Initialize an overlay layer and place it above the image
        this.$overlay = $("<div class=\"select-areas-overlay\" />")
            .css({
                opacity : this.options.overlayOpacity,
                position : "absolute",
                width: this.$image.width(),
                height: this.$image.height()
            })
            .insertAfter(this.$image);

        // Initialize a trigger layer and place it above the overlay layer
        this.$trigger = $("<div />")
            .css({
                backgroundColor : "#000000",
                opacity : 0,
                position : "absolute",
                width: this.$image.width(),
                height: this.$image.height()
            })
            .insertAfter(this.$overlay);

        $.each(this.options.areas, function (key, area) {
            that._add(area, true);
        });


        this._refresh();

        if (this.options.allowSelect) {
            // Bind an event handler to the "mousedown" event of the trigger layer
            this.$trigger.mousedown($.proxy(this.newArea, this)).on("touchstart", $.proxy(this.newArea, this));
        }
        if (this.options.allowNudge) {
            $('html').keydown(function (e) { // move selection with arrow keys
                var codes = {
                        37: "l",
                        38: "u",
                        39: "r",
                        40: "d"
                    },
                    direction = codes[e.which],
                    selectedArea;

                if (direction) {
                    that._eachArea(function (area) {
                        if (area.getData().z === 100) {
                            selectedArea = area;
                            return false;
                        }
                    });
                    if (selectedArea) {
                        var move = {};
                        move[direction] = 1;
                        selectedArea.nudge(move);
                    }
                }
            });
        }
    };

    $.imageSelectAreas.prototype._refresh = function () {
        var nbAreas = this.areas().length;
        this.$overlay.css({
            display : nbAreas? "block" : "none"
        });
        this.$trigger.css({
            cursor : this.options.allowSelect ? "crosshair" : "default"
        });
    };

    $.imageSelectAreas.prototype._eachArea = function (cb) {
        $.each(this._areas, function (id, area) {
            if (area) {
                return cb(area, id);
            }
        });
    };

    $.imageSelectAreas.prototype._remove = function (id) {
        delete this._areas[id];
        this._refresh();
    };

    $.imageSelectAreas.prototype.remove = function (id) {
        if (this._areas[id]) {
            this._areas[id].deleteSelection();
        }
    };

    $.imageSelectAreas.prototype.newArea = function (event) {
        var id = -1;
        if (this.options.maxAreas && this.options.maxAreas <=  this.areas().length) {
            return id;
        }
        this._eachArea(function (area, index) {
            id = Math.max(id, parseInt(index, 10));
        });
        id += 1;

        this._areas[id] = $.imageArea(this, id);
        if (event) {
            this._areas[id].startSelection(event);
        }
        return id;
    };

    $.imageSelectAreas.prototype.set = function (id, options, silent) {
        if (this._areas[id]) {
            options.id = id;
            this._areas[id].set(options, silent);
            this._areas[id].focus();
        }
    };

    $.imageSelectAreas.prototype._add = function (options, silent) {
        var id = this.newArea();
        this.set(id, options, silent);
    };

    $.imageSelectAreas.prototype.add = function (options) {
        var that = this;
        if ($.isArray(options)) {
            $.each(options, function (key, val) {
                that._add(val);
            });
        } else {
            this._add(options);
        }
        this._refresh();
    };

    $.imageSelectAreas.prototype.reset = function () {
        var that = this;
        this._eachArea(function (area, id) {
            that.remove(id);
        });
        this._refresh();
    };

    $.imageSelectAreas.prototype.destroy = function () {
        this.reset();
        this.$holder.remove();
        this.$overlay.remove();
        this.$trigger.remove();
        this.$image.css("width", "").css("position", "").unwrap();
        this.$image.removeData("mainImageSelectAreas");
    };

    $.imageSelectAreas.prototype.areas = function () {
        var ret = [];
        this._eachArea(function (area) {
            ret.push(area.getData());
        });
        return ret;
    };

    $.imageSelectAreas.prototype.relativeAreas = function () {
        var areas = this.areas(),
            ret = [],
            ratio = this.ratio,
            scale = function (val) {
                return Math.floor(val / ratio);
            };

        for (var i = 0; i < areas.length; i++) {
            ret[i] = $.extend({}, areas[i]);
            ret[i].x = scale(ret[i].x);
            ret[i].y = scale(ret[i].y);
            ret[i].width = scale(ret[i].width);
            ret[i].height = scale(ret[i].height);
        }
        return ret;
    };

    $.imageSelectAreas.prototype.contains  = function (point) {
        var res = false;
        this._eachArea(function (area) {
            if (area.contains(point)) {
                res = true;
                return false;
            }
        });
        return res;
    };

    $.selectAreas = function(object, options) {
        var $object = $(object);
        if (! $object.data("mainImageSelectAreas")) {
            //console.log("line 903");
            var mainImageSelectAreas = new $.imageSelectAreas();
            mainImageSelectAreas.init(object, options);
            $object.data("mainImageSelectAreas", mainImageSelectAreas);
            $object.trigger("loaded");
        }
        return $object.data("mainImageSelectAreas");
    };


    $.fn.selectAreas = function(customOptions) {
        //console.log("line 913");
        if ( $.imageSelectAreas.prototype[customOptions] ) { // Method call
            //console.log("line 915");
            var ret = $.imageSelectAreas.prototype[ customOptions ].apply( $.selectAreas(this), Array.prototype.slice.call( arguments, 1 ));
            return typeof ret === "undefined" ? this : ret;

        } else if ( typeof customOptions === "object" || ! customOptions ) { // Initialization
            //Iterate over each object
            this.each(function() {
                var currentObject = this,
                    image = new Image();
                //console.log("current object = ", currentObject);

                // And attach selectAreas when the object is loaded
                image.onload = function() {
                    $.selectAreas(currentObject, customOptions);
                };

                // Reset the src because cached images don"t fire load sometimes
                image.src = currentObject.src;

            });
            return this;

        } else {
            $.error( "Method " +  customOptions + " does not exist on jQuery.selectAreas" );
        }
    };
}) (jQuery);
