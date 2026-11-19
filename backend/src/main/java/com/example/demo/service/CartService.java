package com.example.demo.service;

import com.example.demo.model.Cart;
import com.example.demo.model.CartItem;
import com.example.demo.model.Product;
import com.example.demo.repository.CartRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductService productService;

    public CartService(
            CartRepository cartRepository,
            ProductService productService) {

        this.cartRepository = cartRepository;
        this.productService = productService;
    }

    public Cart addToCart(String customerId, String productId, int quantity) {

        if (quantity <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero"
            );
        }

        Product product = productService.getProductById(productId);

        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> new Cart(
                        null,
                        customerId,
                        new ArrayList<>()
                ));

        CartItem existingItem = cart.getItems()
                .stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {

            int totalQuantity = existingItem.getQuantity() + quantity;

            if (totalQuantity > product.getStock()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock available"
                );
            }

            existingItem.setQuantity(totalQuantity);

        } else {

            if (quantity > product.getStock()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock available"
                );
            }

            cart.getItems().add(new CartItem(productId, quantity));
        }

        return cartRepository.save(cart);
    }

    public Cart getCart(String customerId) {

        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> new Cart(
                        null,
                        customerId,
                        new ArrayList<>()
                ));
    }

    public Cart updateCartItem(
            String customerId,
            String productId,
            int quantity) {

        if (quantity <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero"
            );
        }

        Product product = productService.getProductById(productId);

        if (quantity > product.getStock()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock available"
            );
        }

        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cart not found"
                ));

        CartItem item = cart.getItems()
                .stream()
                .filter(cartItem -> cartItem.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found in cart"
                ));

        item.setQuantity(quantity);

        return cartRepository.save(cart);
    }

    public Cart removeFromCart(String customerId, String productId) {

        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cart not found"
                ));

        boolean removed = cart.getItems()
                .removeIf(item -> item.getProductId().equals(productId));

        if (!removed) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found in cart"
            );
        }

        return cartRepository.save(cart);
    }

    public void clearCart(String customerId) {

        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cart not found"
                ));

        cart.getItems().clear();

        cartRepository.save(cart);
    }

    public double getCartTotal(String customerId) {

        Cart cart = getCart(customerId);

        double total = 0;

        for (CartItem item : cart.getItems()) {

            Product product = productService.getProductById(
                    item.getProductId()
            );

            total += product.getPrice() * item.getQuantity();
        }

        return total;
    }
}