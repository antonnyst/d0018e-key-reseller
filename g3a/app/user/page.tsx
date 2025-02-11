import { cookies } from 'next/headers' 
import Link from 'next/link';
import { LogoutButton } from '../cookies';

export default async function ProfilePage() {
    // Static list of games
    const games = [
      'Grand Theft Boat V',
      'Elden Neckless',
      'Cyberrock 2077',
      'Red Alive Redemption 2',
      'Call of Booty',
    ];

    const unauthorized_page = (
      <div className="min-h-screen bg-gray-100 py-8">
        <Link className="text-2xl" href={"/login"}>
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md text-center">
            <h1>Log in to access your profile!</h1>
          </div>
        </Link>
      </div>
    );
    
    // Cookie logic
    const cookieStore = await cookies();

    if (!cookieStore.has("g3a-session")) {
      return unauthorized_page;
    }

    const sessionToken = cookieStore.get("g3a-session");
    if (sessionToken == undefined) {
      return unauthorized_page;
    }
  
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1>{"Logged in with token: " + sessionToken.value}</h1>
          
          <h1 className="text-2xl font-bold mb-6 text-gray-800">My Game Collection</h1>
  
          {/* List of owned games */}
          <div className="space-y-4">
            {games.length > 0 ? (
              games.map((game, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700"
                >
                  {game}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No games added yet.</p>
            )}
          </div>
  
          <LogoutButton className='mt-8 p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700'></LogoutButton>
        </div>
      </div>
    );
  }