package com.finarg.core.exception;

public class EmailAlreadyRegisteredException extends RuntimeException {

    public EmailAlreadyRegisteredException() {
        super("Este email ya está registrado. Si tenés cuenta, iniciá sesión.");
    }
}
