import './App.css';
import Grid from '@mui/material/Grid';
import { Box, Button, Card, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';
import colors from './colors';

let ws = null

function App() {

  useEffect(() => {

    if (!ws) {
      ws = new  WebSocket('ws://localhost:8008');
    }

    ws.onmessage = (msg) => {
      const {type, data} = JSON.parse(msg.data);
  
      switch (type) {
        case 'initialized':
          setUid(data.uid);
          setGameField(data.field);
          break;
  
        case 'fieldUpdate':
          setGameField(data);
          break;

        case 'log':
          console.table(data.log);
          console.table(data.connections);
          break;
      }
    }

    ws.onopen = (e) => {
      if (ws.readyState !== WebSocket.OPEN) {
        return;
      }
      if (!uid) {
        ws.send(JSON.stringify({type: 'initialize'}))
      }
    }
  })

  const retrieveLog = () => {
    ws.send(JSON.stringify({type: 'getLog'}));
  }

  const [uid, setUid] = useState(null);
  const [gameField, setGameField] = useState([[null, null, null], [null, null, null], [null, null, null]]);

  const onCellClick = (x, y) => {
    ws.send(JSON.stringify({type: 'updateField', data: {uid, x, y}}))
  }

  const getCell = (val, key) => (
  <Grid item xs={4} key={key}>
    <Card>
      <CardContent onClick={() => onCellClick(...key.split('x').map(Number))}>
        <div style={{textAlign: 'center', minHeight: '200px', backgroundColor: colors[val]}}>
        </div>
      </CardContent>
    </Card>
  </Grid>)

  return (
    <div className="App">
      <h2>Hello! </h2>
      {uid &&
      <Box>
        <Grid container spacing={2}>
          {gameField.map((fields, k) => fields.map((cell, i) => getCell(cell, `${k}x${i}`)))}
        </Grid>
      </Box>}

      <Button onClick={retrieveLog}>Retrieve log</Button>

    </div>
  );
}

export default App;
