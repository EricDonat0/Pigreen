import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Home() {
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>🏡 Home do Jogo Pigreen</Text>
            <Text style={styles.subtitulo}>Aqui o Tamagotchi vai morar!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF9F0', // Mesma cor de fundo do app
        alignItems: 'center',
        justifyContent: 'center',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    subtitulo: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    }
});