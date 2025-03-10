import express from "express"
import isAuthenticated from "../middlewares/Authentication.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createCourse } from "../controllers/course.controller.js";
const router = express.Router();

router.post('/add-course' ,isAuthenticated , upload.single("video") ,createCourse );

export default router;