var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var schema=new Schema({
    phone_number:{type:String,required:true},
    session_id:{type:String,required:true,unique:true}
});

module.exports= mongoose.model('MobileAuthSessions',schema);