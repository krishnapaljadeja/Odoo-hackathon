import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import prisma from "../utils/prismClient.js";



const createFreelanceProject = async (req , res) => {
    try{
        const { title , description , minCoins , maxCoins , requirement } = req.body;

        const project = await prisma.freelanceProject.create({
            data : {
                title , description , minCoins , maxCoins , requirement , postedById : req.user.id          
            }
            
        })  

        await prisma.user.update({
            where : { id : req.user.id },
            data : {
                coins : { decrement : minCoins}
            }
        })  

        return res.send(200).json(new ApiResponse(200 , "Project created successfully" , project));
    }catch(error){  
        return res.status(500).json(new ApiError(500 , err.message));
    }
}   

export { createFreelanceProject };
