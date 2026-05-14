import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ImageBackground, Animated, Dimensions, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importando nossos novos componentes
import { CustomInput } from '../components/CustomInput';
import { DatePickerField } from '../components/DatePickerField';

const fundoTijolos = require('../../assets/fundo_tijolos.png');
const { height } = Dimensions.get('window');

export default function Cadastro({ onVoltarLogin }: any) {
    const [nomeResponsavel, setNomeResponsavel] = useState('');
    const [nomeCrianca, setNomeCrianca] = useState('');
    const [emailCelular, setEmailCelular] = useState('');
    const [confirmacaoEmail, setConfirmacaoEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
    const [forcaSenha, setForcaSenha] = useState<{ label: string, cor: string } | null>(null);
    const [dataNascimento, setDataNascimento] = useState(new Date());
    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [dataTexto, setDataTexto] = useState('');
    const [dieta, setDieta] = useState<string | null>(null);

    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();
    }, []);

    // Lógica de avaliação de senha (mantida aqui porque é lógica de negócio)
    const avaliarSenha = (texto: string) => {
        setSenha(texto);
        if (texto.length === 0) { setForcaSenha(null); return; }
        if (texto.length < 6) setForcaSenha({ label: 'Fraca', cor: '#ff3b3b' });
        else if (texto.match(/[a-z]/) && texto.match(/[A-Z]/) && texto.match(/[0-9]/)) setForcaSenha({ label: 'Forte', cor: '#32CD32' });
        else setForcaSenha({ label: 'Média', cor: '#FFA500' });
    };

    const handleCadastrar = async () => {
        if (!nomeResponsavel || !nomeCrianca || !emailCelular || !senha || !dataTexto || !dieta) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }
        // ... lógica de salvar no AsyncStorage ou API ...
        Alert.alert('Sucesso', 'Cadastro salvo!');
        onVoltarLogin();
    };

    return (
        <ImageBackground source={fundoTijolos} style={styles.background} resizeMode="cover">
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
                <TouchableOpacity style={styles.closeButton} onPress={onVoltarLogin}>
                    <Feather name="x" size={26} color="#9e9e9e" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.titulo}>Vamos iniciar seu cadastro.</Text>

                    <CustomInput placeholder="Nome do Responsável" value={nomeResponsavel} onChangeText={setNomeResponsavel} />
                    <CustomInput placeholder="Nome da Criança" value={nomeCrianca} onChangeText={setNomeCrianca} />
                    <CustomInput placeholder="Email ou Celular" value={emailCelular} onChangeText={setEmailCelular} />
                    <CustomInput placeholder="Confirme o Email" value={confirmacaoEmail} onChangeText={setConfirmacaoEmail} erro={confirmacaoEmail && emailCelular !== confirmacaoEmail ? 'Divergente' : null} />

                    <CustomInput placeholder="Senha" value={senha} onChangeText={avaliarSenha} secureTextEntry />
                    {forcaSenha && <Text style={{ color: forcaSenha.cor, alignSelf: 'flex-start', marginBottom: 10 }}>{forcaSenha.label}</Text>}

                    <CustomInput placeholder="Confirme a Senha" value={confirmacaoSenha} onChangeText={setConfirmacaoSenha} secureTextEntry erro={confirmacaoSenha && senha !== confirmacaoSenha ? 'Divergente' : null} />

                    <DatePickerField label="Data de nascimento" value={dataTexto} onPress={() => setMostrarCalendario(true)} />

                    {mostrarCalendario && (
                        <DateTimePicker value={dataNascimento} mode="date" display="default"
                            onChange={(e, d) => {
                                setMostrarCalendario(false);
                                if (d) setDataTexto(`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`);
                            }} />
                    )}

                    {/* Botão de Enviar */}
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
        height: '85%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 15
    },
    closeButton: {
        position: 'absolute',
        top: 25,
        right: 25,
        zIndex: 10
    },
    content: {
        paddingHorizontal: 35,
        paddingTop: 40,
        paddingBottom: 50,
        alignItems: 'center'
    },
    titulo: {
        fontSize: 22,
        color: '#000',
        marginBottom: 35,
        textAlign: 'center',
        fontWeight: '500'
    },
    botaoSubmit: {
        backgroundColor: '#FFCACA',
        paddingVertical: 15,
        width: '80%',
        alignItems: 'center',
        borderRadius: 35
    },
    textoBotao: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500'
    }
});