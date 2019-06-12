import React from 'react';


class SonTables extends React.Component {
    componentDidMount () {
        this.timer = setTimeout(()=>{
            this.confirmMessage()
        }, 3000)
    }
    componentWillUnmount () {
        clearTimeout(this.timer)
    }

    confirmMessage () {
        this.props.onConfirm([this.props.data.name])
    }

    render () {
        const { data, onConfirm } = this.props;
        onConfirm;
        return (
            <div className="SonTables">
                <ul>
                    <li><span>标题：</span>{data.title}</li>
                    <li><span>所属设备序列号：</span>{data.device}</li>
                    <li><span>触发时间：</span>{data.event_time}</li>
                    <li><span>发生时间：</span>{data.creation}</li>
                    <li><span>事件等级：</span>{data.event_level}</li>
                    <li><span>事件类型：</span>{data.event_type}</li>
                    <li><span>详情信息：</span>{data.data}</li>
                    <li><span>确认消息用户：</span>{data.disposed_by}</li>
                </ul>
            </div>
        )
    }
}
export default SonTables;