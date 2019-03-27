import React, {PureComponent} from 'react';
import echarts from 'echarts/lib/echarts';
import  'echarts/lib/chart/line';
import  'echarts/lib/chart/pie';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import {
    Table,
    Button,
    Modal
  } from 'antd';
import { withRouter } from 'react-router-dom';
import http from '../../../utils/Server';
import './style.scss';
let myFaultTypeChart;
function getMin (i, date){
  let Dates = new Date(date - i * 60000)
  let min = Dates.getMinutes();
  if (min < 10){
    return '0' + min
  } else {
    return min;
  }
}
  class ExpandedRowRender extends PureComponent {
    state = {
      data: [],
      flag: true,
      visible: false,
      barData: []
    }
    componentDidMount (){
      myFaultTypeChart = null;
      if (myFaultTypeChart && myFaultTypeChart.dispose) {
        myFaultTypeChart.dispose();
        }
      const { sn } = this.props.match.params;
      http.get('/api/method/iot_ui.iot_api.gate_device_data_array?sn=' + sn + '&vsn=' + this.props.sn).then(res=>{
        console.log(res)
        let data = res.message;
        data && data.length > 0 && data.map((item, ind)=>{
          item.sn = sn;
          item.vsn = this.props.sn;
          item.key = ind;
          if (item.vt === null){
            item.vt = 'float';
          }
        })
          this.setState({
            data,
            record: {},
            flag: false,
            columns: [
              { title: '类型', dataIndex: 'vt', key: 'vt' },
              { title: '名称', dataIndex: 'name', key: 'name' },
              { title: '描述', dataIndex: 'desc', key: 'desc'},
              { title: '单位', dataIndex: 'upgradeNum', key: 'upgradeNum' },
              { title: '数值', dataIndex: 'pv', key: 'pv', render (text) {
                return (<span title={text}>{text}</span>)
              }},
              { title: '时间', dataIndex: 'tm', key: 'tm' },
              { title: '质量戳', dataIndex: 'q', key: 'q' },
              {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (record, props) => {
                  return (
                    <span className="table-operation">
                      <Button onClick={()=>{
                        this.showModal(props)
                      }}
                      >浏览数据</Button>
                    </span>
                  )
                }
              }
            ]
          })
      })
    }
    showModal = (record) => {
      console.log(record)
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
        sn: this.props.match.params.sn,
        vsn: this.props.sn,
        name: record.name,
        vt: record.vt,
        time_condition: 'time > now() - 1h',
        value_method: 'raw',
        group_time_span: '1h',
        _: new Date() * 1
      }
      http.get(`/api/method/iot_ui.iot_api.taghisdata?sn=${data.sn}&vsn=${data.vsn}&tag=${data.name}&vt=${data.vt}&time_condition=time > now() - 10m&value_method=raw&group_time_span=10m&_=1551251898530`).then((res)=>{
        const { myCharts } = this.refs;
        let data = [];
        const date = new Date() * 1;
        for (var i = 0;i < 10;i++){
          data.unshift(new Date(date - (i * 60000)).getHours() + ':' + getMin(i, date));
        }
        console.log(name)
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
                  name: '数值',
                  type: 'line',
                  color: '#37A2DA',
                  data: res.message
                }
              ]
          });
      })
    }
    handleOk = () => {
      const {record} = this.state;
      this.setState({
        visible: false
      });
      this.props.history.push(`/BrowsingHistory/${record.sn}/${record.vsn}`)
      myFaultTypeChart.dispose();
    }
    handleCancel = (e) => {
      console.log(e);
      this.setState({
        visible: false
      });
      myFaultTypeChart.dispose();
    }
    render () {
      return (
        <div>
          <Table
              size="small"
              rowKey="key"
              loading={this.state.flag}
              columns={this.state.columns}
              dataSource={this.state.data}
              pagination={false}
          />
          <Modal
              title={this.state.record ? '变量' + this.state.record.name + '十分钟内数值变化' : ''}
              visible={this.state.visible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              footer={[
                <Button key="back"
                    onClick={this.handleCancel}
                >关闭</Button>,
                <Button key="submit"
                    type="primary"
                    onClick={this.handleOk}
                >
                  更多历史数据
                </Button>
              ]}
          >
            <div
                id="faultTypeMain"
                ref="myCharts"
                style={{width: 472, height: 250}}
            ></div>
          </Modal>
        </div>
      );
    }
  }
export default withRouter(ExpandedRowRender);