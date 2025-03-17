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

type Order = {
    Timestamp: string,
    Sum: string,
    ID: string,
    keys: Key[] | undefined
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
    keys?: Key[],
    orders?: Order[],
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

        
        fetch("/api/account/orders?session="+this.props.session)
            .then(response => {return response.json()})
            .then((json: Order[]) => {
                json.forEach((order: Order) => {
                    fetch("/api/orderkeys?session="+this.props.session+"&orderID="+order.ID)
                        .then(response => response.json())
                        .then((json: Key[]) => {
                            let orders = this.state?.orders;
                            if (orders == undefined) {
                                orders = [];
                            }
                            orders.push({
                                keys: json,
                                Timestamp: order.Timestamp,
                                Sum: order.Sum,
                                ID: order.ID,
                            })
                            this.setState({"orders": orders});
                        })
                });
            })
            .catch(err => console.log(err))


        
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
        const favorites: Favorite[] = this.state?.favorites ? this.state.favorites : [];
        const orders: Order[] = this.state?.orders ? this.state.orders : [];

        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1>{"Logged in with token: " + session}</h1>

                {/* Orders */}
                <h1 className="text-2xl font-bold mb-6 text-gray-800">My Orders</h1>

                <div className="space-y-4">
                    <div className="text-gray-700 flex flex-row w-full">
                        <h1 className="ml-4 my-auto">Order ID</h1>
                        <h1 className="ml-4 my-auto">Sum</h1>
                        <p className="flex-1 ml-4 my-auto text-right">Timestamp</p>
                    </div>
                    {orders.length > 0 ? (
                    orders.map((order: Order, index) => (
                        <div key={index} className="space-y-4">
                            <button
                                className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex flex-row w-full"
                                onClick={() => {document.getElementById("order"+index)?.classList.toggle("hidden")}}
                            >
                                <h1 className="ml-4 my-auto">{order.ID}</h1>
                                <h1 className="ml-4 my-auto">{order.Sum} dollar</h1>
                                <p className="flex-1 ml-4 my-auto text-right">{order.Timestamp}</p>
                            </button>
                            <div id={"order"+index} className="hidden mx-4 text-gray-700 space-y-4">
                                {order.keys?.map((key: Key, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg shadow-sm p-4 flex flex-row w-full">
                                        <img className="aspect-square h-10" src={key.ImageURL}></img>
                                        <h1 className="ml-4 my-auto">{key.Name}</h1>
                                        <p className="flex-1 ml-4 my-auto text-right">{key.KeyString}</p>
                                    </div>
                                ))} 
                            </div>
                        </div>
                        )
                    )
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
