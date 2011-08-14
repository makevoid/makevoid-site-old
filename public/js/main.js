$(function(){
  //ui_test() 
  var gal = $("#gallery").mkGallery(450)  
  
  // other
  $(".scroll_top").live("click", function(){
    $("html, body").animate({scrollTop: 0}, 500)
  })
  $(".mkButtonGo").live("click", function(){
    $("html, body").animate({scrollTop: 600}, 500)
  })
  
})