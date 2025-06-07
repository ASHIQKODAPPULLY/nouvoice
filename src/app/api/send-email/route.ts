import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { customerEmail, planName, priceId } = await request.json();

    // Create transporter with Hostinger SMTP
    const transporter = nodemailer.createTransporter({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "joinus@nouvoice.com.au",
        pass: "Dilsha1996$",
      },
    });

    // Email content
    const mailOptions = {
      from: "joinus@nouvoice.com.au",
      to: "ashiqkodappully@gmail.com",
      subject: `New Subscription: ${planName} Plan`,
      html: `
        <h2>New Subscription Alert</h2>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
        <p><strong>Price ID:</strong> ${priceId}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p>This notification was sent automatically when a customer subscribed to a plan.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}
