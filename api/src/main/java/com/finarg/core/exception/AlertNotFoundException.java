package com.finarg.core.exception;

public class AlertNotFoundException extends RuntimeException {

    public AlertNotFoundException() {
        super("Alerta no encontrada");
    }
}
