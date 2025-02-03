import React from "react";
import { useState } from "react";

import { Text, View, StyleSheet, Image, ScrollView, SafeAreaView, ScrollViewProps, TextInput } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    // backgroundColor: "black",
    flexDirection: "column",
  },
  gameListElement: {
    flexDirection: "row",
    height: 300,
    width: 800,
    backgroundColor: "lightgray",
    borderColor: "black",
    borderWidth: 2,
    marginTop: 4,
  },
  gameLogo: {
    aspectRatio: 1 / 1,
    height: "100%",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",

  },
  gameTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "black",
    marginLeft: 12,
    marginTop: 4,
  },
  gameDescription: {
    fontSize: 28,
    fontWeight: "normal",
    color: "black",
    marginLeft: 12,
    marginRight: 12,
  },
  searchBar: {
    fontSize: 30,
    fontWeight: "normal",
    color: "black",
    margin: 30,
    height: 50,
    borderWidth: 2,
  }
});
function gameCard(name: string, description: string, image_url: string) {
  return <View style={styles.gameListElement}>
          <img
            src={'/images/'+image_url}
            style={styles.gameLogo}
          />
          <View style={styles.textContainer}>
            <Text style={styles.gameTitle}>{name}</Text>
            <Text style={styles.gameDescription}>
              {description}
            </Text>
          </View>
        </View>;
} 

interface IProps {
}

interface Game {
  Name: string,
  ID: number,
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
      return <ScrollView></ScrollView>
    }
    let cards: React.JSX.Element[] = []

    this.state.games.forEach(obj => {
      cards.push(gameCard(obj.Name, obj.Description, obj.ImageURL))
    })

    return <ScrollView>
      <TextInput
        style={styles.searchBar}
        onSubmitEditing={(text) => {
          fetch("/api/games?search="+text.nativeEvent.text)
            .then(response => response.json())
            .then(json => { console.log(json); this.setState({games: json}) })
            .catch(err => console.log(err));
        }}
      />
      {cards}
    </ScrollView>
  }
}

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
    <GamesView></GamesView>
    </SafeAreaView>
  );
}
