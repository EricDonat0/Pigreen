import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Image, Platform } from 'react-native';

const fundoLogo = require('../../assets/fundo_logo.png');
const pigWalking = require('../../assets/pig_walking.png');
const pigWinking = require('../../assets/pig_winking.png');

interface AnimacaoIntroProps {
    onFinish: () => void;
}

export default function AnimacaoIntro({ onFinish }: AnimacaoIntroProps) {
    const pigPositionX = useRef(new Animated.Value(500)).current;
    const [currentPigImage, setCurrentPigImage] = useState(pigWalking);

    useEffect(() => {
        // TRAVA DE SEGURANÇA PARA A WEB
        let timerWeb: ReturnType<typeof setTimeout>;
        if (Platform.OS === 'web') {
            // Força o navegador a esperar 4 segundos (2.5s andando + 0.3s pausa + 1.2s piscando)
            timerWeb = setTimeout(() => {
                if (onFinish) onFinish();
            }, 4000);
        }

        Animated.sequence([
            Animated.timing(pigPositionX, {
                toValue: 0,
                duration: 2500,
                useNativeDriver: Platform.OS !== 'web', // False no PC, True no celular
            }),
            Animated.delay(300),
        ]).start(() => {
            setCurrentPigImage(pigWinking);

            // No celular, confiamos no fim da animação para trocar a tela
            if (Platform.OS !== 'web') {
                setTimeout(() => {
                    if (onFinish) onFinish();
                }, 1200);
            }
        });

        // Limpa o timer se o componente for desmontado antes
        return () => {
            if (timerWeb) clearTimeout(timerWeb);
        };
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={fundoLogo}
                style={styles.logo}
                resizeMode="contain"
            />
            <Animated.Image
                source={currentPigImage}
                style={[
                    styles.pig,
                    { transform: [{ translateX: pigPositionX }] }
                ]}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF9F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: { width: 220, height: 220 },
    pig: {
        position: 'absolute',
        width: 124,
        height: 99,
        bottom: '10%',
        right: '5%',
    },
});