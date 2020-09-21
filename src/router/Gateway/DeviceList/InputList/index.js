import React, {PureComponent} from 'react';
import echarts from 'echarts/lib/echarts';
import  'echarts/lib/chart/line';
import  'echarts/lib/chart/pie';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import { Table, Button, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import http from '../../../../utils/Server';
import Browsinghistory from '../../../BrowsingHistory';
import './style.scss';
import intl from 'react-intl-universal';
let myFaultTypeChart;

class ExpandedRowRender extends PureComponent {
    state = {
        allData: [],
        data: [],
        inputsMap: {},
        flag: true,
        visible: false,
        barData: [],
        columns: [
            { title: intl.get('common.type'), dataIndex: 'vt', key: 'vt', width: '60px' },
            { title: intl.get('common.name'), dataIndex: 'name', key: 'name' },
            { title: intl.get('common.desc'), dataIndex: 'desc', key: 'desc', render (text) {
                return (<span title={text}>{text}</span>)
            }},
            { title: intl.get('common.unit'), dataIndex: 'unit', key: 'unit', width: '60px', render (text) {
                return (<span title={text}>{text}</span>)
            }},
            { title: intl.get('common.number'), dataIndex: 'pv', key: 'pv', render (text) {
                return (<span title={text}>{text}</span>)
            }},
            { title: intl.get('common.time'), dataIndex: 'tm', key: 'tm', width: '180px' },
            { title: intl.get('appstore.quality_stamp'), dataIndex: 'q', key: 'q', width: '120px' },
            {
                title: intl.get('common.operation'),
                dataIndex: 'operation',
                key: 'operation',
                width: '120px',
                render: (record, props) => {
                return (
                    <span className="table-operation">
                    <Button onClick={()=>{
                        this.showModal(props)
                    }}
                    >{intl.get('devece_list.Browsing_data')}</Button>
                    </span>
                )
                }
            }
        ]
    }

    componentDidMount (){
        myFaultTypeChart = null;
        if (myFaultTypeChart && myFaultTypeChart.dispose) {
            myFaultTypeChart.dispose();
        }
        const { inputs } = this.props;
        const { inputsMap } = this.state;

        inputs && inputs.length > 0 && inputs.map( (item) => {
            inputsMap[item.name] = item;
        })
        this.fetch()
        this.timer = setInterval(() => {
            this.fetch()
        }, 3000);

        const { regRefresh, regFilterChangeCB } = this.props;
        if (regRefresh) {
            regRefresh(()=>{
                this.fetch()
            })
        }
        if (regFilterChangeCB) {
            regFilterChangeCB(()=>{
                this.applyFilter()
            })
        }
    }

    componentWillUnmount (){
        const { regRefresh } = this.props;
        if (regRefresh) {
            regRefresh(undefined)
        }
        clearInterval(this.timer)
    }
    applyFilter = ()=>{
        const { filterText } = this.props;
        const { allData } = this.state;
        let newData = [];
        allData && allData.length > 0 && allData.map((item)=>{
            if (item.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1 ||
                (item.desc && item.desc.toLowerCase().indexOf(filterText.toLowerCase()) !== -1) ) {
                newData.push(item)
            }
        });
        this.setState({data: newData})
    }
    fetch = ()=>{
        const { sn, vsn, inputs, filterText } = this.props;
        inputs;
        http.get('/api/gateway_devf_data?gateway=' + sn + '&name=' + vsn).then(res=>{
            let allData = res.data;
            let newData = [];
            const { inputsMap } = this.state;
            allData && allData.length > 0 && allData.map((item, ind)=>{
                item.sn = sn;
                item.vsn = vsn;
                item.key = ind;
                item.desc = item.desc || inputsMap[item.name].desc;
                if (item.vt === null){
                    item.vt = 'float';
                }
                if (item.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1 ||
                    (item.desc && item.desc.toLowerCase().indexOf(filterText.toLowerCase()) !== -1) ) {
                    newData.push(item)
                }
            })
            this.setState({
                allData: allData,
                data: newData,
                flag: false
            })
        })
    }
    showModal = (record) => {
        this.setState({
            visible: true,
            record
        });
        if (record.vt === 'int'){
            record.vt = 'int';
        } else if (record.vt === 'string'){
            record.vt = 'string';
        } else {
            record.vt = 'float';
        }
        const data = {
            sn: this.props.sn,
            vsn: this.props.vsn,
            name: record.name,
            vt: record.vt,
            time_condition: 'time > now() - 1h',
            value_method: 'raw',
            group_time_span: '1h',
            _: new Date() * 1
        }
        http.get(`/api/gateways_historical_data?sn=${data.sn}&vsn=${data.vsn}&tag=${data.name}&vt=${data.vt}&start=-10m&value_method=raw&group_time_span=5s&_=${new Date() * 1}`).then(res=>{
            if (!res.ok) {
                return
            }
            const { myCharts } = this.refs;
            let data = [];
            const date = new Date() * 1;
            const length = res.data.length > 120 ? 120 : res.data.length
            for (var i = 0;i < length;i++){
                const hours = new Date(date - (i * 5000)).getHours()
                const min = new Date(date - (i * 5000)).getMinutes()
                const seconds = new Date(date - (i * 5000)).getSeconds();
                data.unshift(hours + ':' + (min < 10 ? '0' + min : min) + ':' + (seconds < 10 ? '0' + seconds : seconds));
            }
            if (res.data && res.data.length > 0 && this.state.record.vt !== 'string') {
                myFaultTypeChart = echarts.init(myCharts);
                myFaultTypeChart.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    xAxis: {
                        data: data
                    },
                    yAxis: {},
                    series: [
                      {
                        name: intl.get('common.number'),
                        type: 'line',
                        color: '#37A2DA',
                        data: res.data
                      }
                    ]
            });
            } else if (this.state.record.vt === 'string') {
                myCharts.style.textAlin = 'center'
                myCharts.innerHTML = intl.get('gateway.this_kind_of_data_is_not_supported_temporarily')
            } else {
                myCharts.style.textAlin = 'center'
                myCharts.innerHTML = intl.get('gateway.data_not_obtained_yet')
            }
        })
    }
    handleOk = () => {
        const {record} = this.state;
        this.setState({
            visible: false
        });
        this.props.history.push(`/browsinghistory/${record.sn}/${record.vsn}/${record.name}`)
        if (myFaultTypeChart) {
            myFaultTypeChart.dispose();
        }
    }
    handleCancel = () => {
        this.setState({
            visible: false
        });
        if (myFaultTypeChart) {
            myFaultTypeChart.dispose();
        }
    }
    closewindows = () => {
        this.setState({
            Moreandmore: false
            // visible: true
        })
    }
    render () {
        return (
            <div>
                <Table
                    style={{scrollbarWidth: '0'}}
                    size="small"
                    rowKey="key"
                    loading={this.state.flag}
                    columns={this.state.columns}
                    dataSource={this.state.data}
                    pagination={false}
                    rowClassName={(record, index) => {
                        let className = 'light-row';
                        if (index % 2 === 0) {
                            className = 'dark-row';
                        }
                        return className;
                    }}
                    scroll={{x: '100%', y: 500}}
                />
                <Modal
                    title={this.state.record ? intl.get('gateway.variable') + this.state.record.name + intl.get('gateway.value_change_in_ten_minutes') : ''}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width="50%"
                    footer={[
                        <Button key="back"
                            onClick={this.handleCancel}
                        >{intl.get('gateway.close')}</Button>,
                        <Button key="submit"
                            type="primary"
                            // onClick={this.handleOk}
                            onClick={()=>{
                                this.setState({
                                    Moreandmore: true,
                                    visible: false
                                })
                            }}
                        >
                        {intl.get('gateway.more_historical_data')}
                        </Button>
                    ]}
                >
                    <div
                        id="faultTypeMain"
                        ref="myCharts"
                        style={{width: '100%', height: 400, textAlign: 'center', fontSize: 30}}
                    ></div>
                </Modal>
                {
                    this.state.Moreandmore
                    ? <div
                        className="modal_browsinghistory"
                      >
                        <Browsinghistory
                            closewindows={this.closewindows}
                            record={this.state.record}
                        />
                      </div>
                    : ''
                }
            </div>
        );
    }
}
export default withRouter(ExpandedRowRender);