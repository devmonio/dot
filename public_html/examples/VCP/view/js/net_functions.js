
function callService(isAsync, urlService, nameService, params, method, beforeSend_cb, callback, error_cb){
    $.ajax({
        async: isAsync ,
        url: urlService,
        type: method,
        contentType: 'application/x-www-form-urlencoded',
        data: 'command='+nameService+'&'+params, //id del de arriba
        beforeSend: eval(beforeSend_cb),
        dataType: 'json',
        success: eval(callback),
        timeout: 6000,
        error: eval(error_cb)
    });
    return false;	
}
    
function r_callService(isAsync, urlService, nameService, params, method){
    var urlText = "command="+nameService+"&"+params;
    var response = '';
    $.ajax({
        async: isAsync ,
        url: urlService,
        type: method,
        contentType: 'application/x-www-form-urlencoded',
        data: urlText, 
        beforeSend: function(){
            $('#loadingCallServices').show();
        },
        dataType: 'json',
        success: function(data){
            $('#loadingCallServices').hide();
            response = data;
        },
        timeout: 10000,
        error: function(xhr, textStatus, error){
            console.log(xhr.statusText);
            console.log(textStatus);
            console.log(error);
            response= 'error';
        }
    });
    return response;
}
