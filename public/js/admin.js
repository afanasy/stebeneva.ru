$(function() {
  showSlide = function(e) {
    var section = $('.tab-pane.active').attr('id')
    var file = $(this).attr('file')
    if(!file)
      return true
    $('#slide')
      .attr('file', $(this).attr('file'))
      .find('img').attr('src', '/photos/' + section + '/slides/' + file).end()
      .find('input').prop('checked', conf[section][file]).end()
      .modal('show')
  }

  render = function(section, slide, thumb) {
    if(!section)
      section = thumb.parents('.tab-pane').attr('id')
    if(!thumb)
      thumb = $('<div>').addClass('thumb').append($('<img>')).on('click', showSlide).appendTo('#' + section)
    if(slide) {
      thumb
        .stop(true)
        .css('opacity', 1)
        .attr('file', slide)
        .find('img').attr('src', '/photos/' + section + '/thumbs/' + slide).end()
      if(!conf[section][slide])
        conf[section][slide] = false
    }
    else
      thumb.effect('pulsate', {times: 10000}, 1000)
    return thumb
  }

  save = function() {
    var section = $('.tab-pane.active').attr('id')
    var slides = {}
    $('.tab-pane.active .thumb').each(function(index, element) {
      var file = $(element).attr('file')
      slides[file] = conf[section][file]
    })
    conf[section] = slides
    $.post('/admin', {action: 'save', conf: JSON.stringify(conf, null, 2)})
  }

  $('.slides').on('dragover', false).on('drop', function(e) {
    var section = $('.tab-pane.active').attr('id')
    for(var i = 0, f; f = e.dataTransfer.files[i]; i++) {
      var formData = new FormData()
      formData.append('file', f)
      formData.append('section', section)
      var thumb = render(section)
      $.ajax({
        'type': 'POST',
        'url': '/admin',
        'contentType': false,
        'data': formData,
        'processData': false,
        'success': function(thumb) {return function(data) {
          if (data.file) {
            render(null, data.file, thumb)
            save()
          }
          else
            thumb.remove()
        }}(thumb)
      })
    }
    return false
  })

  $('#slide input').on('change', function(e) {
    var section = $('.tab-pane.active').attr('id')
    var file = $('#slide').attr('file')
    conf[section][file] = $(this).is(':checked')
    save()
  })

  $('.delete').on('click', function(e) {
    var section = $('.tab-pane.active').attr('id')
    var file = $('#slide').attr('file')
    $('#slide').modal('hide')
    $('.tab-pane#' + section + ' .thumb[file="' + file + '"]').fadeOut(function() {$(this).remove()})
    $.post('/admin', {action: 'delete', section: section, file: file})
    delete conf[section][file]
    save()
  })

  for (var section in conf) {
    var title = section.charAt(0).toUpperCase() + section.slice(1)
    var a = $('<a>')
      .attr('href', '#' + section)
      .attr('data-toggle', 'tab')
      .text(title)
    $('<li>').append(a).appendTo('.nav')
    var pane = $('<div>')
      .addClass('tab-pane')
      .attr('id', section)
      .appendTo('.tab-content')
    for(var slide in conf[section]) {
      render(section, slide)
    }
    a.tab()
  }

  $('.nav li a:first').tab('show')

  $('.tab-pane').sortable({update: save})
})
