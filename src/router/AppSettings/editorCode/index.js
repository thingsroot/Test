import React, { Component } from 'react';
import { split as SplitEditor} from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/tomorrow';
import {inject, observer} from 'mobx-react';
import { message } from 'antd';
const style = {
    flexGrow: 1,
    display: 'inline-block',
    paddingBottom: '10px'
};

@inject('store')
@observer
class EditorCode extends Component {
    state = {
        data: '{name: "alice"}'
    };

    onChange = (value)=>{
        console.log(value);
        this.props.store.codeStore.setConfiguration(value[0]);
        console.log(this.props.store.codeStore.configuration);
        this.props.store.codeStore.setPredefined(value[1])
    };
    prettyJson (str) {
        let data = JSON.parse(str)
        if (!data) {
            message.error('JSON解析错误')
            return str
        }
        return JSON.stringify(data, null, 4)
    }

    render () {
        const { settingData } = this.props.store.codeStore;
        return (
            <div
                className="editorCode"
                style={{width: '100%'}}
            >
                <div style={{paddingBottom: '20px'}}>
                    <p style={{display: 'flex'}}>
                        <span style={style}>可视化面板描述(JSON):</span>
                        <span style={style}>应用初始值(JSON):</span>
                    </p>
                    <SplitEditor
                        style={{width: '100%'}}
                        mode="java"
                        theme="tomorrow"
                        splits={2}
                        fontSize={18}
                        orientation="beside"
                        value={[
                            settingData.preConfiguration ? this.prettyJson(settingData.preConfiguration) : '',
                            settingData.confTemplate ? this.prettyJson(settingData.confTemplate) : ''
                        ]}
                        name="UNIQUE_ID_OF_DIV"
                        onChange={this.onChange}
                        editorProps={{$blockScrolling: true}}
                    />

                </div>
            </div>
        );
    }
}

export default EditorCode;