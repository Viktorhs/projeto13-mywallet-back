import mongo from "../db/db.js";

let db = await mongo()

async function validUser(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.sendStatus(422);
    }

    try {
        const user = await db.collection("sessions").findOne({token})
    
        if(!user){
            res.sendStatus(401)
        }
    
        res.locals.user = user
    
        next();
    } catch (error) {
        console.log(error);
        return res.send(500)
    }

}

export default validUser