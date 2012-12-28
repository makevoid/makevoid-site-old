g = window

$ ->
  browsers.detect()

  mkGallery.init()

  $(".scroll_top").live "click", ->
    $("html, body").animate scrollTop: 0, 500

mkGallery = {}
g.mkGallery = mkGallery

mkGallery.image_template = (img) ->
 "<img src='#{img.image}' class='image_#{img.idx}' />"

mkGallery.init = ->
  this.draw()
  this.attach_events()
  this.update_classes()
  this.manageState()
  this.resizeHeight()

mkGallery.index = 3
mkGallery.gallery = $("#gallery")
mkGallery.images = ->
  this.gallery.find("img")

mkGallery.size = ->
  @_size ||= mkGallery.images().length

mkGallery.draw = ->
  images = this.gallery.data("gallery")
  _(images).each (image, idx) =>
    image.idx = idx
    image_view = this.image_template(image)
    this.gallery.append image_view

mkGallery.attach_events = ->
  this.keyboardEvents()

  this.images().on "click", (evt) =>
    if $(evt.target).hasClass("image_1")
      this.next()
    else if $(evt.target).hasClass("image_2") || $(evt.target).hasClass("image_3")
      this.prev()

mkGallery.next = ->
  @index = @index + 1
  @index = 0 if @index > this.size()-1
  this.update_classes()
  this.get_page()

mkGallery.prev = ->
  @index = @index - 1
  @index = this.size()-1 if @index < 0
  this.update_classes()
  this.get_page()

mkGallery.update_classes = ->
  _(this.images()).each (image, idx) =>
    $(image).removeClass()
    img = (@index+2-idx+this.size()) % this.size()
    $(image).addClass("image_#{img}")


mkGallery.keyboardEvents = ->
  document.onkeydown = (e) ->
    e = e or window.event
    keycode = e.keyCode or e.which
    if keycode is 37
      mkGallery.next()
    if keycode is 39
      mkGallery.prev()

mkGallery.parseHelpers = (html) ->
  html = html.replace(/- link_to\s+['"](.+?)['"]\s*,\s+['"](.+?)['"]/g, " <a href='$2'>$1</a> ")  if typeof html is "string"
  html

mkGallery.haml = (body) ->
  body = @parseHelpers(body)
  main = Haml(body)
  main {}

mkGallery.get_page = ->
  self = this
  object = this.gallery.data("gallery")[@index]
  $.get "/projects/" + object.template + ".haml", (page) ->
    html = self.haml(page)
    $("#infos").html html
    $("h2").html object.name
    self.updateState()

mkGallery.updateState = ->
  stateObj = this.gallery.data("gallery")[@index]
  titlePage = ""
  page = stateObj.template
  titlePage = ": " + page  unless page is "cappiello"
  title = "makevoid - portfolio" + titlePage
  page = "" if page == "makevoid"
  history.pushState stateObj, title, "/" + page  if history.pushState

mkGallery.manageState = ->
  self = this
  window.onpopstate = (event) ->
    state = event.state
    unless state is `undefined`
      self.currentObject = state
      self.get_page()

mkGallery.resizeHeightOnce = ->
  this.gallery.height $(".image_2").height()+30

mkGallery.resizeHeight = ->
  # fixme with jquery imageloaded
  $("img").imagesLoaded =>
    this.resizeHeightOnce()

browsers = {}
browsers.detect = ->
  chrome = navigator.userAgent.match /Chrome/
  $("body").addClass "firefox" if $.browser.mozilla
  $("body").addClass "webkit" if $.browser.webkit
  $("body").addClass "chrome" if chrome
  $("body").addClass "safari" if $.browser.webkit && !chrome
