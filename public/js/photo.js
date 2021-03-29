var _ = window._
var config = window.config
var thumbSize = 56
var slideSize = {
  width: 840, //675,
  height: 562
}
var opacity = .8
var duration = 3000
var fadeDuration = 1000

$(function() {
  function slide (d) {
    return function () {
      i = (d.add? (i + d.add): d) % _.size(section.photo)
      $('> div', slideBox).css({opacity: 0}).eq(i).css({opacity: 1})
      $('> div', thumbBox).css({opacity: opacity}).eq(i).css({opacity: 1})
      thumbBox.css({transform: 'translate(' + Math.min(scrollBoxWidth - ((i + 1) * thumbWidth), 0) + 'px, 0)'})
      if (d.clear !== false)
        clearInterval(slideInterval)
      return false
    }
  }
  _.each(config.section, section => {
    section.photo = _.where(config.photo, {sectionId: section.id})
  })

  var margin = 10
  var borderWidth = 1
  var scrollBoxWidth = slideSize.width - 50
  var scrollBoxHeight = thumbSize + 2 * borderWidth
  var thumbWidth = thumbSize + margin + 2 * borderWidth
  var section = _.findWhere(config.section, {name: window.section})
  var slideBox = $('<div>')
  var thumbBox = $('<div>')
  var slideInterval = setInterval(function () {slide({add: 1, clear: false})()}, duration)  
  var i = 0

  $('body').
    keydown(function (e) {
      if (e.which == 32) //space
        slide({add: 1})()
      if (e.which == 37) //left arrow
        slide({add: -1})()
      if (e.which == 39) //right arrow
        slide({add: 1})()
    })
  $('.content').
    append(
      slideBox.css({position: 'relative', width: slideSize.width, height: slideSize.height, 'margin-bottom': 10}).append(_.map(section.photo, function (photo, i) {
        return $('<div>').css({
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          'background-image': 'url(/photos/' + section.name + '/slides/' + photo.filename + ')',
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          opacity: i? 0: 1,
          transition: 'opacity ' + fadeDuration + 'ms ease-in-out'
        })
      })),
      $('<div>').css({width: slideSize.width}).append(
        $('<i>').css({cursor: 'pointer', color: '#aaa', float: 'left', 'font-size': 30, 'line-height': scrollBoxHeight + 'px'}).addClass('fas fa-angle-left').click(slide({add: -1})),
        $('<i>').css({cursor: 'pointer', color: '#aaa', float: 'right', 'font-size': 30, 'line-height': scrollBoxHeight + 'px'}).addClass('fas fa-angle-right').click(slide({add: 1})),
        $('<div>').css({width: scrollBoxWidth, height: scrollBoxHeight, margin: '0 auto', overflow: 'hidden'}).append(
          thumbBox.css({width: thumbWidth * _.size(section.photo), overflow: 'auto', transition: 'transform ' + fadeDuration + 'ms ease-in-out'}).append(_.map(section.photo, function (photo, i) {
            return $('<div>').css({
              cursor: 'pointer',
              float: 'left',
              width: thumbSize,
              height: thumbSize,
              'margin-right': 10,
              border: borderWidth + 'px solid #ccc',
              'background-image': 'url(/photos/' + section.name + '/thumbs/' + photo.filename + ')',
              'background-size': 'cover',
              'background-position': 'center',
              'background-repeat': 'no-repeat',
              opacity: i? opacity: 1,
              transition: 'opacity ' + fadeDuration + 'ms ease-in-out'
            }).
            click(slide(i))
          }))
        )
      )
    )
})
