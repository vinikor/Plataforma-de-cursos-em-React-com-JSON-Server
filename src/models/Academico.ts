
export interface Categorias {
    id: string;
    Nome: string;
    Descricao: string;
}

export interface CreateCategoria {
    Nome: string;
    Descricao: string;
}

export interface CreateCurso {
    Titulo: string;
    Descricao: string;
    idInstrutor: string;
    idCategoria: string;
    Nivel: string;
    DataPublicacao: string;
    TotalAulas: number;
    TotalHoras: number;
}

export interface Cursos {
    id: string;
    Titulo: string;
    Descricao: string;
    idInstrutor: string;
    idCategoria: string;
    Nivel: string;
    DataPublicacao: string;
    TotalAulas: number;
    TotalHoras: number;
}

export interface CreateCurso {
    Titulo: string;
    Descricao: string;
    idInstrutor: string;
    idCategoria: string;
    Nivel: string;
    DataPublicacao: string;
    TotalAulas: number;
    TotalHoras: number;
}

export interface Modulos {
    id: string;
    idCurso: string;
    Titulo: string;
    Ordem: number;
}

export interface CreateModulo {
    idCurso: string;
    Titulo: string;
    Ordem: number;
}

export interface Aulas {
    id: string;
    idModulo: string;
    titulo: string;
    TipoConteudo: string;
    UrlConteudo: string;
    Duracao: number;
    Ordem: number;
}

export interface CreateAula {
    idModulo: string;
    titulo: string;
    TipoConteudo: string;
    UrlConteudo: string;
    Duracao: number;
    Ordem: number;
}

export interface Progresso_aula {
    idUsuario: string;
    IdAula: string;
    DataConclusao: string;
    Status: 'concluida' | 'em andamento' | 'nao iniciada';
}
    


export interface Trilhas {
    id: string;
    Titulo: string;
    Descricao: string;
    idCategoria: string;
}

export interface TrilhasCursos {
    id: string;
    idTrilha: string;
    idCurso: string;
    Ordem: number;
}

export interface CreateTrilha {
    Titulo: string;
    Descricao: string;
    idCategoria: string;
}

export interface CreateTrilhaCurso {
    idTrilha: string;
    idCurso: string;
    Ordem: number;
}