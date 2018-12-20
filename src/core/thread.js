
export const SERIAL_EXECUTOR = 1, POOL_EXECUTOR = 2;

const thread_context = {
    SERIAL_EXECUTOR: SERIAL_EXECUTOR,
    POOL_EXECUTOR: POOL_EXECUTOR,
    info: {
        currentId: 0,
        maxmium: 20,
        ThreadStack: new Array(),
        ThreadWaitStack: new Array(),
        limit: 30
    },
}


export class Thread {
    constructor(callback, duration, runType) {
        this.runType = runType || thread_context.SERIAL_EXECUTOR;
        this.startTime = null;
        this.process = null;
        this.isWaiting = false;
        this.paused = false;
        this.countCall = 0;
        this.processId = 0;
        this.isRemoved = false;
        this.delay = duration;
        var self = this;
        if (thread_context.info.ThreadStack.length <= thread_context.info.limit && this.runType == thread_context.SERIAL_EXECUTOR) {
            this.startTime = new Date();
            this.processId = thread_context.info.currentId;
            this.process = _initWorker(callback, this);
            thread_context.info.ThreadStack.push(this);
            thread_context.info.currentId++;
        } else {
            self.process = callback;
            thread_context.info.ThreadWaitStack.push(this);
        }
    }

    remove() {
        _remove(this.processId);
        this.isRemoved = true;
    }

    stop() {
        _remove(this.processId);
        this.isRemoved = true;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    static removeThread(processId) {
        _remove(processId);
    }
}

var _remove = (processId) => {
    for (var i = 0; i < thread_context.info.ThreadStack.length; i++) {
        if (thread_context.info.ThreadStack[i].processId == processId) {
            // clearInterval(thread_context.info.ThreadStack[i].process);
            thread_context.info.ThreadStack[i].process.terminate();
            thread_context.info.ThreadStack[i].process = undefined;
            thread_context.info.ThreadStack.splice(i, 1);
            break;
        }
    }
    if (thread_context.info.ThreadWaitStack.length > 0 && thread_context.info.ThreadStack.length <= thread_context.info.limit) {
        var clone = thread_context.info.ThreadWaitStack.splice(0);
        while (clone.length > 0) {
            var threadItem = clone.shift();
            if (threadItem.isRemoved == false) {
                new Thread(threadItem.process, threadItem.delay);
            }
        }
    }
}


var _removeAll = () => {
    while (thread_context.info.ThreadStack.length > 0) {
        clearInterval(thread_context.info.ThreadStack.shift().process);
    }
    thread_context.info.currentId = 0;
}

var _initWorker = (callback, thread) => {
    var meta = {
        processId: thread.processId,
        delay: thread.delay
    }
    var func = `onmessage = (e) =>{
        setInterval(() =>{
            postMessage(e.data.processId);
        },e.data.delay);
     }`;
    var blob = new Blob([func]);
    var blobURL = window.URL.createObjectURL(blob);
    var worker = new Worker(blobURL);
    worker.onmessage = function (e) {
        if (thread == undefined || callback == undefined) {
            worker.terminate();
            return;
        }
        callback(thread);
    };
    worker.postMessage(meta);
    return worker;
}
