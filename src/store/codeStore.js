import {observable, action} from 'mobx';
class CodeStore {
    @observable treeData = [];
    @observable isChange = false;
    @observable folderType = '';
    @observable myFolder = '';
    @observable editorContent = '';
    @observable newEditorContent = '';
    @observable myEditor = null;
    @observable fileName = 'version';
    @observable addFileName = '';
    @observable addFolderName = '';

    @observable readOnly = true;
    @observable editorValue = {};
    @observable instName = '123';
    @observable template = [];   //template选项
    @observable dataSource = [];   //templateList
    @observable allTableData = [];   //表格数据

    @observable platformData = [];   //平台消息
    @observable tableData = [];   //

    @observable deviceData = [];   //设备消息
    @observable deviceTableData = [];   //

    @observable versionVisible = false;   //版本列表的form表单visible
    @observable templateVisible = false;  //模板列表的form表单visible
    @observable copyVisible = false;  //复制模板列表的form表单visible
    @observable copyData = {};  //复制模板列表的form表单默认值

    @observable description = '';//创建修改应用时markdown的值
    @observable configuration = '';     //配置面板
    @observable predefined = '';        //预定义

    @observable settingData = {
        appName: '',
        codeName: '',
        licenseType: '免费',
        description: '',
        confTemplate: '',
        preConfiguration: ''
    };

    @action setSettingData (values) {
        this.settingData = values;
    }

    @action setAllTableData (values) {
        this.allTableData = values;
    }

    @action setConfiguration (values) {
        this.configuration = values;
    }

    @action setPredefined (values) {
        this.predefined = values;
    }

    @action setDescription (values) {
        this.description = values;
    }

    @action setCopyVisible (values) {
        this.copyVisible = values;
    }

    @action setCopyData (values) {
        this.copyData = values;
    }

    @action setVersionVisible (values) {
        this.versionVisible = values;
    }

    @action setTemplateVisible (values) {
        this.templateVisible = values;
    }

    @action setDeviceData (values) {
        this.deviceData = values;
    }
    @action setDeviceTableData (values) {
        this.deviceTableData = values;
    }
    @action setPlatformData (values) {
        this.platformData = values;
    }
    @action setTableData (values) {
        this.tableData = values;
    }
    @action setTemplate (values) {
        this.template = values;
    }
    @action setDataSource (values) {
        this.dataSource = values;
        console.log(values)
    }
    @action setEditorContent (values) {
        this.editorContent = values;
    }
    @action setTreeData (values) {
        this.treeData = [...values];
    }
    @action setMyEditor (values) {
        this.myEditor = values;
    }
    @action setMyFolder (values) {
        this.myFolder = values;
    }
    @action setFolderType (values) {
        this.folderType = values;
    }
    @action setNewEditorContent (values) {
        this.newEditorContent = values;
    }
    @action change () {
        this.isChange = !this.isChange
    }
    @action setReadOnly () {
        this.readOnly = !this.readOnly
    }
    @action setFileName (values) {
        this.fileName = values;
    }
    @action setAddFileName (values) {
        this.addFileName = values;
    }
    @action setAddFolderName (values) {
        this.addFolderName = values;
    }
    @action setEditorValue (values) {
        this.editorValue = values;
    }
    @action setInstName (values) {
        this.instName = values;
        console.log(values)
    }

}

export default new CodeStore()