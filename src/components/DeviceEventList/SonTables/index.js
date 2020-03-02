import React from 'react';
import {Button} from 'antd'
import intl from 'react-intl-universal';

class SonTables extends React.Component {
    componentDidMount () {
        // this.timer = setTimeout(()=>{
        //     his.confirmMessage()
        // }, 3000)
    }
    componentWillUnmount () {
        //clearTimeout(this.timer)
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
                    <li><span>{intl.get('common.title')}：</span>{data.title}</li>
                    <li><span>{intl.get('platformevent.Serial_number_of_the_device')}：</span>{data.device}</li>
                    <li><span>{intl.get('gateway.trigger_time')}：</span>{data.event_time}</li>
                    <li><span>{intl.get('platformevent.Time_of_occurrence')}：</span>{data.creation}</li>
                    <li><span>{intl.get('platformevent.Event_level')}：</span>{data.event_level}</li>
                    <li><span>{intl.get('platformevent.The_event_type')}：</span>{data.event_type}</li>
                    <li><span>{intl.get('platformevent.The_details_information')}：</span>{data.data}</li>
                    {
                        data.disposed === 1
                        ? <li><span>{intl.get('platformevent.Confirm_message_user')}：</span>{data.disposed_by}</li>
                        : <li><span>
                            <Button
                                type="primary"
                                onClick={()=>{
                                    this.confirmMessage()
                                }}
                            >{intl.get('common.confirm')}</Button>
                        </span></li>
                    }
                </ul>
            </div>
        )
    }
}
export default SonTables;