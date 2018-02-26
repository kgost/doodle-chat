$(document).ready( function()
    var socket = io();
    $('#send-button').on('click', function(e) {
        e.preventDefault();
        //test-conversation will be replaced with conversation id.
        $.ajax({
            url: '/api/test-conversation',
            method: 'post',
            data: {$('#text-entry-box'.val())}
        }).done(function(data) {
            if (data.message == 'Reply Successful')
            socket.emit('new-message', 'test-conversation')
        }).always(function() {
            $('#text-entry-box'.val(''))
        });
    });
});
