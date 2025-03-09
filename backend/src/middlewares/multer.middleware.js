import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../utils/prismClient.js";

// Configure storage for files
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Create separate multer configurations for each file type
const csvConfig = multer({
    dest: "uploads/",
    limits: { fileSize: 1000000 }, // 1MB
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv|xlsx)$/)) {
            return cb(new ApiError(400, "Invalid file format"), false);
        }
        cb(null, true);
    },
});

const pdfConfig = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
            return cb(new ApiError(400, "Invalid file format, only PDF allowed"), false);
        }
        cb(null, true);
    },
});

// Original upload middleware for CSV
const upload = (req, res, next) => {
    const singleUpload = csvConfig.single("file"); // Use the name of the form field

    singleUpload(req, res, (err) => {
        if (err) {
            return res
                .status(500)
                .json(new ApiError(500, "Error uploading file", err));
        }
        if (!req.file) {
            return res.status(400).json(new ApiError(400, "No file uploaded"));
        }
        req.fileName = req.file.filename;
        next();
    });
};
 
// Enhanced middleware for PDF uploads with document replacement
const uploadPDF = async (req, res, next) => {
    try {
        // Check if this is a resubmission by checking for submissionId in the request body
        const isResubmission = req.body.submissionId ? true : false;
        let oldDocumentPath = null;
 
        // If it's a resubmission, fetch the existing document path before uploading the new one
        if (isResubmission) {
            const submissionId = parseInt(req.body.submissionId);
 
            // Use prisma to get the existing submission's document path
            const existingSubmission = await prisma.submission.findUnique({
                where: { id: submissionId },
                select: { documentLink: true }
            });
 
            console.log(existingSubmission);
 
 
            if (existingSubmission && existingSubmission.documentLink) {
                oldDocumentPath = existingSubmission.documentLink;
            }
        }
 
        // Process the upload
        const singleUpload = pdfConfig.single("file");
 
        singleUpload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res
                    .status(400)
                    .json(new ApiError(400, "Error uploading PDF", err));
            } else if (err) {
                return res
                    .status(500)
                    .json(new ApiError(500, "Server error", err));
            }
 
            // If a new file was uploaded and we have an old document path
            if (req.file && oldDocumentPath && isResubmission) {
                // Clean the path by removing leading slash if present
                const cleanPath = oldDocumentPath.startsWith('/') 
                    ? oldDocumentPath.substring(1) 
                    : oldDocumentPath;
 
                // Get the absolute path
                const absolutePath = path.resolve(cleanPath);
 
                // Delete the old file
                try {
                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);
                        console.log(`Successfully deleted old document: ${absolutePath}`);
                    }
                } catch (deleteErr) {
                    console.error("Error deleting old document:", deleteErr);
                    // Continue with the request even if deletion fails
                }
            }
 
            // If file exists, add the file path to the request body
            if (req.file) {
                req.body.documentLink = `/uploads/${req.file.filename}`;
            }
 
            next();
        });
    } catch (error) {
        console.error("Error in uploadPDF middleware:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Server error processing upload", error));
    }
};
 
export { upload, uploadPDF };