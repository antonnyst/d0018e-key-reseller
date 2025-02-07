export default function ProfilePage() {
    // Static list of games
    const games = [
      'Grand Theft Boat V',
      'Elden Neckless',
      'Cyberrock 2077',
      'Red Alive Redemption 2',
      'Call of Booty',
    ];
  
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
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
        </div>
      </div>
    );
  }