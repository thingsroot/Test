import React from 'react';
import {inject, observer} from 'mobx-react';
import {Input} from 'antd';
import {withRouter} from 'react-router-dom'
import http from '../../../utils/Server';

@withRouter
@inject('store')
@observer
class Inst extends React.Component {
    state ={
        errorMessage: ''
    }
    instBlur = ()=>{
        if (this.props.inst_name === '' || this.props.inst_name === undefined) {
            this.setState({errorMessage: '实例名不能为空'})
        } else {
            this.setState({errorMessage: ''})
        }
    };
    instChange = (e)=>{
        let value = e.target.value
        value = value.replace(/[^A-Za-z0-9_]/, '')
        if (this.state.inst_name !== value) {
            this.setState({inst_name: value}, () => {
                this.props.onChange(value)
                setTimeout(this.checkInstanceName, 1000)
            })
        }
    };

    checkInstanceName = ()=>{
        let gateway_sn = this.props.gateway_sn;
        http.get('/api/gateways_applications_list?gateway=' + gateway_sn).then(res=>{
            if (res.ok === true) {
                this.setState({errorMessage: ''})
                let names = Object.keys(res.data);
                names && names.length > 0 && names.map(item=>{
                    if (this.props.inst_name === item) {
                        this.setState({errorMessage: '实例名' + item + '已经存在!'})
                    }
                })
            }
        })
    };

    render () {
        const { gateway_sn, inst_name, editable, onChange } = this.props;
        gateway_sn, onChange;
        return (
            <div className="Inst">
                <p style={{lineHeight: '50px'}}>
                    <span className="spanStyle">实例名：</span>
                    <Input
                        disabled={editable !== true}
                        type="text"
                        style={{width: '300px'}}
                        value={inst_name}
                        allowClear
                        onChange={this.instChange}
                        onBlur={this.instBlur}
                    />
                    <span className="error">{this.state.errorMessage}</span>
                </p>
            </div>
        )
    }
}
export default Inst;