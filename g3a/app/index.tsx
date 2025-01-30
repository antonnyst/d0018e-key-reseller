import React from "react";
import { Text, View, StyleSheet, Image, ScrollView, SafeAreaView } from "react-native";

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
    width: "33%",
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
});

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
      <View style={styles.gameListElement}>
        <Image
        source={require('../assets/images/icon.png')}
        style={styles.gameLogo}
        />
        <View style={styles.textContainer}>
          <Text
          style={styles.gameTitle}
          >Speltitel</Text>
          <Text
          style={styles.gameDescription}
          >
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
            nisi ut aliquip ex ea commodo consequat."
          </Text>
        </View>
      </View>
      <View style={styles.gameListElement}>
        <Image
        source={require('../assets/images/icon.png')}
        style={styles.gameLogo}
        />
        <View style={styles.textContainer}>
          <Text
          style={styles.gameTitle}
          >Speltitel</Text>
          <Text
          style={styles.gameDescription}
          >
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
            nisi ut aliquip ex ea commodo consequat."
          </Text>
        </View>
      </View>
      <View style={styles.gameListElement}>
        <Image
        source={require('../assets/images/icon.png')}
        style={styles.gameLogo}
        />
        <View style={styles.textContainer}>
          <Text
          style={styles.gameTitle}
          >Speltitel</Text>
          <Text
          style={styles.gameDescription}
          >
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
            nisi ut aliquip ex ea commodo consequat."
          </Text>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
