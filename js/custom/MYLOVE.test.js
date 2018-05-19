MYLOVE.test = {
    _autoload: [
    	['initTest', !!$('.test-btn').length]
    ],

    initTest: function() {
        $(document).on('click', '#yes', function() {
        	alert('123456');
        });
    }
};