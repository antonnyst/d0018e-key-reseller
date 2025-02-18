"use client"
import React from "react";

type GamePageParameters = {
    params: Promise<GamePageProperties>
}

type GamePageProperties = {
    id: string;
}

type GamePageState = {
    game?: Game
}

interface Game {
    Name: string,
    ID: string,
    Description: string,
    active: boolean,
    ImageURL: string,
  }
  

class GamePage extends React.Component<GamePageProperties, GamePageState> {
    componentDidMount(): void {
        fetch("/api/game/"+this.props.id)
            .then(response => { return response.json()})
            .then(json => { console.log(json); this.setState({game: json}) })
            .catch(err => console.log(err));
    }

    render(): React.ReactNode {
        if (this.state?.game == undefined) {
            return <div><p>Loading game...</p></div>
        }
        return (
            <div className="bg-gray-100">
                <div className="p-8 grid grid-cols-5 grid-rows-3 gap-4 h-lvh rounded-lg shadow-md">
                    <div className="bg-white col-span-3 row-span-2 border p-8 rounded-lg flex flex-col">
                        <h1 className="text-5xl text-center mb-10">{this.state.game.Name}</h1>

                        <div className="w-full flex">
                            <p className="flex-1">pris 100 dollar</p>
                            <p className="flex-1">only 45 keys left</p>
                            <button className="bg-green-400 rounded-lg p-2">add to basket</button>
                        </div>

                        <div className="flex-1 flex">
                            <p className="self-end text-bottom">{this.state.game.Description}</p>
                        </div>
                    </div>
                    <div className="bg-white col-span-2 row-span-2 border p-8 rounded-lg">
                        <img className="h-full w-full" src={"/"+this.state.game.ImageURL}></img>
                    </div>
                    <div className="bg-white col-span-5 row-span-1 border p-8 rounded-lg">
                        
                    </div>
                </div>
            </div>
        );
    }
}

export default function Page(props: GamePageParameters) {
    return <GamePage id={React.use(props.params).id}></GamePage>
}


