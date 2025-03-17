/* eslint-disable @next/next/no-img-element */
"use client"
import React from "react";


function gameCard(name: string, description: string, image_url: string, id: string, tags: string[]) {
  return (
    <button className="border-2 border-black grid grid-rows-[1fr_auto] h-[25em]"  key={id} onClick={() => {document.location.href="/game/"+id}}>
      <img className="aspect-square m-[5%] w-[90%]" src={"/"+image_url} alt={"Logo for " + name}></img>
      <div className="overflow-hidden">
        <h1 className="font-bold text-center">{name}</h1>
        <p className="mt-2 text-left p-4">{description}</p>
        <footer className ="p-1 bg-gray-50 rounded-lg shadow-sm text-gray-700 flex-1 ml-4 my-auto text-center">{tags}</footer>
      </div>
    </button>
  )
}

type IProps = {
  search?: string,
}

interface Game {
  Name: string,
  ID: string,
  Description: string,
  active: boolean,
  ImageURL: string,
  Tags: string[],
}

type GameTag = {
  Name: string,
}

interface IState {
  games: Game[]
  tags: GameTag[]
}

class GamesView extends React.Component<IProps, IState> {
  componentDidMount(): void {
    fetch("/api/game")
    .then(response => {console.log(response); return response.json()})
      .then((json: Game[]) => {

        // Fetch tags for each game
        json.forEach(game => {
          fetch(`/api/gametags?id=${game.ID}`)
            .then(response => response.json())
            .then((json: GameTag[]) => {
              let games = this.state?.games;
              if (games == undefined) {
                  games = [];
              }
              games.push({
                Name: game.Name,
                ID: game.ID,
                Description: game.Description,
                active: game.active,
                ImageURL: game.ImageURL,
                Tags: json.map(tag => tag.Name)
              });
              this.setState({"games": games}); 
            })
          .catch(err => console.error("Error fetching gametags:", err));
        });
      })
      .catch(err => console.error("Error fetching games:", err));
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
        cards.push(gameCard(obj.Name, obj.Description, obj.ImageURL, obj.ID, obj.Tags))
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
