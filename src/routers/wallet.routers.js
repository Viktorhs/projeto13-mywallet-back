import express from "express";
import * as walletController from "../controllers/wallet.controllers.js"
import authUser from "../middlewares/authorization.middleware.js"


const router = express.Router();

router.use(authUser)

router.get("/listWallets", walletController.listOperations);
router.post("/operation", walletController.newOperation);
router.delete("/delete/:operationId", walletController.deleteOperation);
router.put("/operation/:operationId", walletController.editOperation);

export default router;