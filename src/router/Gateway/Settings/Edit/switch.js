import React, { Component } from 'react';
import { Switch } from 'antd';


class EditSwitch extends Component {
    constructor (props){
        super(props)
        this.wait_timer = null
        this.state = {
            _checked: false,
            checked: false,
            waiting: false
        }
    }

    componentDidMount (){
        this.setState({
            checked: this.props.checked,
            _checked: this.props.checked
        })
    }

    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.props.gateway) {
            this.setState({
                checked: nextProps.checked,
                _checked: nextProps.checked,
                waiting: false
            })
        } else {
            if (nextProps.checked !== this.state.checked){
                if (this.state.waiting) {
                    this.setState({checked: nextProps.checked})
                    if (nextProps.checked === this.state._checked) {
                        clearTimeout(this.wait_timer)
                        this.setState({waiting: false})
                    }
                } else {
                    this.setState({
                        checked: nextProps.checked,
                        _checked: nextProps.checked
                    })
                }
            }
        }
    }
    onCheckedChangeWithWarning = (value) => {
        this.props.onWarning(value, (checked) => {
            this.onCheckedChange(checked)
        })
    }

    onCheckedChange = (value) => {
        clearTimeout(this.wait_timer)
        this.setState({_checked: value, waiting: true}, () => {
            const { _checked } = this.state;
            this.props.onChange(_checked, (result, keep_wait_timeout) => {
                if (result) {
                    let timeout = keep_wait_timeout !== undefined ? keep_wait_timeout : 30000
                    clearTimeout(this.wait_timer)
                    if (this.state.checked === this.state._checked) {
                        this.setState({waiting: false})
                    } else {
                        this.wait_timer = setTimeout( ()=> {
                            this.setState({waiting: false})
                        }, timeout)
                    }
                } else {
                    this.setState({
                        _checked: this.state.checked,
                        waiting: false
                    })
                }
            })
        })
        this.wait_timer = setTimeout( ()=> {
            const { checked } = this.state;
            this.setState({
                _checked: checked,
                waiting: false
            })
        }, 10000)
    }

    render () {
        const { checked, onChange, onWarning, disabled } = this.props;
        checked, onChange;
        return (
        <Switch
            checkedChildren="ON&nbsp;"
            unCheckedChildren="OFF"
            checked={this.state._checked}
            disabled={disabled || this.state.waiting}
            onChange={onWarning ? this.onCheckedChangeWithWarning : this.onCheckedChange}
        />)
    }
}

export default EditSwitch