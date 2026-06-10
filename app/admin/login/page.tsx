import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHero } from "../../components/page-hero";
import { adminSignIn } from "../actions";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <>
      <PageHero
        description="Sign in to manage site content and media."
        eyebrow="Admin"
        imageSrc="/images/bg-img/bg-2.jpg"
        title="Admin Login"
      />
      <section className="page-section muted-section">
        <div className="site-shell auth-shell">
          <form action={adminSignIn} className="auth-form">
            <label>
              Email
              <input
                autoComplete="email"
                name="email"
                placeholder="admin@example.com"
                required
                type="email"
              />
            </label>
            <label>
              Password
              <input
                autoComplete="current-password"
                name="password"
                placeholder="Password"
                required
                type="password"
              />
            </label>
            <button className="primary-button" type="submit">
              Sign In
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
