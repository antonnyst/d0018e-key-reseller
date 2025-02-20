"use client"
import React from "react";

type IProps = {
    session: string
}

type Favorite = {
    Name: string,
    ImageURL: string,
    ID: string,
}

type MinimalKey = {
    KeyString: string,
    GameID: string,
}

type Key = {
    KeyString: string,
    Name: string,
    ImageURL: string,
    GameID: string,
}

type Game = {
    Name: string,
    ID: string,
    Description: string,
    active: boolean,
    ImageURL: string,
}

interface IState {
    favorites?: Favorite[],
    keys?: Key[]
}

export class UserPage extends React.Component<IProps, IState> {
    componentDidMount(): void {
        fetch("/api/favorites?session="+this.props.session)
            .then(response => {console.log(response); return response.json()})
            .then((json: string[]) => {
                json.forEach((fav: string) => {
                    fetch("/api/game/"+fav)
                        .then(response => response.json())
                        .then(json => {
                            let favs = this.state?.favorites;
                            if (favs == undefined) {
                                favs = [];
                            }
                            favs.push(json);
                            this.setState({"favorites": favs});
                        }).catch((err)=>console.log(err));
                });
            })
            .catch(err => console.log(err));

        fetch("/api/account/keys?session="+this.props.session)
            .then(response => {console.log(response); return response.json()})
            .then((json: MinimalKey[]) => {
                json.forEach((key: MinimalKey) => {
                    const { KeyString, GameID } = key;

                    fetch("/api/game/"+GameID)
                        .then(response => response.json())
                        .then((game: Game) => {
                            let keys = this.state?.keys;
                            if (keys == undefined) {
                                keys = [];
                            }
                            keys.push({
                                KeyString,
                                GameID,
                                Name: game.Name,
                                ImageURL: game.ImageURL
                            });
                            this.setState({"keys": keys});
                        }).catch((err)=>console.log(err));
                });
            })
            .catch(err => console.log(err));

    }

    render(): React.ReactNode {      
        const session = this.props.session;
    
        // Static list of games
        /*const games: Key[] = [
            {
                KeyString: "aaa-bbb-ccc",
                Name: "Gruvkraft - Kiruna Edition",
                ImageURL: "GRUVKRAFT.jpg",
                GameID: "1000"
            },
            {
                KeyString: "sussy-key",
                Name: "EEE",
                ImageURL: "GRUVKRAFT.jpg",
                GameID: "1001"
            }
        ];*/
        const games: Key[] = this.state?.keys ? this.state.keys : [];
        const favorites: Favorite[] = this.state?.favorites ? this.state.favorites : [];

        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1>{"Logged in with token: " + session}</h1>
                
                <h1 className="text-2xl font-bold mb-6 text-gray-800">My Keys</h1>

                {/* List of owned games */}
                <div className="space-y-4">
                    {games.length > 0 ? (
                    games.map((game: Key, index) => (
                        <button
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex flex-row w-full"
                            onClick={() => {document.location.href="/game/"+game.GameID}}
                        >
                            <img className="aspect-square h-10" src={game.ImageURL}></img>
                            <h1 className="ml-4 my-auto">{game.Name}</h1>
                            <p className="flex-1 ml-4 my-auto text-right">{game.KeyString}</p>
                        </button>
                    ))
                    ) : (
                    <p className="text-gray-500 text-center">No games added yet.</p>
                    )}
                </div>

                {/* Favorites */}
                <h1 className="mt-6 text-2xl font-bold mb-6z text-gray-800">My Favorites</h1>
                <div className="space-y-4">
                    {favorites.length > 0 ? (
                    favorites.map((favorite, index) => (
                        <button
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex flex-row w-full"
                            onClick={() => {document.location.href="/game/"+favorite.ID}}
                        >
                            <img className="aspect-square h-10" src={favorite.ImageURL}></img>
                            <h1 className="ml-4 my-auto">{favorite.Name}</h1>
                        </button>
                    ))
                    ) : (
                    <p className="text-gray-500 text-center">No favorites yet.</p>
                    )}
                </div>
            </div>
        );
    } 
}
