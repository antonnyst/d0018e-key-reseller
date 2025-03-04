"use client"
import React from "react";

type GamePageParameters = {
    params: Promise<GamePageProperties>
}

type GamePageProperties = {
    id: string,
}

type GamePageState = {
    game?: Game
    tags?: GameTag[]
    review?: Review[]
}

type GameTag = {
    Name: string,
}

interface Game {
    Name: string,
    ID: string,
    Description: string,
    active: boolean,
    ImageURL: string,
}

interface Review {
    ID: string,
    Description: string,
    Positive: boolean,
    UserID: string,
}



class GamePage extends React.Component<GamePageProperties, GamePageState> {
    componentDidMount(): void {
        fetch("/api/game/"+this.props.id)
            .then(response => { return response.json()})
            .then(json => { console.log(json); this.setState({game: json}) })         
            .catch(err => console.log(err));
        
        fetch("/api/gametags?id=" + this.props.id)
            .then(response => {console.log(response); return response.json()})
            .then((json: GameTag[]) => {
                json.forEach((key: GameTag) => {
                    let tags = this.state?.tags;
                    if (tags == undefined) {
                        tags = [];
                    }
                    tags.push(key)
                    this.setState({"tags": tags});
                });
            })
            .catch(err => console.error("Error fetching gametags:", err));

        fetch("/api/reviews?GameID=" + this.props.id)
            .then(response => {return response.json()})
            .then(json => {console.log(json); this.setState({review: json}) })
            .catch(err => console.error("Error fetching reviews:", err));
    }
    

    render(): React.ReactNode {
        if (this.state?.game == undefined) {
            return <div><p>Loading game...</p></div>
        }
        const tags: GameTag[] = this.state?.tags ? this.state.tags : [];
        const review: Review[] = this.state?.review ? this.state.review : [];

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
                    {/* reviews */}
                    <div className="bg-white col-span-5 row-span-1 border p-8 rounded-lg">
                        <p className="flex-1">Reviews</p>
                        <div className="w-full flex">
                            <div className="flex flex-wrap gap-2">
                                {review.length > 0 ? (
                                    review.map((game: Review, index) => (
                                        <button key={index} className="p-4 bg-amber-800 rounded-lg shadow-sm text-white flex-1 ml-4 my-auto text-left">
                                            User: {game.UserID} recommends game: {game.Positive?"TRUE":"FALSE"} and says: {game.Description}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center">No reviews on this game yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* tags on games */}
                    <div className="bg-white col-span-5 row-span-1 border p-8 rounded-lg">

                        <div className="w-full flex">
                            <p className="flex-1">Categories</p>
                            <div className="flex flex-wrap gap-2">                    
                                {tags.length > 0 ? (
                                    tags.map((game: GameTag, index) => (
                                        <button key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex-1 ml-4 my-auto text-left">
                                            {game.Name}
                                        </button>
                                    ))
                                    ) : (
                                <p className="text-gray-500 text-center">No tags added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default function Page(props: GamePageParameters) {
    return <GamePage id={React.use(props.params).id}></GamePage>
}


