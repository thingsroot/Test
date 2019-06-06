import appStore from './appStore';
import codeStore from './codeStore';
import messageStore from './messageStore';
import timer from './timer'
import action from './action'
import session from './session'

const store = {
    timer,
    action,
    session,
    appStore,
    codeStore,
    messageStore
};

export default store