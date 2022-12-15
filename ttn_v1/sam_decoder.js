
// Demo Payload
// "8583011866018201fa41b8cccd8202fa421800008203190292820400"

var offset_temp = 18;
var offset_temp_lenght = 8 + offset_temp;

var offset_humi = 32;
var offset_humi_lenght = 8 + offset_humi;

var offset_c02  = 46;
var offset_c02_lenght  = 4 + offset_c02;

function toHexString(byteArray) {
  var s = '';
  byteArray.forEach(function(byte) {
    s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
  });
  return s;
}

function hex2float(num) {
  var sign = (num & 0x80000000) ? -1 : 1;
  var exponent = ((num >> 23) & 0xff) - 127;
  var mantissa = 1 + ((num & 0x7fffff) / 0x7fffff);
  return sign * mantissa * Math.pow(2, exponent);
}

function hex2dec(hex) {
  return parseInt(hex,16);
}

function Decoder(bytes, port){
  var hex = toHexString(bytes);
  var hex_temp = hex.slice(offset_temp, offset_temp_lenght);
  var hex_humi = hex.slice(offset_humi, offset_humi_lenght);
  var hex_co2  = hex.slice(offset_c02, offset_c02_lenght);

  var float_temp = (hex2float("0x"+hex_temp));
  var float_humi = (hex2float("0x"+hex_humi));
  var dez_co2 = (hex2dec(hex_co2));

  return {"temperature":float_temp, "humidity":float_humi, "co2":dez_co2} ;
}

/* Test Routine 
var result = Decoder([133, 131, 1, 24, 102, 1, 130, 1, 250, 65, 184, 204, 205, 130, 2, 250, 66, 24, 0, 0, 130, 3, 25, 2, 146, 130, 4, 0], null);
console.log(result);
*/