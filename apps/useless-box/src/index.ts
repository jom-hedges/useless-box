import { Elysia } from "elysia";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    GetCommand,
    PutCommand,
    UpdateCommand,
    DynamoDBDocumentClient, 
} from "@aws-sdk/lib-dynamodb";

// one client for the whole process
const ddb = new DynamoDBClient({ region: "ap-northeast-1", });
const ddbDoc = DynamoDBDocumentClient.from(ddb);

const TABLE_NAME = "useless-box";
const PK_VALUE = "useless-box-001";


const app = new Elysia()
  .state('intervalId', null)
    
  // ensure a record exists (run once at startup)
  .onStart(async ({ store }) => {
    console.log('Startup: ensuring DynamoDB records exists.');
  
    const record = await ddbDoc.send(
      new GetCommand({ 
        TableName: TABLE_NAME, 
        Key: { pk: PK_VALUE }

      })
    );
    
    if (!record.Item) {
      console.log('Seeding DynamoDB with initial state.')
      await ddbDoc.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: { pk: PK_VALUE, on: false }
        })
      );
    } else {
      console.log('Record already exists: ', record.Item)
    }

    const intervalRest = setInterval(async () => {
      try {
        const result = await ddbDoc.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { pk: PK_VALUE}
          })
        );

        const item = result?.item

        if (!item?.on) return;

        console.log("Auto-off triggered: flipping SWITCH to OFF.")

        // flip the switch to false
        await ddbDoc.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { pk: PK_VALUE },
            UpdateExpression: "set #o = :off",
            ExpressionAttributeNames: { "#o": "on" },
            ExpressionAttributeValues: { ":off": false}
          })
        );
      } catch (err) {
          console.error("Auto-off loop error:", err);
      }
    }, 1000);
    store.intervalId = intervalRest;
  })
  
  .onStop(({ store }) => {
    if (store.intervalId) {
      clearInterval(store.intervalId);
      console.log("Cleanup: cleared background interval");
    }  
  })


  // get the current state
  .get("/state", async () => {
    const { Item } = await ddbDoc.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: PK_VALUE }
      })
    );

    return Item ?? { error: 'not found' };
  })

  // toggle the state
  .post("/toggle", async () => {
    const { Item } = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: PK_VALUE },
      })
    );

    const newState = !Item?.on;

    await ddbDoc.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { 
          pk: PK_VALUE,
          on: newState
        }
      })
    );

    return { pk: PK_VALUE, on: newState };
  });

// start the server
app.listen(3000, () => console.log("Useless Box app is running on port 3000"));
           
