import { Elysia } from "elysia";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    GetCommand,
    PutCommand,
    DynamoDBDocumentClient, 
} from "@aws-sdk/lib-dynamodb";

// one client for the whole process
const ddb = new DynamoDBClient({ region: "ap-northeast-1", });
const ddbDocClient = DynamoDBDocumentClient.from(ddb);

const TABLE_NAME = "useless-box";
const PK = "useless-box-001";

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
        TableName: "useless-box", 
        Item: { pk: "useless-box-001", on: false }
      })
    );
    
    if (!Item) {
      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: { pk: PK, on: false }
        })
      );
    }

    console.log("DynamoDB record ensured:", PK);
  })
    
  // get the current state
  .get("/state", async ({ store }) => {
    const { Item } = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: PK }
      })
    );

    return Item ?? { pk: PK, on: false };
  })

  // toggle the state
  .post("/toggle", async ({ store }) => {
    const { Item } = await ddb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: PK },
      })
    );

    const newState = !Item?.on;

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { pk: PK, on: newState }
      })
    );

    return { pk: PK, on: newState };
  });

app.listen(3000, () => console.log("Useless Box app is running on port 3000"));
        
    
  
