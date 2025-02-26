"use client"
import React from "react";

type IProps = {
    session: string
}

type Order = {
    ID: string,
    Timestamp: string,
    Sum: string,
    UserID: string,
}

type User = {
    ID: string,
    Name: string,
    UserType: string,
    SignupTimestamp: string,
}

/*type Game = {
    Name: string,
    ID: string,
    Description: string,
    active: boolean,
    ImageURL: string,
}*/

interface IState {
    orders?: Order[],
    users?: User[],
}

export class AdminPage extends React.Component<IProps, IState> {
    componentDidMount(): void {
        fetch("/api/orders?session="+this.props.session)
            .then(response => {console.log(response); return response.json()})
            .then((orders: Order[]) => {
                this.setState({orders: orders})
            })
            .catch(err => console.log(err));

        fetch("/api/users?session="+this.props.session)
            .then(response => {console.log(response); return response.json()})
            .then((users: User[]) => {
                this.setState({users: users})
            })
            .catch(err => console.log(err));
            /*
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
        */
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
        const orders: Order[] = this.state?.orders ? this.state.orders  : [];
        const users: User[] = this.state?.users ? this.state.users  : [];

        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1>{"Logged in with token: " + session}</h1>
                
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Admin</h1>

                <h1 className="text-2xl font-bold mb-6 text-gray-800">Orders</h1>
                <div className="space-y-4">
                    {orders.length > 0 ? (
                    orders.map((order: Order, index) => (
                        <button
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex flex-row w-full"
                            onClick={() => {}}
                        >
                            <h1 className="ml-4 my-auto">{order.ID}</h1>
                            <h1 className="ml-4 my-auto">{order.UserID}</h1>
                            <h1 className="ml-4 my-auto">{order.Sum}</h1>
                            <p className="flex-1 ml-4 my-auto text-right">{order.Timestamp}</p>
                        </button>
                    ))
                    ) : (
                    <p className="text-gray-500 text-center">No games added yet.</p>
                    )}
                </div>

                <h1 className="text-2xl font-bold mb-6 text-gray-800">Users</h1>
                <div className="space-y-4">
                    {users.length > 0 ? (
                    users.map((user: User, index) => (
                        <button
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex flex-row w-full"
                            onClick={() => {}}
                        >
                            <h1 className="ml-4 my-auto">{user.ID}</h1>
                            <h1 className="ml-4 my-auto">{user.Name}</h1>
                            <h1 className="ml-4 my-auto">{user.UserType}</h1>
                            <p className="flex-1 ml-4 my-auto text-right">{user.SignupTimestamp}</p>
                        </button>
                    ))
                    ) : (
                    <p className="text-gray-500 text-center">No games added yet.</p>
                    )}
                </div>
            </div>
        );
    } 
}
