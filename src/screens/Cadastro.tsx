import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
    Platform, ImageBackground, Animated, Dimensions, Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// Importações do Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const fundoTijolos = require('../../assets/fundo_tijolos.png');
const { height } = Dimensions.get('window');

const InputComAsterisco = ({ placeholder, value, onChangeText, secureTextEntry, erro, autoCapitalize }: any) => (
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
            autoCapitalize={autoCapitalize || 'none'}
            cursorColor="#000"
        />
        {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}
    </View>
);

interface CadastroProps {
    onVoltarLogin: () => void;
}

export default function Cadastro({ onVoltarLogin }: CadastroProps) {
    const [nomeResponsavel, setNomeResponsavel] = useState('');
    const [nomeCrianca, setNomeCrianca] = useState('');
    const [email, setEmail] = useState('');
    const [confirmacaoEmail, setConfirmacaoEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
    const [forcaSenha, setForcaSenha] = useState<{ label: string, cor: string } | null>(null);
    const [dataNascimento, setDataNascimento] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [dataTexto, setDataTexto] = useState('');
    const [dieta, setDieta] = useState<string | null>(null);

    const opcoesDieta = [
        'é vegano',
        'é vegetariano',
        'está em transição'
    ];

    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true
        }).start();
    }, []);

    const avaliarSenha = (texto: string) => {
        setSenha(texto);
        if (texto.length === 0) { setForcaSenha(null); return; }
        if (texto.length < 6) { setForcaSenha({ label: 'Fraca', cor: '#ff3b3b' }); }
        else if (texto.match(/[a-z]/) && texto.match(/[A-Z]/) && texto.match(/[0-9]/)) { setForcaSenha({ label: 'Forte', cor: '#32CD32' }); }
        else { setForcaSenha({ label: 'Média', cor: '#FFA500' }); }
    };

    const aoMudarData = (event: any, dataSelecionada?: Date) => {
        if (Platform.OS !== 'ios') setMostrarCalendario(false);
        if (dataSelecionada) {
            setDataNascimento(dataSelecionada);
            const dia = String(dataSelecionada.getDate()).padStart(2, '0');
            const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
            const ano = dataSelecionada.getFullYear();
            setDataTexto(`${dia}  /  ${mes}  /  ${ano}`);
        }
    };

    const erroEmail = confirmacaoEmail.length > 0 && email !== confirmacaoEmail ? 'Os e-mails não coincidem' : null;
    const erroSenha = confirmacaoSenha.length > 0 && senha !== confirmacaoSenha ? 'As senhas não coincidem' : null;

    const handleCadastrar = async () => {
        // Verificação rigorosa baseada na imagem
        if (!nomeResponsavel || !nomeCrianca || !email || !confirmacaoEmail || !senha || !confirmacaoSenha || !dataTexto || !dieta) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }

        if (email !== confirmacaoEmail || senha !== confirmacaoSenha) {
            Alert.alert('Erro', 'As confirmações não coincidem.');
            return;
        }

        try {
            const resultadoAuth = await createUserWithEmailAndPassword(auth, email.trim(), senha);
            const uid = resultadoAuth.user.uid;

            await setDoc(doc(db, "usuarios", uid), {
                nomeResponsavel: nomeResponsavel,
                nomeCrianca: nomeCrianca,
                email: email.trim(),
                dataNascimento: dataTexto,
                dieta: dieta,
                dataCadastro: new Date().toISOString()
            });

            Alert.alert('Sucesso!', 'Cadastro realizado com sucesso!', [{ text: 'OK', onPress: onVoltarLogin }]);

        } catch (error: any) {
            Alert.alert('Erro no Cadastro', 'Verifique os dados ou se o e-mail já existe.');
        }
    };

    return (
        <ImageBackground source={fundoTijolos} style={styles.background} resizeMode="cover">
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
                <TouchableOpacity style={styles.closeButton} onPress={onVoltarLogin}>
                    <Feather name="x" size={26} color="#9e9e9e" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.titulo}>Vamos iniciar seu cadastro.{'\n'}É rapidinho!</Text>

                    <InputComAsterisco placeholder="Nome completo do responsável" value={nomeResponsavel} onChangeText={setNomeResponsavel} />
                    <InputComAsterisco placeholder="Nome completo da criança" value={nomeCrianca} onChangeText={setNomeCrianca} />
                    <InputComAsterisco placeholder="Email ou Nº de celular" value={email} onChangeText={setEmail} />
                    <InputComAsterisco placeholder="Confirmação Email ou Nº de celular" value={confirmacaoEmail} onChangeText={setConfirmacaoEmail} erro={erroEmail} />
                    <InputComAsterisco placeholder="Senha" value={senha} onChangeText={avaliarSenha} secureTextEntry />
                    <InputComAsterisco placeholder="Confirmação de senha" value={confirmacaoSenha} onChangeText={setConfirmacaoSenha} secureTextEntry erro={erroSenha} />

                    <View style={styles.dateContainer}>
                        <Text style={styles.labelSecundaria}>Data de nascimento da criança</Text>
                        <View style={styles.dateRowWrapper}>
                            <TouchableOpacity style={styles.dateRow} onPress={() => setMostrarCalendario(true)}>
                                <MaterialCommunityIcons name="calendar-blank-outline" size={28} color="#333" />
                                <View style={styles.dateInputFalso}>
                                    <Text style={dataTexto ? styles.textoDataSelecionada : styles.textoDataPlaceholder}>
                                        {dataTexto || "___  /  ___  /  _______"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <MaterialCommunityIcons name="chevron-double-down" size={30} color="#FFB6C1" />
                        </View>
                        {mostrarCalendario && <DateTimePicker value={dataNascimento} mode="date" display="default" onChange={aoMudarData} maximumDate={new Date()} />}
                    </View>

                    <View style={styles.radioContainer}>
                        <Text style={styles.labelSecundaria}>Assinale apenas um:</Text>
                        {opcoesDieta.map((opcao, index) => (
                            <TouchableOpacity key={index} style={styles.radioOption} onPress={() => setDieta(opcao)}>
                                <View style={[styles.radioCircle, dieta === opcao && styles.radioSelected]} />
                                <Text style={styles.radioText}>O responsável {opcao}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.botaoSubmit} onPress={handleCadastrar}>
                        <Text style={styles.textoBotao}>Cadastrar</Text>
                    </TouchableOpacity>
                </ScrollView>
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
        height: '88%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 10
    },
    closeButton: {
        position: 'absolute',
        top: 25,
        right: 25,
        zIndex: 10
    },
    content: {
        paddingHorizontal: 35,
        paddingTop: 30,
        paddingBottom: 60
    },
    titulo: {
        fontSize: 22,
        color: '#000',
        marginBottom: 30,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 26
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 15,
        justifyContent: 'center'
    },
    placeholderContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        bottom: 8,
        left: 0
    },
    placeholderText: {
        fontSize: 14,
        color: '#000'
    },
    asterisco: {
        fontSize: 14,
        color: '#ff3b3b',
        fontWeight: 'bold',
        marginLeft: 4
    },
    inputCustom: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingVertical: 5,
        fontSize: 14,
        color: '#000'
    },
    inputErro: {
        borderBottomColor: '#ff3b3b'
    },
    textoErro: {
        color: '#ff3b3b',
        fontSize: 11,
        marginTop: 2
    },
    dateContainer: {
        width: '100%',
        marginTop: 25,
        marginBottom: 25
    },
    labelSecundaria: {
        color: '#000',
        marginBottom: 10,
        fontSize: 14,
        fontWeight: '400'
    },
    dateRowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '85%'
    },
    dateInputFalso: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginLeft: 10,
        paddingBottom: 5,
        alignItems: 'center'
    },
    textoDataPlaceholder: {
        fontSize: 14,
        color: '#9e9e9e',
        letterSpacing: 1
    },
    textoDataSelecionada: {
        fontSize: 14,
        color: '#000',
        letterSpacing: 1
    },
    radioContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 35
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    radioCircle: {
        height: 18,
        width: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: '#FFB6C1',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    radioSelected: {
        backgroundColor: '#FFB6C1'
    },
    radioText: {
        color: '#000',
        fontSize: 14
    },
    botaoSubmit: {
        backgroundColor: '#FFCACA',
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
        borderRadius: 30,
        alignSelf: 'center'
    },
    textoBotao: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500'
    }
});