
/**
 * EEPROM Base Code
 */
namespace EEPROM {

    let CAT24_I2C_BASE_ADDR = 0x54  // This is A16 = 0, setting A16 = 1 will change address to 0x55

    // Write a single byte to a specified address
    export function writeByte(data: any, addr: number): void {
        if (addr < 0) {
            addr = 0
        }
        if (addr > 131071) {
            addr = 131071
        }

        let buf = pins.createBuffer(3);                             // Create buffer for holding addresses & data to write
        let i2cAddr = 0

        if ((addr >> 16) == 0) {                                    // Select the required address (A16 as 0 or 1)
            i2cAddr = CAT24_I2C_BASE_ADDR                           // A16 = 0
        }
        else {
            i2cAddr = CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
        }

        buf[0] = (addr >> 8) & 0xFF                                 // Memory location bits a15 - a8
        buf[1] = addr & 0xFF                                        // Memory location bits a7 - a0
        buf[2] = data                                               // Store the data in the buffer
        pins.i2cWriteBuffer(i2cAddr, buf, false)                    // Write the data to the correct address
    }

    // Page Write
    export function writePage(data: string, page: number): void {
        if (page < 12) {
            page = 12
        }
        if (page > 511) {
            page = 511
        }
        let dataLength = data.length
        let buf = pins.createBuffer(dataLength + 2);                  // Create buffer for holding addresses & data to write
        let i2cAddr = 0
        let startAddr = page * 256

        if ((startAddr >> 16) == 0) {                               // Select the required address (A16 as 0 or 1)
            i2cAddr = CAT24_I2C_BASE_ADDR                           // A16 = 0
        }
        else {
            i2cAddr = CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
        }

        buf[0] = (startAddr >> 8) & 0xFF                            // Memory location bits a15 - a8
        buf[1] = startAddr & 0xFF                                   // Memory location bits a7 - a0

        for (let i = 0; i < dataLength; i++) {
            let ascii = data.charCodeAt(i)
            buf[i + 2] = ascii                                        // Store the data in the buffer
        }

        pins.i2cWriteBuffer(i2cAddr, buf, false)                    // Write the data to the correct address
    }

    // Split the EEPROM pages in half to make 128 byte blocks
    // Write a data entry to a single block
    export function writeBlock(data: string, block: number): void {
        let dataLength = data.length
        let buf = pins.createBuffer(dataLength + 2);                  // Create buffer for holding addresses & data to write
        let i2cAddr = 0
        let startAddr = block * 128

        if ((startAddr >> 16) == 0) {                               // Select the required address (A16 as 0 or 1)
            i2cAddr = CAT24_I2C_BASE_ADDR                           // A16 = 0
        }
        else {
            i2cAddr = CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
        }

        buf[0] = (startAddr >> 8) & 0xFF                            // Memory location bits a15 - a8
        buf[1] = startAddr & 0xFF                                   // Memory location bits a7 - a0

        for (let i = 0; i < dataLength; i++) {
            let ascii = data.charCodeAt(i)
            buf[i + 2] = ascii                                        // Store the data in the buffer
        }

        pins.i2cWriteBuffer(i2cAddr, buf, false)                    // Write the data to the correct address
    }

    // Read a data entry from a single block
    export function readBlock(block: number): string {
        let startAddr = block * 128
        let byte = 0
        let entry = ""

        for (byte = 0; byte < 127; byte++) {
            entry = entry + String.fromCharCode(readByte(startAddr + byte))
        }

        return entry
    }

    // Read a single byte from a specified address
    export function readByte(addr: number): number {
        if (addr < 0) {
            addr = 0
        }
        if (addr > 131071) {
            addr = 131071
        }

        let writeBuf = pins.createBuffer(2)                         // Create a buffer for holding addresses
        let readBuf = pins.createBuffer(1)                          // Create a buffer for storing read data
        let i2cAddr = 0

        if ((addr >> 16) == 0) {                                    // Select the required address (A16 as 0 or 1)
            i2cAddr = CAT24_I2C_BASE_ADDR                           // A16 = 0
        }
        else {
            i2cAddr = CAT24_I2C_BASE_ADDR + 1                       // A16 = 1
        }

        writeBuf[0] = (addr >> 8) & 0xFF                            // Memory location bits a15 - a8
        writeBuf[1] = addr & 0xFF                                   // Memory location bits a7 - a0
        pins.i2cWriteBuffer(i2cAddr, writeBuf, false)               // Write to the address to prepare for read operation

        readBuf = pins.i2cReadBuffer(i2cAddr, 1, false)             // Read the data at the correct address into the buffer
        let readData = readBuf[0]                                   // Store the data from the buffer as a variable

        return readData                                             // Return the variable so the data can be accessed
    }
}
