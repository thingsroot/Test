
export function GetSerialListBySN (sn) {
    let tty_list = []
    if (/2-30002.+/.test(sn)) {
        // Q102
        tty_list = [{
            name: '串口1',
            value: '/dev/ttymxc0'
        }, {
            name: '串口2',
            value: '/dev/ttymxc1'
        }]
    } else if (/2-30102.+/.test(sn)) {
        // Q204
        tty_list = [{
            name: '串口1',
            value: '/dev/ttymxc0'
        }, {
            name: '串口2',
            value: '/dev/ttymxc1'
        }, {
            name: '串口3',
            value: '/dev/ttymxc2'
        }, {
            name: '串口4',
            value: '/dev/ttymxc3'
        }]
    } else if (/TRTX01.+/.test(sn)) {
        // T1-3000
        tty_list = [{
            name: '串口1',
            value: '/dev/ttyS1'
        }, {
            name: '串口2',
            value: '/dev/ttyS2'
        }]
    } else if (/TRTC01.+/.test(sn)) {
        // C1-1100
        tty_list = [{
            name: 'RS485',
            value: '/dev/ttyS1'
        }] /* S1: RS485 */
    } else if (/TRTC02.+/.test(sn)) {
        // C1-1200
        tty_list = [{
            name: 'RS232',
            value: '/dev/ttyS1'
        }, {
            name: 'RS485',
            value: '/dev/ttyS3'
        }] /* S1: RS232, S3: RS485 */
    } else if (/TRTC03.+/.test(sn)) {
        // C1-1300
        tty_list = [{
            name: 'RS232',
            value: '/dev/ttyS0'
        }, {
            name: 'RS485',
            value: '/dev/ttyS1'
        }] /* S0: RS232, S1: RS485 */
    }
    return tty_list
}

export function GetInfoBySN (sn) {
    if (/2-30002.+/.test(sn)) {
        // Q102
        return {
            model: 'Q102',
            cpu: 'NXP i.MX 6ULL (Arm® Cortex®-A7)',
            ram: '256M',
            rom: '4GB'
        }
    } else if (/2-30102.+/.test(sn)) {
        // Q204
        return {
            model: 'Q204',
            cpu: 'NXP i.MX 6UltraLite (Arm® Cortex®-A7)',
            ram: '512M',
            rom: '4GB'
        }
    } else if (/TRTX01.+/.test(sn)) {
        // T1-3000
        return {
            model: 'T1-3000',
            cpu: 'Allwinner H3 (Quad-Core Arm® Cortex®-A7)',
            ram: '256M',
            rom: '4GB'
        }
    } else if (/TRTC01.+/.test(sn)) {
        // C1-1100
        return {
            model: 'C1-1100',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '16M'
        }
	} else if (/TRTC02.+/.test(sn)) {
        // C1-1200
        return {
            model: 'C1-1200',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '32M'
        }
	} else if (/TRTC03.+/.test(sn)) {
        // C1-1300
        return {
            model: 'C1-1300',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '32M'
        }
    }

    return {
        cpu: 'UNKNOWN',
        ram: 'UNKNOWN',
        rom: 'UNKNOWN'
    }
}
