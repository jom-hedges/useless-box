import { Elysia } from 'elysia';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  object,
  string,
  boolean,
  optional,
  parse
} from 'valibot';

import {
    GetCommand,
    PutCommand,
    UpdateCommand,
    DynamoDBDocumentClient, 
} from '@aws-sdk/lib-dynamodb';

// config
const TABLE_NAME = 'useless-box';
const PK_VALUE = 'useless-box-001';
const REGION = 'ap-northeast-1';

// schema
const StateSchema = object({
  pk: string(),
  on:optional(boolean()),
});

const validateState = (item: any) =>
  parse(StateSchema, item);

// constructors  
const makeClient = () =>
  DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

const makeGet = (table: string, key: Record<string, any>) =>
  new GetCommand({ TableName: table, Key: key });

const makePut = (table: string, item: Record<string, any>) =>
  new PutCommand({ TableName: table, Item: item });

// dynamoDB operations
const fetchState = (ddb) => async (): Promise<any> =>
  (await ddb.send(makeGet(TABLE_NAME, { pk: PK_VALUE }))).Item;

const writeState = (ddb) => async (state) =>
  await ddb.send(makePut(TABLE_NAME, state));

// ensure the initial state exists
const ensureInitialState = (fetch, write) => async () => {
  const existing = await fetch();

  if (!existing) {
    await write({ pk: PK_VALUE, on: false });
    return { created: true }; 
  }
  return { created: false };
}

// state transformer
const deriveNewState = (state) => ({
  pk: PK_VALUE,
  on: !Boolean(state?.on)
});

// polling
const makePoller = (fetch, onChange) => {
  let last = null;

  const loop = async () => {
    try {
      const item = await fetch();
      if (!item) return;

      const validated = validateState(item);
      if (JSON.stringify(validated) !== JSON.stringify(last)) {
        last = validated;
        onChange(validated);
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  return (intervalMs) => setInterval(loop, intervalMs)
}

// Elysia boundary (i/o only)
const app = new Elysia()
  .state('ddb', makeClient())
  
  .onStart(async ({ store }) => {
    const ddb = store.ddb;

    const fetch = fetchState(ddb);
    const write = writeState(ddb);

    const result = await ensureInitialState(fetch, write)();
    console.log('Initial state:', result);

    // start poller 
    const poll = makePoller(fetch, (newState) => 
     console.log('Switch flipped to ', newState)
    );
    poll(1_000);

    console.log('Polling started every 1s')
  })

  .get('/state', async ({ store }) => {
    const state = await fetchState(store.ddb)();
    return validateState(state ?? { pk: PK_VALUE, on: false });
  })

  .post('/toggle', async ({ store }) => {
    const ddb = store.ddb;
    const fetch = fetchState(ddb);
    const write = writeState(ddb);

    const current = await fetch();
    const validated = validateState(current ?? { pk: PK_VALUE, on: false });

    const newState = deriveNewState(validated);
    await write(newState);

    return newState;
  });
  

// start the server
app.listen(3000, () => 
  console.log("Useless Box app is running on port 3000")
);
           
