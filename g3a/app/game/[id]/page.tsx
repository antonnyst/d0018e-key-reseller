"use client"
import React from "react";
import Form from 'next/form'
import {getCookie} from "cookies-next";

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
    stock?: string
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
    Price: string,
}

interface Review {
    ID: string,
    Description: string,
    Positive: boolean,
    UserID: string,
}

async function postReview(formdata: FormData, GameID: string | undefined) {
    const description = formdata.get("RUserDescription");
    const positive = formdata.get("RUserPositive");
    const gameID = GameID;
    const cookie = getCookie("g3a-session");

    try {
        const response = await fetch("/api/reviews", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({description: description, positive: positive, gameID: gameID, session: cookie}),
        })
        if (response) {
            console.log(response);
        }
    } catch (err) {
        console.log(err);
    }
    document.location.reload()
}

async function handleAddToBasket(GameID: string | undefined) {
    const session = getCookie("g3a-session");
    if (GameID==undefined) {
        return;
    }
    try {
        const response = await fetch("/api/basket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({session, GameID}),
        })
        if (response) {
            console.log(response);
        }
    } catch (err) {
        console.log(err);
    }
    document.location.reload()
}


class GamePage extends React.Component<GamePageProperties, GamePageState> {
    componentDidMount(): void {
        fetch("/api/game/" + this.props.id)
            .then(response => {
                return response.json()
            })
            .then(json => {
                console.log(json);
                this.setState({game: json})
            })
            .catch(err => console.log(err));

        fetch("/api/game/" + this.props.id + "/stock")
            .then(response => {
                return response.json()
            })
            .then(json => {
                console.log(json);
                this.setState({stock: json})
            })
            .catch(err => console.log(err));

        fetch("/api/gametags?id=" + this.props.id)
            .then(response => response.json())
            .then((json: GameTag[]) => {
                this.setState({tags: json});
            })
            .catch(err => console.error("Error fetching gametags:", err));

        fetch("/api/reviews?GameID=" + this.props.id)
            .then(response => {
                return response.json()
            })
            .then(json => {
                console.log(json);
                this.setState({review: json})
            })
            .catch(err => console.error("Error fetching reviews:", err));
    }


    render(): React.ReactNode {
        if (this.state?.game == undefined) {
            return <div><p>Loading game...</p></div>
        }
        const tags: GameTag[] = this.state?.tags ? this.state.tags : [];
        const review: Review[] = this.state?.review ? this.state.review : [];

        const handleReview = (formData: FormData) => postReview(formData, this.state?.game?.ID);

        return (
            <div className="bg-gray-100">
                <div className="p-8 grid grid-cols-5 grid-rows-3 gap-4 h-lvh rounded-lg shadow-md">
                    <div className="bg-white col-span-3 row-span-2 border p-8 rounded-lg flex flex-col">
                        <h1 className="text-5xl text-center mb-10">{this.state.game.Name}</h1>

                        <div className="w-full flex">
                            <p className="flex-1">pris {this.state?.game?.Price} dollar</p>
                            <p className="flex-1">only {this.state.stock} keys left</p>
                            <button onClick={()=>handleAddToBasket(this.state?.game?.ID)} className="bg-green-400 rounded-lg p-2">add to basket</button>
                        </div>

                        <div className="flex-1 flex">
                            <p className="self-end text-bottom">{this.state.game.Description}</p>
                        </div>
                    </div>
                    <div className="bg-white col-span-2 row-span-2 border p-8 rounded-lg">
                        <img className="h-full w-full" src={"/" + this.state.game.ImageURL}></img>
                    </div>
                    {/* reviews */}
                    <div className="bg-white col-span-5 row-span-1 border p-8 rounded-lg">
                        <p className="flex-1">Reviews</p>
                        <div className="w-full flex">
                            <div className="flex flex-wrap gap-2">
                                {review.length > 0 ? (
                                    review.map((game: Review, index) => (
                                        <button key={index}
                                                className="p-4 bg-amber-800 rounded-lg shadow-sm text-white flex-1 ml-4 my-auto text-left">
                                            User: {game.UserID} recommends game: {game.Positive ? "TRUE" : "FALSE"} and
                                            says: {game.Description}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center">No reviews on this game yet.</p>
                                )}
                            </div>
                        </div>
                        {this.state.game && this.state.game.ID && (
                        <Form action={handleReview}>
                            <div className="bg-white col-span-3 row-span-2 border p-8 rounded-lg flex">
                                <div className="w-full">
                                    <h1 className="text-center">What you think:</h1>
                                    <input name="RUserDescription" className="border-black border w-full"></input>
                                </div>
                                <div className="w-full">
                                    <h1 className="text-center">You like game? Type 1 or 0:</h1>
                                    <input name="RUserPositive" className="border-black border w-full"></input>
                                </div>
                                <div className="w-full">
                                    <button type="submit" className="border-black border ml-[25%] mr-[25%] w-[50%]">Send
                                        Review!
                                    </button>
                                </div>
                            </div>
                        </Form>
                        )}
                    </div>

                    {/* tags on games */}
                    <div className="bg-white col-span-5 row-span-1 border p-8 rounded-lg">

                        <div className="w-full flex">
                            <p className="flex-1">Categories</p>
                            <div className="flex flex-wrap gap-2">
                                {tags.length > 0 ? (
                                    tags.map((game: GameTag, index) => (
                                        <button key={index}
                                                className="p-4 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex-1 ml-4 my-auto text-center">
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


