import { Elysia } from "elysia";
import { 
    PutItemCommand,
    ScanCommand, 
    GetItemCommand,
    DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

const TABLE_NAME = "UselessBoxTable";
const REGION = "ap-northheast-1";

const dbClient = new DynamoDBClient({ region: REGION });

const app = new Elysia()





