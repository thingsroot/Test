import React, { Component } from 'react';
import http from '../../../utils/Server';
import { Table } from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Collapses from './Collapses';
import PropTypes from 'prop-types';
const columns = [{
    title: '名称',
    dataIndex: 'meta.inst',
    key: 'meta.inst'
    // sorter: true
  }, {
    title: '描述',
    dataIndex: 'meta.description',
    key: 'meta.description'
    // sorter: true
  }, {
    title: 'I/O/C',
    dataIndex: 'meta.ioc',
    key: 'meta.ioc'
    // sorter: true
  }, {
    title: '设备SN',
    key: 'meta.sn',
    dataIndex: 'meta.sn',
    width: '30%'
    // sorter: true
  }, {
    title: '所属实例',
    key: 'meta.app_inst',
    dataIndex: 'meta.app_inst'
    // sorter: true
    }
  //   , {
  //   title: 'Action',
  //   key: 'action',
  //   render: (record) => {
  //     return (<span>
  //       <Link
  //           disabled={record.set_data ? false : true}
  //           to={`/MyGatesDevicesOutputs/${record.Gate_Sn}/${record.sn}`}
  //           key="1"
  //       >数据下置</Link>
  //     </span>)
  //   }
  // }
  ];
  @withRouter
  @inject('store')
  @observer
class GatesList extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }


    state = {
        data: [],
        loading: true,
        sn: this.props.match.params.sn,
        devList: []
    }
    componentDidMount (){
      this.timer = setInterval(() => {
        this.getData(this.state.sn);
      }, 3000);
    }
    UNSAFE_componentWillReceiveProps (nextProps){
      if (nextProps.location.pathname !== this.props.location.pathname){
        clearInterval(this.timer)
        this.timer = setInterval(() => {
          this.getData(this.state.sn);
        }, 3000);
        const sn = nextProps.match.params.sn;
        this.setState({
            sn,
            loading: true
        }, ()=>{
            this.getData(sn);
        });
      }
    }
    componentWillUnmount (){
      clearInterval(this.timer)
    }
    getData (sn){
        http.get('/api/gateways_dev_list?gateway=' + sn).then(res=>{
          let data = [];
          if (res.message && res.message.length > 0){
            res.message.map((item=>{
              item.meta.ioc = '' + (item.inputs ? item.inputs.length : '0') + '/' + (item.outputs ? Object.keys(item.outputs).length : '0') + '/' + (item.commands ? item.commands.length : '0');
              if (item.meta.outputs > 0){
                item.meta.Gate_Sn = this.props.match.params.sn;
                item.meta.set_data = true
              }
              data.push(item);
            }))
          }
          this.setState({
            data,
            devList: res.message,
            loading: false
          })
        })
    }
    render () {
        let { data, loading } = this.state;
        return (
            <div>
                      <Table
                          columns={columns}
                          dataSource={
                              data && data.length > 0 ? data : []
                          }
                          loading={loading}
                          rowKey="meta.sn"
                          expandedRowRender={Collapses}
                          expandRowByClick
                      />
            </div>
        );
    }
}

export default GatesList;