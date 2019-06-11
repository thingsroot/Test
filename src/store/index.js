import codeStore from './codeStore';
import timer from './timer'
import action from './action'
import session from './session'
import gatewayInfo from './gatewayInfo'
import gatewayList from './gatewayList'

const store = {
    timer,
    action,
    session,
    codeStore,
    gatewayInfo: new gatewayInfo(),
    gatewayList: new gatewayList()
};

export default store