import React from 'react';
import {inject, observer} from 'mobx-react';
import {Input} from 'antd';
import {withRouter} from 'react-router-dom'
import http from '../../../utils/Server';
import intl from 'react-intl-universal';

@withRouter
@inject('store')
@observer
class Inst extends React.Component {
    state ={
        errorMessage: ''
    }
    instBlur = ()=>{
        if (this.props.inst_name === '' || this.props.inst_name === undefined) {
            this.setState({errorMessage: intl.get('appsinstall.instance_name_cannot_be_empty')})
        } else {
            this.setState({errorMessage: ''})
        }
    };
    instChange = (e)=>{
        let value = e.target.value
        value = value.replace(/[^A-Za-z0-9_]/, '');
        this.props.onChange(value)
        if (this.state.inst_name !== value) {
            this.setState({inst_name: value}, () => {
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
                        this.setState({errorMessage: intl.get('appsinstall.instance_name') + item + `${intl.get('appsinstall.already_exist')}!`})
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
                    <span className="spanStyle">{intl.get('appsinstall.instance_name')}：</span>
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