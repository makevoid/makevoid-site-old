// BrowserUpdateNotify
//
// js:
//
// $(function(
//   requirements = { requirements  }
//   $("#update_browser").browserUpdateNotify(requirements)
// ))
//
//
// html:
//
// <div id='update_browser'>...</div>

$.fn.browserUpdateNotify = function(reqs){
  // if (reqs == undefined || reqs == {})
  //   this.html("BrowserUpdateNotify error: You have to specify some browser update requirements!")
  
  this.html("you are running X browser version Y, please update to version Z")
}


$(function(
  requirements = { requirements  }
  $("#update_browser").browserUpdateNotify(requirements)
))
