import { api } from './api';

import type { Matricula } from '../models/matricula';

export const getMatriculas = async (): Promise<Matricula[]> => {
    try {
        const response = await api.get<Matricula[]>('/matriculas');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar matrículas:', error);
        throw error;
    }
};

export const createMatricula = async (matricula: Matricula): Promise<void> => {
    try {
        await api.post('/matriculas', matricula);
    } catch (error) {
        console.error('Erro ao criar matrícula:', error);
        throw error;
    }
};



