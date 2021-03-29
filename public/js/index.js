var _ = window._
var config = window.config
var slideSize = {
  width: 840,
  height: 562
}
var duration = 3000
var fadeDuration = 1000

$(function() {
  _.each(config.section, section => {
    section.photo = _.where(config.photo, {sectionId: section.id})
  })
  $('.content').css({position: 'relative', width: slideSize.width, height: slideSize.height}).append(_.flatten(_.map(config.section, function (section) {
    return _.map(_.where(section.photo, {frontpage: 1}), function (photo, i) {
      return $('<div>').css({
        cursor: 'pointer',
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
      }).
      click(function () {
        location = '/photo/' + section.name
        return false
      })
    })
  })))
  var i = 0
  setInterval(function () {
    i = (i + 1) % _.size($('.contents > div'))
    $('.content > div').css({opacity: 0}).eq(i).css({opacity: 1})
  }, duration)  
})
