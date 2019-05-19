import React, { Component } from 'react';
import { Table, Button, Icon } from 'antd';
import http from '../../../utils/Server';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Action from './action';
import app from '../../../assets/images/app.png'
let timer;
@withRouter
@inject('store') @observer
class AppsList extends Component {
      constructor (props){
        super(props)
        this.state = {
          data: [],
          pagination: {},
          loading: true,
          url: window.location.pathname,
          columns: [{
            title: '',
            dataIndex: 'data.data.icon_image',
            key: 'img',
            width: '100px',
            render: (record)=>{
              console.log(record, 'img')
              if (record) {
                return (
                  <img
                      src={record}
                      alt=""
                      style={{width: 50, height: 50}}
                  />
                  )
              } else {
                return (
                  <img
                      src={app}
                      alt=""
                      style={{width: 50, height: 50}}
                  />
                )
              }
            }
          }, {
            title: '实例名',
            dataIndex: 'device_name',
            sorter: true,
            //render: name => `${name} ${name}`,
            width: '20%',
            action: (record)=>{
              return (
                <Button>{record}</Button>
              )
            }
          }, {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
            render: (props, record)=>{
              console.log(record)
              if (record.data){
                if (record.latestVersion > props) {
                  return (
                      <span style={{color: 'blue'}}>
                       {props} <Icon type="arrow-up"/>
                      </span>
                  )
                } else {
                  return <span>{props}</span>
                }
              } else {
                return (
                  <span style={{color: 'orange'}}>本地</span>
                )
              }
            }
          }, {
            title: '设备数',
            dataIndex: 'devs_len',
            key: 'devs_len'
          }, {
            title: '状态',
            dataIndex: 'status',
            render: record=>{
              if (record === 'running'){
                return (
                  <span style={{background: '#00a65a', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
                )
              } else {
                return (
                  <span style={{background: '#f39c12', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
                )
              }
            }
          }, {
            title: '启动时间',
            dataIndex: 'running'
          }
        ]
      }
      }
      componentDidMount () {
        this.fetch(this.props.match.params.sn);
        timer = setInterval(() => {
          this.fetch(this.props.match.params.sn)
        }, 10000);
      }
      UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.location.pathname !== this.props.location.pathname){
        clearInterval(timer);
        timer = setInterval(() => {
          this.fetch(nextProps.match.params.sn)
        }, 10000);
        this.setState({
          loading: true
        }, ()=>{
          this.fetch(nextProps.match.params.sn);
        })
        }
      }
      componentWillUnmount (){
        clearInterval(timer)
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
      fetch = (sn) => {
        const pagination = { ...this.state.pagination };
        http.get('/api/gateways_app_list?gateway=' + sn + '&beta=' + this.props.store.appStore.status.enable_beta).then(res=>{
          this.props.store.appStore.setApplen(res.message && res.message.length)
          this.setState({
            data: res.message,
            loading: false,
            pagination
          })
        })
      }
    render () {
      const { loading } = this.state;
        return (
            <div>
                <Table
                    rowKey="sn"
                    columns={this.state.columns}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={loading}
                    onChange={this.handleTableChange}
                    bordered
                    expandRowByClick
                    expandedRowRender={(record) => <Action record={record}/>}
                />
            </div>
        );
    }
}

export default AppsList;