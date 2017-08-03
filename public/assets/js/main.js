$(function() {
    $('#commit_tts').click(function() {
        $('#commit_tts').text('转换中……').removeClass('btn-primary').addClass('btn-warning');
        $('#download_link').attr('href', '#').css('display', 'none');
        $('#play_tts').attr('src', '#').css('display', 'none');
        var text = $('#textarea_tts').val();
        if (text && text.length > 0) {
            $.get('/tts?t=' + text, function(data, status) {
                $('#commit_tts').text('转换').removeClass('btn-warning').addClass('btn-primary');
                if (status == 'success') {
                    console.log(data.toString('utf8'));
                    $('#play_tts').attr('src', 'tmp/' + data).css('display', 'initial');
                    $('#download_link').attr('href', 'tmp/' + data).css('display', 'initial');
                } else {
                    console.error(status);
                    $('#play_tts').attr('src', '#').css('display', 'none');
                    $('#download_link').text(status).attr('href', '#').css({ 'display': 'initial' });
                }
            });
        }
    });
});