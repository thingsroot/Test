import http from './Server';

export function exec_result (id) {
    return new Promise((resolve, reject) => {
        http.get('/api/gateways_exec_result?id=' + id).then(res=>{
            if (res.data  && res.data.result === true){
                return resolve([true, res.data.message])
            }
            if (res.data && res.data.result === false){
                return resolve([false, res.data.message])
            } else {
                return reject('Running')
            }
        }).catch(err=>{
            reject(err)
        })
    })
}

export function doUpdate (actions, cb) {
    let now = new Date().getTime()
    actions.map( (action)=>{
        if (action.status !== 'running' ) {
            return
        }
        if (now > action.start + action.timeout) {
            cb(action, 'timeout', 'Action timeout')
            return
        }
        if (now > action.last + 1000){
            action.last = now + 3000
            exec_result(action.id).then( ([result, msg]) => {
                console.log(result, msg)
                if (result) {
                    cb(action, 'done', msg)
                } else {
                    cb(action, 'failed', msg)
                }
                if (action.finish_action !== undefined) {
                    action.finish_action(result)
                }
            }).catch( err=> {
                console.log(err)
            })
        }
    })
}
