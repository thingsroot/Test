import React, { Component } from 'react';
import { InputNumber, Button, Modal } from 'antd';
import intl from 'react-intl-universal';

const confirm = Modal.confirm

class EditSwitch extends Component {
    constructor (props){
        super(props)
        this.wait_timer = null
        this.state = {
            value: '',
            _value: '',
            waiting: false,
            editing: false
        }
    }

    componentDidMount (){
        this.setState({
            value: this.props.value,
            _value: this.props.value
        })
    }

    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.props.gateway) {
            this.setState({
                value: nextProps.value,
                _value: nextProps.value,
                waiting: false,
                editing: false
            })
        } else {
            if (nextProps.value !== this.state.value) {
                if (this.state.waiting) {
                    this.setState({value: nextProps.value})
                    if (nextProps.value === this.state._value) {
                        clearTimeout(this.wait_timer)
                        this.setState({waiting: false})
                    }
                } else {
                    if (this.state.editing) {
                        this.setState({ value: nextProps.value })
                        this.showConfirm(nextProps.value)
                    } else {
                        this.setState({
                            value: nextProps.value,
                            _value: nextProps.value
                        })
                    }
                }
            }
        }
    }
    showConfirm (value) {
        let self = this;
        confirm({
            title: intl.get('gateway.show_the_latest_data'),
            content: `${intl.get('gateway.the_data_you_are_modifying_has_changed')}: ` + String(value),
            onOk () {
                self.setState({ _value: value })
            },
            onCancel () {}
        })
    }

    onApplyChange = () => {
        clearTimeout(this.wait_timer)
        this.setState({waiting: true}, () => {
            const {_value } = this.state;
            this.props.onChange(_value, (result, keep_wait_timeout) => {
                if (result) {
                    let timeout = keep_wait_timeout !== undefined ? keep_wait_timeout : 30000
                    clearTimeout(this.wait_timer)
                    if (this.state.value === this.state._value) {
                        this.setState({waiting: false})
                    } else {
                        this.wait_timer = setTimeout( ()=> {
                            this.setState({waiting: false})
                        }, timeout)
                    }
                } else {
                    this.setState({
                        _value: this.state.value,
                        waiting: false
                    })
                }
            })
        })
        this.wait_timer = setTimeout( ()=> {
            const { value } = this.state;
            this.setState({
                _value: value,
                waiting: false
            })
        }, 10000)
    }

    render () {
        const { checked, onChange, disabled } = this.props;
        checked, onChange;
        return (
            <div>
                <InputNumber
                    min={0}
                    value={this.state._value}
                    disabled={disabled}
                    style={{width: 100}}
                    onChange={(value)=>{
                        this.setState({_value: value})
                    }}
                    onFocus={()=>{
                        this.setState({editing: true})
                    }}
                />
                {
                    this.state.editing
                    ? <Button
                        disabled={disabled}
                        style={{
                            position: 'absolute',
                            right: -70,
                            marginLeft: 66,
                            top: 9
                        }}
                        onClick={()=>{
                            this.setState({
                                editing: false
                            }, () => {
                                this.onApplyChange()
                            })
                        }}
                      >{intl.get('appsinstall.save')}</Button>
                    : ''
                }
            </div>
        )
    }
}

export default EditSwitch