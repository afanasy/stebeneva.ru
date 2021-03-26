var duration = 3000
var fadeDuration = 1000

$(function() {
  $('#slides > div').hide()
  $('#slides > div:first').show()
  setInterval(function () {
    var next = $('#slides > div:visible').fadeOut(fadeDuration).next()
    if (!next.length)
      next = $('#slides > div:first')
    next.fadeIn(fadeDuration)
  }, duration)  
})
