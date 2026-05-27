import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground, Animated, Dimensions, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Importações do Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const fundoLogin = require('../../assets/fundo_tijolos_login.png');
const { height } = Dimensions.get('window');

interface LoginProps {
    onIrParaCadastro: () => void;
    onLoginSucesso: () => void;
}

export default function Login({ onIrParaCadastro, onLoginSucesso }: LoginProps) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [loginConcluido, setLoginConcluido] = useState(false);

    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true
        }).start();
    }, []);

    // --- FUNÇÃO DE LOGIN NO FIREBASE ---
    const handleFazerLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Atenção', 'Preencha seu E-mail e senha.');
            return;
        }

        try {
            // Autentica o usuário na nuvem do Firebase
            await signInWithEmailAndPassword(auth, email.trim(), senha);

            // Ativa a tela de sucesso
            setLoginConcluido(true);

            setTimeout(() => {
                onLoginSucesso();
            }, 2000);

        } catch (error: any) {
            let mensagemErro = 'Login ou senha inválidos.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                mensagemErro = 'E-mail ou senha incorretos.';
            } else if (error.code === 'auth/invalid-email') {
                mensagemErro = 'O formato do e-mail inserido é inválido.';
            }
            Alert.alert('Erro de Autenticação', mensagemErro);
        }
    };

    return (
        <ImageBackground source={fundoLogin} style={styles.background} resizeMode="cover">
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>

                {loginConcluido ? (

                    <View style={styles.sucessoContainer}>
                        <View style={styles.circleCheck}>
                            <Feather name="check" size={40} color="#000" />
                        </View>
                        <Text style={styles.textoSucesso}>Tudo pronto</Text>
                    </View>

                ) : (

                    <>
                        <Text style={styles.titulo}>Seja bem-vindo</Text>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="E-mail"
                                placeholderTextColor="#000"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Senha"
                                placeholderTextColor="#000"
                                secureTextEntry={!mostrarSenha}
                                value={senha}
                                onChangeText={setSenha}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setMostrarSenha(!mostrarSenha)}>
                                <Feather name={mostrarSenha ? "eye" : "eye-off"} size={22} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.botaoEntrar} onPress={handleFazerLogin}>
                            <Text style={styles.textoBotaoEntrar}>Entrar no App</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cadastroBtn} onPress={onIrParaCadastro}>
                            <Text style={styles.cadastroTexto}>Ainda não possuo cadastro</Text>
                        </TouchableOpacity>
                    </>

                )}
            </Animated.View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    bottomSheet: {
        backgroundColor: '#FDF9F0',
        height: '70%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 35,
        paddingTop: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10
    },
    titulo: {
        fontSize: 36,
        color: '#000',
        marginBottom: 50,
        textAlign: 'center',
        fontWeight: '400'
    },
    inputWrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginBottom: 30,
        paddingBottom: 5
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000'
    },
    eyeIcon: {
        padding: 5
    },
    botaoEntrar: {
        backgroundColor: '#FFCACA',
        paddingVertical: 15,
        width: '100%',
        alignItems: 'center',
        borderRadius: 30,
        marginTop: 20
    },
    textoBotaoEntrar: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold'
    },
    cadastroBtn: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center'
    },
    cadastroTexto: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000'
    },
    sucessoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 50
    },
    circleCheck: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    textoSucesso: {
        fontSize: 28,
        color: '#000',
        fontWeight: '400',
        letterSpacing: 1
    }
});