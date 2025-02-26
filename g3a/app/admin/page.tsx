import { cookies } from "next/headers";
import { AdminPage } from "./admin";

export default async function Admin() {
        
    // Cookie logic
    const cookieStore = await cookies();

    if (!cookieStore.has("g3a-session")) {
      return 
    }

    const sessionToken = cookieStore.get("g3a-session");
    if (sessionToken == undefined) {
      return 
    }

    return <div className="min-h-screen bg-gray-100 py-8">
      <AdminPage session={sessionToken.value}></AdminPage>
    </div>;
}