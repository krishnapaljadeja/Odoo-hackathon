import express from "express"
import authRouter from "./src/routes/auth.routes.js"

const app = express();
app.use(express.json())


app.use('/auth' , authRouter);

app.listen(3000 , ()=> {
    console.log("http://localhost:3000");
})