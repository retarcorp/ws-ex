const { WebSocketServer } = require('ws');
const uuid = require('uuid');

const wss = new WebSocketServer({
    port: 8008,
})

const field = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
const log = [];
const createLog = (uid, x, y, value) => ({uid, x, y, value});

let connections = [];

wss.on('connection', (ws) => {
    
    ws.on('error', console.error);
    
    connections.push(ws);

    ws.on('close', () => connections = connections.filter(c => c !== ws));

    ws.on('message', (msg) => {
        const {type, data} = JSON.parse(msg);

        switch(type) {
            case 'initialize':
                const uid = uuid.v4();
                ws.send(JSON.stringify({type: 'initialized', data: {uid, field}}));
                console.log('Initialized user with uid '+ uid)
            
                break;

            case 'updateField':
                field[data.x][data.y]++;
                connections.forEach(ws => ws.send(JSON.stringify({type: 'fieldUpdate', data: field})));
                log.push(createLog(data.uid, data.x, data.y, field[data.x][data.y]));
            
                break;

            case 'getLog':
                ws.send(JSON.stringify({type: 'log', data: {log, connections}}));
                break;
        }
    })
})