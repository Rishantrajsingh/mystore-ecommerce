package com.example.demo.controller;


import com.example.demo.model.Cart;
import com.example.demo.model.CartItem;
import com.example.demo.service.CartService;
import com.example.demo.model.Customer;
import com.example.demo.repository.CustomerRepository;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;
    private final CustomerRepository customerRepository;

    public CartController(
            CartService cartService,
            CustomerRepository customerRepository) {

        this.cartService = cartService;
        this.customerRepository = customerRepository;
    }

    private String getCustomerId(Authentication authentication) {

        Customer customer = customerRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"
                ));

        return customer.getId();
    }

    @PostMapping("/add")
    public Cart addToCart(
            Authentication authentication,
            @RequestBody CartItem cartItem) {

        String customerId = getCustomerId(authentication);

        return cartService.addToCart(
                customerId,
                cartItem.getProductId(),
                cartItem.getQuantity()
        );
    }

    @GetMapping
    public Cart getCart(Authentication authentication) {

        String customerId = getCustomerId(authentication);

        return cartService.getCart(customerId);
    }


    @PutMapping("/{productId}")
    public Cart updateCartItem(
            Authentication authentication,
            @PathVariable String productId,
            @RequestParam int quantity) {

        String customerId = getCustomerId(authentication);

        return cartService.updateCartItem(
                customerId,
                productId,
                quantity
        );
    }

    @DeleteMapping("/{productId}")
    public Cart removeFromCart(
            Authentication authentication,
            @PathVariable String productId) {

        String customerId = getCustomerId(authentication);

        return cartService.removeFromCart(customerId, productId);
    }

    @DeleteMapping("/clear")
    public String clearCart(Authentication authentication) {

        String customerId = getCustomerId(authentication);

        cartService.clearCart(customerId);

        return "Cart cleared successfully";
    }

    @GetMapping("/total")
    public double getCartTotal(Authentication authentication) {

        String customerId = getCustomerId(authentication);

        return cartService.getCartTotal(customerId);
    }
}