import React, { Component } from 'react';
import { Input, Table, Select, Button } from 'antd';
import { inject, observer } from 'mobx-react';
import GatewayStatus from '../../common/GatewayStatus';
import axios from 'axios';
import './style.scss';
const Option = Select.Option;
const Search = Input.Search;
// utc时间转换
const convertUTCTimeToLocalTime = function (UTCDateString) {
  if (!UTCDateString){
    return '-';
  }
  function formatFunc (str) {
    return str > 9 ? str : '0' + str
  }
  const date2 = new Date(UTCDateString);
  const year = date2.getFullYear();
  const mon = formatFunc(date2.getMonth() + 1);
  const day = formatFunc(date2.getDate());
  let hour = date2.getHours();
  const minute  = date2.getSeconds() < 10 ? '0' + date2.getSeconds() : date2.getSeconds();
  hour = formatFunc(hour);
  const min = formatFunc(date2.getMinutes());
  const dateStr = year + '-' + mon + '-' + day + ' ' + hour + ':' + min + ':' + minute;
  return dateStr;
}
const columns = [{
    title: '名称',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: name => `${name}`,
    width: '50%'
  }, {
    title: '描述',
    dataIndex: 'desc'
  }];

  const detailcolumns = [{
    title: '序号',
    dataIndex: 'id',
    sorter: (a, b) => a.id - b.id,
    width: '100px'
  }, {
    title: '类型',
    dataIndex: 'type',
    width: '150px'
  }, {
    title: '数值',
    dataIndex: 'value',
    width: '200px',
    render (text) {
      return (<span title={text}>{text}</span>)
    }
  }, {
    title: '时间',
    dataIndex: 'time',
    render: (time)=>{
      if (time) {
        return (
          <span>{convertUTCTimeToLocalTime(time)}</span>
        )
      }
    }
  }, {
    title: '质量戳',
    dataIndex: 'quality'
  }];


@inject('store')
@observer
class BrowsingHistory extends Component {
    state = {
        data: [],
        filterdata: [],
        pagination: {},
        loading: false,
        detailloading: false,
        rowid: -1,
        detail: [],
        defaultvalue: '--',
        value_function: 'raw',
        value_group_time: '5m',
        value_time_duration: '1h',
        vt: '',
        record: {},
        gateway: '',
        device_sn: ''
      };
      componentDidMount () {
        this.setState({
          gateway: this.props.record.sn,
          device_sn: this.props.record.vsn,
          input: this.props.record.name
        }, () =>{
          this.fetch();
        })
        // this.setState({
        //   gateway: this.props.match.params.sn,
        //   device_sn: this.props.match.params.vsn,
        //   input: this.props.match.params.input
        // }, () =>{
        //   this.fetch();
        // })
        this.props.store.timer.setGateStatusLast(0)
      }
      UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.record.sn !== nextProps.record.sn){
          this.setState({
            gateway: this.props.record.sn,
            device_sn: this.props.record.vsn,
            input: this.props.record.name
          }, () =>{
            this.fetch();
          })
          this.props.store.timer.setGateStatusLast(0)
        }
      }
      handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
          pagination: pager
        });
        this.fetch({
          results: pagination.pageSize,
          page: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          ...filters
        });
      }
      fetch = (params = {}) => {
        this.setState({ loading: true });
        axios({
          url: `/api/gateways_dev_data?gateway=${this.state.gateway}&name=${this.state.device_sn}&_=${new Date() * 1}`,
          method: 'get',
          data: {
            results: 10,
            ...params
          },
          type: 'json'
        }).then((resp) => {
          let res = resp.data;
          if (!res.ok) {
            return
          }
          let current_record = undefined
          res.data.map((val, ind)=>{
              val.id = ind;
              if (this.state.input && val.name === this.state.input) {
                current_record = val;
              }
          })
          const pagination = { ...this.state.pagination };
          // Read total count from server
          pagination.total = res.totalCount;
          // pagination.total = 200;
          this.setState({
            loading: false,
            data: res.data,
            filterdata: res.data,
            pagination
          }, ()=>{
            if (current_record) {
              this.getData(current_record)
            }
          });
        });
      }
      getData = (record)=>{
        const { value_function, value_group_time, value_time_duration, gateway, device_sn} = this.state;
        this.setState({
          rowId: record.id,
          vt: record.vt,
          defaultvalue: this.state.data[record.id].name,
          detailloading: true,
          record: record
        }, ()=>{
          if (record.vt === 'int'){
            record.vt = 'int';
          } else if (record.vt === 'string'){
            record.vt = 'string';
          } else {
            record.vt = 'float';
          }
            axios(`/api/gateways_historical_data?sn=${gateway}&vsn=${device_sn}&tag=${record.name}&vt=${record.vt || 'float'}&start=-${value_time_duration}&value_method=${value_function}&group_time_span=${value_group_time}&_=1551251898530`, {
              method: 'get',
              headers: {
                  Accept: 'application/json, text/javascript, */*; q=0.01'
              }
            }).then(resp=>{
                let res = resp.data
                if (!res.ok) {
                  return
                }
                if (res.data !== undefined){
                  res.data.map((val, ind)=>{
                    val.id = ind + 1;
                    val.type = this.state.value_function;
                  })
                  this.setState({
                      detail: res.data,
                      detailloading: false
                  })
                } else {
                  this.setState({
                    detail: [],
                    detailloading: false
                })
                }
            })
        });
      }
      onClickRow = (record) => {
        return {
            onClick: () => {
              this.getData(record)
            }
          };
      }
      setRowClassName = (record) => {
        return record.id === this.state.rowId ? 'clickRowStyl' : '';
      }
      handleChange (type, value) {
        switch (type){
          case 'value_function':
              this.setState({value_function: value}, ()=>{
                if (Object.keys(this.state.record).length > 0) {
                  this.getData(this.state.record)
                }
              });
              break;
          case 'value_group_time':
              this.setState({value_group_time: value}, ()=>{
                if (Object.keys(this.state.record).length > 0) {
                  this.getData(this.state.record)
                }
              });
              break;
          case 'value_time_duration':
              this.setState({value_time_duration: value}, ()=>{
                if (Object.keys(this.state.record).length > 0) {
                  this.getData(this.state.record)
                }
              });
              break;
          default: '';
        }
      }
      searchVariable = (e) =>{
        const events = event || e;
        if (this.state.filterdata && this.state.filterdata.length > 0){
          let value = events.target.value;
          let data = this.state.filterdata.filter((item)=>item.name.indexOf(value) !== -1)
          this.setState({
            data
          })
        }
      }
    render () {
        return (
            <div className="historywrap">
                <GatewayStatus gateway={this.state.gateway}/>
                <div className="history">
                    <div className="historyleft">
                        <div style={{display: 'flex'}}>
                            <span style={{lineHeight: '30px', marginRight: '10px'}}>选中变量:</span>
                            <Input disabled
                                value={this.state.defaultvalue}
                                style={{width: 300}}
                            />
                        </div>
                        <div style={{margin: '10px 0'}}>
                          <span style={{marginRight: '10px'}}>查找变量:</span>
                          <Search
                              placeholder="input search text"
                              onSearch={this.searchVariable}
                              style={{ width: 200 }}
                          />
                        </div>
                        <Table
                            columns={columns}
                            size="middle"
                            rowKey="id"
                            bordered
                            dataSource={this.state.data}
                            pagination={this.state.pagination}
                            loading={this.state.loading}
                            onRow={this.onClickRow}
                            rowClassName={this.setRowClassName}
                            onChange={this.handleTableChange}
                        />
                    </div>
                    <div className="historyright">
                        <Button
                            style={{position: 'absolute', right: 10, top: 20}}
                            onClick={()=>{
                              // this.props.history.go(-1)
                              this.props.closewindows()
                            }}
                        >
                          关闭
                          {/* <Icon type="rollback"/> */}
                        </Button>
                        <div
                            style={{margin: '10px 0'}}
                        >
                          <span>取值方式：</span>
                            <Select defaultValue="raw"
                                disabled={this.state.vt === 'string'}
                                style={{ width: 120 }}
                                onChange={(value)=>{
                                  this.handleChange('value_function', value)
                                }}
                            >
                              <Option value="raw">原始值</Option>
                              <Option value="mean">平均值</Option>
                              <Option value="max">最大值</Option>
                              <Option value="min">最小值</Option>
                              <Option value="sum">总和</Option>
                              <Option value="count">个数</Option>
                            </Select>
                          <span style={{marginLeft: '10px'}}>统计时域：</span>
                            <Select defaultValue="5m"
                                style={{ width: 120 }}
                                disabled={this.state.value_function === 'raw' ? true : false}
                                onChange={(value)=>{
                              this.handleChange('value_group_time', value)
                            }}
                            >
                              <Option value="5s">五秒</Option>
                              <Option value="10s">十秒</Option>
                              <Option value="30s">三十秒</Option>
                              <Option value="1m">一分钟</Option>
                              <Option value="5m">五分钟</Option>
                              <Option value="10m">十分钟</Option>
                              <Option value="30m">半小时</Option>
                              <Option value="1h">一小时</Option>
                              <Option value="1d">一天</Option>
                            </Select>
                          <span style={{marginLeft: '10px'}}>时间范围：</span>
                          <Select defaultValue="1h"
                              style={{ width: 120 }}
                              onChange={(value)=>{
                                this.handleChange('value_time_duration', value)
                              }}
                          >
                              <Option value="15m">十五分钟</Option>
                              <Option value="30m">半小时</Option>
                              <Option value="1h">一小时</Option>
                              <Option value="2h">两小时</Option>
                              <Option value="12h">半天</Option>
                              <Option value="1d">一天</Option>
                              <Option value="3d">三天</Option>
                              <Option value="7d">一周</Option>
                              <Option value="30d">一个月</Option>
                            </Select>
                        </div>
                        <Table
                            columns={detailcolumns}
                            dataSource={this.state.detail && this.state.detail.length > 0 ? this.state.detail : []}
                            size="small"
                            rowKey="id"
                            bordered
                            loading={this.state.detailloading}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default BrowsingHistory;