import {observable, action} from 'mobx'


class GatewayList {
    @observable online = []
    @observable offline = []
    @observable all = []

    @action setOnline (value) {
        this.online = value ? value : []
    }
    @action setOffline (value) {
        this.offline = value ? value : []
    }
    @action setAll (value) {
        this.all = value ? value : []
    }
}

export default GatewayList