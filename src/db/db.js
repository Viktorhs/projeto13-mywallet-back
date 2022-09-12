import { MongoClient } from "mongodb";
import dotenv from "dotenv"

dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URI)

export default async function mongo(){
    let connect;

    try {
        connect = await mongoClient.db('mywallet');
    return connect;
    } catch (error) {
        console.error(error);
        return error
    }
}