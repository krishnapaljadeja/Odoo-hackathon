import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import prisma from "../utils/prismClient.js";


export const createCourse = async (req , res) => {
    try{
        
        const { title , description , instructor , coins} = req.body;
        console.log("Request file:", req.file);
        // console.log(req.file)
        const videoUrl = req.file.path;

        const course = await prisma.course.create({
            data : {
                title,
                description,
                instructor,
                coins : parseInt(coins),
                videoUrl
            }
        })

        await prisma.user.update({
            where : { id : req.user.id },
            data : {
                coins : { decrement : coins}
            }
        })

        return res.send(200).json(new ApiResponse(200 , "Course created successfully" , course));
    }catch(err){
        return res.status(500).json(new ApiError(500 , err.message));
    }
}