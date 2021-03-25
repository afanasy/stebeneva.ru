var thumbSize = 56
var opacity = .8

$(function () {
  function thumb (d) {
    function render (update) {
      _.extend(d, update)
      box.empty().off().stop(true).addClass('thumb').
        css({
          cursor: 'pointer',
          float: 'left',
          width: thumbSize,
          height: thumbSize,
          margin: '20px 0 0 20px',
          'border-radius': 5,
          border: '1px solid #ccc',
          'box-shadow': '0px 0px 3px 0px black',
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          opacity: opacity
        })
      if (d.file && !d.filename) {
        superagent.post('/admin').field({section: d.section}).attach('file', d.file).end(function (err, res) {
          if (res.body && res.body.filename)
            return render({section: d.section, filename: res.body.filename})
          box.remove()
        })
        return box.css({opacity: 1}).effect('pulsate', {times: 10000}, 10000 * 1000)
      }
      return box.
        css({
          'background-image': 'url(/photos/' + d.section + '/thumbs/' + d.filename + ')',
          opacity: opacity
        }).
        on('click', function () {
          $('#slide').
            find('img').attr('src', '/photos/' + d.section + '/slides/' + d.filename).end().
            find('input').prop('checked', conf[d.section][d.filename]).end().
            modal('show')
          $('#slide .delete').off().on('click', function () {
            $('#slide').modal('hide')
            box.fadeOut(function() {
              box.remove()
            })
            delete conf[d.section][d.filename]
            superagent.post('/admin').send({action: 'delete', section: d.section, filename: d.filename}).end()
            return false
          })
          $('#slide input').off().on('change', function () {
            conf[d.section][d.filename] = $(this).is(':checked')
            superagent.post('/admin').send({action: 'update', section: d.section, file: d.filename, frontpage: +conf[d.section][d.filename]}).end()
          })
          return false
        }).
        hover(
          function () {$(this).css({opacity: 1})},
          function () {$(this).css({opacity: opacity})}
        )
    }
    var box = $('<div>')
    return render()
  }

  function save () {
    var section = $('.tab-pane.active').attr('id')
    var slides = {}
    $('.tab-pane.active .thumb').each(function(index, element) {
      var file = $(element).attr('file')
      slides[file] = conf[section][file]
    })
    conf[section] = slides
    superagent.post('/admin').send({action: 'save', conf: conf}).end()
  }

  $('.nav').append(_.map(conf, function (photo, section) {
    return $('<li>').append(
      $('<a>').
        attr('href', '#' + section).
        attr('data-toggle', 'tab').
        tab().
        text(section.charAt(0).toUpperCase() + section.slice(1))
      )
  }))
  $('.tab-content').append(_.map(conf, function (photo, section) {
    return $('<div>').
      attr('id', section).
      addClass('tab-pane').
      css({position: 'fixed', top: 60, right: 5, bottom: 0, left: 5}). //for drop
      on('dragover', false).
      on('drop', function (e) {
        $('.tab-pane.active').append(_.map(e.originalEvent.dataTransfer.files, function (file) {
          return thumb({section: section, file: file})
        }))
        return false
      }).
      append(_.map(photo, function (frontpage, filename) {
        return thumb({section: section, filename: filename})
      }))
  }))
  $('.nav li a:first').tab('show')
  $('.tab-pane').sortable({
    cursor: 'pointer',
    start: function (e, ui) {
      ui.placeholder.css({
        float: 'left',
        width: thumbSize,
        height: thumbSize,
        margin: '20px 0 0 20px',
      })
    },
    update: save
  })
})
