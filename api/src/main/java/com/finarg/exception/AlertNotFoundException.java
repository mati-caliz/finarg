package com.finarg.exception;

public class AlertNotFoundException extends RuntimeException {

    public AlertNotFoundException(String message) {
        super(message);
    }

    public AlertNotFoundException() {
        super("Alerta no encontrada");
    }
}
