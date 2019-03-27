import React, { PureComponent } from 'react';
import marked from 'marked';
import http from '../../../utils/Server';

class AppDesc extends PureComponent {
    state = {
        editorContent: ''
    };
    componentDidMount (){
        const {name} = this.props;
        http.postToken('/api/method/app_center.api.app_detail?app=' + name).then(res=>{
            this.setState({
                editorContent: res.message.description
            });
            let rendererMD = new marked.Renderer();
            marked.setOptions({
                renderer: rendererMD,
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                sanitize: false,
                smartLists: true,
                smartypants: false
            });//基本设置
            document.getElementById('editor').innerHTML = marked(this.state.editorContent);
        });


    }
    render () {
        return (
            <div className="appDesc">
                <div id="editor"> </div>
            </div>
        );
    }
}

export default AppDesc;