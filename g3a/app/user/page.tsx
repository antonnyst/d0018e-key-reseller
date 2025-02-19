import { cookies } from 'next/headers' 
import LoginPage from './login';
import { UserPage } from './user';
import { AccountPage } from './account';

export default async function ProfilePage() {
        
    // Cookie logic
    const cookieStore = await cookies();

    if (!cookieStore.has("g3a-session")) {
      return <LoginPage/>;
    }

    const sessionToken = cookieStore.get("g3a-session");
    if (sessionToken == undefined) {
      return <LoginPage/>;
    }
  
    return <div className="min-h-screen bg-gray-100 py-8">
      <UserPage session={sessionToken.value}></UserPage>
      <AccountPage session={sessionToken.value}></AccountPage>
    </div>
  }
