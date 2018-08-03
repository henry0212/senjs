import { Thread, POOL_EXECUTOR } from "./thread.js"
import { List } from "../util/list-util.js";


let service_context = {
    DELAY_DEFAULT: -1,
    DELAY_MANUAL: -2,
    _queue: null,
    delay: 1000,
    sbDelay: 100,
    isRunning: false,
}


var _runner = null;

export class Service {
    constructor() {

    }
    static register(listener, name) {
        if (service_context._queue == null) {
            service_context._queue = new List();
        }
        var service = new Service();
        service.name = name;
        service.listener = listener;
        service.Id = Number(new Date().getTime() + "" + service_context._queue.size());
        service.isPaused = false;
        service.isRemoved = false;
        service.startTime = new Date();
        service.delay = -1;
        service_context._queue.add(service);
        _run();
        return service;
    }

    pause() {
        _pause(this);
    }

    remove() {
        _remove(this);
    }

    resume() {
        _resume(this);
    }
}

function _remove(service) {
    if (service.threadId) {
        Thread.removeThread(service.threadId);
    }
    service.isRemoved = true;
}
function _removeAll() {
    service_context._queue.foreach(function (item, count) {
        item.isRemoved = true;
    });
}

function _pause(service) {
    service.isPaused = true;
    if (service.threadId) {
        Thread.removeThread(service.threadId);
    }
}

function _pauseAll() {
    service_context._queue.foreach(function (item, count) {
        item.isPaused = true;
    });
}
function _resumeAll() {
    service_context._queue.foreach(function (item, count) {
        item.isPaused = false;
    });
}
function _resume(service) {
    service.isPaused = false;
    service_context._queue.add(service);
    _run();
}
function _run() {
    if (_runner == null) {
        _runner = new Thread(function (thread) {
            if (!service_context.isRunning) {
                service_context.isRunning = true;
                var arrayRemoveIndex = new Array();
                service_context._queue.foreachWithTimer(function (item, count) {
                    if (item.isRemoved) {
                        arrayRemoveIndex.push(count);
                    } else if (!item.isPaused && !item.isRemoved && item.delay == service_context.DELAY_DEFAULT) {
                        item.listener();
                    } else if (item.isPaused && !item.isRemoved && item.delay == service_context.DELAY_MANUAL) {
                        item.delay = item.oldDelay;
                        service_context._queue.remove(item);
                    } else if (!item.isPaused && item.isRemoved && item.delay == service_context.DELAY_MANUAL) {
                        _remove(item);
                    } else if (!item.isPaused && !item.isRemoved && item.delay > 0) {
                        var thred = new Thread(function () {
                            item.listener();
                        }, item.delay);
                        item.oldDelay = item.delay;
                        item.delay = service_context.DELAY_MANUAL;
                        item.threadId = thred.processId;
                    }

                }, service_context.sbDelay, function () {
                    service_context.isRunning = false;
                    for (var i = 0; i < arrayRemoveIndex.length; i++) {
                        service_context._queue.removeAt(arrayRemoveIndex[i]);
                    }
                    if (service_context._queue.size() == 0 && _runner) {
                        _runner.remove();
                        _runner = null;
                    }
                });
            }
        }, service_context.delay, POOL_EXECUTOR);
        _runner.remove = () => {
            throw new Error("Service cannot remove");
        };
    }
}
