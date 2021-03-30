var _ = window._
var config = window.config
var thumbSize = 56
var slideSize = {
  width: 840,
  height: 562
}
var opacity = .8
var duration = 3000
var fadeDuration = 1000

$(function() {
  function render () {
    function slide (photo, i) {
      return $('<div>').css({
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        'background-image': 'url(/photo/' + photo.id + '/slide)',
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        opacity: i? 0: 1,
        transition: 'opacity ' + fadeDuration + 'ms ease-in-out'
      })
    }
    function photo () {
      function jump (d) {
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
      var margin = 10
      var borderWidth = 1
      var scrollBoxWidth = slideSize.width - 50
      var scrollBoxHeight = thumbSize + 2 * borderWidth
      var thumbWidth = thumbSize + margin + 2 * borderWidth
      var section = _.findWhere(config.section, {name: _.last(location.pathname.split('/'))})
      var slideBox = $('<div>')
      var thumbBox = $('<div>')
      var slideInterval = setInterval(function () {jump({add: 1, clear: false})()}, duration)  
      var i = 0
      $('body').
        keydown(function (e) {
          if (e.which == 32) //space
            jump({add: 1})()
          if (e.which == 37) //left arrow
            jump({add: -1})()
          if (e.which == 39) //right arrow
            jump({add: 1})()
        })
      return box.
        append(
          slideBox.css({position: 'relative', width: slideSize.width, height: slideSize.height, 'margin-bottom': 10}).append(_.map(section.photo, slide)),
          $('<div>').css({width: slideSize.width}).append(
            $('<i>').css({cursor: 'pointer', color: '#aaa', float: 'left', 'font-size': 30, 'line-height': scrollBoxHeight + 'px'}).addClass('fas fa-angle-left').click(jump({add: -1})),
            $('<i>').css({cursor: 'pointer', color: '#aaa', float: 'right', 'font-size': 30, 'line-height': scrollBoxHeight + 'px'}).addClass('fas fa-angle-right').click(jump({add: 1})),
            $('<div>').css({width: scrollBoxWidth, height: scrollBoxHeight, margin: '0 auto', overflow: 'hidden'}).append(
              thumbBox.css({width: thumbWidth * _.size(section.photo), overflow: 'auto', transition: 'transform ' + fadeDuration + 'ms ease-in-out'}).append(_.map(section.photo, function (photo, i) {
                return $('<div>').css({
                  cursor: 'pointer',
                  float: 'left',
                  width: thumbSize,
                  height: thumbSize,
                  'margin-right': 10,
                  border: borderWidth + 'px solid #ccc',
                  'background-image': 'url(/photo/' + photo.id + '/thumb)',
                  'background-size': 'cover',
                  'background-position': 'center',
                  'background-repeat': 'no-repeat',
                  opacity: i? opacity: 1,
                  transition: 'opacity ' + fadeDuration + 'ms ease-in-out'
                }).
                click(jump(i))
              }))
            )
          )
        )
    }
    box.empty()
    clearInterval(slideInterval)
    $('body').off()
    if (location.pathname == '/') {
      var frontpagePhoto = _.where(config.photo, {frontpage: 1})
      box.append(
        $('<div>').css({cursor: 'pointer', position: 'relative', width: slideSize.width, height: slideSize.height}).
          append(_.map(frontpagePhoto, slide)).
          click(function () {
            window.history.pushState({}, '', '/photo/' + _.findWhere(config.section, {id: frontpagePhoto[i].sectionId}).name)
            render()
            return false
          })
      )
      var i = 0
      slideInterval = setInterval(function () {
        i = (i + 1) % _.size(frontpagePhoto)
        $('> div > div', box).css({opacity: 0}).eq(i).css({opacity: 1})
      }, duration)
      return box
    }
    if (location.pathname.match(/^\/photo/))
      return photo()
    if (location.pathname == '/contact')
      return box.append($('#contact').clone().removeClass('hide'))
  }
  function aClick (e) {
    e.preventDefault()
    window.history.pushState({}, '', $(this).attr('href'))
    render()
    return false
  }
  _.each(config.section, function (section) {
    section.photo = _.where(config.photo, {sectionId: section.id})
  })
  window.onpopstate = render
  $('.head a').click(aClick)
  $('.nav a').click(aClick)
  var slideInterval
  var box = $('.content')
  render()
})
