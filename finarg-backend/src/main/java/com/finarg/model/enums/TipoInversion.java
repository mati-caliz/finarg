package com.finarg.model.enums;

public enum TipoInversion {
    PLAZO_FIJO("Plazo Fijo Tradicional"),
    PLAZO_FIJO_UVA("Plazo Fijo UVA"),
    FCI_MONEY_MARKET("FCI Money Market"),
    FCI_RENTA_FIJA("FCI Renta Fija"),
    CAUCION("Caucion Bursatil"),
    STABLECOIN_DAI("Stablecoin DAI"),
    STABLECOIN_USDT("Stablecoin USDT");

    private final String descripcion;

    TipoInversion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
