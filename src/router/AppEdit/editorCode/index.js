import React, { Component } from 'react';
import { split as SplitEditor} from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/tomorrow';
import intl from 'react-intl-universal';

const style = {
    flexGrow: 1,
    display: 'inline-block',
    paddingBottom: '10px'
};

class EditorCode extends Component {
    state = {
        data: '{name: "alice"}'
    };

    onChange = (value)=>{
        this.props.onChange(value[0], value[1]);
    };

    render () {
        const { pre_configuration, conf_template } = this.props;
        return (
            <div
                className="editorCode"
                style={{width: '100%'}}
            >
                <div style={{paddingBottom: '20px'}}>
                    <p style={{display: 'flex'}}>
                        <span style={style}>{intl.get('appedit.visual_panel_description')}:</span>
                        <span style={style}>{intl.get('appedit.apply_initial_value')}:</span>
                    </p>
                    <SplitEditor
                        style={{width: '100%'}}
                        mode="java"
                        theme="tomorrow"
                        splits={2}
                        fontSize={18}
                        orientation="beside"
                        value={[
                            conf_template ? conf_template : '',
                            pre_configuration ? pre_configuration : ''
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