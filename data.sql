INSERT INTO products (name, category, price, description, barcode, stock_quantity)
VALUES
    ('Milk', 'Dairy', 2.99, 'Fresh whole milk', '123456789012', 100),
    ('Bread', 'Bakery', 1.99, 'Whole wheat bread', '234567890123', 150),
    ('Eggs', 'Dairy', 3.49, 'Large brown eggs', '345678901234', 120),
    ('Apples', 'Produce', 0.79, 'Red delicious apples', '456789012345', 200),
    ('Chicken', 'Meat', 5.99, 'Boneless skinless chicken breast', '567890123456', 80),
    ('Rice', 'Pantry', 4.49, 'Long grain white rice', '678901234567', 100),
    ('Toothpaste', 'Personal Care', 2.49, 'Fluoride toothpaste', '789012345678', 90);


INSERT INTO customers (first_name, last_name, email, phone, address)
VALUES
    ('John', 'Doe', 'john.doe@example.com', '123-456-7890', '123 Main St, Anytown, USA'),
    ('Jane', 'Smith', 'jane.smith@example.com', '987-654-3210', '456 Oak Ave, Sometown, USA'),
    ('Michael', 'Johnson', 'michael.johnson@example.com', '555-123-4567', '789 Elm Rd, Othertown, USA'),
    ('Sarah', 'Williams', 'sarah.williams@example.com', '777-888-9999', '321 Pine Ln, Anycity, USA');


-- Assuming `customer_id` refers to existing customers in the `customers` table
INSERT INTO sales (customer_id, sale_date, total_amount)
VALUES
    (1, '2024-06-20 10:15:00', 25.97),
    (2, '2024-06-20 11:30:00', 18.45),
    (3, '2024-06-21 09:45:00', 10.87),
    (1, '2024-06-21 14:00:00', 32.50);


-- Assuming `sale_id` refers to existing sales in the `sales` table and `product_id` refers to existing products in the `products` table
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
VALUES
    (1, 1, 2, 2.99, 5.98),
    (1, 2, 3, 1.99, 5.97),
    (2, 3, 1, 3.49, 3.49),
    (3, 4, 3, 0.79, 2.37),
    (4, 5, 2, 5.99, 11.98),
    (4, 6, 1, 4.49, 4.49);


-- Assuming `sale_id` refers to existing sales in the `sales` table
INSERT INTO transactions (transaction_type, sale_id, transaction_date, amount)
VALUES
    ('sale', 1, '2024-06-20 10:15:00', 25.97),
    ('sale', 2, '2024-06-20 11:30:00', 18.45),
    ('sale', 3, '2024-06-21 09:45:00', 10.87),
    ('sale', 4, '2024-06-21 14:00:00', 32.50);


-- Assuming `product_id` refers to existing products in the `products` table
INSERT INTO inventory (product_id, stock_quantity)
VALUES
    (1, 100),
    (2, 150),
    (3, 120),
    (4, 200),
    (5, 80),
    (6, 100),
    (7, 90);