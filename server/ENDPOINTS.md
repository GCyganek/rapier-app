# Administrator page

- Protocol: **HTTP**
- URL: `http://localhost:3000`
- Endpoints source code: `server/src/controllers/admin.controller.ts`

## `load-players`

Endpoint takes JSON string as x-www-form-urlencoded body parameter and saves given players in server. 
JSON should be an array of `Player` interface instances. Endpoint returns ids of successfully added players. 
Existing players are not updated. 

### Method
`POST`

### Parameters (body)
| name    | type        |
|---------|-------------|
| players | JSON string |

### Response
| name | type |
|------|------|
| -    | JSON |

### Example JSON

```
[
  {  
    "id": "player1",  
    "firstName": "Janek",
    "lastName": "Kowalski"
  },
  {
    "id": "player2",
    "firstName": "Andrzej",
    "lastName": "Nowak"
  },
  {
    "id": "player3",
    "firstName": "Marek",
    "lastName": "Jarek"
  }
]
```

## `load-fights`

Endpoint takes JSON string as x-www-form-urlencoded body parameter and saves given fights in server. 
JSON should be an array of `FightData` interface instances. Endpoint returns ids of successfully added fights.
Existing fights are not updated.

### Method
`POST`

### Parameters (body)
| name   | type        |
|--------|-------------|
| fights | JSON string |

### Response
| name | type |
|------|------|
| -    | JSON |

### Example JSON

```
[
  {
    "id": "fight1",
    "mainJudgeId": "main",
    "redJudgeId": "red",
    "blueJudgeId": "blue",
    "redPlayerId": "player1",
    "bluePlayerId": "player2",
    "endConditions": [
      {
        "name": "TIME_ENDED",
        "value": "5"
      },
      {
        "name": "ENOUGH_POINTS",
        "value": "15"
      }
    ]
  },
  {
    "id": "fight2",
    "mainJudgeId": "main_judge",
    "redJudgeId": "red_judge",
    "blueJudgeId": "blue_judge",
    "redPlayerId": "player3",
    "bluePlayerId": "player2",
    "endConditions": [
      {
        "name": "ENOUGH_POINTS",
        "value": "10"
      }
    ]
  }
]
```

# Judges communication

- Protocol: **WebSockets**
- URL: `location.host`
- All parameters are passed by `MessageBody` by default
- All responses are objects by default
- If there are any errors, endpoints return `{ status: STATUS_NAME }` object by default
- If there are no errors, returned status is `OK`
- Endpoints source code: `server/src/gateways/judges.gateway.ts`

## `join` 

Endpoint for judges to join the fight. Only previously selected judges can join the fight (they are identified by their ID).
Endpoint checks if judge is allowed to join this fight, saves its socket and returns information about players and role of the judge.
Players have no points, there are no events in the events' history, timer is set to zero minutes.

### Parameters
| name    | type   |
|---------|--------|
| fightId | string |
| judgeId | string |

### Response (send to the judge that called this endpoint)
| name       | type      |
|------------|-----------|
| role       | JudgeRole |
| redPlayer  | Player    |
| bluePlayer | Player    |

where `Player` is an interface:

| name      | type   |
|-----------|--------|
| id        | string |
| firstName | string |
| lastName  | string |

and `JudgeRole` is an enum:

| name      | value  |
|-----------|--------|
| MainJudge | "MAIN" |
| RedJudge  | "RED"  |
| BlueJudge | "BLUE" |

### Error codes
- `NOT_FOUND` - fight with given fightId doesn't exist
- `BAD_REQUEST` - judge with given judgeId has already joined fight with different socket
- `UNAUTHORIZED` - judge with given judgeId is not allowed to join this fight

## `startFight`

Endpoint to start fight. Only main judge is allowed to start fight. Endpoint makes sure that 
it is called by main judge, starts fight (changes fight state to `RUNNING` and starts timer) and 
sends message to all judges.

### Parameters
| name    | type   |
|---------|--------|
| fightId | string |
| judgeId | string |

### Response (send to all judges)
| name       | type   |
|------------|--------|
| status     | string |

### Error codes
- `NOT_FOUND` - fight with given fightId doesn't exist
- `UNAUTHORIZED` - judge with given judgeId is not the main judge
- `NOT_READY` - not all judges have already joined this fight
- `BAD_REQUEST` - fight has already been started

## `finishFight`

Endpoint to finish fight. Only main judge is allowed to finish fight (even if the end conditions are not fulfilled). 
Endpoint makes sure that it is called by main judge, finishes fight (changes fight state to `FINISHED` and stops timer) 
and sends message to all judges.

### Parameters
| name    | type   |
|---------|--------|
| fightId | string |
| judgeId | string |

### Response (send to all judges)
| name       | type   |
|------------|--------|
| status     | string |

### Error codes
- `NOT_FOUND` - fight with given fightId doesn't exist
- `UNAUTHORIZED` - judge with given judgeId is not the main judge
- `BAD_REQUEST` - fight has not been started or has already been finished

## `pauseTimer`

Endpoint to pause fight. Only main judge is allowed to pause fight. Endpoint makes sure that it is called by main judge, 
pauses fight (changes fight state to `PAUSED` and pauses timer) and sends message to all judges.
Parameter `exactPauseTimeInMillis` is used to synchronize timer and time between judges and server.

### Parameters
| name                   | type   |
|------------------------|--------|
| fightId                | string |
| judgeId                | string |
| exactPauseTimeInMillis | number |

### Response (send to all judges)
| name                   | type   |
|------------------------|--------|
| status                 | string |
| exactPauseTimeInMillis | number |

### Error codes
- `NOT_FOUND` - fight with given fightId doesn't exist
- `UNAUTHORIZED` - judge with given judgeId is not the main judge
- `BAD_REQUEST` - fight is not running

## `resumeTimer`

Endpoint to resume fight. Only main judge is allowed to resume fight. Endpoint makes sure that it is called by main judge,
resumes fight (changes fight state to `RUNNING` and resumes timer) and sends message to all judges.

### Parameters
| name                   | type   |
|------------------------|--------|
| fightId                | string |
| judgeId                | string |

### Response (send to all judges)
| name                   | type   |
|------------------------|--------|
| status                 | string |

### Error codes
- `NOT_FOUND` - fight with given fightId doesn't exist
- `UNAUTHORIZED` - judge with given judgeId is not the main judge
- `BAD_REQUEST` - fight is not paused

## `newEvents`

Endpoint to add new events to the events' history. Only main judge is allowed to add new events. Endpoint makes sure 
that it is called by the main judge, modifies fight state (add points for players and add new events to the history), 
sends message to all judges and checks if number of points satisfies fight end condition (if fight is intended to end 
after one of the players collected certain number of points). Endpoint can be also used to add events proposed by other judges (main judge accepts
proposal and sends message containing proposal to this endpoint).

### Parameters
| name             | type    |
|------------------|---------|
| fightId          | string  |
| judgeId          | string  |
| events           | Event[] |
| redPlayerPoints  | number  |
| bluePlayerPoints | number  |

where `Event` is an interface:

| name        | type   |
|-------------|--------|
| id          | string |
| playerColor | string |

where `id` is the identifier of the selected event (for example, an action "Attack -> Successful -> Head strike" 
can be identified by `id = 'ashs'`).

### Response (send to all judges)
Response contains all events' history and the total number of points for both players (to prevent errors
when response is received twice by the same judge).

| name       | type        |
|------------|-------------|
| status     | string      |
| allEvents  | Event[]     |
| redPlayer  | PlayerState |
| bluePlayer | PlayerState |

where `PlayerState` is an interface:

| name   | type   |
|--------|--------|
| id     | string |
| points | number |

### Error codes
- `NOT_FOUND` - fight with given fightId doesn't exist
- `UNAUTHORIZED` - judge with given judgeId is not the main judge
- `BAD_REQUEST` - number of points is negative

## `eventsSuggestion`

Endpoint to propose new events to the events' history. Only red or blue judge is allowed to propose new events. 
Endpoint makes sure that it is called by the red or blue judge and sends proposal to the main judge.

### Parameters
| name             | type    |
|------------------|---------|
| fightId          | string  |
| judgeId          | string  |
| events           | Event[] |
| redPlayerPoints  | number  |
| bluePlayerPoints | number  |

### Response (send to the judge suggesting new events)

| name    | type    |
|---------|---------|
| status  | string  |

### Error codes
- `NOT_FOUND` - fight with given fightId doesn't exist
- `UNAUTHORIZED` - judge with given judgeId is the main judge (only red or blue can suggest new events)
- `BAD_REQUEST` - number of points is negative or fight has ended / was never started

### Response (send to the main judge)

| name             | type    |
|------------------|---------|
| judgeColor       | string  |
| events           | Event[] |
| redPlayerPoints  | number  |
| bluePlayerPoints | number  |

## `fightEndConditionFulfilled`

Endpoint to emit information about the fulfillment of the fight end conditions. It is called when the timer or number
of points of one of the players reaches some value. 

### Response (send to all judges)

| name          | type   |
|---------------|--------|
| status        | string |
| conditionName | string |

where `conditionName` is enum with values:
- `TIME_ENDED`
- `ENOUGH_POINTS`

# Mocked Fight and Players

## `Fight`

| name         | type   | value     |
|--------------|--------|-----------|
| id           | string | 'mockup'  |
| mianJudgeId  | string | 'main'    |
| redJudgeID   | string | 'red'     |
| blueJudgeId  | string | 'blue'    |
| redPlayerId  | string | 'player1' |
| bluePlayerId | string | 'player2' |

## `Player1`

| name      | type   | value      |
|-----------|--------|------------|
| id        | string | 'player1'  |
| firstName | string | 'Ala'      |
| lastName  | string | 'Kowalska' |

## `Player2`

| name      | type   | value      |
|-----------|--------|------------|
| id        | string | 'player2'  |
| firstName | string | 'Jan'      |
| lastName  | string | 'Kowalski' |
