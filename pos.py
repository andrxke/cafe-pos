#!/usr/bin/env python3
"""
Cafe POS System
A simple point-of-sale system for managing orders, transactions, and customer credits.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional


class DataStore:
    """Handles data persistence using JSON files."""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.items_file = os.path.join(data_dir, "items.json")
        self.customers_file = os.path.join(data_dir, "customers.json")
        self.transactions_file = os.path.join(data_dir, "transactions.json")
        self._ensure_data_dir()
    
    def _ensure_data_dir(self):
        """Create data directory if it doesn't exist."""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def load_items(self) -> Dict:
        """Load items from JSON file."""
        if os.path.exists(self.items_file):
            with open(self.items_file, 'r') as f:
                return json.load(f)
        return {}
    
    def save_items(self, items: Dict):
        """Save items to JSON file."""
        with open(self.items_file, 'w') as f:
            json.dump(items, f, indent=2)
    
    def load_customers(self) -> Dict:
        """Load customers from JSON file."""
        if os.path.exists(self.customers_file):
            with open(self.customers_file, 'r') as f:
                return json.load(f)
        return {}
    
    def save_customers(self, customers: Dict):
        """Save customers to JSON file."""
        with open(self.customers_file, 'w') as f:
            json.dump(customers, f, indent=2)
    
    def load_transactions(self) -> List:
        """Load transactions from JSON file."""
        if os.path.exists(self.transactions_file):
            with open(self.transactions_file, 'r') as f:
                return json.load(f)
        return []
    
    def save_transactions(self, transactions: List):
        """Save transactions to JSON file."""
        with open(self.transactions_file, 'w') as f:
            json.dump(transactions, f, indent=2)


class Item:
    """Represents a menu item."""
    
    def __init__(self, name: str, price: float):
        self.name = name
        self.price = price
    
    def to_dict(self) -> Dict:
        return {"name": self.name, "price": self.price}
    
    @staticmethod
    def from_dict(data: Dict) -> 'Item':
        return Item(data["name"], data["price"])


class Customer:
    """Represents a customer with credit balance."""
    
    def __init__(self, name: str, credit: float = 0.0):
        self.name = name
        self.credit = credit
    
    def add_credit(self, amount: float):
        """Add credit to customer's account."""
        self.credit += amount
    
    def deduct_credit(self, amount: float) -> bool:
        """Deduct credit from customer's account. Returns True if successful."""
        if self.credit >= amount:
            self.credit -= amount
            return True
        return False
    
    def to_dict(self) -> Dict:
        return {"name": self.name, "credit": self.credit}
    
    @staticmethod
    def from_dict(data: Dict) -> 'Customer':
        return Customer(data["name"], data["credit"])


class Transaction:
    """Represents a transaction."""
    
    def __init__(self, items: List[str], total: float, payment_type: str, 
                 customer_name: Optional[str] = None, change: float = 0.0):
        self.timestamp = datetime.now().isoformat()
        self.items = items
        self.total = total
        self.payment_type = payment_type  # "cash" or "credit"
        self.customer_name = customer_name
        self.change = change
    
    def to_dict(self) -> Dict:
        return {
            "timestamp": self.timestamp,
            "items": self.items,
            "total": self.total,
            "payment_type": self.payment_type,
            "customer_name": self.customer_name,
            "change": self.change
        }


class POSSystem:
    """Main POS system class."""
    
    def __init__(self):
        self.store = DataStore()
        self.items = self.store.load_items()
        self.customers = self.store.load_customers()
        self.transactions = self.store.load_transactions()
    
    def add_item(self, name: str, price: float):
        """Add a new item to the menu."""
        if name in self.items:
            print(f"Item '{name}' already exists. Updating price.")
        self.items[name] = {"name": name, "price": price}
        self.store.save_items(self.items)
        print(f"Item '{name}' added/updated with price ${price:.2f}")
    
    def list_items(self):
        """Display all menu items."""
        if not self.items:
            print("No items in the menu.")
            return
        
        print("\n=== MENU ===")
        for name, item_data in sorted(self.items.items()):
            print(f"  {name}: ${item_data['price']:.2f}")
        print()
    
    def get_or_create_customer(self, name: str) -> Customer:
        """Get existing customer or create new one."""
        if name in self.customers:
            return Customer.from_dict(self.customers[name])
        return Customer(name)
    
    def save_customer(self, customer: Customer):
        """Save customer data."""
        self.customers[customer.name] = customer.to_dict()
        self.store.save_customers(self.customers)
    
    def list_customers(self):
        """Display all customers and their credits."""
        if not self.customers:
            print("No customers in the system.")
            return
        
        print("\n=== CUSTOMERS ===")
        for name, customer_data in sorted(self.customers.items()):
            print(f"  {name}: ${customer_data['credit']:.2f} credit")
        print()
    
    def create_order(self):
        """Create a new order."""
        if not self.items:
            print("Cannot create order: No items in the menu. Add items first.")
            return
        
        print("\n=== NEW ORDER ===")
        order_items = []
        total = 0.0
        
        while True:
            self.list_items()
            item_name = input("Enter item name (or 'done' to finish): ").strip()
            
            if item_name.lower() == 'done':
                break
            
            if item_name not in self.items:
                print(f"Item '{item_name}' not found. Please try again.")
                continue
            
            order_items.append(item_name)
            total += self.items[item_name]['price']
            print(f"Added {item_name} (${self.items[item_name]['price']:.2f}). Current total: ${total:.2f}")
        
        if not order_items:
            print("No items ordered. Order cancelled.")
            return
        
        print(f"\n=== ORDER SUMMARY ===")
        for item in order_items:
            print(f"  {item}: ${self.items[item]['price']:.2f}")
        print(f"Total: ${total:.2f}\n")
        
        self.process_payment(order_items, total)
    
    def process_payment(self, order_items: List[str], total: float):
        """Process payment for an order."""
        print("Payment Options:")
        print("1. Cash")
        print("2. Credit (customer account)")
        
        choice = input("Select payment method (1 or 2): ").strip()
        
        if choice == '1':
            self.process_cash_payment(order_items, total)
        elif choice == '2':
            self.process_credit_payment(order_items, total)
        else:
            print("Invalid choice. Payment cancelled.")
    
    def process_cash_payment(self, order_items: List[str], total: float):
        """Process cash payment."""
        while True:
            try:
                amount_paid = float(input(f"Enter cash amount received: $"))
                if amount_paid < total:
                    print(f"Insufficient payment. Need ${total:.2f}, received ${amount_paid:.2f}")
                    continue
                break
            except ValueError:
                print("Invalid amount. Please enter a number.")
        
        change = amount_paid - total
        
        # Check if customer wants to add change to credit
        if change > 0:
            print(f"Change: ${change:.2f}")
            add_to_credit = input("Add change to customer credit? (y/n): ").strip().lower()
            if add_to_credit == 'y':
                customer_name = input("Enter customer name: ").strip()
                customer = self.get_or_create_customer(customer_name)
                customer.add_credit(change)
                self.save_customer(customer)
                print(f"${change:.2f} added to {customer_name}'s credit. New balance: ${customer.credit:.2f}")
                
                # Record transaction with customer
                transaction = Transaction(order_items, total, "cash", customer_name, change)
                self.transactions.append(transaction.to_dict())
                self.store.save_transactions(self.transactions)
                print("Transaction completed!")
                return
        
        # Record regular cash transaction
        transaction = Transaction(order_items, total, "cash", None, change)
        self.transactions.append(transaction.to_dict())
        self.store.save_transactions(self.transactions)
        print("Transaction completed!")
    
    def process_credit_payment(self, order_items: List[str], total: float):
        """Process credit payment from customer account."""
        customer_name = input("Enter customer name: ").strip()
        customer = self.get_or_create_customer(customer_name)
        
        print(f"{customer_name}'s current credit: ${customer.credit:.2f}")
        
        if customer.deduct_credit(total):
            self.save_customer(customer)
            transaction = Transaction(order_items, total, "credit", customer_name)
            self.transactions.append(transaction.to_dict())
            self.store.save_transactions(self.transactions)
            print(f"Payment successful! Remaining credit: ${customer.credit:.2f}")
            print("Transaction completed!")
        else:
            print(f"Insufficient credit. Need ${total:.2f}, have ${customer.credit:.2f}")
            print("Would you like to:")
            print("1. Pay the difference in cash")
            print("2. Cancel transaction")
            choice = input("Select option (1 or 2): ").strip()
            
            if choice == '1':
                difference = total - customer.credit
                print(f"Amount due: ${difference:.2f}")
                try:
                    amount_paid = float(input(f"Enter cash amount: $"))
                    if amount_paid >= difference:
                        # Use all credit and pay difference in cash
                        customer.credit = 0
                        self.save_customer(customer)
                        
                        cash_change = amount_paid - difference
                        if cash_change > 0:
                            print(f"Change: ${cash_change:.2f}")
                        
                        transaction = Transaction(order_items, total, "mixed", customer_name, cash_change)
                        self.transactions.append(transaction.to_dict())
                        self.store.save_transactions(self.transactions)
                        print("Transaction completed!")
                    else:
                        print("Insufficient payment. Transaction cancelled.")
                except ValueError:
                    print("Invalid amount. Transaction cancelled.")
            else:
                print("Transaction cancelled.")


def main():
    """Main application loop."""
    pos = POSSystem()
    
    print("=" * 50)
    print("    CAFE POS SYSTEM")
    print("=" * 50)
    
    while True:
        print("\n=== MAIN MENU ===")
        print("1. Create Order")
        print("2. Add Item to Menu")
        print("3. View Menu")
        print("4. View Customers")
        print("5. Exit")
        
        choice = input("\nSelect option (1-5): ").strip()
        
        if choice == '1':
            pos.create_order()
        elif choice == '2':
            name = input("Enter item name: ").strip()
            if not name:
                print("Item name cannot be empty.")
                continue
            try:
                price = float(input("Enter item price: $"))
                if price < 0:
                    print("Price cannot be negative.")
                    continue
                pos.add_item(name, price)
            except ValueError:
                print("Invalid price. Please enter a number.")
        elif choice == '3':
            pos.list_items()
        elif choice == '4':
            pos.list_customers()
        elif choice == '5':
            print("Thank you for using Cafe POS System!")
            break
        else:
            print("Invalid option. Please try again.")


if __name__ == "__main__":
    main()
