export interface Plano {
  ID_Plano: string;
  Nome: string;
  Descricao?: string;
  Preco: number;
  DuracaoMeses: number;
}

export interface CreatePlano {
  Nome: string;
  Descricao?: string;
  Preco: number;
  DuracaoMeses: number;
}

export interface Assinatura {
  ID_Assinatura: string;
  ID_Usuario: string;
  ID_Plano: string;
  DataInicio: string; // ISO string: "2026-06-05T10:00:00.000Z"
  DataFim: string;
}

export interface CreateAssinatura {
  ID_Usuario: string;
  ID_Plano: string;
  DataInicio: string;
  DataFim: string;
}

export interface Pagamento {
  ID_Pagamento: string;
  ID_Assinatura: string;
  ValorPago: number;
  DataPagamento: string; // ISO string: "2026-06-05T10:00:00.000Z"
  MetodoPagamento: string;
  Id_Transacao_Gateway: string;
  DataFim: string;
}

export interface CreatePagamento {
  ID_Assinatura: string;
  ValorPago: number;
  DataPagamento: string;
  MetodoPagamento: string;
  Id_Transacao_Gateway: string;
  DataFim: string;
}
