import React, { Component } from 'react';
import { split as SplitEditor} from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/github';
import {inject, observer} from 'mobx-react';
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

    render () {
        const { settingData } = this.props.store.codeStore;
        return (
            <div
                className="editorCode"
                style={{width: '100%'}}
            >
                <div style={{paddingBottom: '20px'}}>
                    <p style={{display: 'flex'}}>
                        <span style={style}>配置面板描述(JSON):</span>
                        <span style={style}>应用初始值(JSON):</span>
                    </p>
                    <SplitEditor
                        style={{width: '100%'}}
                        mode="java"
                        theme="github"
                        splits={2}
                        fontSize={18}
                        orientation="beside"
                        value={[settingData.preConfiguration ? settingData.preConfiguration : '', settingData.confTemplate ? settingData.confTemplate : '']}
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