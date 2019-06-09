import appStore from './appStore';
import codeStore from './codeStore';
import messageStore from './messageStore';
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
    messageStore,
    gatewayInfo
};

export default store