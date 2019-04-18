import React from 'react';
import http from '../../../utils/Server';
import {inject, observer} from 'mobx-react';

@inject('store')
@observer
class SonTable extends React.Component {
    componentDidMount () {
        let name = this.props.data.name;
        let arr = [];
        arr.push(name);
        let params = {
            category: this.props.category,
            activities: name,
            disposed: 1
        };
        http.post('/api/activities_dispose', params).then(res=>{
            console.log(res.data)
        });
        //过滤数据
        let data = this.props.store.codeStore.tableData;
        data && data.length > 0 && data.map((v, key)=>{
            key;
            if (v.name === name) {
                v.disposed = 1
            }
        });
        let newData = data.splice(0, data.length - 1);
        this.props.store.codeStore.setPlatformData(newData);
        this.props.store.codeStore.setTableData(newData);
    }

    render () {
        const { data } = this.props;
        return (
            <div className="SonTable">
                <ul>
                    <li><span>标题：</span>{data.title}</li>
                    <li><span>所属设备序列号：</span>{data.device}</li>
                    <li><span>发生时间：</span>{data.creation}</li>
                    <li><span>触发用户用户名：</span>{data.user}</li>
                    <li><span>执行结果：</span>{data.status}</li>
                    <li><span>记录类型：</span>{data.operation}</li>
                    <li><span>详情信息：</span>{data.message}</li>
                    {/*<li><span>是否确认消息：</span>{data.dieposed}</li>*/}
                    {/*<li><span>确认消息用户：</span></li>*/}
                </ul>
            </div>
        )
    }
}
export default SonTable;