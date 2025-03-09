import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import cron from "node-cron";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.MAILER_MAIL, 
    pass: process.env.MAILER_SECRET, 
  },
});

// Function to check and send emails
const checkPendingSubmissions = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const pendingSubmissions = await prisma.submission.findMany({
      where: {
        status: "PENDING",
        submissionDate: { lte: threeDaysAgo },
      },
      include: {
        counsellor: true,
        student: true,
      },
    });

    for (const submission of pendingSubmissions) {
      if (submission.counsellor?.email) {
        await sendEmail(submission.counsellor.email, submission.student.name);
      }
    }
  } catch (error) {
    console.error("Error checking pending submissions:", error);
  }
};

const sendEmail = async (counsellorEmail, studentName) => {
  const mailOptions = {
    from: process.env.MAILER_NAME,
    to: counsellorEmail,
    subject: "Pending Submission Alert",
    text: `Dear Counsellor, \n\nThe submission of student ${studentName} has been pending for more than 3 days. Please review it.\n\nBest Regards,\nYour System`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${counsellorEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${counsellorEmail}:`, error);
  }
};


cron.schedule("0 9 * * *", checkPendingSubmissions);

console.log("Cron job started to check pending submissions daily at 9 AM.");
