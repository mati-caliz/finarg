package com.finarg.exception;

public class AlertNotFoundException extends RuntimeException {

    public AlertNotFoundException() {
        super("Alerta no encontrada");
    }
}
