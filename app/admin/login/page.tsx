import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="admin-login-fullscreen">
      <div className="admin-login-backdrop-decor">
        <div className="decor-circle-1" />
        <div className="decor-circle-2" />
      </div>

      <div className="admin-login-card-container">
        <div className="admin-login-card-header">
          <Link className="admin-login-brand-badge" href="/">
            <span className="brand-dot" />
            Judith Aiyesan
          </Link>
          <h1 className="admin-login-heading">Admin Portal</h1>
          <p className="admin-login-subheading">
            Sign in with your administrator credentials to manage music, events,
            media, and site content.
          </p>
        </div>

        <LoginForm />

        <div className="admin-login-card-footer">
          <Link className="back-home-link" href="/">
            &larr; Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
