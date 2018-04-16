//@ts-check
export const I2C_ADDRESS = 0x3C
const SET_CONTRAST = 0x81
const DISPLAY_ALL_ON_RESUME = 0xA4
const DISPLAY_ALL_ON = 0xA5
const NORMAL_DISPLAY = 0xA6
const INVERT_DISPLAY = 0xA7
const DISPLAY_OFF = 0xAE
const DISPLAY_ON = 0xAF
const SUGGESTED_RATIO = 0x80
const SET_DISPLAY_OFFSET = 0xD3
const SET_COMPINS = 0xDA

const SET_VCOMDETECT = 0xDB

const SET_DISPLAY_CLOCK_DIV = 0xD5
const SET_PRECHARGE = 0xD9

const SET_MULTIPLEX = 0xA8

const SET_LOW_COLUMN = 0x00
const SET_HIGH_COLUMN = 0x10

const SET_START_LINE = 0x40

const MEMORY_MODE = 0x20
const COLUMN_ADDR = 0x21
const PAGE_ADDR = 0x22

const COM_SCAN_INC = 0xC0
const COM_SCAN_DEC = 0xC8

const SEG_REMAP = 0xA0

const CHARGE_PUMP = 0x8D

const EXTERNAL_VCC = 0x1
const SWITCH_CAP_VCC = 0x2

const ACTIVATE_SCROLL = 0x2F
const DEACTIVATE_SCROLL = 0x2E
const SET_VERTICAL_SCROLL_AREA = 0xA3
const RIGHT_HORIZONTAL_SCROLL = 0x26
const LEFT_HORIZONTAL_SCROLL = 0x27
const VERTICAL_AND_RIGHT_HORIZONTAL_SCROLL = 0x29
const VERTICAL_AND_LEFT_HORIZONTAL_SCROLL = 0x2A

const LCD_WIDTH = 128

const sendCommands = (write, commands) => commands.forEach(command => write([0, command]))

/**
 * 
 * @param {Uint8Array} bitmap 
 */
const createPages = bitmap => {
    const pages = []
    for (let pageIndex = 0; pageIndex < bitmap.length; pageIndex += LCD_WIDTH) {
        const page = new Uint8Array(bitmap.buffer, pageIndex, LCD_WIDTH);
        pages.push(page)
    }
    return pages
}

const createPageWrite = write => bitmapPage => {
    const page = new Uint8Array(LCD_WIDTH + 1);
    page.set([SET_START_LINE], 0)
    page.set(bitmapPage, 1)
    write(page)
}

function createRender(write, height) {
    const renderCommands = new Uint8Array([
        COLUMN_ADDR,
        0x00,
        LCD_WIDTH - 1,

        PAGE_ADDR,
        0x00,
        (height >> 3) - 1 // height >> 3 == number of pages
    ]);
    const pageWrite = createPageWrite(write)
    /**
     * 
     * @param {Uint8Array} bitmap 
     */
    const render = bitmap => {
        sendCommands(write, renderCommands)
        const pages = createPages(bitmap)
        pages.forEach(pageWrite);
    }
    return render
}


function displayInitialization(write, height, externalVCC = 0x00) {
    const initializationCommands = new Uint8Array([
        DISPLAY_OFF,
        SET_DISPLAY_CLOCK_DIV,
        SUGGESTED_RATIO,

        SET_MULTIPLEX,
        height - 1,

        SET_DISPLAY_OFFSET,
        0x00,

        SET_START_LINE,

        CHARGE_PUMP,
        externalVCC === EXTERNAL_VCC ? 0x10 : 0x14,

        MEMORY_MODE,
        0x00,

        SEG_REMAP | 0x01,
        COM_SCAN_DEC,

        SET_COMPINS,
        height === 64 ? 0x12 : 0x02,

        SET_CONTRAST,
        externalVCC === EXTERNAL_VCC ? 0x9F : 0xCF,

        SET_PRECHARGE,
        externalVCC === EXTERNAL_VCC ? 0x22 : 0XF1,

        SET_VCOMDETECT,
        0x40,

        DISPLAY_ALL_ON_RESUME,
        NORMAL_DISPLAY,
        DISPLAY_ON
    ])
    sendCommands(write, initializationCommands)
}

export function createDisplay(setup, write, height) {
    setup();
    displayInitialization(write, height)
    
    const display = {
        render: createRender(write, height),
        write
    }

    return display
}

/**
 * Switches display off
 * @param {Object} display 
 */
export const switchOff = display => display.write([0, DISPLAY_OFF])

/**
 * Switches display on
 * @param {Object} display 
 */
export const switchOn = display => display.write([0, DISPLAY_ON])

/**
 * Sets the contrast of a display
 * @param {Object} display 
 * @param {number} contrast between 0...255
 */
export const setContrast = (display, contrast) => display.write([0, SET_CONTRAST, contrast])
