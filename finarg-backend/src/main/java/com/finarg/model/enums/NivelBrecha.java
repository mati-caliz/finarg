package com.finarg.model.enums;

public enum NivelBrecha {
    BAJA("baja", 0, 20),
    MEDIA("media", 20, 40),
    ALTA("alta", 40, 100);

    private final String nombre;
    private final double minimo;
    private final double maximo;

    NivelBrecha(String nombre, double minimo, double maximo) {
        this.nombre = nombre;
        this.minimo = minimo;
        this.maximo = maximo;
    }

    public String getNombre() {
        return nombre;
    }

    public double getMinimo() {
        return minimo;
    }

    public double getMaximo() {
        return maximo;
    }

    public static NivelBrecha fromPorcentaje(double porcentaje) {
        if (porcentaje < 20) {
            return BAJA;
        } else if (porcentaje < 40) {
            return MEDIA;
        } else {
            return ALTA;
        }
    }
}
