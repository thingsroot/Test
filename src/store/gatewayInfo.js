import {observable, action} from 'mobx'

class GatewayData {
    @observable uptime = 0
    @observable mem_total = 0
    @observable mem_used = 0
    @observable cpu_temp = 0
    @observable starttime = 0
    @observable version = 0
    @observable skynet_version = 0
    @observable platform = ''
    @observable firmware_version = ''
    @observable cpuload = 0
    @observable data_upload = false
    @observable data_upload_max_dpp = 1024
    @observable data_upload_cov = 1
    @observable data_upload_cov_ttl = 300
    @observable data_upload_period = 1000
    @observable upload_period_limit = 10240
    @observable data_cache = 0
    @observable data_cache_per_file = 4096
    @observable data_cache_limit = 1024
    @observable data_cache_fire_freq = 1000
    @observable stat_upload = false
    @observable comm_upload = 0
    @observable log_upload = 0
    @observable event_upload = 99
    @observable enable_beta = 0

    @action updateStatus (data) {
        let self_keys = Object.getOwnPropertyNames(this.__proto__)
        for (let [k, v] of Object.entries(data)) {
            if (self_keys.findIndex(item => item === k) !== -1) {
                //console.log(k, v)
                this[k] = v
            }
        }
    }
}


const dumpInstallApps = (data) => {
    let apps = []
    const find_key = 'app_run_'
    for (let [k, v] of Object.entries(data)) {
        v;
        if (k.startsWith(find_key)) {
            apps.push(k.substr(find_key.length))
        }
    }
    return apps
}

class GatewayInfo {
    @observable last_updated = ''
    @observable dev_name = ''
    @observable device_status = ''
    @observable sn = ''
    @observable description = ''
    @observable enabled = 0

    @observable install_apps = [] // Instance name list from realtime-data for running
    @observable Net_Manager = false
    @observable p2p_vpn = false
    @observable cpu = ''
    @observable data = new GatewayData()

    @observable devices = []
    @observable devices_count = 0
    @observable apps = {}
    @observable apps_count = 0

    @action updateStatus (data) {
        let self_keys = Object.getOwnPropertyNames(this.__proto__)
        for (let [k, v] of Object.entries(data)) {
            if (k === 'data') {
                this.data.updateStatus(v)
                this.install_apps = dumpInstallApps(v)
            } else {
                if (self_keys.findIndex(item => item === k) !== -1) {
                    //console.log(k, v)
                    this[k] = v
                }
            }
        }
        //console.log(this)
    }

    @action setDevices (value) {
        this.devices = value
        this.devices_count = value.length
    }
    @action setApps (value) {
        this.apps = value
        this.apps_count = Object.keys(value).length
    }
}

export default new GatewayInfo()