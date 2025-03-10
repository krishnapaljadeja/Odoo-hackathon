import express from "express"
import isAuthenticated from "../middlewares/Authentication.js";
import { createFreelanceProject } from "../controllers/freelanceProject.controller.js";
const router = express.Router();

router.post('/add-project' ,isAuthenticated ,createFreelanceProject );

export default router;