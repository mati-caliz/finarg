package com.finarg.exception;

public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException() {
        super("Token inválido");
    }
}
