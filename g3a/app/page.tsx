/* eslint-disable @next/next/no-img-element */
"use client"
import React from "react";


function gameCard(name: string, description: string, image_url: string, id: string) {
  return (
    <button className="border-2 border-black grid h-[25em]"  key={id} onClick={() => {document.location.href="/game/"+id}}>
      <img className="aspect-square m-[5%] w-[90%]" src={"/"+image_url} alt={"Logo for " + name}></img>
      <div className="overflow-hidden">
        <h1 className="font-bold text-center">{name}</h1>
        <p className="mt-2 text-left p-4">{description}</p>
      </div>
    </button>
  )
}

type IProps = object

interface Game {
  Name: string,
  ID: string,
  Description: string,
  active: boolean,
  ImageURL: string,
}

interface IState {
  games: Game[]
}

class GamesView extends React.Component<IProps, IState> {
  componentDidMount(): void {
    fetch("/api/game")
      .then(response => {console.log(response); return response.json()})
      .then(json => {  this.setState({games: json}) })
      .catch(err => console.log(err));
  }
  render(): React.ReactNode {      
    const search = (
      <div className="w-full p-4">
        <input 
          className="border-2 border-black w-full p-2 text-xl"
          onChange={e => {
            fetch("/api/game?search="+e.target.value)
              .then(response => {console.log(response); return response.json()})
              .then(json => { this.setState({games: json}) })
              .catch(err => console.log(err))
          }}
          placeholder="Search..."
        /> 
      </div>
    );
    
    if (this.state?.games == null) {
      return search;
    }
    const cards: React.JSX.Element[] = []
    
    if (this.state.games.length == 0) {
      cards.push((
        <h1 className="text-2xl text-center font-bold col-span-full">No games found!</h1>
      )) 
    } else {
      this.state.games.forEach(obj => {
        cards.push(gameCard(obj.Name, obj.Description, obj.ImageURL, obj.ID))
      })
    }
    
    return <div>
      {search}
      <div className="p-4 gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6">
        {cards}
      </div>
    </div>
  }
}

export default function Index() {
  return (
    <>
      <div>
        <GamesView></GamesView>
      </div>
    </>
  );
}
