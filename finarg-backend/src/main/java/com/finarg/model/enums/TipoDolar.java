package com.finarg.model.enums;

public enum TipoDolar {
    OFICIAL("oficial", "Oficial"),
    BLUE("blue", "Blue"),
    BOLSA("bolsa", "MEP/Bolsa"),
    CCL("contadoconliqui", "Contado con Liqui"),
    TARJETA("tarjeta", "Tarjeta"),
    MAYORISTA("mayorista", "Mayorista"),
    CRIPTO("cripto", "Cripto");

    private final String codigo;
    private final String nombre;

    TipoDolar(String codigo, String nombre) {
        this.codigo = codigo;
        this.nombre = nombre;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public static TipoDolar fromCodigo(String codigo) {
        for (TipoDolar tipo : values()) {
            if (tipo.codigo.equalsIgnoreCase(codigo)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de dolar no encontrado: " + codigo);
    }
}
