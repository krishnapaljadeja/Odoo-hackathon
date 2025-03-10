import express from "express"
import authRouter from "./src/routes/auth.routes.js"
import courseRouter from "./src/routes/course.routes.js"
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true 
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser())


app.use('/auth' , authRouter);
app.use('/course' , courseRouter);

app.listen(3000 , ()=> {
    console.log("http://localhost:3000");
})