package com.example.demo.service;

import com.example.demo.model.Cart;
import com.example.demo.model.CartItem;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.Product;
import com.example.demo.repository.OrderRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductService productService;

    public OrderService(
            OrderRepository orderRepository,
            CartService cartService,
            ProductService productService) {

        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.productService = productService;
    }

    public Order checkout(String customerId) {

        Cart cart = cartService.getCart(customerId);
        List<CartItem> cartItems = cart.getItems();

        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cart is empty"
            );
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0;

        // First loop: Validate stock and prepare order items
        for (CartItem cartItem : cartItems) {

            Product product = productService.getProductById(
                    cartItem.getProductId()
            );

            if (cartItem.getQuantity() > product.getStock()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getName()
                );
            }

            OrderItem orderItem = new OrderItem(
                    product.getId(),
                    product.getName(),
                    product.getPrice(),
                    cartItem.getQuantity()
            );

            orderItems.add(orderItem);

            totalAmount += product.getPrice() * cartItem.getQuantity();
        }

        // Second loop: Reduce product stock
        for (CartItem cartItem : cartItems) {

            productService.purchaseProduct(
                    cartItem.getProductId(),
                    cartItem.getQuantity()
            );
        }

        // Create order
        Order order = new Order();

        order.setCustomerId(customerId);
        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Clear only this customer's cart
        cartService.clearCart(customerId);

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(String id) {

        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found " + id
                ));
    }


    public Order updateOrderStatus(String id, String status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found " + id
                ));

        if (order.getStatus().equals("CANCELLED")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cancelled order status cannot be updated"
            );
        }

        if (order.getStatus().equals("DELIVERED")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Delivered order status cannot be updated"
            );
        }

        if (!status.equals("PLACED") &&
                !status.equals("SHIPPED") &&
                !status.equals("DELIVERED")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order status"
            );
        }

        if (order.getStatus().equals("PLACED") &&
                !status.equals("SHIPPED")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "PLACED order can only be changed to SHIPPED"
            );
        }

        if (order.getStatus().equals("SHIPPED") &&
                !status.equals("DELIVERED")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "SHIPPED order can only be changed to DELIVERED"
            );
        }

        order.setStatus(status);

        return orderRepository.save(order);
    }

    public List<Order> getMyOrders(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public Order getMyOrderById(String customerId, String orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"
                ));

        if (!order.getCustomerId().equals(customerId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this order"
            );
        }
        return order;
    }

    public String cancelMyOrder(String customerId, String orderId) {

        Order order = getMyOrderById(customerId, orderId);

        if (!order.getStatus().equals("PLACED")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only placed orders can be cancelled"
            );
        }

        for (OrderItem item : order.getItems()) {
            productService.updateStocksByProductId(
                    item.getProductId(),
                    item.getQuantity()
            );
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        return "Order cancelled successfully";
    }
}