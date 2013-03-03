(function() {
  var browsers, first_time, g, mkGallery;

  g = window;

  $(function() {
    browsers.detect();
    mkGallery.init();
    return $(".scroll_top").live("click", function() {
      return $("html, body").animate({
        scrollTop: 0
      }, 500);
    });
  });

  mkGallery = {};

  g.mkGallery = mkGallery;

  mkGallery.image_template = function(img) {
    return "<img src='" + img.image + "' class='image_" + img.idx + "' />";
  };

  mkGallery.init = function() {
    this.draw();
    this.attach_events();
    this.update_classes();
    this.manageState();
    return this.resizeHeight();
  };

  mkGallery.index = 3;

  mkGallery.gallery = $("#gallery");

  mkGallery.images = function() {
    return this.gallery.find("img");
  };

  mkGallery.size = function() {
    return this._size || (this._size = mkGallery.images().length);
  };

  mkGallery.draw = function() {
    var images,
      _this = this;
    images = this.gallery.data("gallery");
    return _(images).each(function(image, idx) {
      var image_view;
      image.idx = idx;
      image_view = _this.image_template(image);
      return _this.gallery.append(image_view);
    });
  };

  mkGallery.attach_events = function() {
    var _this = this;
    this.keyboardEvents();
    return this.images().on("click", function(evt) {
      if ($(evt.target).hasClass("image_1")) {
        return _this.next();
      } else if ($(evt.target).hasClass("image_2") || $(evt.target).hasClass("image_3")) {
        return _this.prev();
      }
    });
  };

  mkGallery.next = function() {
    this.index = this.index + 1;
    if (this.index > this.size() - 1) {
      this.index = 0;
    }
    this.update_classes();
    return this.get_page();
  };

  mkGallery.prev = function() {
    this.index = this.index - 1;
    if (this.index < 0) {
      this.index = this.size() - 1;
    }
    this.update_classes();
    return this.get_page();
  };

  mkGallery.update_classes = function() {
    var _this = this;
    return _(this.images()).each(function(image, idx) {
      var img;
      $(image).removeClass();
      img = (_this.index + 2 - idx + _this.size()) % _this.size();
      return $(image).addClass("image_" + img);
    });
  };

  mkGallery.keyboardEvents = function() {
    return document.onkeydown = function(e) {
      var keycode;
      e = e || window.event;
      keycode = e.keyCode || e.which;
      if (keycode === 37) {
        mkGallery.next();
      }
      if (keycode === 39) {
        return mkGallery.prev();
      }
    };
  };

  mkGallery.parseHelpers = function(html) {
    if (typeof html === "string") {
      html = html.replace(/- link_to\s+['"](.+?)['"]\s*,\s+['"](.+?)['"]/g, " <a href='$2'>$1</a> ");
    }
    return html;
  };

  mkGallery.haml = function(body) {
    var main;
    body = this.parseHelpers(body);
    main = Haml(body);
    return main({});
  };

  first_time = true;

  mkGallery.get_page = function() {
    var format, object, self;
    self = this;
    if (first_time && location.pathname !== "/") {
      this.index = this.index - 1;
      this.update_classes();
    }
    first_time = false;
    object = this.gallery.data("gallery")[this.index];
    format = object.format || "haml";
    return $.get("/projects/" + object.template + ("." + format), function(page) {
      var html, link;
      html = format === "haml" ? self.haml(page) : page;
      $("#infos").html(html);
      link = "<a href='http://" + object.url + "'>" + object.name + "</a>";
      $("h2").html(link);
      return self.updateState();
    });
  };

  mkGallery.updateState = function() {
    var page, stateObj, title, titlePage;
    stateObj = this.gallery.data("gallery")[this.index];
    titlePage = "";
    page = stateObj.template;
    if (page !== "cappiello") {
      titlePage = ": " + page;
    }
    title = "makevoid - portfolio" + titlePage;
    if (page === "makevoid") {
      page = "";
    }
    if (history.pushState) {
      return history.pushState(stateObj, title, "/" + page);
    }
  };

  mkGallery.manageState = function() {
    var self;
    self = this;
    return window.onpopstate = function(event) {
      var state;
      state = event.state;
      if (state !== undefined) {
        self.currentObject = state;
        return self.get_page();
      }
    };
  };

  mkGallery.resizeHeightOnce = function() {
    return this.gallery.height($(".image_2").height() + 30);
  };

  mkGallery.resizeHeight = function() {
    var _this = this;
    $("img").imagesLoaded(function() {
      return _this.resizeHeightOnce();
    });
    return $(window).on("resize", function() {
      return _this.resizeHeightOnce();
    });
  };

  browsers = {};

  browsers.detect = function() {
    var chrome, ios;
    chrome = navigator.userAgent.match(/Chrome/);
    ios = navigator.userAgent.match(/iphone|ipod|ipad/i);
    if ($.browser.mozilla) {
      $("body").addClass("firefox");
    }
    if ($.browser.webkit) {
      $("body").addClass("webkit");
    }
    if (chrome) {
      $("body").addClass("chrome");
    }
    if ($.browser.webkit && !chrome) {
      $("body").addClass("safari");
    }
    if (ios) {
      return $("body").addClass("ios");
    }
  };

}).call(this);
