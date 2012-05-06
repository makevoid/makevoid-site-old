(function() {
  var g, mkGallery;

  g = window;

  mkGallery = {
    buttons_selector: ".mkButtonGo",
    images_urls: [],
    images: [],
    gal_height: 0,
    parse_helpers: true,
    initialize: function(h, element) {
      this.gal_height = h;
      this.image_width = 600;
      this.element = element;
      this.gallery_data = eval(element.attr("data-gallery"));
      this.images_urls = this.gallery_data.map(function(elem, idx) {
        return elem.image;
      });
      this.images_count = this.gallery_data.length;
      this.currentIndex = 0;
      this.draw();
      this.set_z_indexes();
      this.body_width_start = $("body").width();
      this.size_and_position();
      this.reveal();
      this.attach_events();
      this.reveal_buttons();
      this.manageState();
      this.keyboardEvents();
      this.lameFixForChrome();
      return this.lameFixForSafari();
    },
    lameFixForSafari: function() {
      var self;
      if (!navigator.userAgent.match(/Chrome/) && $.browser.webkit) {
        self = this;
        return $("#gallery").bind("click", function(evt) {
          if ($(evt.target).attr("id") === "gallery") return self.next();
        });
      }
    },
    lameFixForChrome: function() {
      if (navigator.userAgent.match(/Chrome/)) {
        this.next(true);
        this.next(true);
        this.next(true);
        this.prev(true);
        this.prev(true);
        return this.prev(true);
      }
    },
    keyboardEvents: function() {
      return document.onkeydown = function(e) {
        var keycode;
        e = e || window.event;
        keycode = e.keyCode || e.which;
        if (keycode === 39) {
          return mkGallery.next();
        } else {
          if (keycode === 37) return mkGallery.prev();
        }
      };
    },
    parseHelpers: function(html) {
      if (typeof html === "string") {
        html = html.replace(/- link_to\s+['"](.+?)['"]\s*,\s+['"](.+?)['"]/g, "<a href='$2'>$1</a> ");
      }
      return html;
    },
    haml: function(body) {
      var main;
      if (this.parse_helpers) body = this.parseHelpers(body);
      main = Haml(body);
      return main({});
    },
    getPage: function() {
      var object, self;
      self = this;
      object = this.currentObject;
      return $.get("/projects/" + object.template + ".haml", function(page) {
        var html;
        html = self.haml(page);
        $("#infos").html(html);
        return $("h2").html(object.name);
      });
    },
    postAnimationHook: function() {
      var object;
      object = this.gallery_data[this.currentIndex];
      this.currentObject = object;
      return this.getPage();
    },
    getCenter: function() {
      var center, elem_width;
      elem_width = this.element.width() / 2;
      center = elem_width - this.image_width / 2;
      return center;
    },
    deactivate_buttons: function() {
      return $(this.buttons_selector).removeClass("active");
    },
    activate_buttons: function() {
      var self;
      self = this;
      return setTimeout((function() {
        return $(self.buttons_selector).addClass("active");
      }), 500);
    },
    reveal_buttons: function() {
      var center, self;
      center = this.getCenter();
      this.activate_buttons();
      self = this;
      return $(".mkButtonGo").css({
        left: center + 200 + "px"
      });
    },
    attach_events: function() {
      var self;
      self = this;
      return $(function() {
        var elem;
        elem = self.element;
        return elem.find("img").live("click", function(event) {
          var center, center_x, clicked_on_center_or_next, clicked_on_next, current_x, offset;
          console.log("img clicked");
          current_x = parseInt($(this).transformY());
          center_x = parseInt(elem.find("img.mkCenter").first().transformY());
          clicked_on_center_or_next = current_x < center_x;
          clicked_on_next = current_x !== center_x;
          if (clicked_on_center_or_next) {
            return self.prev();
          } else if (!clicked_on_next) {
            center = center_x + 300;
            offset = 100;
            if (event.pageX > center + offset) {
              return mkGallery.next();
            } else {
              if (event.pageX < center - offset) return mkGallery.prev();
            }
          }
        });
      });
    },
    reveal: function() {
      return $.each_image(function(index, image) {
        return image.removeClass("mkHidden");
      });
    },
    set_z_indexes: function() {
      return $.each_image(function(index, image) {
        return image.css({
          zIndex: 12 - index
        });
      });
    },
    size_and_position: function() {
      var base_scale, body_width_diff, center, center2, first, height, moz, mozx, treshold, width, x, y;
      center = this.getCenter();
      $.each_image(function(index, image) {
        return image.removeClass("mkCenter");
      });
      first = this.images[0];
      base_scale = 1;
      first.transf(center, 0, base_scale * 1, {
        opacity: 1
      });
      moz = $.browser.mozilla;
      first.addClass("mkCenter");
      treshold = 200;
      if (moz) treshold = 300;
      width = 600;
      height = 400;
      center2 = $("body").width() / 2 - width / 2;
      y = this.gal_height / 2 - height / 2;
      x = center2 + treshold;
      mozx = 0;
      if (moz) mozx = treshold * 2 / 1.5;
      this.images[1].transf(x + mozx, y, base_scale * 0.6, {
        opacity: 0.8
      });
      x = center2 - treshold;
      this.images.back(-1).transf(x, y, base_scale * 0.6, {
        opacity: 0.8
      });
      treshold = 300;
      if (moz) treshold = 500;
      width = 300;
      height = 200;
      y += 30;
      center2 = center2 + 50;
      x = center2 + treshold;
      if (moz) mozx = treshold * 2 / 1.5;
      this.images[2].css({
        display: "block"
      }).transf(x + mozx, y, base_scale * 0.4, {
        opacity: 0
      });
      x = center2 - treshold;
      this.images.back(-2).css({
        display: "block"
      }).transf(x, y, base_scale * 0.4, {
        opacity: 0
      });
      body_width_diff = $("body").width() - this.body_width_start;
      if (moz) {
        body_width_diff = $("body").width() * 2.1 + $("body").width() - this.body_width_start;
      }
      return $(".mkButtonGo").transf(body_width_diff / 2, 0, {});
    },
    draw: function() {
      var self;
      this.element.height(this.gal_height);
      self = this;
      return $.each_image_url(function(index, image_url) {
        var image, num_shown, tot;
        image = $("<img class='mkHidden image_" + index + "' src='" + image_url + "'>");
        $("#gallery").append(image);
        self.images.push(image);
        tot = self.images_urls.length;
        num_shown = 2;
        if (index >= 0 && index <= num_shown || index <= tot && index >= tot - num_shown) {
          return $(".image_" + index).css({
            opacity: 0
          });
        } else {
          return $(".image_" + index).transf(self.getCenter(), 0, 0.4).hide();
        }
      });
    },
    next: function(no_hook) {
      var self;
      this.deactivate_buttons();
      self = this;
      return setTimeout((function() {
        var images;
        images = self.images;
        self.images = images.slice(1);
        self.images.push(images[0]);
        self.currentIndex++;
        if (self.currentIndex >= self.gallery_data.length) self.currentIndex = 0;
        setTimeout(self.set_z_indexes, 200);
        self.size_and_position();
        if (!no_hook) {
          self.postAnimationHook();
          self.activate_buttons();
          return self.updateState();
        }
      }), 100);
    },
    prev: function(no_hook) {
      var self;
      this.deactivate_buttons();
      self = this;
      return setTimeout((function() {
        var head, images;
        images = self.images;
        head = images.slice(0, images.length - 1);
        self.images = $.merge(images.slice(-1), head);
        self.currentIndex--;
        if (self.currentIndex < 0) {
          self.currentIndex = self.gallery_data.length - 1;
        }
        self.set_z_indexes();
        self.size_and_position();
        if (!no_hook) {
          self.postAnimationHook();
          self.activate_buttons();
          return self.updateState();
        }
      }), 100);
    },
    updateState: function() {
      var page, stateObj, title, titlePage;
      stateObj = this.currentObject;
      titlePage = "";
      page = stateObj.template;
      if (page !== "cappiello") titlePage = ": " + page;
      title = "makevoid - portfolio" + titlePage;
      if (history.pushState) return history.pushState(stateObj, title, "/" + page);
    },
    manageState: function() {
      var self;
      self = this;
      return window.onpopstate = function(event) {
        var state;
        state = event.state;
        if (state !== undefined) {
          self.currentObject = state;
          return self.getPage();
        }
      };
    }
  };

  $.fn.mkGallery = function(height) {
    mkGallery.initialize(height, $(this));
    $(window).bind("resize", function() {
      return mkGallery.size_and_position();
    });
    return this;
  };

  g.mkGallery = mkGallery;

}).call(this);
