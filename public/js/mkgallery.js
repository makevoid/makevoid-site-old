// mkGallery
//
// this code is open source - feel free to fork it and/or drop a line @makevoid 

// usage:
//
//  js:
//    
//    $("#gallery").mkGallery(450)  
//
//  haml (you can convert it to html): 
//    
//    %div#gallery{ :"data-images" => "['/imgs/image1.png', '/imgs/image2.png', '/imgs/imageN.png']" }
//      .btn_next.mkButton >
//      .btn_prev.mkButton <
//
//  note: data-images is a JSON array



// jquery helpers and integration

$ = jQuery;

$.each_image_url = function(fn) {
  this.each(mkGallery.images_urls, fn)
}

$.each_image = function(fn) {
  this.each(mkGallery.images, fn)
}

$.transf = function(x, y) {
  return { "-webkit-transform": "translate3d("+x+"px, "+y+"px, 0)", "-moz-transform": "translate("+(x/3-390)+"px, "+y+"px)" }
}

// fail? 
// Object.prototype.merge = function(obj){
//   return $.extend(this, obj)
// }

$.fn.transf = function(x, y, options) {
  this.css( $.extend( $.transf(x, y), options ) )
}

$.fn.transformY = function() {
  var match
  if ($.browser.webkit) 
    match = this.css("-webkit-transform").match(/matrix\(1, 0, 0, 1, (\d+)/)
  else
    match = this.css("-moz-transform").match(/matrix\(1, 0, 0, 1, (\d+)/)
  if (match)
    return match[1]
  else
    return 0
}


// main object

var mkGallery = {
  
  images_shown: 5,
  buttons_selector: ".mkButtonGo",
  //buttons_selector: ".btn_prev, .btn_next, .mkButtonGo",
  images_urls: [], 
  images: [],
  gal_height: 0,
  
  initialize: function(h, element) {
    this.gal_height = h // and image_height
    this.image_width = 600
    this.element = element
    this.images_urls = eval(element.attr("data-images"))
    this.draw()
    this.set_z_indexes()
    this.size_and_position()
    this.reveal()
    this.attach_events()
    this.reveal_buttons()
  },
  
  getCenter: function () {
    elem_width = this.element.width()/2
    center = elem_width - this.image_width/2
    return center
  },

  
  deactivate_buttons: function () {
    $(this.buttons_selector).removeClass("active")    
  },
  
  activate_buttons: function () {
    setTimeout(function() {
      $(mkGallery.buttons_selector).addClass("active")
    }, 500)  
  },
  
  reveal_buttons: function () {
    center = this.getCenter()
    
    this.activate_buttons()
    $(".btn_prev").css({left: center+"px"}).bind("click", function() {
      mkGallery.prev()
    })
    $(".btn_next").css({left: center+550+"px"}).bind("click", function() {
      mkGallery.next()
    })    
    $(".mkButtonGo").css({left: center+200+"px"})
    
  },
  
  attach_events: function() {
    elem = this.element
    elem.find("img").live("click", function(event){
      // FIXME: better check total x?

      current_x = parseInt($(this).transformY())
      center_x = parseInt(elem.find("img.mkCenter").first().transformY())
      //console.log(current_x+" - "+center_x)
      clicked_on_center_or_next = current_x < center_x
      clicked_on_next = current_x != center_x
      if (clicked_on_center_or_next)
        mkGallery.prev()
      else
        if (clicked_on_next)
          mkGallery.next()
        else {
          // on the center image
          center = center_x+300
          offset = 200
          if (event.pageX > center+offset)
            mkGallery.next()
          else if (event.pageX < center-offset)
            mkGallery.prev()
        }
    })
  },
  
  reveal: function() {
    $.each_image(function(index, image) {
      image.removeClass("mkHidden")
    })
  },
  
  set_z_indexes: function() {    
    $.each_image(function(index, image) {
      image.css({zIndex: 10-index})        
    })
//    this.images[0].css({zIndex: 2})
  },
  
  size_and_position: function() {
    center = this.getCenter()
    
    img_width = 400
    img_height = 300
    
    $.each_image(function(index, image) {
      image.height(img_height)
      image.removeClass("mkCenter")
    })
    
    first = this.images[0]
    first.transf(center, 0, { width: this.image_width, height: this.gal_height, opacity: 1})
    first.addClass("mkCenter")
    
    treshold = 200
    center2 = this.element.width()/2 - img_width/2
    y = this.gal_height/2 - img_height/2
    width = img_width
    height = img_height
    x = center2+treshold
    this.images[1].transf(x, y, { width: width, height: height, opacity: 0.8})
    x = center2-treshold
    this.images[4].transf(x, y, { width: width, height: height, opacity: 0.8})
    
    treshold = 300
    y -= 40 
    x = center2+treshold
    this.images[2].transf(x, y, { width: width, height: height, opacity: 0})
    val = center2-treshold
    this.images[3].transf(x, y, { width: width, height: height, opacity: 0})
    
    $(".mkButtonGo").css({left: center+150+"px"})
  },
  
  draw: function() {
    this.element.height(this.gal_height)
    
    $.each_image_url(function(index, image_url) {
      if (index > mkGallery.images_shown-1)
        return 
        
      image = $("<img class='mkHidden' src='"+image_url+"'>")
      $("#gallery").append(image)
      mkGallery.images.push(image)
    })
  },
  
  next: function() {
    this.deactivate_buttons()
    setTimeout(function() {
      images = mkGallery.images
      mkGallery.images = images.slice(1)
      mkGallery.images.push(images[0])
      setTimeout(mkGallery.set_z_indexes, 200)
      mkGallery.size_and_position()
      mkGallery.activate_buttons()  
    }, 100)
  },
  
  prev: function() {
    this.deactivate_buttons()
    setTimeout(function() {
      images = mkGallery.images
      head = images.slice(0, images.length-1)
      mkGallery.images = $.merge(images.slice(-1), head)
      mkGallery.set_z_indexes()
      mkGallery.size_and_position()
      mkGallery.activate_buttons()
    }, 100)
  }
  
}


// jquery hook

$.fn.mkGallery = function(height) {
  mkGallery.initialize(height, $(this))
  $(window).resize(function(){
    mkGallery.size_and_position()
  })
  return this;
}