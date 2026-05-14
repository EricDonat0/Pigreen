import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    label: string;
    value: string;
    onPress: () => void;
}

export const DatePickerField = ({ label, value, onPress }: Props) => (
    <View style={styles.dateContainer}>
        <Text style={styles.labelSecundaria}>{label}</Text>
        <View style={styles.dateRowWrapper}>
            <TouchableOpacity style={styles.dateRow} onPress={onPress}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={30} color="#333" />
                <View style={styles.dateInputFalso}>
                    <Text style={value ? styles.textoDataSelecionada : styles.textoDataPlaceholder}>
                        {value || "___  /  ___  /  _______"}
                    </Text>
                </View>
            </TouchableOpacity>
            <MaterialCommunityIcons name="chevron-double-down" size={32} color="#FFB6C1" />
        </View>
    </View>
);

const styles = StyleSheet.create({
    dateContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 35,
        alignItems: 'center'
    },
    labelSecundaria: {
        color: '#000',
        marginBottom: 12,
        fontSize: 14,
        alignSelf: 'flex-start'
    },
    dateRowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%'
    },
    dateInputFalso: {
        flex: 1,
        borderBottomWidth: 1.2,
        borderBottomColor: '#000',
        marginLeft: 12,
        paddingBottom: 5,
        alignItems: 'center'
    },
    textoDataPlaceholder: {
        fontSize: 14,
        color: '#000',
        letterSpacing: 2
    },
    textoDataSelecionada: {
        fontSize: 15,
        color: '#000',
        letterSpacing: 2
    },
});