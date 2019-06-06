import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
//import { LazyLoad } from 'react-lazy-load';
import AppCard from '../../common/AppCard';
/*
import {Input, Icon, Button, message, notification, Rate, Drawer } from 'antd';  //
const openNotification = (title, message) => {
    notification.open({
        message: title,
        description: message,
        placement: 'buttonRight'
    });
};
*/


@withRouter
@inject('store')
@observer
class AppStore extends Component {
    constructor (props){
        super(props)
        this.state = {
            data: []
        }
    }

    componentDidMount (){
        let arr = ['aaaa', 'bbb', 'eee']
        this.setState({data: arr})
    }

    render () {
        const { data } = this.state;
        return (
        <div className="AppStore">
            <div className="installcontent">
                {
                    data && data.length > 0 && data.map((val, ind)=>{
                        return (
                            // <LazyLoad
                            //     key={ind}
                            //     offsetTop={100}
                            // >
                            // <AppCard
                            //     app={val}
                            // />
                            // </LazyLoad>
                            <AppCard
                                app={val}
                                key={ind}
                            />
                        )
                    })
                }
            </div>
        </div>
        );
    }
}

export default AppStore;