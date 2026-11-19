package com.example.demo.dto;

import jakarta.validation.constraints.Positive;

public class PurchaseRequestDTO {

    @Positive(message = "Quantity must be greater than zero")
    private int quantity;


    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

}
