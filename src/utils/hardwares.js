
export function GetSerialListBySN (sn) {
    let tty_list = []
    if (/2-30002.+/.test(sn)) {
        // Q102
        tty_list = ['/dev/ttymxc0', '/dev/ttymcx1']
    } else if (/2-30102.+/.test(sn)) {
        // Q204
        tty_list = ['/dev/ttymxc0', '/dev/ttymcx1', '/dev/ttymcx2', '/dev/ttymcx3']
    } else if (/TRTX01.+/.test(sn)) {
        // TLink X1
        tty_list = ['/dev/ttyS1', '/dev/ttyS2']
    }
    return tty_list
}

export function GetInfoBySN (sn) {
    if (/2-30002.+/.test(sn)) {
        // Q102
        return {
            cpu: 'NXP i.MX 6ULL (Arm® Cortex®-A7)',
            ram: '256M',
            rom: '4GB'
        }
    } else if (/2-30102.+/.test(sn)) {
        // Q204
        return {
            cpu: 'NXP i.MX 6UltraLite (Arm® Cortex®-A7)',
            ram: '512M',
            rom: '4GB'
        }
    } else if (/TRTX01.+/.test(sn)) {
        // TLink X1
        return {
            cpu: 'Allwinner H3 (Quad-Core Arm® Cortex®-A7)',
            ram: '256M',
            rom: '4GB'
        }
    }
    return {
        cpu: 'UNKNOWN',
        ram: 'UNKNOWN',
        rom: 'UNKNOWN'
    }
}