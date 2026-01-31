package com.finarg.exception;

public class EmailAlreadyRegisteredException extends RuntimeException {

    public EmailAlreadyRegisteredException() {
        super("Este email ya está registrado. Si tenés cuenta, iniciá sesión.");
    }
}
