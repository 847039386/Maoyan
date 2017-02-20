function a(callback){
    callback(1,2)
}




a(function(b,c){
    console.log("你号"+c)
})