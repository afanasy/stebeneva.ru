var _ = window._
var superagent = window.superagent
var conf = window.conf
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
          modal({
            body: $('<img>').attr('src', '/photos/' + d.section + '/slides/' + d.filename),
            footer: [
              $('<div>').addClass('form-check').css({'margin-right': 'auto'}).append(
                $('<input>').
                  attr({type: 'checkbox', id: 'frontpage'}).
                  addClass('form-check-input').
                  prop('checked', conf[d.section][d.filename]).
                  change(function () {
                    conf[d.section][d.filename] = $(this).is(':checked')
                    superagent.post('/admin').send({action: 'update', section: d.section, file: d.filename, frontpage: +conf[d.section][d.filename]}).end()
                  }),
                $('<label>').attr({for: 'frontpage'}).text('Show on frontpage')
              ),
              $('<button>').addClass('btn btn-danger').text('Delete').click(function () {
                $(this).closest('.modal').modal('hide')
                box.fadeOut(function() {
                  box.remove()
                })
                delete conf[d.section][d.filename]
                superagent.post('/admin').send({action: 'delete', section: d.section, filename: d.filename}).end()
                return false
              })
            ]
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

  function modal (d) {
    $('<div>').addClass('modal fade').append(
      $('<div>').addClass('modal-dialog modal-lg').append(
        $('<div>').addClass('modal-content').append(
          $('<div>').addClass('modal-header').append(
            $('<h5>').addClass('modal-title').append(d.title),
            $('<button>').attr({'data-bs-dismiss': 'modal'}).addClass('btn-close')
          ),
          $('<div>').addClass('modal-body').append(d.body),
          $('<div>').addClass('modal-footer').append(d.footer)
        )
      )
    ).
    modal('show')
  }

  $('body').append(
    $('<ul>').addClass('nav nav-pills').
      append(_.map(conf, function (photo, section) {
        return $('<li>').append(
          $('<a>').
            attr({href: '#' + section, 'data-bs-toggle': 'tab'}).
            addClass('nav-link').
            text(section.charAt(0).toUpperCase() + section.slice(1)).
            tab()
          )
      })),
    $('<div>').addClass('tab-content').
      append(_.map(conf, function (photo, section) {
        return $('<div>').
          attr('id', section).
          addClass('tab-pane fade').
          css({position: 'fixed', top: 60, right: 5, bottom: 0, left: 5}). //for drop
          on('dragover', false).
          on('drop', function (e) {
            $(this).append(_.map(e.originalEvent.dataTransfer.files, function (file) {
              return thumb({section: section, file: file})
            }))
            return false
          }).
          sortable({
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
          }).
          append(_.map(photo, function (frontpage, filename) {
            return thumb({section: section, filename: filename})
          }))
      }))
  )
  $('.nav li:first a').tab('show')
})
