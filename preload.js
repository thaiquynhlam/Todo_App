const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = [
            'TaskItem:add',
            'TaskItem:complete',
            'TaskItem:pause',
            'TaskItem:continue',
            'TaskItem:delete',
            'TaskItem:reset',
            'TaskItems:getAll',
            'Mail:send'

        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.invoke(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = [
            'TaskItems:Initial',
            'TaskItem:completeAdd',
            'TaskItem:completeChangeCompletedStatus',
            'TaskItem:completeChangePausedStatus',
            'TaskItem:completeChangeContinuingStatus',
            'TaskItem:completDeleteTask',
            'TaskItems:reload',
            'TaskItems:completeGetAll',
            'Mail:complete-send',
            'Mail:error-send'
        ];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
}
);