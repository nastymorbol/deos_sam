/*
  TIP SINUS LoRaWAN simple payload decoder.
  ChirpStack V4 
  Use it as it is or remove the bugs :)
  https://www.tip-meter.de/index.php/themen/sinus-lora-lorawan

  https://www.deos-ag.com/de/
  s.schulze@deos-ag.com
*/

function pad2(num) {
    num = num.toString();
    while (num.length < 2) num = "0" + num;
    return num;
}

const modbus_register = [
    { index: 1, type: "ULI", fkt: "1.0", key: "T1_active_energy_import", name: "T1 Wirk Energie Zähler Gesamt Bezug (Import)", unit: "1kWh/1Wh" },
    { index: 2, type: "ULI", fkt: "1.0", key: "T1_active_energy_export", name: "T1 Wirk Energie Zähler Gesamt Lieferung (Exp.)", unit: "1kWh/1Wh" },
    { index: 3, type: "ULI", fkt: "1.0", key: "T1_reactive_energy_import", name: "T1 Blind Energie Zähler Gesamt Bezug (Import)", unit: "1kWh/1Wh" },
    { index: 4, type: "ULI", fkt: "1.0", key: "T1_reactive_energy_export", name: "T1 Blind Energie Zähler Gesamt Lieferung (Exp.)", unit: "1kWh/1Wh" },
    { index: 5, type: "ULI", fkt: "1.0", key: "T2_active_energy_import", name: "T2 Wirk Energie Zähler Gesamt Bezug (Import)", unit: "1kWh/1Wh" },
    { index: 6, type: "ULI", fkt: "1.0", key: "T2_energy_export", name: "T2 Wirk Energie Zähler Gesamt Lieferung (Exp.)", unit: "1kWh/1Wh" },
    { index: 7, type: "ULI", fkt: "1.0", key: "T2_reactive_energy_import", name: "T2 Blind Energie Zähler Gesamt Bezug (Import)", unit: "1kWh/1Wh" },
    { index: 8, type: "ULI", fkt: "1.0", key: "T2_reactive_energy_export", name: "T2 Blind Energie Zähler Gesamt Lieferung (Exp.)", unit: "1kWh/1Wh" },
    { index: 9, type: "SLI", fkt: "0.001", key: "active_power", name: "Wirkleistung gesamt", unit: "1mW / 1,0W" },
    { index: 10, type: "SLI", fkt: "0.001", key: "reactive_power", name: "Blindleistung gesamt", unit: "1mW / 1,0VAr" },
    { index: 11, type: "SLI", fkt: "0.001", key: "apparent_power", name: "Scheinleistung gesamt", unit: "1mW / 1,0VA" },
    { index: 12, type: "ULI", fkt: "0.001", key: "frequency", name: "Frequenz", unit: "10mHz / 1,0Hz" },
    { index: 13, type: "SLI", fkt: "0.01", key: "cos_phi", name: "cos phi gesamt", unit: "0,01 / 1,0" },
    { index: 14, type: "ULI", fkt: "1.0", key: "T1_active_energy_import_frac", name: "T1 Wirk Energie Zähler Import", unit: "1Wh" },
    { index: 15, type: "SLI", fkt: "0.001", key: "active_power_l1", name: "Wirkleistung L1", unit: "1mW / 1,0W" },
    { index: 16, type: "SLI", fkt: "0.001", key: "reactive_power_l1", name: "Blindleistung L1", unit: "1mVAr/1,0VAr" },
    { index: 17, type: "SLI", fkt: "0.001", key: "apparent_power_l1", name: "Scheinleistung L1", unit: "1mVA / 1,0VA" },
    { index: 18, type: "ULI", fkt: "0.001", key: "voltage_l1", name: "Spannung L1_RMS", unit: "1mV / 1,0V" },
    { index: 19, type: "ULI", fkt: "0.001", key: "current_l1", name: "Strom L1_RMS", unit: "1mA / 1,0A" },
    { index: 20, type: "SLI", fkt: "0.001", key: "cos_phi_l1", name: "cos phi L1", unit: "0,01 / 1,0" },
    { index: 21, type: "ULI", fkt: "1.0", key: "T1_active_energy_export_frac", name: "T1 Wirk Energie Zähler Export", unit: "1Wh" },
    { index: 22, type: "ULI", fkt: "1.0", key: "T1_reactive_energy_import_frac", name: "T1 Blind Energie Zähler Import", unit: "1Wh" },
    { index: 23, type: "SLI", fkt: "0.001", key: "active_power_l2", name: "Wirkleistung L2", unit: "1mW / 1,0W" },
    { index: 24, type: "SLI", fkt: "0.001", key: "reactive_power_l2", name: "Blindleistung L2", unit: "1mVAr / 1,0VAr" },
    { index: 25, type: "SLI", fkt: "0.001", key: "apparent_power_l2", name: "Scheinleistung L2", unit: "1mVA / 1,0VA" },
    { index: 26, type: "ULI", fkt: "0.001", key: "voltage_l2", name: "Spannung L2_RMS", unit: "1mV / 1,0V" },
    { index: 27, type: "ULI", fkt: "0.001", key: "current_l2", name: "Strom L2_RMS", unit: "1mA / 1,0A" },
    { index: 28, type: "SLI", fkt: "0.001", key: "cos_phi_l2", name: "cos phi L2", unit: "0,01 / 1,0" },
    { index: 29, type: "ULI", fkt: "1.0", key: "T1_reactive_energy_export_frac", name: "T1 Blind Energie Zähler Export", unit: "1Wh" },
    { index: 30, type: "ULI", fkt: "1.0", key: "T2_active_energy_import_frac", name: "T2 Wirk Energie Zähler Import", unit: "1Wh" },
    { index: 31, type: "SLI", fkt: "0.001", key: "active_power_l3", name: "Wirkleistung L3", unit: "1mW / 1,0W" },
    { index: 32, type: "SLI", fkt: "0.001", key: "reactive_power_l3", name: "Blindleistung L3", unit: "1mVAr/ 1,0VAr" },
    { index: 33, type: "SLI", fkt: "0.001", key: "apparent_power_l3", name: "Scheinleistung L3", unit: "1mVA / 1,0VA" },
    { index: 34, type: "ULI", fkt: "0.001", key: "voltage_l3", name: "Spannung L3_RMS", unit: "1mV / 1,0V" },
    { index: 35, type: "ULI", fkt: "0.001", key: "current_l3", name: "Strom L3_RMS", unit: "1mA / 1,0A" },
    { index: 36, type: "SLI", fkt: "0.001", key: "cos_phi_l3", name: "cos phi L3", unit: "0,01 / 1,0" },
    { index: 37, type: "ULI", fkt: "1.0", key: "T2_energy_export_frac", name: "T2 Wirk Energie Zähler Export", unit: "1Wh" },
    { index: 38, type: "ULI", fkt: "1.0", key: "T2_reactive_energy_import_frac", name: "T2 Blind Energie Zähler Import", unit: "1Wh" },
    { index: 39, type: "ULI", fkt: "1.0", key: "T2_reactive_energy_export_frac", name: "T2 Blind Energie Zähler Export", unit: "1Wh" },
]

const modbus_exceptions = [
    { code: 0x0c, description: "Modbus response doesn't fit in a LoraPacket (max size 51byte)" },
    { code: 0x0d, description: "Unknown or invalid Modbus response" }
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
        type: 'not_supported'
    };
    const buffer = input.bytes;
    const fPort = input.fPort;


    // check minimal buffer length
    if (buffer.length < 3) {
        decoded.error = "Buffer length too small. Minimum length = 3. Current length = " + buffer.length;
        return {
            data: decoded
        };
    }

    const fCtrl = buffer[offset++];
    const cmdId = buffer[offset++];


    // read register response
    if (fPort == 2) {

        switch (cmdId) {
            case 3: decoded.type = 'holding_register'; break;
            case 4: decoded.type = 'input_register'; break;
            case 0x10: decoded.type = 'write_holding_register'; break;
            case 0x81: decoded.type = 'exception'; break;
            default:
                decoded.type = 'unknown_status';
                break;
        }

        if (cmdId > 0x80) {
            decoded.error_code = buffer[offset];            
            decoded.error = modbus_exceptions.find(e => e.code == decoded.error_code).description ?? "Unknown error code";
            return {
                data: decoded
            };
        }

        decoded.address = fCtrl;
        decoded.count = buffer[offset++];
        decoded.buffer = [];
        decoded.int16 = [];
        decoded.int32 = [];
        for (; offset < buffer.length - 2; offset++) {
            decoded.buffer.push(buffer[offset]);
            if ((offset - 1) % 2 == 0) {
                decoded.int16.push((buffer[offset] << 8) | (buffer[offset + 1] & 0x00FF));
            }
            if (offset == 3 || (offset - 3) % 4 == 0 && offset + 4 < buffer.length - 2) {
                decoded.int32.push((buffer[offset + 0] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | (buffer[offset + 3] << 0));
            }
        }
        decoded.crc = (buffer[offset++] << 8) | buffer[offset];
        decoded.xCrc = '0x' + decoded.crc.toString("16");
    }


    // check for command ack signal
    if (buffer.length === 3) {
        const state = buffer[offset++];

        if (state == 0x00) {
            decoded.type = "response";
            switch (cmdId) {
                case 1: decoded.result = "OK Downlink interval changed"; break;
                case 2: decoded.result = "OK Downlink register changed"; break;
                case 3: decoded.result = "OK Downlink mode changed"; break;
                case 4: decoded.result = "OK rejoin activated"; break;
                default:
                    decoded.result = "OK FCtrl: " + fCtrl + " CmdID: " + cmdId;
                    break;
            }

        }
        else if (state == 80) {
            decoded.type = "error";
            decoded.error = "FCtrl (" + fCtrl + ") not supported";
        }
        else if (state == 81) {
            decoded.type = "error";
            decoded.error = "CmdID (" + cmdId + ") not supported";
        }
        else if (state == 82) {
            decoded.type = "error";
            decoded.error = "Download packet size doesn't fit in 4 bytes";
        }
        else {
            decoded.type = "error";
            decoded.error = "FCtrl: " + fCtrl + " CmdID: " + cmdId + " State: " + state;
        }

    }
    // check for periodic signal
    else if (fCtrl == 0x0a) {
        decoded.type = 'telemetry';
        // get the register in the telegram
        decoded.registerCount = cmdId;

        var registers = [];

        for (; offset < decoded.registerCount; offset++) {
            if (!buffer[offset])
                continue;

            var element = modbus_register.find(e => e.index == buffer[offset]);
            if (!element)
                element = { register: buffer[offset] };
            registers.push(element);
        }

        decoded.serial = buffer[offset++].toString("16").padStart(2, '0')
            + buffer[offset++].toString("16").padStart(2, '0')
            + buffer[offset++].toString("16").padStart(2, '0')
            + buffer[offset++].toString("16").padStart(2, '0');

        decoded.time = buffer[offset++].toString("10").padStart(2, '0') + ":"
            + buffer[offset++].toString("10").padStart(2, '0') + ":"
            + buffer[offset++].toString("10").padStart(2, '0');

        var array = new ArrayBuffer(buffer.length);
        for (let index = 0; index < buffer.length; index++) {
            array[index] = buffer[index];
        }

        // first register value
        for (let index = 0; index < registers.length; index++) {
            const register = registers[index];
            var value = (buffer[offset++] << 24) +
                (buffer[offset++] << 16) +
                (buffer[offset++] << 8) +
                (buffer[offset++] << 0);

            if (register.type == "ULI") {
                value = value >>> 0;
            }
            if (register.fkt) {
                register.value = value * register.fkt;
            }
            else {
                register.value = value;
            }
        }

        // cleanup / merge register
        for (let index = 0; index < registers.length; index++) {
            const register = registers[index];

            const fractionKey = register.key + "_frac";
            const fractionReg = registers.find(e => e.key == fractionKey);

            if (fractionReg) {
                // decimal value found
                register.value += (fractionReg.value / 1000.0);
                registers = registers.filter(e => e.key != fractionKey);
                index--;
            }
        }

        decoded['registers'] = [];
        for (let index = 0; index < registers.length; index++) {
            const register = registers[index];

            decoded[register.key] = register.value;
            decoded['registers'].push(register);
        }
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

    if (encoded.type === 'confirmed') {
        return {
            bytes: [01, 03, 01]
        };
    }
    if (encoded.type === 'unconfirmed') {
        return {
            bytes: [01, 03, 00]
        };
    }
    if (encoded.type === 'rejoin') {
        return {
            bytes: [01, 04, 01]
        };
    }
    if (encoded.type === 'periode') {

        if (encoded.interval) {
            var interval = encoded.interval ?? 60;
            var buffer = [
                01,
                01,
                ((interval & 0xFF00) >> 8),
                ((interval & 0x00FF) >> 0)
            ];
            return {
                bytes: buffer
            };
        }
        if (encoded.register) {
            var buffer = [01, 02];
            for (var i = 0; i < encoded.register.length; i++) {
                buffer.push(encoded.register[i]);
            }
            return {
                bytes: buffer
            };
        }
    }

    if (typeof encoded.start !== 'undefined' && typeof encoded.count !== 'undefined') {
        if (encoded.count == 0) {
            return { bytes: [] };
        }
        if (encoded.type === 'holding_register') {
            return {
                bytes: [
                    01, 03,
                    ((encoded.start & 0xFF00) >> 8), ((encoded.start & 0x00FF) >> 0),
                    ((encoded.count & 0xFF00) >> 8), ((encoded.count & 0x00FF) >> 0)
                ]
            };
        }
        if (encoded.type === 'input_register') {
            return {
                bytes: [
                    01, 04,
                    ((encoded.start & 0xFF00) >> 8), ((encoded.start & 0x00FF) >> 0),
                    ((encoded.count & 0xFF00) >> 8), ((encoded.count & 0x00FF) >> 0)
                ]
            };
        }
    }

    return { bytes: [] };
}

//############################## Test Commands ##############################
/*

var json = {
    type: 'rejoin',
    intervalx: 622,
    registerx: [
        18, 12, 5
    ]
};

json = {
    type: 'holding_register',
    start: 10,
    count: 2
};

json = {
    type: "input_register",
    start: 0,
    count: 16
};
console.log(JSON.stringify(json));

json = {
    type: 'periode',
    register: [
        9, 10, 11, 18, 19
    ]
};

json = {
    type: 'unconfirmed'
};

json = {
    type: 'confirmed'
};

console.log( JSON.stringify(json) );
console.log(
    encodeDownlink(
    {
        variables: {},
        data: json
    }
))


console.log(encodeDownlink({
    variables: {},
    data: {
        type: 'periode',
        register: [
            18, 12, 5
        ]
    }
}))
    
console.log(decodeUplink({
    fPort: 2,
    bytes: [01, 04, 04, 00, 03, 0x87, 0xE3, 00, 03, 0x87, 0xE3, 00, 03, 0x29, 0xFD]
}));


console.log(decodeUplink({
    bytes: [10, 6, 1, 14, 5, 30, 0, 25, 83, 32, 10, 59,
    0, 0, 0, 0,
    20, 0, 0, 3,
    151, 0, 0, 0,
    0, 0, 0, 0, 0]
    }));

function parseHexString(str) { 
    var result = [];
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }

    return result;
}

console.log(decodeUplink({
    bytes: parseHexString("0a07090a0b12130019532009040000004578fffffd200000458700037d1c0000004d")
    }));

    const modbus_exceptions = [
        { code: 1, name: 'Illegal Function', description: 'The function code received in the query is not an allowable action for the slave.  This may be because the function code is only applicable to newer devices, and was not implemented in the unit selected.  It could also indicate that the slave is in the wrong state to process a request of this type, for example because it is unconfigured and is being asked to return register values. If a Poll Program Complete command was issued, this code indicates that no program function preceded it.' },
        { code: 2, name: 'Illegal Data Address', description: 'The data address received in the query is not an allowable address for the slave. More specifically, the combination of reference number and transfer length is invalid. For a controller with 100 registers, a request with offset 96 and length 4 would succeed, a request with offset 96 and length 5 will generate exception 02.' },
        { code: 3, name: 'Illegal Data Value', description: 'A value contained in the query data field is not an allowable value for the slave.  This indicates a fault in the structure of remainder of a complex request, such as that the implied length is incorrect. It specifically does NOT mean that a data item submitted for storage in a register has a value outside the expectation of the application program, since the MODBUS protocol is unaware of the significance of any particular value of any particular register.' },
        { code: 4, name: 'Slave Device Failure', description: 'An unrecoverable error occurred while the slave was attempting to perform the requested action.' },
        { code: 5, name: 'Acknowledge', description: 'Specialized use in conjunction with programming commands.' },
        { code: 6, name: 'Slave Device Busy', description: 'Specialized use in conjunction with programming commands.' },
        { code: 7, name: 'Negative Acknowledge', description: 'The slave cannot perform the program function received in the query. This code is returned for an unsuccessful programming request using function code 13 or 14 decimal. The master should request diagnostic or error information from the slave.' },
        { code: 8, name: 'Memory Parity Error', description: 'Specialized use in conjunction with function codes 20 and 21 and reference type 6, to indicate that the extended file area failed to pass a consistency check. ' },
        { code: 10, name: 'Gateway Path Unavailable', description: 'Specialized use in conjunction with gateways, indicates that the gateway was unable to allocate an internal communication path from the input port to the output port for processing the request. Usually means the gateway is misconfigured or overloaded.' },
        { code: 11, name: 'Gateway Target Device Failed to Respond', description: 'Specialized use in conjunction with gateways, indicates that no response was obtained from the target device. Usually means that the device is not present on the network.' }
    ]
*/
