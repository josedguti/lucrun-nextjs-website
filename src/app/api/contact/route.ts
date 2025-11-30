import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle different form structures
    const hasFullForm = body.firstName && body.lastName;
    
    let name: string;
    let email: string;
    let message: string;
    let phone: string | undefined;
    let program: string | undefined;

    if (hasFullForm) {
      // Contact page form (firstName, lastName, email, phone, program, message)
      name = `${body.firstName} ${body.lastName}`;
      email = body.email;
      message = body.message || "";
      phone = body.phone;
      program = body.program;
      
      // Validate required fields for full form
      if (!body.firstName || !body.lastName || !email || !body.phone || !body.program) {
        return NextResponse.json(
          { error: "Tous les champs requis doivent être remplis" },
          { status: 400 }
        );
      }
    } else {
      // Simple form (name, email, message)
      name = body.name;
      email = body.email;
      message = body.message;
      
      // Validate required fields for simple form
      if (!name || !email || !message) {
        return NextResponse.json(
          { error: "Tous les champs sont requis" },
          { status: 400 }
        );
      }
    }

    // Build email HTML based on form type
    let emailHtml = `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
    `;
    
    if (phone) {
      emailHtml += `<p><strong>Téléphone:</strong> ${phone}</p>`;
    }
    
    if (program) {
      emailHtml += `<p><strong>Programme:</strong> ${program}</p>`;
    }
    
    emailHtml += `
      <p><strong>Message:</strong></p>
      <p>${message ? message.replace(/\n/g, "<br>") : "Aucun message"}</p>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // You'll need to verify your domain with Resend
      to: ["luc.run.coach@gmail.com"],
      subject: `Nouveau message de contact de ${name}`,
      html: emailHtml,
      replyTo: email,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Message envoyé avec succès", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
