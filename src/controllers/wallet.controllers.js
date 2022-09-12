import joi from "joi";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";

import mongo from "../db/db.js";

const userOperationSchema = joi.object({
    description: joi.string().min(1).required(),
    value: joi.number().precision(2).required(),
    type: joi.string().valid('input', 'output').required()
});

let db = await mongo();

async function listOperations (req, res){
    const { userID } = res.locals.user;

    try {
        const userList = await db.collection("wallets").find({userID}).toArray()
        res.status(200).send(userList);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)
    }
}

async function newOperation (req, res){
    const { userID } = res.locals.user;
    const operation = req.body;

    const validation = userOperationSchema.validate(req.body, {
        abortEarly: false,
    });

    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {
        await db.collection("wallets").insertOne({
            ...operation,
            date: dayjs().format("DD/MM"),
            userID
        })

        res.sendStatus(201)

    } catch (error) {
        console.error(error);
        return res.sendStatus(500)
    }

}

async function deleteOperation (req, res){
    const { userID } = res.locals.user;
    const { operationId } = req.params;

    try {
        const validateOperation = await db.collection("wallets").findOne({_id: ObjectId(operationId)});
        if(!validateOperation){
            return res.sendStatus(404)
        }
        
        if(validateOperation.userID.str !== userID.str){
            return res.sendStatus(401)
        }

        await db.collection("wallets").deleteOne({_id: ObjectId(operationId)})
        res.sendStatus(200)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)
    }
}

async function editOperation (req, res){
    const { userID } = res.locals.user;
    const { operationId } = req.params;
    const newOperation = req.body

    const validation = userSignInSchema.validate(req.body, {
        abortEarly: false,
    });

    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const validateOperation = await db.collection("wallets").findOne({_id: ObjectId(operationId)});
        if(!validateOperation){
            return res.sendStatus(404)
        }
        if(validateOperation.userID !== userID){
            return res.sendStatus(401)
        }

        await db.collection("wallets").updateOne({_id: ObjectId(operationId)}, { $set: newOperation })
        res.sendStatus(200)
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)
    }
}

export { listOperations, newOperation, deleteOperation, editOperation }