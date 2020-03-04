import React, { PureComponent } from 'react';
import {withRouter} from 'react-router-dom';
import http from '../../../utils/Server';
@withRouter
class Wps extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            iFrameHeight: '100%'
        }
    }
    componentDidMount () {
        const {version, newVersion} = this.props;
        http.get('/api/get_wps_url?conf=' + this.props.match.params.name + '&version=' + version + '&version_new=' + (newVersion + 1)).then(res=>{
            if (res.ok) {
                this.setState({
                    url: res.url
                })
            }
        })
    }
    render () {
        return (
            <div
                id="wps_wrap"
            >
                <iframe
                    style={{width: '100%', height: this.state.iFrameHeight, overflow: 'visible'}}
                    ref="iframe"
                    src={this.state.url}
                    width="100%"
                    height={this.state.iFrameHeight}
                    scrolling="no"
                    frameBorder="0"
                />
                </div>
        )
    }
}

export default Wps