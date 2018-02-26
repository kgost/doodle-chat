$(document).ready( function()
    var socket = io();
    $('#send-button').on('click', function(e) {
        e.preventDefault();
        //test-conversation will be replaced with conversation id.
        $.ajax({
            url: '/api/test-conversation',  //TODO: change to conersation id
            method: 'post',
            data: {$('#text-entry-box'.val())}
        }).done(function(data) {
            if (data.message == 'Reply Successful')
                socket.emit('new-message', 'test-conversation') //TODO: change to conersation id
        }).always(function() {
            $('#text-entry-box'.val(''))
        });
    });

//test-conversation will be replaced with conversation id.
    socket.on('refresh', function(message) {
        $.ajax({
            url: '/api/test-conversation', //TODO: change to conersation id
            method: 'get'
        }).done(function(data) {
            if (data.message == 'Reply Successful') {
                $('#message-container').empty();
                for (var i; i < data.obj.length; i++) {
                    $("#message-container").append('<div class="card"> <div class="card-body">' + data.obj[i] + '</div> </div>');
                }
            }
        })
    })
});
