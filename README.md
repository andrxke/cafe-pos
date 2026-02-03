# Cafe POS System

A simple Point of Sale (POS) system for small cafes that allows baristas to manage orders, process transactions, and track customer credits.

## Features

- **Order Management**: Record customer orders with multiple items
- **Item Management**: Add and manage menu items with prices
- **Transaction Processing**: 
  - Process cash transactions
  - Process credit transactions using customer accounts
  - Mixed payments (credit + cash)
- **Customer Credit Tracking**: 
  - Automatically track credits when customers overpay
  - Deduct from credit balance for future purchases
- **Data Persistence**: All data is saved in JSON files

## Requirements

- Python 3.6 or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/andrxke/cafe-pos.git
cd cafe-pos
```

2. Run the application:
```bash
python3 pos.py
```

## Usage

### Main Menu

When you start the application, you'll see the main menu:

```
=== MAIN MENU ===
1. Create Order
2. Add Item to Menu
3. View Menu
4. View Customers
5. Exit
```

### Adding Items

1. Select option `2` from the main menu
2. Enter the item name (e.g., "Espresso")
3. Enter the price (e.g., "3.50")

### Creating an Order

1. Select option `1` from the main menu
2. Enter item names from the menu (one at a time)
3. Type "done" when finished adding items
4. Choose payment method:
   - **Cash**: Enter the amount received, system calculates change
     - Option to add change to customer credit
   - **Credit**: Use customer's account credit balance
     - If insufficient credit, option to pay difference in cash

### Viewing Menu and Customers

- Select option `3` to view all menu items and prices
- Select option `4` to view all customers and their credit balances

## Data Storage

All data is stored in the `data/` directory:
- `items.json`: Menu items and prices
- `customers.json`: Customer accounts and credit balances
- `transactions.json`: Transaction history

## Example Workflow

1. **Add menu items**:
   - Add "Espresso" for $3.50
   - Add "Cappuccino" for $4.00
   - Add "Muffin" for $2.50

2. **Process an order**:
   - Customer orders 1 Espresso and 1 Muffin (Total: $6.00)
   - Customer pays $10.00 cash
   - Change: $4.00
   - Add change to customer's (e.g., "John") credit account

3. **Use credit for next order**:
   - John orders 1 Cappuccino ($4.00)
   - Pay with credit (uses John's $4.00 credit)
   - Transaction complete, credit balance: $0.00

## License

MIT 
