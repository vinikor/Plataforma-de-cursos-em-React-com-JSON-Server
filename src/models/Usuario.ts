
export interface Usuario {
  id: string;
  NomeCompleto: string;
  Email: string;
  SenhaHash: string;
  DataCadastro: string;    // ISO string: "2026-06-05T10:00:00.000Z"
  isInstrutor: boolean;
}

