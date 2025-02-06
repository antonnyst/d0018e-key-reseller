"use client"
import Link from "next/link";
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
        return <div>
            <Link href="/">Go back</Link>
            <h1>{this.state.game.Name}</h1>
            <p>{this.state.game.Description}</p>
        </div>
    }
}

export default function Page(props: GamePageParameters) {
    return <GamePage id={React.use(props.params).id}></GamePage>
}


