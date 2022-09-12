import joi from "joi";
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt'

import mongo from "../db/db.js";

const userSignUpSchema = joi.object({
    name: joi.string().min(1).required(),
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    repeatPassword: joi.ref('password'),
})

const userSignInSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
})

let db = await mongo()

async function signUp (req, res){
    const userSignUp = req.body;

    const validation = userSignUpSchema.validate(userSignUp, {
        abortEarly: false,
    });

    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {

        const verificationUser = await db.collection("users").findOne({email: userSignUp.email});

        if(verificationUser){
            return res.sendStatus(409)
        }

        const passwordHash = bcrypt.hashSync(userSignUp.password, 12);
        await db.collection("users").insertOne({
            name: userSignUp.name,
            email: userSignUp.email,
            password: passwordHash
        })

        const lista = await db.collection("users").find().toArray();
        res.status(201).send(lista);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)
    }

}

async function signIn (req, res){
    const {email, password} = req.body;
    const validation = userSignInSchema.validate(req.body, {
        abortEarly: false,
    });

    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {

        const user = await db.collection("users").findOne({email})
        const passwordIsValid = bcrypt.compareSync(password, user.password)
        
        if(!passwordIsValid || !user){
            return res.sendStatus(404)
        }

        const token = uuid()

        await db.collection("sessions").insertOne({
            userID: user._id,
            token,
            lastSignIn: Date.now()
        })

        res.send({
            name: user.name,
            token
        })
        
    } catch (error) {
        console.error(error);
        return res.sendStatus(500)
    }


}

async function logout (req, res){
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    const validate = await db.collection("sessions").findOne({token});

    if(!validate){
        return res.status(404).send("sessão não encontrada");
    }

    await db.collection("sessions").deleteOne({token});
    res.sendStatus(200);
}

export { signUp, signIn, logout }