g = window


mkGallery =
  buttons_selector: ".mkButtonGo"
  images_urls: []
  images: []
  gal_height: 0
  parse_helpers: true
  initialize: (h, element) ->
    console.log "asd"
    @gal_height = h
    @image_width = 600
    @element = element
    @gallery_data = eval(element.attr("data-gallery"))
    @images_urls = @gallery_data.map((elem, idx) ->
      elem.image
    )
    @images_count = @gallery_data.length
    @currentIndex = 0
    @draw()
    @set_z_indexes()
    @body_width_start = $("body").width()
    @size_and_position()
    @reveal()
    @attach_events()
    @reveal_buttons()
    @manageState()
    @keyboardEvents()
    @lameFixForChrome()
    @lameFixForSafari()

  lameFixForSafari: ->
    if not navigator.userAgent.match(/Chrome/) and $.browser.webkit
      self = this
      $("#gallery").bind "click", (evt) ->
        self.next()  if $(evt.target).attr("id") is "gallery"

  lameFixForChrome: ->
    if navigator.userAgent.match(/Chrome/)
      @next true
      @next true
      @next true
      @prev true
      @prev true
      @prev true

  keyboardEvents: ->
    document.onkeydown = (e) ->
      e = e or window.event
      keycode = e.keyCode or e.which
      if keycode is 39
        mkGallery.next()
      else mkGallery.prev()  if keycode is 37

  parseHelpers: (html) ->
    html = html.replace(/- link_to\s+['"](.+?)['"]\s*,\s+['"](.+?)['"]/g, "<a href='$2'>$1</a> ")  if typeof html is "string"
    html

  haml: (body) ->
    body = @parseHelpers(body)  if @parse_helpers
    main = Haml(body)
    main {}

  getPage: ->
    self = this
    object = @currentObject
    $.get "/projects/" + object.template + ".haml", (page) ->
      html = self.haml(page)
      $("#infos").html html
      $("h2").html object.name

  postAnimationHook: ->
    object = @gallery_data[@currentIndex]
    @currentObject = object
    @getPage()

  getCenter: ->
    elem_width = @element.width() / 2
    center = elem_width - @image_width / 2
    center

  deactivate_buttons: ->
    $(@buttons_selector).removeClass "active"

  activate_buttons: ->
    self = this
    setTimeout (->
      $(self.buttons_selector).addClass "active"
    ), 500

  reveal_buttons: ->
    center = @getCenter()
    @activate_buttons()
    self = this
    $(".mkButtonGo").css left: center + 200 + "px"

  attach_events: ->
    self = this
    $ ->
      elem = self.element
      elem.find("img").live "click", (event) ->
        console.log "img clicked"
        current_x = parseInt($(this).transformY())
        center_x = parseInt(elem.find("img.mkCenter").first().transformY())
        clicked_on_center_or_next = current_x < center_x
        clicked_on_next = current_x isnt center_x
        if clicked_on_center_or_next
          self.prev()
        else unless clicked_on_next
          center = center_x + 300
          offset = 100
          if event.pageX > center + offset
            mkGallery.next()
          else mkGallery.prev()  if event.pageX < center - offset

  reveal: ->
    $.each_image (index, image) ->
      image.removeClass "mkHidden"

  set_z_indexes: ->
    $.each_image (index, image) ->
      image.css zIndex: 12 - index

  size_and_position: ->
    center = @getCenter()
    $.each_image (index, image) ->
      image.removeClass "mkCenter"

    first = @images[0]
    base_scale = 1
    first.transf center, 0, base_scale * 1,
      opacity: 1

    moz = $.browser.mozilla

    first.addClass "mkCenter"
    treshold = 200
    treshold = 300  if moz
    width = 600
    height = 400
    center2 = $("body").width() / 2 - width / 2
    y = @gal_height / 2 - height / 2
    x = center2 + treshold
    mozx = 0
    mozx = treshold * 2 / 1.5  if moz
    @images[1].transf x + mozx, y, base_scale * 0.6,
      opacity: 0.8

    x = center2 - treshold
    @images.back(-1).transf x, y, base_scale * 0.6,
      opacity: 0.8

    treshold = 300
    treshold = 500  if moz
    width = 300
    height = 200
    y += 30
    center2 = center2 + 50
    x = center2 + treshold
    mozx = treshold * 2 / 1.5  if moz
    @images[2].css(display: "block").transf x + mozx, y, base_scale * 0.4,
      opacity: 0

    x = center2 - treshold
    @images.back(-2).css(display: "block").transf x, y, base_scale * 0.4,
      opacity: 0

    body_width_diff = $("body").width() - @body_width_start
    body_width_diff = $("body").width() * 2.1 + $("body").width() - @body_width_start  if moz
    $(".mkButtonGo").transf body_width_diff / 2, 0, {}

  draw: ->
    @element.height @gal_height
    self = this
    $.each_image_url (index, image_url) ->
      image = $("<img class='mkHidden image_" + index + "' src='" + image_url + "'>")
      $("#gallery").append image
      self.images.push image
      tot = self.images_urls.length
      num_shown = 2
      if index >= 0 and index <= num_shown or index <= tot and index >= tot - num_shown
        $(".image_" + index).css opacity: 0
      else
        $(".image_" + index).transf(self.getCenter(), 0, 0.4).hide()

  next: (no_hook) ->
    @deactivate_buttons()
    self = this
    setTimeout (->
      images = self.images
      self.images = images.slice(1)
      self.images.push images[0]
      self.currentIndex++
      self.currentIndex = 0  if self.currentIndex >= self.gallery_data.length
      setTimeout self.set_z_indexes, 200
      self.size_and_position()
      unless false # no_hook
        self.postAnimationHook()
        self.activate_buttons()
        self.updateState()
    ), 100

  prev: (no_hook) ->
    @deactivate_buttons()
    self = this
    setTimeout (->
      images = self.images
      head = images.slice(0, images.length - 1)
      self.images = $.merge(images.slice(-1), head)
      self.currentIndex--
      self.currentIndex = self.gallery_data.length - 1  if self.currentIndex < 0
      self.set_z_indexes()
      self.size_and_position()
      unless no_hook
        self.postAnimationHook()
        self.activate_buttons()
        self.updateState()
    ), 100

  updateState: ->
    stateObj = @currentObject
    titlePage = ""
    page = stateObj.template
    titlePage = ": " + page  unless page is "cappiello"
    title = "makevoid - portfolio" + titlePage
    history.pushState stateObj, title, "/" + page  if history.pushState

  manageState: ->
    self = this
    window.onpopstate = (event) ->
      state = event.state
      unless state is `undefined`
        self.currentObject = state
        self.getPage()

$.fn.mkGallery = (height) ->
  mkGallery.initialize height, $(this)
  $(window).bind "resize", ->
    mkGallery.size_and_position()
  this

g.mkGallery = mkGallery