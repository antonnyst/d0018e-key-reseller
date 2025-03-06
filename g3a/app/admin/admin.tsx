"use client"
import Form from "next/form";
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

type Key = {
    KeyString: string, 
    ID: string,
    GameID: string,
}

type Game = {
    ID: string, 
    Name: string,
    Description: string,
    ImageURL: string,
    active: boolean,
    Price: string
}

interface IState {
    orders?: Order[],
    users?: User[],
    games?: Game[],
    keys?: Key[],
}

async function modifyGame(formData: FormData) {
    const Name = formData.get("Name");
    const Description = formData.get("Description");
    const ImageURL = formData.get("ImageURL");
    const GameID = formData.get("GameID");
    const active = formData.get("active");
    const session = formData.get("session");
    const Price = formData.get("Price");
    fetch("/api/game/"+GameID+"?session="+session, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "gameName": Name,
                "gameDesc": Description,
                "gameImg": ImageURL,
                "active": active == "on" ? true : false,
                "Price": Price,
            })
        }
    ).then(()=>{
        document.location.reload()
    })
}

async function addGame(formData: FormData) {
    const Name = formData.get("Name");
    const Description = formData.get("Description");
    const ImageURL = formData.get("ImageURL");
    const session = formData.get("session");
    fetch("/api/game?session="+session, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "gameName": Name,
                "gameDesc": Description,
                "gameImg": ImageURL,
            })
        }
    ).then(()=>{
        document.location.reload()
    })
}

async function addKey(formData: FormData) {
    const GameID = formData.get("GameID");
    const KeyString = formData.get("KeyString");
    const session = formData.get("session");
    fetch("/api/keys?session="+session, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "GameID": GameID,
                "KeyString": KeyString,
            })
        }
    ).then(()=>{
        document.location.reload()
    })
}


export class AdminPage extends React.Component<IProps, IState> {
    componentDidMount(): void {
        fetch("/api/admin?session="+this.props.session)
            .then(response => {
                if (!response.ok) {
                    document.location.href="/"
                }
            })

        fetch("/api/game?session="+this.props.session)
            .then(response => {console.log(response); return response.json()})
            .then((games: Game[]) => {
                this.setState({games: games})
            })
            .catch(err => console.log(err));
        
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
        
        fetch("/api/keys?session="+this.props.session)
            .then(response => {console.log(response); return response.json()})
            .then((keys: Key[]) => {
                this.setState({keys: keys})
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
        const orders: Order[] = this.state?.orders ? this.state.orders : [];
        const users: User[] = this.state?.users ? this.state.users : [];
        const games: Game[] = this.state?.games ? this.state.games : [];
        const keys: Key[] = this.state?.keys ? this.state.keys : [];

        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1>{"Logged in with token: " + session}</h1>
                
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Admin</h1>

                <h1 className="text-2xl font-bold mt-6 text-gray-800">Orders</h1>
                <div className="space-y-4">
                    <div className="text-gray-700 flex flex-row w-full">
                        <h1 className="ml-4 my-auto">Order ID</h1>
                        <h1 className="ml-4 my-auto">User ID</h1>
                        <h1 className="ml-4 my-auto">Sum</h1>
                        <p className="flex-1 ml-4 my-auto text-right">Timestamp</p>
                    </div>
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

                <h1 className="text-2xl font-bold mt-6 text-gray-800">Users</h1>
                <div className="space-y-4">
                    <div className="text-gray-700 flex flex-row w-full">
                        <h1 className="ml-4 my-auto">User ID</h1>
                        <h1 className="ml-4 my-auto">Name</h1>
                        <h1 className="ml-4 my-auto">Type</h1>
                        <p className="flex-1 ml-4 my-auto text-right">Signup Timestamp</p>
                    </div>
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
                
                <h1 className="text-2xl font-bold mt-6 text-gray-800">Games</h1>
                <div className="space-y-4">
                    <div className="text-gray-700 flex flex-row w-full">
                        <h1 className="ml-4 my-auto">Game ID</h1>
                        <h1 className="ml-4 my-auto">Game Name</h1>
                        <h1 className="ml-4 my-auto">Price</h1>
                        <p className="flex-1 ml-4 my-auto text-right">Active</p>
                    </div>
                    {games.length > 0 ? (
                    games.map((game: Game, index) => (
                        <div key={index} className="space-y-2">
                            <button
                                className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex flex-row w-full"
                                onClick={() => {document.getElementById("game"+index)?.classList.toggle("hidden")}}
                            >
                                <h1 className="ml-4 my-auto">{game.ID}</h1>
                                <h1 className="ml-4 my-auto">{game.Name}</h1>
                                <h1 className="ml-4 my-auto">{game.Price}</h1>
                                <p className="flex-1 ml-4 my-auto text-right">{game.active ? "Active" : "Inactive"}</p>
                            </button>
                            <div id={"game"+index} className="hidden mx-4 p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700">
                                <Form action={modifyGame}>
                                    <input type="hidden" name="GameID" value={game.ID} />
                                    <input type="hidden" name="session" value={session} />

                                    <div>
                                        <h1>Name</h1>
                                        <input name="Name" defaultValue={game.Name}></input>
                                    </div>
                                    <div>
                                        <h1>Description</h1>
                                        <input name="Description" defaultValue={game.Description}></input>
                                    </div>
                                    <div>
                                        <h1>ImageURL</h1>
                                        <input name="ImageURL" defaultValue={game.ImageURL}></input>
                                    </div>
                                    <div>
                                        <h1>Price</h1>
                                        <input name="Price" defaultValue={game.Price}></input>
                                    </div>
                                    <div>
                                        <h1>Active</h1>
                                        <input name="active" type="checkbox" defaultChecked={game.active}></input>
                                    </div>
                                    <div>
                                        <button type="submit" className="bg-white border">Edit!</button>
                                    </div>
                                </Form>
                               
                            </div>
                        </div>
                    ))
                    ) : (
                    <p className="text-gray-500 text-center">No games added yet.</p>
                    )}
                </div>
                <h1 className="text-2xl font-bold mt-6 text-gray-800">Add Game</h1>
                <div className="space-y-4">
                    <Form action={addGame} className="mx-4 p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700">
                        <input type="hidden" name="session" value={session} />
                        <div>
                            <h1>Name</h1>
                            <input name="Name" defaultValue={"💀"}></input>
                        </div>
                        <div>
                            <h1>Description</h1>
                            <input name="Description" defaultValue={"💀"}></input>
                        </div>
                        <div>
                            <h1>ImageURL</h1>
                            <input name="ImageURL" defaultValue={"💀"}></input>
                        </div>
                        <div>
                            <h1>Price</h1>
                            <input name="Price" defaultValue={"10"}></input>
                        </div>
                        <div>
                            <button type="submit" className="bg-white border">Add game!</button>
                        </div>
                    </Form>
                </div>


                <h1 className="text-2xl font-bold mt-6 text-gray-800">Keys</h1>
                <div className="space-y-4">
                    <div className="text-gray-700 flex flex-row w-full">
                        <h1 className="ml-4 my-auto">Key ID</h1>
                        <h1 className="ml-4 my-auto">Game ID</h1>
                        <p className="flex-1 ml-4 my-auto text-right">Keystring</p>
                    </div>
                    {keys.length > 0 ? (
                    keys.map((key: Key, index) => (
                        <button
                            key={index}
                            className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex flex-row w-full"
                            onClick={() => {}}
                        >
                            <h1 className="ml-4 my-auto">{key.ID}</h1>
                            <h1 className="ml-4 my-auto">{key.GameID}</h1>
                            <p className="flex-1 ml-4 my-auto text-right">{key.KeyString}</p>
                        </button>
                    ))
                    ) : (
                    <p className="text-gray-500 text-center">No keys yet.</p>
                    )}
                </div>

                <h1 className="text-2xl font-bold mt-6 text-gray-800">Add Key</h1>
                <div className="space-y-4">
                    <Form action={addKey} className="mx-4 p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700">
                        <input type="hidden" name="session" value={session} />
                        <div>
                            <h1>GameID</h1>
                            <input name="GameID" defaultValue={""}></input>
                        </div>
                        <div>
                            <h1>KeyString</h1>
                            <input name="KeyString" defaultValue={""}></input>
                        </div>
                        <div>
                            <button type="submit" className="bg-white border">Add key!</button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    } 
}
