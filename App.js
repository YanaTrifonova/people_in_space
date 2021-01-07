import React, {useEffect, useState} from "react";
import {Button, Image, StyleSheet, Text, View} from "react-native";
import {Accelerometer} from 'expo-sensors';
import Axios from "axios";

export default function App() {
    const styles = StyleSheet.create({
        app: {
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
        },
        text: {
            fontSize: 40,
            textAlign: 'center',
            margin: 40,
        },
        rocket: {
            position: "absolute",
            justifyContent: "center",

            width: 100,
            height: 100,
            left: "50%",
            transform: [
                {
                    translateX: -50
                }
            ],
        }
    });
    const rocketImage = require('./media/rocket.png');

    const [rocket, setRocket] = useState(0);
    const [showRocket, setShowRocket] = useState(false);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [subscription, setSubscription] = useState(null);

    const setUpdateInterval = () => {
        Accelerometer.setUpdateInterval(16);
    };

    const subscribe = () => {
        setSubscription(
            Accelerometer.addListener(accelerometerData => {
                setRocket(accelerometerData.y * 1000 + 1000);

                if (accelerometerData.y * 1000 > 220) {
                    unsubscribe();
                    setShowResult(true);
                }
            })
        );
    };

    const unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    useEffect(() => {
        subscribe();
        const getData = async () => {
            try {
                const response = await Axios.get('http://api.open-notify.org/astros.json');
                setResult(response.data);
            } catch (error) {
                console.log(error);
            }
        }
        getData().catch(error => {
            throw error
        });

        return () => unsubscribe();
    }, [showRocket]);

    const onButtonClicked = () => {
        subscribe();
        setUpdateInterval();
        setShowRocket(true);
    }

    const onReloadButtonClick = () => {
        setShowRocket(false);
        setShowResult(false);
    }

    return (
        <View>
            <View style={styles.app}>
                {!showRocket
                 ?
                 <View>
                     <Text style={styles.text}>Do you want to know how many people are there in the space?</Text>
                     <Button title="Yes, I am curious" onPress={onButtonClicked}/>
                 </View>
                 : null}
                {showResult
                 ? <View><Text style={styles.text}>{result.number > 1
                                                    ? `There are ${result.number} people in the Space right now`
                                                    : result.number === 1
                                                      ? "There is 1 person right now in the Space"
                                                      : "No one person is there in the Space right now"}</Text>
                        <Button title="Try again" onPress={onReloadButtonClick}/></View>
                 : null}
            </View>
            <View>
                {(showRocket && !showResult)
                 ? <Image source={rocketImage} style={[{bottom: rocket,}, styles.rocket]}/>
                 : null}
            </View>
        </View>
    );
}
