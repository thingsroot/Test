import React, { Component } from 'react';
import { Input, Table, Select, Button, Icon } from 'antd';
import { inject, observer } from 'mobx-react';
import GatewayStatus from '../../common/GatewayStatus';
import axios from 'axios';
import './style.scss';
import intl from 'react-intl-universal';

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
    title: intl.get('common.name'),
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: name => `${name}`,
    width: '50%'
  }, {
    title: intl.get('common.desc'),
    dataIndex: 'desc'
  }];

  const detailcolumns = [{
    title: intl.get('dashboard.the_serial_number'),
    dataIndex: 'id',
    sorter: (a, b) => a.id - b.id,
    width: '150px'
  }, {
    title: intl.get('common.type'),
    dataIndex: 'type',
    width: '150px'
  }, {
    title: intl.get('common.number'),
    dataIndex: 'value',
    width: '200px',
    render (text) {
      return (<span title={text}>{text}</span>)
    }
  }, {
    title: intl.get('common.time'),
    dataIndex: 'time',
    render: (time)=>{
      if (time) {
        return (
          <span>{convertUTCTimeToLocalTime(time)}</span>
        )
      }
    }
  }, {
    title: intl.get('appstore.quality_stamp'),
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
                            {intl.get('appstore.select_variables')}：
                            <Input disabled
                                value={this.state.defaultvalue}
                                style={{width: 300}}
                            />
                        </div>
                        <div style={{margin: '10px 0'}}>
                          <span style={{marginRight: '10px'}}>{intl.get('gateway.To_find_the_variables')}:</span>
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
                            style={{position: 'absolute', right: 10, top: 10}}
                            // style={{position: 'absolute', right: 10, top: 20}}
                            onClick={()=>{
                              // this.props.history.go(-1)
                              this.props.closewindows()
                            }}
                        >
                          {intl.get('appstore.back_off')}
                          <Icon type="rollback"/>
                        </Button>
                        <div>
                          {intl.get('appstore.way_of_value_selection')}：
                            <Select defaultValue="raw"
                                disabled={this.state.vt === 'string'}
                                style={{ width: 120 }}
                                onChange={(value)=>{
                                  this.handleChange('value_function', value)
                                }}
                            >
                              <Option value="raw">{intl.get('appstore.original_value')}</Option>
                              <Option value="mean">{intl.get('appstore.average_value')}</Option>
                              <Option value="max">{intl.get('appstore.maximum_value')}</Option>
                              <Option value="min">{intl.get('appstore.minimum_value')}</Option>
                              <Option value="sum">{intl.get('appstore.the_sum')}</Option>
                              <Option value="count">{intl.get('appstore.number')}</Option>
                            </Select>
                          {intl.get('appstore.statistical_time_domain')}：
                            <Select defaultValue="5m"
                                style={{ width: 120 }}
                                disabled={this.state.value_function === 'raw' ? true : false}
                                onChange={(value)=>{
                              this.handleChange('value_group_time', value)
                            }}
                            >
                              <Option value="5s">{intl.get('appstore.five_seconds')}</Option>
                              <Option value="10s">{intl.get('appstore.ten_seconds')}</Option>
                              <Option value="30s">{intl.get('appstore.thirty_seconds')}</Option>
                              <Option value="1m">{intl.get('appstore.one_Minute')}</Option>
                              <Option value="5m">{intl.get('appstore.five_Minute')}</Option>
                              <Option value="10m">{intl.get('appstore.ten_Minute')}</Option>
                              <Option value="30m">{intl.get('appstore.half_an_hour')}</Option>
                              <Option value="1h">{intl.get('appstore.one_hour')}</Option>
                              <Option value="1d">{intl.get('appstore.one_day')}</Option>
                            </Select>
                          {intl.get('appstore.time_frame')}：
                          <Select defaultValue="1h"
                              style={{ width: 120 }}
                              onChange={(value)=>{
                                this.handleChange('value_time_duration', value)
                              }}
                          >
                              <Option value="15m">{intl.get('appstore.fifteen_minutes')}</Option>
                              <Option value="30m">{intl.get('appstore.half_an_hour')}</Option>
                              <Option value="1h">{intl.get('appstore.one_hour')}</Option>
                              <Option value="2h">{intl.get('appstore.two_hours')}</Option>
                              <Option value="12h">{intl.get('appstore.half_day')}</Option>
                              <Option value="1d">{intl.get('appstore.one_day')}</Option>
                              <Option value="3d">{intl.get('appstore.three_days')}</Option>
                              <Option value="7d">{intl.get('appstore.a_week')}</Option>
                              <Option value="30d">{intl.get('appstore.one_month')}</Option>
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