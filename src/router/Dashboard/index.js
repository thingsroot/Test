import React, { PureComponent } from 'react';
import './index.scss'
import echarts from 'echarts/lib/echarts';
import intl from 'react-intl-universal';
import  'echarts/lib/chart/bar';
import  'echarts/lib/chart/line';
import  'echarts/lib/chart/pie';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import { Tabs, Table } from 'antd';
import { Link } from 'react-router-dom';
import http from '../../utils/Server';
// import intl from 'react-intl-universal';

const show = {
    display: 'block'
};
const hide = {
    display: 'none'
};

const TabPane = Tabs.TabPane;
const todayColumns = [{
    title: intl.get('dashboard.the_serial_number'),
    key: 'index',
    render: (text, record, index)=>`${index + 1}`
}, {
    title: intl.get('common.name'),
    dataIndex: 'name',
    className: 'nameWidth',
    key: 'name',
    render: (text, record)=>{
        return (
            <Link
                style={{cursor: 'pointer'}}
                to={`/gatewayevent/${record.sn}/24`}
            >
            {text}
        </Link>
        )
    }
}, {
    title: intl.get('dashboard.location'),
    dataIndex: 'position',
    className: 'thWidth',
    key: 'position'
}, {
    title: intl.get('dashboard.last_on-line_time'),
    dataIndex: 'last_updated',
    className: 'longWidth',
    key: 'last_updated'
}, {
    title: intl.get('dashboard.the_number_of'),
    dataIndex: 'today',
    className: 'thWidth',
    key: 'today'
}];
const weekColumns = [{
    title: intl.get('dashboard.the_serial_number'),
    key: 'index',
    render: (text, record, index)=>`${index + 1}`
}, {
    title: intl.get('dashboard.name'),
    dataIndex: 'name',
    className: 'nameWidth',
    key: 'name',
    render: (text, record)=>{
        return (
            <Link
                style={{cursor: 'pointer'}}
                to={`/gatewayevent/${record.sn}/168`}
            >
            {text}
        </Link>
        )
    }
}, {
    title: intl.get('dashboard.location'),
    dataIndex: 'position',
    className: 'thWidth',
    key: 'position'
}, {
    title: intl.get('dashboard.last_on-line_time'),
    dataIndex: 'last_updated',
    className: 'longWidth',
    key: 'last_updated'
}, {
    title: intl.get('dashboard.the_serial_number'),
    dataIndex: 'total',
    className: 'thWidth',
    key: 'today'
}];

function compare (property){
    return function (a, b) {
        let value1 = a[property];
        let value2 = b[property];
        return value2 - value1;
    }
}

class Dashboard extends PureComponent {
    state = {
        todayData: [],
        weekData: [],
        pieData: [],
        barData: [],
        timeData: [],
        myFaultTypeChart: '',
        myGatesChart: '',
        myOnlineChart: ''
    };

    componentDidMount () {
        // http.get()
        //饼状图数据
        http.get('/apis/api/method/iot.user_api.device_type_statistics').then(res=>{
            this.setState({
                pieData: res.message
            });
            let gatesMain = this.refs.gatesMain;
            if (this.state.pieData && gatesMain) {
                this.myGatesChart = echarts.init(gatesMain);
                this.myGatesChart.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b} : {c} ({d}%)'
                    },
                    legend: {
                        data: ['Q102', 'Q204', 'T1-3000', intl.get('dashboard.other')]
                    },
                    series: [{
                        name: intl.get('dashboard.equipment_type'),
                        type: 'pie',
                        radius: '55%',
                        color: ['#3CB2EF', '#50A3BA', '#236192', '#FFD85C'],
                        data: [
                            {value: this.state.pieData['Q102'], name: 'Q102'},
                            {value: this.state.pieData['Q204'], name: 'Q204'},
                            {value: this.state.pieData['T1-3000'], name: 'T1-3000'},
                            {value: this.state.pieData['VBOX'], name: intl.get('dashboard.other')}
                        ]
                    }]
                });
                window.addEventListener('resize', this.echarts1);
            }
        });
        // 在线数据
        http.get('/apis/api/method/iot.user_api.device_status_statistics').then(res=>{
            this.setState({
                timeData: res.message
            });
            let onlineMain = this.refs.onlineMain;
            if (this.state.timeData && onlineMain) {
                this.myOnlineChart = echarts.init(onlineMain);
                this.myOnlineChart.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            animation: false
                        }
                    },
                    xAxis: {
                        type: 'time',
                        splitLine: {
                            show: false
                        }
                    },
                    yAxis: {},
                    series: [{
                        name: 'Online',
                        type: 'line',
                        smooth: true,
                        data: this.state.timeData.map(function (item) {
                            return [new Date(item.time), item.online];
                        }),
                        lineStyle: {
                            color: '#50a3ba'
                        }
                    },
                        {
                            name: 'Offline',
                            type: 'line',
                            smooth: true,
                            data: this.state.timeData.map(function (item) {
                                return [new Date(item.time), item.offline];
                            }),
                            lineStyle: {
                                color: '#eac736'
                            }
                        }]
                });
                window.addEventListener('resize', this.echarts2);
            }
        });
        //柱状图数据
        http.get('/apis/api/method/iot.user_api.device_event_type_statistics').then(res=>{
            this.setState({
                barData: res.message
            });
            let faultTypeMain = this.refs.faultTypeMain;
            if (this.state.barData && faultTypeMain) {
                let data1 = [];
                let data2 = [];
                let data3 = [];
                let data4 = [];
                let data5 = [];
                this.state.barData.map((v) => {
                    // data1.push(v[intl.get('common.sym')]);
                    // data2.push(v[intl.get('gateway.equipment')]);
                    // data3.push(v[intl.get('common.communication')]);
                    // data4.push(v[intl.get('common.data')]);
                    data1.push(v['系统']);
                    data2.push(v['设备']);
                    data3.push(v['通讯']);
                    data4.push(v['数据']);
                    data5.push(v['应用']);
                });

                this.myFaultTypeChart = echarts.init(faultTypeMain);
                this.myFaultTypeChart.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        // data: [intl.get('common.sym'), intl.get('gateway.equipment'), intl.get('common.communication'), intl.get('common.data'), intl.get('common.applications')]
                        data: ['系统', '设备', '通讯', '数据', '应用']
                    },
                    xAxis: [{
                        type: 'category',
                        axisLabel: {
                            rotate: 30,
                            interval: 0
                        }
                    }],
                    yAxis: {},
                    series: [{
                        // name: intl.get('common.sym'),
                        name: '系统',
                        type: 'bar',
                        data: this.state.barData.map(function (item) {
                            return [item.time.substr(0, 10), item['系统']];
                            // return [item.time.substr(0, 10), item[intl.get('common.sym')]];
                        })
                    }, {
                        // name: intl.get('gateway.equipment'),
                        name: '设备',
                        type: 'bar',
                        data: this.state.barData.map(function (item) {
                            return [item.time.substr(0, 10), item['设备']];
                            // return [item.time.substr(0, 10), item[intl.get('gateway.equipment')]];
                        })
                    }, {
                        // name: intl.get('common.communication'),
                        name: '通讯',
                        type: 'bar',
                        data: this.state.barData.map(function (item) {
                            return [item.time.substr(0, 10), item['通讯']];
                            // return [item.time.substr(0, 10), item[intl.get('common.communication')]];
                        })
                    }, {
                        // name: intl.get('common.data'),
                        name: '数据',
                        type: 'bar',
                        data: this.state.barData.map(function (item) {
                            return [item.time.substr(0, 10), item['数据']];
                            // return [item.time.substr(0, 10), item[intl.get('common.data')]];
                        })
                    }, {
                        // name: intl.get('common.applications'),
                        name: '应用',
                        type: 'bar',
                        data: this.state.barData.map(function (item) {
                            return [item.time.substr(0, 10), item['应用']];
                            // return [item.time.substr(0, 10), item[intl.get('common.applications')]];
                        })
                    }]
                });
                window.addEventListener('resize', this.echarts3);
            }
        });

        function getBeforeDate (n){//n为你要传入的参数，当前为0，前一天为-1，后一天为1
            let date = new Date() ;
            let year, month, day ;
            date.setDate(date.getDate() + n);
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate() ;
            let s = year + '-' + ( month < 10 ? ( '0' + month ) : month ) + '-' + ( day < 10 ? ( '0' + day ) : day) ;
            return s ;
        }
        // 前10网关
        http.get('/apis/api/method/iot.user_api.device_event_count_statistics').then(res=>{
            if (res.message) {
                let data = [];
                let t = getBeforeDate(0);
                res.message.map((v)=>{
                    if (v.today !== '0' && v.last_updated.indexOf(t) !== -1){
                        data.push(v)
                    }
                });
                data = data.splice(0, 10);
                data.sort(compare('today'));
                this.setState({
                    todayData: data
                })
            }

        });
        //一周内故障最多的网关
        http.get('/apis/api/method/iot.user_api.device_event_count_statistics').then(res=>{
            if (res.message) {
                let data = [];
                let t = getBeforeDate(0);
                let t1 = getBeforeDate(-1);
                let t2 = getBeforeDate(-2);
                let t3 = getBeforeDate(-3);
                let t4 = getBeforeDate(-4);
                let t5 = getBeforeDate(-5);
                let t6 = getBeforeDate(-6);
                res.message.map((v)=>{
                    if (v.last_updated.indexOf(t) !== -1 ||
                        v.last_updated.indexOf(t1) !== -1 ||
                        v.last_updated.indexOf(t2) !== -1 ||
                        v.last_updated.indexOf(t3) !== -1 ||
                        v.last_updated.indexOf(t4) !== -1 ||
                        v.last_updated.indexOf(t5) !== -1 ||
                        v.last_updated.indexOf(t6) !== -1 ){
                        if (v.total !== 0 && v.total !== '0'){
                            data.push(v)
                        }
                    }
                });
                data = data.splice(0, 10);
                data.sort(compare('total'));
                this.setState({
                    weekData: data
                })
            }
        });
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.echarts1);
        window.removeEventListener('resize', this.echarts2);
        window.removeEventListener('resize', this.echarts3);
    }

    echarts1 = ()=>{
        this.myGatesChart.resize();
    };
    echarts2 = ()=>{
        this.myOnlineChart.resize();
    };
    echarts3 = ()=>{
        this.myFaultTypeChart.resize();
    };

    render () {
        let todayData = this.state.todayData;
        let weekData = this.state.weekData;
        return (
            <div className="home">
                <div className="main">
                    <div
                        className="echarts"
                        style={{width: '49%'}}
                    >
                        <p>{intl.get('dashboard.online_statistics')}</p>
                        <div
                            ref="onlineMain"
                            style={{width: '97%',
                                 height: 320}}
                        >  </div>
                        <div
                            className="tips"
                            style={this.state.timeData && this.state.timeData.length > 0 ? hide : show}
                        >
                            {intl.get('dashboard.no_data_at_present')}
                        </div>
                    </div>
                    <div
                        className="echarts"
                        style={{width: '49%'}}
                    >
                        <p>{intl.get('dashboard.fault_statistics')}</p>
                        <div id="">
                            <Tabs
                                type="card"
                            >
                                <TabPane
                                    tab={intl.get('dashboard.top_10_gateways')}
                                    key="1"
                                >
                                    <Table
                                        rowKey="sn"
                                        columns={todayColumns}
                                        dataSource={todayData}
                                        size="small"
                                        style={{width: '100%'}}
                                        pagination={false}
                                        scroll={{ y: 220 }}
                                        locale={{emptyText: intl.get('dashboard.no_trouble')}}
                                    />
                                </TabPane>
                                <TabPane
                                    tab={intl.get('dashboard.most_failures_in_a_week')}
                                    key="2"
                                >
                                    <Table
                                        rowKey="sn"
                                        columns={weekColumns}
                                        dataSource={weekData}
                                        size="small"
                                        style={{width: '100%'}}
                                        pagination={false}
                                        scroll={{ y: 220 }}
                                        locale={{emptyText: intl.get('dashboard.no_trouble')}}
                                    />
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                    <div
                        className="echarts"
                        style={{width: '49%'}}
                    >
                        <p>{intl.get('dashboard.gateway_model_statistics')}</p>
                        <div
                            ref="gatesMain"
                            style={{width: '97%', height: 350}}
                        >  </div>
                        <div
                            className="tips"
                            style={this.state.pieData !== undefined ? hide : show}
                        >
                            {intl.get('dashboard.no_data_at_present')}
                        </div>
                    </div>
                    <div
                        className="echarts"
                        style={{width: '49%'}}
                    >
                        <p>{intl.get('dashboard.fault_type_statistics')}</p>
                        <div
                            ref="faultTypeMain"
                            style={{width: '97%', height: 350}}
                        >  </div>
                        <div
                            className="tips"
                            style={this.state.barData && this.state.barData.length > 0 ? hide : show}
                        >
                            {intl.get('dashboard.no_data_at_present')}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
