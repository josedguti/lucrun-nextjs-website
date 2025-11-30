import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "luc.run.coach@gmail.com";

// This route requires admin authentication
export async function DELETE(request: Request) {
  try {
    // Verify admin access
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Non autorisé - Accès admin requis" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous supprimer vous-même" },
        { status: 400 }
      );
    }

    // Get the Supabase admin client (requires service role key)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be added to .env.local
    );

    // Delete the user from auth.users (this will cascade delete the profile and all related data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression de l'utilisateur" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Utilisateur supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
