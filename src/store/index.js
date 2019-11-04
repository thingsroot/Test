import timer from './timer'
import action from './action'
import session from './session'
import gatewayInfo from './gatewayInfo'
import gatewayList from './gatewayList'
import groups from './groups';

const store = {
    timer,
    action,
    session,
    groups: new groups(),
    gatewayInfo: new gatewayInfo(),
    gatewayList: new gatewayList()
};

export default store