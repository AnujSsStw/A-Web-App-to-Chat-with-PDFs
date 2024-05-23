import { auth, signOut, signIn } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export async function Nav() {
  const session = await auth();

  return (
    <div className="py-2 mx-5">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link href="/" className="hover:underline flex items-center gap-1">
            <Image src="/logo.jpeg" width="50" height="50" alt="Logo" />
          </Link>

          <div className="flex items-center gap-8">
            {session?.user && (
              <>
                <Link
                  href="/create"
                  className="hover:underline flex items-center gap-1"
                >
                  Create ➕
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              width="40"
              height="40"
              alt="user avatar"
              className="rounded-full"
            />
          )}
          <div>{session?.user?.name}</div>
          <div>
            {session?.user ? (
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit">Sign Out</button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/" });
                }}
              >
                <button type="submit">Sign in</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
