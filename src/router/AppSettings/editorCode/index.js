import React, { PureComponent } from 'react';
import { split as SplitEditor} from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/github';
const style = {
    flexGrow: 1,
    display: 'inline-block',
    paddingBottom: '10px'
}
class EditorCode extends PureComponent {
    state = {
        data: '{name: "alice"}'
    };
    render () {
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
                        mode="json"
                        theme="github"
                        splits={2}
                        fontSize={18}
                        orientation="beside"
                        value={['', this.state.data]}
                        name="UNIQUE_ID_OF_DIV"
                        editorProps={{$blockScrolling: true}}
                    />
                    {
                        console.log(this.state.data)
                    }
                </div>
            </div>
        );
    }
}

export default EditorCode;