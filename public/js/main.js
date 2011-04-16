$ = jQuery;

$.each_image = function(fn) {
  this.each(mkGallery.imgs, fn)
}

var mkGallery = {
  
  imgs: [],
  gal_height: 0,
  
  initialize: function(h, element) {
    this.gal_height = h
    this.element = element
    this.imgs = eval(element.attr("data-images"))
    this.draw()
    this.position()
  },
  
  position: function() {
    $.each_image(function(index, value) {
      console.log(value)
    })
  },
  
  draw: function() {
    this.element.height(this.gal_height)

    $.each_image(function(index, value) {
      $("#gallery").append("<img src='"+value+"'>")
    })
  }
  
}

$.fn.mkGallery = function(height) {
  mkGallery.initialize(height, $(this))
  return this;
}

$("#gallery").mkGallery(450)

function ui_test(){
  size = $("#gallery img").size()
  _.each(_.range(size), function(num) { 
    
    img = $($("#gallery img")[num])
    img.css({left: 100*num+"px"})
    if (num == 1)
      img.addClass("center")
    if (num == 2)
      img.css({left: img.width()+"px"})
    
    img.click(function(){
      $(this).removeClass("center")
      $(this).css({left: 100*(num-1)+"px"})
      img2 = $($("#gallery img")[2])
      img2.addClass("center")
      img2.css({left: 100*num+"px"})
    })
  })
}

$(function(){
  ui_test() 
  
});