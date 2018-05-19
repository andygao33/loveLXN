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
