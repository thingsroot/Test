import appStore from './appStore';
import codeStore from './codeStore';
import timer from './timer'
import action from './action'
import session from './session'
import gatewayInfo from './gatewayInfo'

const store = {
    timer,
    action,
    session,
    appStore,
    codeStore,
    gatewayInfo
};

export default store