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
function _autoload(){
	$.each(MYLOVE,function(section,obj){
		if($.isArray(obj._autoload)){
			$.each(obj._autoload,function(key,value){
				if($.isArray(value)){
					if(value[1]){
						MYLOVE[section][value[0]]();
					}else{
						if(value[2]){
							MYLOVE[section][value[2]]()
						}
					}
				}else{
					MYLOVE[section][value]();
				}
			})
		}
	})
}

$(function(){
	_autoload();
});
