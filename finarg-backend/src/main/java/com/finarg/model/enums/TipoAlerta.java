package com.finarg.model.enums;

public enum TipoAlerta {
    ARBITRAJE("Oportunidad de arbitraje detectada"),
    BRECHA("Cambio significativo en la brecha cambiaria"),
    COTIZACION("Cotizacion alcanza valor configurado"),
    RESERVAS("Cambio en reservas del BCRA");

    private final String descripcion;

    TipoAlerta(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
