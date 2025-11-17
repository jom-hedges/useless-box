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
const ddbDocClient = DynamoDBDocumentClient.from(ddb);

const TABLE_NAME = "useless-box";
const PK_VALUE = "useless-box-001";


const app = new Elysia()
  .state('ddb', ddb)
    
  .onError(({ error, code, status }) => {
    console.error("error occurred", error);

    // pretty good JSON
    if (code === "NOT FOUND")
      return status(404, { message: 'Not found' });

    // fallback for any other error 
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" }}
    );
  })
    
  // ensure a record exists (run once at startup)
  .onStart(async ({ store }) => {
    const ddb = store.ddb;

    const { Item } = await ddb.send(
      new GetCommand({ 
        TableName: TABLE_NAME, 
        Key: { pk: PK_VALUE }

      })
    );
    
    if (!Item) {
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: { pk: PK_VALUE, on: false }
        })
      );
    }

    console.log("Seeded DynamoDB with default state: ", PK_VALUE);

    const id = setInterval(async ({ store }) => {
      const ddb = store.ddb  

      try {
        const { Item } = await ddb.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { pk: PK_VALUE}
          })
        )
        if (!Item?.on) return;

        console.log("Auto-off triggered: flipping SWITCH to OFF.")

        // flip the switch to false
        await ddb.send(
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
  })

  // get the current state
  .get("/state", async ({ store }) => {
    const ddb = store.ddb

    const { Item } = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: PK_VALUE }
      })
    );

    return Item ?? { pk: PK_VALUE, on: false };
  })

  // toggle the state
  .post("/toggle", async ({ store }) => {
    const ddb = store.ddb

    const { Item } = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: PK_VALUE },
      })
    );

    const newState = !Item?.on;

    await ddb.send(
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

app.listen(3000, () => console.log("Useless Box app is running on port 3000"));
           
