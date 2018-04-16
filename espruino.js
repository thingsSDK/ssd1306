//@ts-check
import { createDisplay, I2C_ADDRESS } from './main'

function createSetup(i2cInterface, clock, data) {
    return () => {
        i2cInterface.setup({ scl: clock, sda: data });
    };
}

function createWrite(i2cInterface, address) {
    return (...data) => {
        i2cInterface.writeTo(address, ...data);
    };
}

export function connect(options) {
    options = options || {};
    // @ts-ignore
    const i2cInterface = options.i2cInterface || I2C1;
    const clock = options.clock || 5;
    const data = options.data || 4;
    const height = options.height || 32;
    const address = options.address || I2C_ADDRESS;
    const setup = createSetup(i2cInterface, clock, data);
    const write = createWrite(i2cInterface, address);
    return createDisplay(setup, write, height);
}