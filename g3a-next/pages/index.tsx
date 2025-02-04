import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "../styles/app.module.css"
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function gameCard(name: string, description: string, image_url: string, id: string) {
  return <>
    <div className={styles.gameCard}>
      <img className={styles.gameLogo} src={"/"+image_url}></img>
      <div className={styles.gameInfo}>
        <h1>{name}</h1>
        <p>{description}</p>
      </div>
    </div>
  </>
}

interface IProps {
}

interface Game {
  Name: string,
  ID: string,
  Description: string,
  active: Boolean,
  ImageURL: string,
}

interface IState {
  games: Game[]
}

class GamesView extends React.Component<IProps, IState> {
  componentDidMount(): void {
    fetch("/api/games")
      .then(response => response.json())
      .then(json => { this.setState({games: json}) })
      .catch(err => console.log(err));
  }
  render(): React.ReactNode {      
    if (this.state?.games == null) {
      return <></>
    }
    let cards: React.JSX.Element[] = []

    this.state.games.forEach(obj => {
      cards.push(gameCard(obj.Name, obj.Description, obj.ImageURL, obj.ID))
    })

    return <>
      <div className={styles.gameContainer}>
        {cards}
      </div>

      
    </>
  }
}


export default function Index() {
  return (
    <>
      <Head>
        <title>G3A - the BEST key reseller</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <GamesView></GamesView>
      </div>
    </>
  );
}
