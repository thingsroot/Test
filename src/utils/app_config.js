import {observable, action} from 'mobx'

const createDefaultValue = (type, default_value, values) => {
    if (default_value !== undefined) {
        return default_value
    }
    if (type === 'boolean') {
        return values === undefined ? false : values[0]
    }
    if (type === 'number') {
        return values === undefined ? 0 : values[0]
    }
    if (type === 'string') {
        return values === undefined ? '' : values[0]
    }
    if (type === 'dropdown') {
        return values === undefined ? '' : values[0]
    }
    if (type === 'templates') {
        return values === undefined ? [] : values
    }
    if (type === 'table') {
        return values === undefined ? [] : values
    }
    if (type === 'section') {
        return values === undefined ? {} : values
    }
    if (type === 'serial') {
        return values === undefined ? {} : values
    }
    if (type === 'tcp_client') {
        return values === undefined ? {} : values
    }
}

const newConfigItem = (name, desc, type, default_value, depends, values) => {
    var item = observable({
        // observable 属性:
        name: name,
        desc: desc,
        type: type,
        default: default_value,
        depends: depends,
        values: values,
        value: createDefaultValue(type, default_value, values),
        hide: false,

        // 动作:
        setName (value) {
            this.name = value;
        },
        setDesc (value) {
            this.desc = value;
        },
        setType (value) {
            this.type = value;
        },
        setDefault (value) {
            this.default = value;
        },
        setDepends (value) {
            this.depends = value;
        },
        setValues (value) {
            this.values = value;
        },
        setValue (value) {
            this.value = value;
        },
        setHide (value) {
            this.hide = value;
        },

        get Value () {
            return this.value
        }
    }, {
        setName: action,
        setDesc: action,
        setType: action,
        setDefault: action,
        setDepends: action,
        setValues: action,
        setValue: action
    });
    return item;
}

class ConfigSection {
    @observable name = ''
    @observable desc = ''
    @observable type = ''
    @observable child = []
    @observable hide = false

    @action setName (value) {
        this.name = value;
    }
    @action setDesc (value) {
        this.desc = value;
    }
    @action delChild (name) {
        this.child.slice(this.child.findIndex( item => item.name === name), 1)
    }
    @action addChild (name, desc, type, default_value, depends, values) {
        let item = newConfigItem(name, desc, type, default_value, depends, values)
        this.child.push(item)
    }

    @action fromObject (obj) {
        this.name = obj.name
        this.desc = obj.desc
        this.type = obj.type
        obj.child && obj.child.length > 0 && obj.child.map( (v, key) => {
            key;
            this.addChild(v.name, v.desc, v.type, v.default, v.depends, v.values)
        })
    }

    get Value () {
        let val = {}
        for (let item of this.child) {
            val[item.name] = item.Value
        }
        return val
    }

    @action setValue (value) {
        for (let item of this.child) {
            item.setValue(value[item.name])
        }
    }
}

const newAppConfigTemplate = (name, conf_name, description, version) => {
    var item = observable({
        // observable 属性:
        name: name,
        conf_name: conf_name,
        description: description,
        version: version,

        // 动作:
        setName (value) {
            this.name = value;
        },
        setConfName (value) {
            this.conf_name = value;
        },
        setDescription (value) {
            this.description = value;
        },
        setVersion (value) {
            this.version = value;
        }
    }, {
        setName: action,
        setConfName: action,
        setDescription: action,
        setVersion: action
    });
    return item;
}

export class ConfigStore {
    @observable sections = []
    @observable templates = []

    @action addSection (section) {
        let item = new ConfigSection()
        item.fromObject(section)
        this.sections.push(item)
    }
    @action delSection (name) {
        this.sections.splice(this.sections.findIndex( item => item.name === name), 1)
    }
    @action cleanSetion () {
        this.sections.clear()
    }

    @action addTemplate (name, conf_name, description, version ) {
        let item = newAppConfigTemplate(name, conf_name, description, version)
        return this.templates.push( item );
    }

    @action delTemplate (index) {
        this.templates.splice(index, 1)
    }

    @action delTemplateByName (name) {
        this.templates.splice(this.templates.findIndex(item => name === item.name), 1)
    }

    get Value (){
        let value = {}
        this.sections.map( (section, skey) => {
            skey;
            let sval = section.Value;
            for (let [k, v] of Object.entries(sval)) {
                value[k] = v
            }
        })
        return value
    }
    @action setValue (value){
        for (let [k, v] of Object.entries(value)) {
            this.setKeyValue(k, v)
        }
    }

    getKeyValue (key){
        this.sections.map( (section, skey) => {
            if (key === skey) {
                return section.Value
            }
            for (let item of section.child) {
                if (key === item.name) {
                    return item.Value
                }
            }
        })
    }

    @action setKeyValue (key, value) {
        this.sections.map( (section, index) => {
            index;
            if (key === section.name) {
                section.setValue(value)
                return
            }
            for (let item of section.child) {
                if (key === item.name) {
                    item.setValue(value)
                    return
                }
            }
        })
    }
}
