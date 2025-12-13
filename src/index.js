const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const tableName = process.env.TABLE_NAME;
    
    try {
        // Get current count
        const getParams = {
            TableName: tableName,
            Key: { id: 'view-count' }
        };
        
        const getResult = await ddbDocClient.send(new GetCommand(getParams));
        
        // If item doesn't exist, start with 0, otherwise use existing count
        const currentCount = getResult.Item?.count || 0;
        
        // Increment count
        const newCount = currentCount + 1;

        // Update count in database (this will create the item if it doesn't exist)
        const putParams = {
            TableName: tableName,
            Item: {
                id: 'view-count',
                count: newCount,
                lastUpdated: new Date().toISOString()
            }
        };
        
        await ddbDocClient.send(new PutCommand(putParams));
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ count: newCount })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
