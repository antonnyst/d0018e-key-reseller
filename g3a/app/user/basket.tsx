"use client"
import React from "react";

type IProps = {
    session: string
}

type ShoppCart = {
    Name: string,
    ImageURL: string,
    ID: string,
}
interface IState {
    shoppcarts?: ShoppCart[]
}

export class BasketPage extends React.Component<IProps, IState> {
    componentDidMount(): void {
        fetch("/api/basket?session="+this.props.session)
            .then(response => {console.log(response); return response.json()})
            .then((json: string[]) => {
                json.forEach((bask: string) => {
                    fetch("/api/game/"+bask)
                        .then(response => response.json())
                        .then(json => {
                            let basks = this.state?.shoppcarts;
                            if (basks == undefined) {
                                basks = [];
                            }
                            basks.push(json);
                            this.setState({"shoppcarts": basks});
                        }).catch((err)=>console.log(err));
                });
            })
            .catch(err => console.log(err));
    }

    render(): React.ReactNode {
        const shoppcarts: ShoppCart[] = this.state?.shoppcarts ? this.state.shoppcarts : [];

        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md pt-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">My Basket</h1>
                <div className="space-y-4">
                    {shoppcarts.length > 0 ? (
                        shoppcarts.map((favorite, index) => (
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
                        <p className="text-gray-500 text-center">Nothing in basket yet.</p>
                    )}
                </div>
            </div>
        );
    }
}
