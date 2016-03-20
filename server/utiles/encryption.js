/**
 * Created by alexeykastyuk on 3/19/16.
 */
var crypt = require("crypto-js/md5");

var encrypt = function(str){

	return crypt(str).toString();

}
module.exports = encrypt;