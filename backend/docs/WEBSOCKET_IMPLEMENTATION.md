# WebSocket Real-Time Features Implementation

## Overview

This document describes the WebSocket implementation for real-time odds updates and race status notifications in the horse racing platform.

## Architecture

### Backend Components

1. **WebSocket Server** (`backend/src/config/websocket.ts`)
   - Socket.io server integrated with Express HTTP server
   - Redis adapter for multi-server coordination
   - JWT-based authentication middleware
   - Connection lifecycle management

2. **WebSocket Service** (`backend/src/services/websocket.service.ts`)
   - Race subscription management
   - Broadcasting utilities for odds updates, race status, and news
   - Subscription statistics and monitoring

3. **Odds Storage Integration** (`backend/src/services/odds-storage.service.ts`)
   - Automatic WebSocket broadcasting when odds are stored
   - Broadcasts to all clients subscribed to affected races

### Frontend Components

1. **WebSocket Context** (`frontend/src/contexts/WebSocketContext.tsx`)
   - React context provider for WebSocket connection
   - Connection state management
   - Event subscription utilities

2. **Custom Hooks** (`frontend/src/hooks/useRaceOdds.ts`)
   - `useRaceOdds(raceId)` - Subscribe to single race odds updates
   - `useMultipleRaceOdds(raceIds)` - Subscribe to multiple races

3. **UI Components**
   - `OddsTable` - Updated to display real-time odds
   - `WebSocketStatus` - Connection status indicator

## WebSocket Events

### Client → Server

| Event               | Payload                 | Description                                   |
| ------------------- | ----------------------- | --------------------------------------------- |
| `subscribe_race`    | `{ raceId: string }`    | Subscribe to odds updates for a specific race |
| `unsubscribe_race`  | `{ raceId: string }`    | Unsubscribe from race updates                 |
| `subscribe_races`   | `{ raceIds: string[] }` | Subscribe to multiple races at once           |
| `get_subscriptions` | -                       | Get list of currently subscribed races        |
| `ping`              | -                       | Health check ping                             |

### Server → Client

| Event          | Payload                                | Description                    |
| -------------- | -------------------------------------- | ------------------------------ |
| `subscribed`   | `{ type, raceId(s), message }`         | Confirmation of subscription   |
| `unsubscribed` | `{ type, raceId, message }`            | Confirmation of unsubscription |
| `odds_update`  | `{ type, raceId, payload, timestamp }` | Real-time odds update          |
| `race_status`  | `{ type, raceId, payload, timestamp }` | Race status change             |
| `news_update`  | `{ type, payload, timestamp }`         | New news article published     |
| `notification` | `{ type, payload, timestamp }`         | User-specific notification     |
| `pong`         | `{ timestamp }`                        | Response to ping               |
| `error`        | `{ type, message }`                    | Error message                  |

## Usage Examples

### Backend: Broadcasting Odds Update

```typescript
import { WebSocketService } from './services/websocket.service';

// Broadcast odds update to all clients subscribed to a race
WebSocketService.broadcastOddsUpdate(raceId, {
  odds: latestOdds,
  updatedAt: new Date().toISOString(),
});
```

### Frontend: Subscribe to Race Odds

```typescript
import { useRaceOdds } from '@/hooks/useRaceOdds';

function RaceComponent({ raceId }) {
  const { latestOdds, lastUpdate, connected } = useRaceOdds(raceId);

  return (
    <div>
      <p>Connection: {connected ? 'Live' : 'Offline'}</p>
      <p>Last Update: {lastUpdate}</p>
      {/* Display odds */}
    </div>
  );
}
```

### Frontend: Manual Subscription

```typescript
import { useWebSocket } from '@/contexts/WebSocketContext';

function CustomComponent() {
  const { subscribeToRace, onOddsUpdate } = useWebSocket();

  useEffect(() => {
    // Subscribe to race
    subscribeToRace('race-123');

    // Listen for updates
    const cleanup = onOddsUpdate((data) => {
      console.log('Odds update:', data);
    });

    return cleanup;
  }, []);
}
```

## Authentication

WebSocket connections support optional JWT authentication:

1. **Authenticated Connections**: Include JWT token in connection auth

   ```typescript
   const socket = io(backendUrl, {
     auth: { token: 'your-jwt-token' },
   });
   ```

2. **Anonymous Connections**: Connect without token (limited features)
   ```typescript
   const socket = io(backendUrl);
   ```

## Room Management

The server uses Socket.io rooms for efficient broadcasting:

- Room naming: `race:{raceId}`
- Clients join rooms when subscribing to races
- Broadcasts are sent only to clients in the relevant room
- Automatic cleanup when clients disconnect

## Redis Pub/Sub

For multi-server deployments, Redis pub/sub coordinates WebSocket messages:

1. **Redis Adapter**: Socket.io uses `@socket.io/redis-adapter`
2. **Pub/Sub Clients**: Separate Redis clients for publishing and subscribing
3. **Automatic Coordination**: Messages broadcast on one server reach clients on all servers

## Performance Considerations

1. **Connection Limits**: Monitor concurrent WebSocket connections
2. **Room Subscriptions**: Limit number of rooms per client
3. **Message Throttling**: Avoid broadcasting too frequently (max 1/second per race)
4. **Graceful Degradation**: Fall back to polling if WebSocket unavailable

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Response includes WebSocket statistics:

```json
{
  "status": "ok",
  "services": {
    "websocket": {
      "connected": 42,
      "rooms": 15
    }
  }
}
```

### Subscription Statistics

```typescript
import { WebSocketService } from './services/websocket.service';

const stats = WebSocketService.getSubscriptionStats();
console.log(stats);
// {
//   totalConnections: 42,
//   totalRooms: 20,
//   raceRooms: ['race:123', 'race:456', ...]
// }
```

## Testing

### Manual Testing with Socket.io Client

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' },
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);

  // Subscribe to race
  socket.emit('subscribe_race', { raceId: 'race-123' });
});

socket.on('odds_update', (data) => {
  console.log('Odds update:', data);
});

socket.on('subscribed', (data) => {
  console.log('Subscribed:', data);
});
```

### Load Testing

Use tools like `socket.io-client-load-test` or `artillery` to test concurrent connections:

```yaml
# artillery.yml
config:
  target: 'http://localhost:3001'
  socketio:
    transports: ['websocket']
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - engine: socketio
    flow:
      - emit:
          channel: 'subscribe_race'
          data:
            raceId: 'race-123'
      - think: 30
```

## Troubleshooting

### Connection Issues

1. **CORS Errors**: Ensure frontend URL is in CORS whitelist
2. **Authentication Failures**: Check JWT token validity
3. **Connection Timeouts**: Verify Redis is running and accessible

### No Updates Received

1. **Check Subscription**: Verify client subscribed to correct race
2. **Check Room Membership**: Use `get_subscriptions` event
3. **Check Broadcasting**: Verify odds are being stored and broadcast

### High Memory Usage

1. **Limit Subscriptions**: Restrict rooms per client
2. **Clean Up Disconnections**: Ensure proper cleanup on disconnect
3. **Monitor Redis Memory**: Check Redis memory usage

## Future Enhancements

1. **Compression**: Enable WebSocket compression for large payloads
2. **Binary Protocol**: Use binary encoding for better performance
3. **Selective Updates**: Send only changed odds, not full snapshots
4. **Client-Side Caching**: Implement intelligent client-side caching
5. **Reconnection Strategy**: Improve reconnection with exponential backoff
6. **Message Queuing**: Queue messages during disconnection for replay

## Security Considerations

1. **Rate Limiting**: Limit subscription requests per client
2. **Room Validation**: Validate race IDs before joining rooms
3. **Token Refresh**: Handle JWT token expiration gracefully
4. **DDoS Protection**: Use Cloudflare or similar for WebSocket protection
5. **Input Validation**: Validate all client messages

## Dependencies

### Backend

- `socket.io` - WebSocket server
- `@socket.io/redis-adapter` - Multi-server coordination
- `ioredis` - Redis client

### Frontend

- `socket.io-client` - WebSocket client

## Configuration

### Environment Variables

```bash
# Backend
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## References

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Redis Adapter Documentation](https://socket.io/docs/v4/redis-adapter/)
- [WebSocket Protocol RFC](https://tools.ietf.org/html/rfc6455)
