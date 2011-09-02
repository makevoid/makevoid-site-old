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
//    %div#gallery{ :"data-gallery" => "[{ "name": "Foo", "template": "foo", "/imgs/foo.png"}, { "name": "Bar", "template": "bar", "/imgs/bar.png"}]" }
//      .btn_next.mkButton >
//      .btn_prev.mkButton <
//
//  note: data-images is a JSON hash with:
//    - name
//    - template name (template)
//    - image url (image)
//
//  remember to require gallery_helpers.js before loading this file




// main object

var mkGallery = {
  
  buttons_selector: ".mkButtonGo",
  images_urls: [], 
  images: [],
  gal_height: 0,
  parse_helpers: true, // FIXME: default should be false, this is an optional feature
  
  initialize: function(h, element) {
    this.gal_height = h // and image_height
    this.image_width = 600
    this.element = element
    this.gallery_data = eval(element.attr("data-gallery"))
    this.images_urls = this.gallery_data.map(function(elem, idx) { return elem.image; })
    this.images_count = this.gallery_data.length
    this.currentIndex = 0
    this.draw()
    this.set_z_indexes()
    this.size_and_position()
    this.reveal()
    this.attach_events()
    this.reveal_buttons()
    this.manageState()
    this.keyboardEvents()
  },
  
  keyboardEvents: function() {
    document.onkeydown = function(e) {
      e = e || window.event;
      var keycode = e.keyCode || e.which;

      if (keycode == 39) {         
        mkGallery.next()
      } else if (keycode == 37) {
        mkGallery.prev()        
      }
    }
  },
  
  // haml rendering
  
  parseHelpers: function(html) {
    if (typeof html == "string")
      html = html.replace(/- link_to\s+['"](.+?)['"]\s*,\s+['"](.+?)['"]/g, "<a href='$2'>$1</a> ")
    return html
  },
  
  haml: function(body) {    
    if (this.parse_helpers)
      body = this.parseHelpers(body)
    var main = Haml(body)
    return main({})
  },
  
  
  getPage: function() {
    var self = this
    var object = this.currentObject
    $.get("/projects/"+object.template+".haml", function(page){
      var html = self.haml(page)
      $("#infos").html(html)
      $("h2").html(object.name)
    })
  },
  
  
  postAnimationHook: function() {
    // change content
    var object = this.gallery_data[this.currentIndex]
    this.currentObject = object
    this.getPage()
  },
  
  getCenter: function () {
    var elem_width = this.element.width()/2
    var center = elem_width - this.image_width/2
    return center
  },

  
  deactivate_buttons: function () {
    $(this.buttons_selector).removeClass("active")    
  },
  
  activate_buttons: function () {
    var self = this
    setTimeout(function() {
      $(self.buttons_selector).addClass("active")
    }, 500)  
  },
  
  reveal_buttons: function () {
    var center = this.getCenter()
    
    this.activate_buttons()
    var self = this
    $(".mkButtonGo").css({left: center+200+"px"})
  },
  
  attach_events: function() {
    var self = this
    $(function(){
      var elem = self.element
      elem.find("img").live("click", function(event){
        // FIXME: better check total x?
        var current_x = parseInt($(this).transformY())
        
        center_x = parseInt(elem.find("img.mkCenter").first().transformY())
        // console.log(current_x+" - "+center_x)
        var clicked_on_center_or_next = current_x < center_x
        var clicked_on_next = current_x != center_x
        
        if (clicked_on_center_or_next)
          self.prev()
        else
          if (clicked_on_next)
            self.next()
          else { // on the center image
            var center = center_x+300
            var offset = 100
            //console.log(event.pageX, center, offset)
            
            if (event.pageX > center+offset)
              mkGallery.next()
            else if (event.pageX < center-offset)
              mkGallery.prev()
          }
      })
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
    var center = this.getCenter()

    $.each_image(function(index, image) {
      image.removeClass("mkCenter")
    })
    
    var first = this.images[0]
    first.transf(center, 0, { width: this.image_width, height: this.gal_height, opacity: 1})
    first.addClass("mkCenter")
    
    var treshold = 200
    if ($.browser.mozilla)
      treshold = 300
    var width = 400
    var height = 300
    var center2 = this.element.width()/2 - width/2
    var y = this.gal_height/2 - height/2
    var x = center2+treshold
    var mozx = 0
    if ($.browser.mozilla)
      mozx = treshold*2/1.5
    this.images[1].transf(x+mozx, y, { width: width, height: height, opacity: 0.8})
    x = center2-treshold
    this.images.back(-1).transf(x, y, { width: width, height: height, opacity: 0.8})
    
    treshold = 300
    if ($.browser.mozilla)
      treshold = 500
    width = 300
    height = 200
    y += 30 
    center2 = center2+50
    x = center2+treshold
    if ($.browser.mozilla)
      mozx = treshold*2/1.5
    this.images[2].transf(x+mozx, y, { width: width, height: height, opacity: 0})
    x = center2-treshold
    this.images.back(-2).transf(x, y, { width: width, height: height, opacity: 0})
    
    $(".mkButtonGo").css({left: center+200+"px"})
  },
  
  draw: function() {
    this.element.height(this.gal_height)
    
    var self = this
    $.each_image_url(function(index, image_url) {  
      var image = $("<img class='mkHidden image_"+index+"' src='"+image_url+"'>")
      $("#gallery").append(image)
      self.images.push(image)
      

      // FIXME: values hardcoded
      if (index > 1 && index < 6) {
        $(".image_"+index).css({ width: 300, height: 200, opacity: 0})
      } else {
        console.log($(".image_"+index))
        $(".image_"+index).css({ width: 300, height: 200, opacity: 0})
      }
    })
  },
  
  next: function() {
    this.deactivate_buttons()
    var self = this
    setTimeout(function() {
      var images = self.images
      self.images = images.slice(1)
      self.images.push(images[0])
      
      self.currentIndex++
      if (self.currentIndex >= self.gallery_data.length)
        self.currentIndex = 0
        
      setTimeout(self.set_z_indexes, 200)
      self.size_and_position()
      self.postAnimationHook()
      self.activate_buttons()  
      self.updateState()
    }, 100)
  },
  
  prev: function() {
    this.deactivate_buttons()
    var self = this
    setTimeout(function() {
      var images = self.images
      var head = images.slice(0, images.length-1)
      self.images = $.merge(images.slice(-1), head)
      
      self.currentIndex--
      if (self.currentIndex < 0)
        self.currentIndex = self.gallery_data.length-1
        
      self.set_z_indexes()
      self.size_and_position()
      self.postAnimationHook()
      self.activate_buttons()
      self.updateState()
    }, 100)
  },
  
  // state management
  
  updateState: function() {
    var stateObj = this.currentObject
    var titlePage = ""
    var page = stateObj.template
    if (page != "cappiello")
      titlePage = ": "+page
    var title = "makevoid - portfolio"+titlePage
    if (history.pushState)
      history.pushState(stateObj, title, "/"+page);
  },
  
  manageState: function() {
    var self = this
    window.onpopstate = function(event){
      state = event.state
      if (state != undefined) {
        self.currentObject = state
        self.getPage()
      }
    }
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