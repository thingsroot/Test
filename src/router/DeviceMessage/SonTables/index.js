import React from 'react';
import http from '../../../utils/Server';
import {inject, observer} from 'mobx-react';

@inject('store')
@observer
class SonTables extends React.Component {
    componentDidMount () {
        let name = this.props.data.name;
        let arr = [];
        arr.push(name);
        let data = {
            category: this.props.category,
            events: name,
            disposed: 1
        };
        http.post('/api/events_dispose', data).then(res=>{
            console.log(res)
        });
        //过滤数据
        let deviceTableData = this.props.store.codeStore.deviceTableData;
        console.log(deviceTableData)
        deviceTableData && deviceTableData.length > 0 && deviceTableData.map((v, key)=>{
            key;
            if (v.name === name) {
                v.disposed = 1
            }
        });
        let newData = deviceTableData.splice(0, deviceTableData.length - 1);
        this.props.store.codeStore.setDeviceData(newData);
        this.props.store.codeStore.setDeviceTableData(newData);
    }

    render () {
        const { data } = this.props;
        return (
            <div className="SonTables">
                <ul>
                    <li><span>标题：</span>{data.title}</li>
                    <li><span>所属设备序列号：</span>{data.device}</li>
                    <li><span>发生时间：</span>{data.creation}</li>
                    <li><span>事件等级：</span>{data.event_level}</li>
                    <li><span>事件类型：</span>{data.event_type}</li>
                    <li><span>详情信息：</span>{data.data}</li>
                    {/*<li><span>是否确认消息：</span>{data.dieposed}</li>*/}
                    {/*<li><span>确认消息用户：</span></li>*/}
                </ul>
            </div>
        )
    }
}
export default SonTables;