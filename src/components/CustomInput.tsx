import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Props {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    erro?: string | null;
}

export const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry, erro }: Props) => (
    <View style={styles.inputWrapper}>
        {value === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
                <Text style={styles.placeholderText}>{placeholder}</Text>
                <Text style={styles.asterisco}> *</Text>
            </View>
        )}
        <TextInput
            style={[styles.inputCustom, erro ? styles.inputErro : null]}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            cursorColor="#000"
        />
        {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    inputWrapper: { width: '100%', marginBottom: 18, justifyContent: 'center' },
    placeholderContainer: { position: 'absolute', flexDirection: 'row', alignItems: 'center', bottom: 8, left: 0 },
    placeholderText: { fontSize: 14, color: '#000' },
    asterisco: { fontSize: 14, color: '#ff3b3b', fontWeight: 'bold', marginLeft: 10 },
    inputCustom: { width: '100%', borderBottomWidth: 1.2, borderBottomColor: '#000', paddingVertical: 5, fontSize: 15, color: '#000' },
    inputErro: { borderBottomColor: '#ff3b3b' },
    textoErro: { color: '#ff3b3b', fontSize: 12, marginTop: 5, marginLeft: 2, fontWeight: '500' },
});