export interface Cotizacion {
  tipo: string;
  nombre: string;
  compra: number;
  venta: number;
  spread: number;
  variacion: number;
  fechaActualizacion: string;
}

export interface Brecha {
  dolarOficial: number;
  dolarBlue: number;
  porcentajeBrecha: number;
  nivel: 'BAJA' | 'MEDIA' | 'ALTA';
  colorSemaforo: string;
  descripcion: string;
}

export interface Inflacion {
  fecha: string;
  valor: number;
  interanual?: number;
  acumuladoAnio?: number;
}

export interface AjusteInflacion {
  montoOriginal: number;
  montoAjustado: number;
  fechaOrigen: string;
  fechaDestino: string;
  inflacionAcumulada: number;
  mesesTranscurridos: number;
}

export interface Reservas {
  reservasBrutas: number;
  reservasNetas: number;
  swapChina: number;
  encajesBancarios: number;
  depositosGobierno: number;
  fecha: string;
  variacionDiaria: number;
  tendencia: string;
}

export interface GananciasRequest {
  sueldoBrutoMensual: number;
  tipoEmpleado: 'RELACION_DEPENDENCIA' | 'AUTONOMO';
  obraSocial?: number;
  jubilacion?: number;
  sindicato?: number;
  tieneConyuge: boolean;
  cantidadHijos: number;
  alquilerVivienda?: number;
  servicioDomestico?: number;
  gastosEducativos?: number;
}

export interface GananciasResponse {
  sueldoBrutoAnual: number;
  totalDeducciones: number;
  gananciaNetaSujetaAImpuesto: number;
  impuestoAnual: number;
  impuestoMensual: number;
  alicuotaEfectiva: number;
  sueldoNetoMensual: number;
  detalleCalculo: {
    minimoNoImponible: number;
    deduccionEspecial: number;
    cargasFamilia: number;
    deduccionesPersonales: number;
    totalDeduccionesPermitidas: number;
  };
  desglosePorTramo: {
    tramo: number;
    desde: number;
    hasta: number;
    alicuota: number;
    baseImponible: number;
    impuestoTramo: number;
  }[];
}

export interface Arbitraje {
  tipoOrigen: string;
  tipoDestino: string;
  cotizacionOrigen: number;
  cotizacionDestino: number;
  spreadPorcentaje: number;
  gananciaEstimadaPor1000USD: number;
  descripcion: string;
  pasos: string;
  viable: boolean;
  riesgo: string;
}

export interface SimulacionRequest {
  montoInicial: number;
  tipoInversion: string;
  plazoDias: number;
  reinvertir?: boolean;
  tasaPersonalizada?: number;
}

export interface SimulacionResponse {
  tipoInversion: string;
  montoInicial: number;
  plazoDias: number;
  tasaTNA: number;
  tasaTEA: number;
  rendimientoNominal: number;
  rendimientoReal: number;
  montoFinal: number;
  gananciaARS: number;
  gananciaUSD: number;
  rendimientoEnDolares: number;
  proyeccion: {
    mes: number;
    capitalAcumulado: number;
    interesesMes: number;
    inflacionEstimada: number;
    rendimientoReal: number;
  }[];
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  emailVerificado: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
