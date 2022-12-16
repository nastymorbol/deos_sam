/*
  Thermokon NOVA-3
  ChirpStack V4 
  Use it as it is or remove the bugs :)
  

  https://www.deos-ag.com/de/
  s.schulze@deos-ag.com
*/

const records = [
    { id: 0x10, type: "SI", fkt: "0.1", key: "temperature", unit: "°C" },
    { id: 0x11, type: "SI8", fkt: "1.0", key: "humidity", unit: "%rH" },
    { id: 0x12, type: "UI", fkt: "1.0", key: "co2", unit: "ppm" },
    { id: 0x13, type: "UI", fkt: "1.0", key: "voc", unit: "%" },
    { id: 0x30, type: "UI", fkt: "1.0", key: "abs_pressure" },
    { id: 0x31, type: "SI", fkt: "1.0", key: "dif_pressure" },
    { id: 0x32, type: "UI", fkt: "1.0", key: "flow", unit: "cbm/h" },
    { id: 0x40, type: "UI", fkt: "1.0", key: "illuminance", unit: "lux" },
    { id: 0x41, type: "UI8", key: "occupancy" },
    { id: 0x50, type: "UI8", key: "reed_contact_1" },
    { id: 0x51, type: "SI", key: "leakage" },
    { id: 0x54, type: "SI8", fkt: "20.0", key: "battery", unit: "mV" },
    { id: 0x63, type: "UI8", fkt: "1.0", key: "poti", unit: "%", 
        calculate: function(variables, value, decoded) {

            decoded.poti = value;
            if(typeof variables === 'undefined') { return; }

            let y1 = Number(variables["poti_min"]);
            let y2 = Number(variables["poti_max"]);

            if( Number.isNaN(y1) ) { return; }
            if( Number.isNaN(y2) ) { return; }
            let x1 = 0;
            let x2 = 100;

            decoded.poti_min = y1;
            decoded.poti_max = y2;
            decoded.poti_raw = value;
            decoded.poti = ( value - x1 ) * ( y2 - y1 ) / ( x2 - x1 ) + y1;
        }  
    },
    // Configuration datasets
    { id: 0x84, type: "UI8", key: "config" },
    { id: 0xC0, type: "UI8", key: "config" },
    { id: 0xC1, type: "UI8", key: "config" },
    { id: 0xC2, type: "UI8", key: "config" },
    //{ id: 0x9500, type: "UI8", key: "reed_contact_2" }
]


// Decode uplink function.
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - data = Object representing the decoded payload.
function decodeUplink(input) {

    var offset = 0;
    var decoded = {
        type: 'telemetry'
    };
    const buffer = input.bytes;
    const fPort = input.fPort;

    // check minimal buffer length
    if (buffer.length < 2) {
        decoded.error = "Buffer length too small. Minimum length = 3. Current length = " + buffer.length;
        return { data: decoded };
    }

    for (; offset < buffer.length;) {
        const id = buffer[offset++];
        let record = records.find(r => r.id == id);
        if(typeof record === 'undefined')
        {
            decoded['id_' + id] = 'unsupported';
            continue;
        }

        var value = undefined;
        switch (record.type) {
            case 'SI' : value = ((buffer[offset++]<<8) | (buffer[offset++]<<0));
                break;
            case 'SI8': value = (buffer[offset++]<<0);
                break;
            case 'UI' : value = ((buffer[offset++]<<8) | (buffer[offset++]<<0)) >>> 0 ;
                break;
            case 'UI8': value = (buffer[offset++]<<0) >>> 0;
                break;
            default:
                break;
        }

        // decode occupancy
        if(id == 0x41)
        {
            decoded[record.key] = value & 1;
            decoded[record.key + "_count"] = (value & 0xFE) >> 1;
            continue;
        }

        if(typeof record.fkt !== 'undefined')
        {
            value = value * record.fkt;
        }

        if(typeof record.calculate !== 'undefined')
        {
            record.calculate(input.variables, value, decoded);
            continue;
        }


        if(record.key === 'config')
        {
            var key = undefined;
            let id = value;
            if(record.id === 0xC0)
            {
                value = ((buffer[offset++]<<8) | (buffer[offset++]<<0)) >>> 0;
                // Device Type
                if(id === 0x00)
                {
                    key = 'device_type';
                    if(value == 0x4001)
                    {
                        value = '0x' + value.toString(16) + ' (MCS LRW)';
                    }
                    if(value == 0x4002)
                    {
                        value = '0x' + value.toString(16) + ' (PTD CO2)';
                    }
                }
            }

            decoded[key] = value;
            continue;
        }

        decoded[record.key] = value;
    }    
    
    return {
        data: decoded
    };
}

// Encode downlink function.
//
// Input is an object with the following fields:
// - data = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.
function encodeDownlink(input) {

    const encoded = input.data;

    return { bytes: [] };
}

//############################## Test Commands ##############################
/*

var json = {
    type: 'rejoin',
    interval: 622,
    register: [
        18, 12, 5
    ]
};


console.log(JSON.stringify(json));

console.log(encodeDownlink({
    variables: {},
    data: json
}))
*/

function parseHexString(str) { 
    var result = [];
    while(str.indexOf(' ') > -1 )
        str = str.replace(' ', '');
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }

    return result;
}

var decoded = decodeUplink({
    bytes: parseHexString("5450 1000e7 1120 12035e 6337"),
    variables: { 
        poti_min: '18',
        poti_max: '24'
    }
});

console.log(decoded);


decoded = decodeUplink({
    bytes: parseHexString("6364")
    });
    
console.log(decoded);

decoded = decodeUplink({
    bytes: parseHexString("c00040024100")

    });
    
console.log(decoded);

