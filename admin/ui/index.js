var _ = window._
var superagent = window.superagent
var config = window.config
var thumbSize = 56
var opacity = .8

$(function () {
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
  function thumb (d) {
    function render (update) {
      _.extend(d, update)
      box.empty().off().stop(true).
        addClass('thumb').
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
      if (d.file && !d.photo) {
        superagent.post('/admin/add').field({type: 'photo', sectionId: d.section.id}).attach('file', d.file).end(function (err, res) {
          if (res.body && res.body.id)
            return render({photo: res.body})
          box.remove()
        })
        return box.css({opacity: 1}).effect('pulsate', {times: 10000}, 10000 * 1000)
      }
      return box.
        attr({'data-id': d.photo.id}).
        css({
          'background-image': 'url(/photos/' + d.section.name + '/thumbs/' + d.photo.filename + ')',
          opacity: opacity
        }).
        on('click', function () {
          modal({
            body: $('<img>').attr('src', '/photos/' +  d.section.name + '/slides/' + d.photo.filename).css({display: 'block', margin: '0 auto'}),
            footer: [
              $('<div>').addClass('form-check').css({'margin-right': 'auto'}).append(
                $('<input>').
                  attr({type: 'checkbox', id: 'frontpage'}).
                  addClass('form-check-input').
                  prop('checked', d.photo.frontpage).
                  change(function () {
                    superagent.post('/admin/update').send({type: 'photo', id: d.photo.id, frontpage:+$(this).is(':checked')}).end((err, res) => {
                      d.photo.frontpage = res.body.frontpage
                    })
                  }),
                $('<label>').attr({for: 'frontpage'}).text('Show on frontpage')
              ),
              $('<button>').addClass('btn btn-danger').text('Delete').click(function () {
                box.fadeOut(function() {
                  box.remove()
                })
                superagent.post('/admin/delete').send({type: 'photo', id: d.photo.id}).end(() => {
                  d.section.photo.splice(d.section.photo.indexOf(d.photo), 1)
                })
                $(this).closest('.modal').modal('hide')
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

  _.each(config.section, section => {
    section.photo = _.where(config.photo, {sectionId: section.id})
  })

  $('body').css({padding: 15}).append(
    $('<ul>').addClass('nav nav-pills').
      append(_.map(config.section, function (section) {
        return $('<li>').append(
          $('<a>').
            attr({href: '#' + section.name, 'data-bs-toggle': 'tab'}).
            addClass('nav-link').
            text(section.name.charAt(0).toUpperCase() + section.name.slice(1)).
            tab()
          )
      })),
    $('<div>').addClass('tab-content').
      append(_.map(config.section, function (section) {
        return $('<div>').
          attr('id', section.name).
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
            update: function (e, ui) {
              superagent.post('/admin/update').send({type: 'photo', id: ui.item.attr('data-id'), position: ui.item.index() + 1}).end()
            }
          }).
          append(_.map(section.photo, function (photo) {
            return thumb({section: section, photo: photo})
          }))
      }))
  )
  $('.nav li:first a').tab('show')
})
