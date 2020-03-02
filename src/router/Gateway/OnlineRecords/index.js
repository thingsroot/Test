import React, { Component } from 'react';
import http from '../../../utils/Server';
import { formatTime } from '../../../utils/time';
import { Table, Tabs  } from 'antd';
import { withRouter} from 'react-router-dom';
import intl from 'react-intl-universal';
const TabPane = Tabs.TabPane;

function callback (key) {
  this.setState({
      loading: true,
      activeKey: key
  }, ()=>{
      this.fetch()
  })
}
@withRouter
class GatewayOnlineRecord extends Component {
    constructor (props) {
        super(props)
        this.state = {
            gate_wanip: [],
            // gate_status: [],
            gate_ipchange: [],
            gate_fault: [],
            loading: true,
            gateway: undefined,
            activeKey: 'gate_wanip',
            columns: [{
                title: intl.get('common.time'),
                dataIndex: 'time',
                key: 'time',
                defaultSortOrder: 'descend',
                width: 300,
                sorter: (a, b) => a.timestamp && b.timestamp && a.timestamp - b.timestamp
            }, {
                title: intl.get('common.number'),
                dataIndex: 'number',
                key: 'number'
            }]
        }
        this.callback = callback.bind(this)
    }
    componentDidMount () {
        this.setState({ loading: true, gateway: this.props.gateway }, ()=>{
            this.fetch()
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.state.gateway){
            this.setState({
                loading: true,
                gateway: nextProps.gateway
            }, ()=>{
                this.fetch()
            })
        }
    }
    fetch = () => {
        const {gateway, activeKey} = this.state;
        if (gateway === undefined || gateway === '') {
            return
        }
        http.get('/api/gateway_online_record?sn=' + gateway + '&type=' + activeKey).then(res=>{
            if (res.ok) {
                const data = [];
                res.data && res.data.length > 0 && res.data.map(item=>{
                    data.push({
                        time: formatTime(new Date(item[0]), 'yyyy-MM-dd hh:mm:ss S'),
                        timestamp: new Date(item[0]),
                        number: item[1]
                    })
                })
                this.setState({
                    [activeKey]: data,
                    loading: false
                })
            } else {
                this.setState({
                    [activeKey]: [],
                    loading: false
                })
            }
        })
    }
    render () {
        const { gate_fault, gate_ipchange, gate_wanip, loading, columns } = this.state;
        return (
            <div
                style={{marginTop: 20}}
            >
                <Tabs
                    style={{marginTop: -19}}
                    onChange={this.callback}
                    type="card"
                >
                    <TabPane
                        tab={intl.get('gateway.networking_IP_records')}
                        key="gate_wanip"
                    >
                        <Table
                            columns={columns}
                            loading={loading}
                            rowKey="time"
                            dataSource={gate_wanip}
                        />
                    </TabPane>
                    <TabPane
                        tab={intl.get('gateway.gateway_reconnect_record')}
                        key="gate_fault"
                    >
                        <Table
                            columns={columns}
                            loading={loading}
                            rowKey="time"
                            dataSource={gate_fault}
                        />
                    </TabPane>
                    <TabPane
                        tab={intl.get('gateway.IP_change_record')}
                        key="gate_ipchange"
                    >
                        <Table
                            columns={columns}
                            loading={loading}
                            rowKey="time"
                            dataSource={gate_ipchange}
                        />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default GatewayOnlineRecord;