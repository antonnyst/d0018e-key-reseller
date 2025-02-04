import { Text, View, StyleSheet, Image, ScrollView, SafeAreaView, ScrollViewProps, TextInput, Pressable } from "react-native";
import React from "react";
import { useSearchParams } from "expo-router/build/hooks";

const styles = StyleSheet.create({
    window: {
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        //backgroundColor: "yellow",
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
    gameLogo: {
        aspectRatio: 1 / 1,
        height: "100%",
    },
    textContainer: {
        flex: 1,
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
})
function gameHomePage(name: string, description: string, image_url: string, id: string) {
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
    gamesid?: string
};

interface Game {
  Name: string,
  ID: string,
  Description: string,
  active: Boolean,
  ImageURL: string,
}

interface IState {
  game?: Game
}
class GamesView extends React.Component<IProps, IState> {
    
    componentDidMount(): void {
      const gamesid = useSearchParams().get("id");

      fetch(`/api/game/${gamesid}`)
        .then(response => response.json())
        .then(json => { this.setState({game: json}) })
        .catch(err => console.log(err));
    }
    render(): React.ReactNode {      
      if (this.state?.game == undefined) {
        return <ScrollView></ScrollView>
      }
      let cards: React.JSX.Element[] = []
      let obj = this.state.game;
      cards.push(gameHomePage(obj.Name, obj.Description, obj.ImageURL, obj.ID))
    
      return <ScrollView>{cards}</ScrollView>
    }
}
export default function page(){
    return (
      <SafeAreaView style={styles.window}>
        <GamesView></GamesView>
      </SafeAreaView>
    );
}