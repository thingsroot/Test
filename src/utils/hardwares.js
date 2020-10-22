import intl from 'react-intl-universal';
export function GetInfoBySN (sn) {
    if (/2-30002.+/.test(sn)) {
        // Q102
        return {
            model: 'Q102',
            cpu: 'NXP i.MX 6ULL (Arm® Cortex®-A7)',
            ram: '256M',
            rom: '4GB',
            tty_list: [{
                name: intl.get('gateway.serial_port') + '1',
                value: '/dev/ttymxc0'
            }, {
                name: intl.get('gateway.serial_port') + '2',
                value: '/dev/ttymxc1'
            }],
            Disable_extension: false
        }
    } else if (/2-30102.+/.test(sn)) {
        // Q204
        return {
            model: 'Q204',
            cpu: 'NXP i.MX 6UltraLite (Arm® Cortex®-A7)',
            ram: '512M',
            rom: '4GB',
            tty_list: [{
                name: intl.get('gateway.serial_port') + '1',
                value: '/dev/ttymxc0'
            }, {
                name: intl.get('gateway.serial_port') + '2',
                value: '/dev/ttymxc1'
            }, {
                name: intl.get('gateway.serial_port') + '3',
                value: '/dev/ttymxc2'
            }, {
                name: intl.get('gateway.serial_port') + '4',
                value: '/dev/ttymxc3'
            }],
            Disable_extension: false
        }
    } else if (/TRTX01.+/.test(sn)) {
        // T1-3000
        return {
            model: 'T1-3000',
            cpu: 'Allwinner H3 (Quad-Core Arm® Cortex®-A7)',
            ram: '256M',
            rom: '4GB',
            tty_list: [{
                name: intl.get('gateway.serial_port') + '1',
                value: '/dev/ttyS1'
            }, {
                name: intl.get('gateway.serial_port') + '2',
                value: '/dev/ttyS2'
            }],
            Disable_extension: false
        }
    } else if (/TRTC10.+/.test(sn)) {
        // C1-1100
        return {
            model: 'C1-1100',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '16M',
            /* S1: RS485 */
            tty_list: [{
                name: 'RS485',
                value: '/dev/ttyS1'
            }],
            Disable_extension: true
        }
    } else if (/TRTC11.+/.test(sn)) {
        // C1-1110
        return {
            model: 'C1-1110',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '32M',
            /* S1: RS485 */
            tty_list: [{
                name: 'RS485',
                value: '/dev/ttyS1'
            }],
            Disable_extension: false
        }
	} else if (/TRTC20.+/.test(sn)) {
        // C1-1200
        return {
            model: 'C1-1200',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '16M',
            /* S1: RS232, S3: RS485 */
            tty_list: [{
                name: 'RS232',
                value: '/dev/ttyS1'
            }, {
                name: 'RS485',
                value: '/dev/ttyS3'
            }],
            Disable_extension: true
        }
	} else if (/TRTC21.+/.test(sn)) {
        // C1-1210
        return {
            model: 'C1-1210',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '32M',
            /* S1: RS232, S3: RS485 */
            tty_list: [{
                name: 'RS232',
                value: '/dev/ttyS1'
            }, {
                name: 'RS485',
                value: '/dev/ttyS3'
            }],
            Disable_extension: false
        }
	} else if (/TRTC30.+/.test(sn)) {
        // C1-1300
        return {
            model: 'C1-1300',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '16M',
            /* S0: RS232, S1: RS485 */
            tty_list: [{
                name: 'RS232',
                value: '/dev/ttyS0'
            }, {
                name: 'RS485',
                value: '/dev/ttyS1'
            }],
            Disable_extension: true
        }
	} else if (/TRTC31.+/.test(sn)) {
        // C1-1310
        return {
            model: 'C1-1310',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '32M',
            /* S0: RS232, S1: RS485 */
            tty_list: [{
                name: 'RS232',
                value: '/dev/ttyS0'
            }, {
                name: 'RS485',
                value: '/dev/ttyS1'
            }],
            Disable_extension: false
        }
	} else if (/TRTC35.+/.test(sn)) {
        // C1-1350
        return {
            model: 'C1-1350',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '16M',
            /* S0: RS232, S1: RS485 */
            tty_list: [{
                name: 'RS232',
                value: '/dev/ttyS0'
            }, {
                name: 'RS485',
                value: '/dev/ttyS1'
            }],
            Disable_extension: true
        }
	} else if (/TRTC36.+/.test(sn)) {
        // C1-1360
        return {
            model: 'C1-1360',
            cpu: 'MediaTek MT7688 (MIPS® 24KEc)',
            ram: '128M',
            rom: '32M',
            /* S0: RS232, S1: RS485 */
            tty_list: [{
                name: 'RS232',
                value: '/dev/ttyS0'
            }, {
                name: 'RS485',
                value: '/dev/ttyS1'
            }],
            Disable_extension: false
        }
    }

    return {
        cpu: 'UNKNOWN',
        ram: 'UNKNOWN',
        rom: 'UNKNOWN',
        tty_list: [],
        Disable_extension: false
    }
}
