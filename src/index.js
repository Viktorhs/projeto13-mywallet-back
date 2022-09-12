import express from "express";
import cors from "cors";
import usersRouter from "./routers/users.routers.js"
import walletRouter from "./routers/wallet.routers.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use(usersRouter);
app.use(walletRouter);

app.listen(5000, () => console.log("Listen on port 5000"))
