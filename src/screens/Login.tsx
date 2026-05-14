import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground, Animated, Dimensions, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- Importa o Banco de Dados

const fundoLogin = require('../../assets/fundo_tijolos_login.png');
const { height } = Dimensions.get('window');

interface LoginProps {
    onIrParaCadastro: () => void;
}

export default function Login({ onIrParaCadastro }: LoginProps) {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }).start();
    }, []);

    // --- FUNÇÃO PARA VERIFICAR O LOGIN NO BANCO ---
    const handleFazerLogin = async () => {
        if (!login || !senha) {
            Alert.alert('Atenção', 'Preencha seu login e senha.');
            return;
        }

        try {
            // 1. Busca os dados salvos no celular
            const dadosSalvos = await AsyncStorage.getItem('@pigreen_usuario');

            if (dadosSalvos !== null) {
                // 2. Converte de texto JSON de volta para Objeto
                const usuario = JSON.parse(dadosSalvos);

                // 3. Compara o que o usuário digitou com o que está no banco
                if (usuario.login === login && usuario.senha === senha) {
                    Alert.alert('Acesso Liberado!', `Bem-vindo de volta, responsável pela criança ${usuario.nomeCrianca}!`);
                    // Futuramente: aqui você avisará o App.tsx para ir para a tela Home do jogo!
                } else {
                    Alert.alert('Erro', 'Login ou senha incorretos.');
                }
            } else {
                Alert.alert('Ops!', 'Nenhum cadastro encontrado. Por favor, crie uma conta primeiro.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao acessar os dados de login.');
        }
    };

    return (
        <ImageBackground source={fundoLogin} style={styles.background} resizeMode="cover">
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.titulo}>Seja bem-vindo</Text>

                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Login" placeholderTextColor="#000" value={login} onChangeText={setLogin} />
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#000" secureTextEntry={!mostrarSenha} value={senha} onChangeText={setSenha} />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setMostrarSenha(!mostrarSenha)}>
                        <Feather name={mostrarSenha ? "eye" : "eye-off"} size={22} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Agora o botão de Entrar (Esqueci a senha virou botão por enquanto) */}
                <TouchableOpacity style={styles.botaoEntrar} onPress={handleFazerLogin}>
                    <Text style={styles.textoBotaoEntrar}>Entrar no App</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cadastroBtn} onPress={onIrParaCadastro}>
                    <Text style={styles.cadastroTexto}>Ainda não possuo cadastro</Text>
                </TouchableOpacity>
            </Animated.View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, justifyContent: 'flex-end' },
    bottomSheet: { backgroundColor: '#FDF9F0', height: '70%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 35, paddingTop: 50, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 10 },
    titulo: { fontSize: 36, color: '#000', marginBottom: 50, textAlign: 'center', fontWeight: '400' },
    inputWrapper: { width: '100%', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 30, paddingBottom: 5 },
    input: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#000' },
    eyeIcon: { padding: 5 },

    botaoEntrar: { backgroundColor: '#FFCACA', paddingVertical: 15, width: '100%', alignItems: 'center', borderRadius: 30, marginTop: 20 },
    textoBotaoEntrar: { color: '#000', fontSize: 16, fontWeight: 'bold' },

    cadastroBtn: { position: 'absolute', bottom: 50, alignSelf: 'center' },
    cadastroTexto: { fontSize: 14, fontWeight: 'bold', color: '#000' }
});