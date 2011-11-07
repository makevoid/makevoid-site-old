
// jquery helpers and integration

Array.prototype.rev = function() {
  var arr = this
  var rev = arr.reverse()
  // wtf ????
  return rev
}


Array.prototype.back = function(num) {
  return this[num+this.length]
}

$ = jQuery;

$.each_image_url = function(fn) {
  this.each(mkGallery.images_urls, fn)
}

$.each_image = function(fn) {
  this.each(mkGallery.images, fn)
}

$.transf = function(x, y) {
  // "-ms-transform": "translate("+x+"px, "+y+"px)",  ... yes sure!
  return { "-o-transform": "translate("+x+"px, "+y+"px)", "-moz-transform": "translate("+(x/3-390)+"px, "+y+"px)", "-webkit-transform": "translate3d("+x+"px, "+y+"px, 20px)" }
}

// fail? 
// Object.prototype.merge = function(obj){
//   return $.extend(this, obj)
// }

$.fn.transf = function(x, y, options) {
  if (!$.browser.msie)
    this.css( $.extend($.transf(x, y), options) )
  else {
    this.animate( $.extend({ top: y, left: x }, options), 300 )
  }
  return this
}

$.fn.transformY = function() {
  var match
  if ($.browser.webkit) {
    var transf = this.css("-webkit-transform")
    if (transf.match(/matrix3d\(/)) // wtf webkit committers!?
      match = transf.match(/matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ([-\d.]+),/)
    else
      match = transf.match(/matrix\(1, 0, 0, 1, ([-\d.]+)/)
  } else {
    match = this.css("-moz-transform").match(/matrix\(1, 0, 0, 1, ([-\d.]+)/)
  }

  if (match) {
    return match[1]
  } else
    return 0
}
