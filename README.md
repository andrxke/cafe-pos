# Cafe POS System

A web-based Point of Sale (POS) system for small cafes that allows baristas to manage orders, process transactions, and track customer credits.

## Features

- **Barista Login System**: Secure login for staff members
- **Web-Based UI**: Modern, responsive interface accessible from any device
- **Order Management**: 
  - Select items from menu
  - Enter quantity for each item
  - Add notes for special requests (e.g., "extra hot", "no sugar")
- **Customer Tracking**: Track customer accounts and credit balances
- **Transaction Processing**: 
  - Process cash payments with change calculation
  - Process credit transactions using customer accounts
  - Mixed payments (credit + cash)
- **Item Management**: Add, view, and delete menu items
- **Dashboard**: View recent transactions and system statistics
- **Data Persistence**: All data saved in JSON files

## Requirements

- Python 3.7 or higher
- Flask 2.3.0 or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/andrxke/cafe-pos.git
cd cafe-pos
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Default Login

- **Username**: `admin`
- **Password**: `admin123`

*Note: Change these credentials in production*

## Usage

### Logging In

1. Open the application in your browser
2. Enter your barista credentials
3. Click "Login"

### Creating an Order

1. Click "New Order" from the dashboard or navigation
2. For each item:
   - Enter the quantity
   - Add any special notes/requests
3. Enter customer name (optional, but required for credit tracking)
4. Select payment type (Cash or Customer Credit)
5. Click "Proceed to Payment"
6. Complete the payment:
   - **Cash**: Enter amount received, system calculates change
     - Option to add change to customer credit
   - **Credit**: Uses customer's credit balance
     - If insufficient, option to pay difference with cash

### Managing Menu Items

1. Navigate to "Menu Items"
2. Click "+ Add Item" to add new items
3. Enter item name and price
4. Click "Add Item"
5. To delete an item, click "Delete" on any item card

### Viewing Customers

1. Navigate to "Customers"
2. View all customers and their credit balances
3. Customers are automatically created when processing orders

## Data Storage

All data is stored in the `data/` directory as JSON files:
- `items.json`: Menu items and prices
- `customers.json`: Customer accounts and credit balances
- `transactions.json`: Transaction history
- `baristas.json`: Barista login credentials

## Example Workflow

1. **Barista logs in** with credentials
2. **Add menu items** (one-time setup):
   - Espresso: $3.50
   - Cappuccino: $4.00
   - Muffin: $2.50

3. **Customer orders**:
   - 1x Cappuccino
   - 1x Muffin
   - Notes: "Extra hot cappuccino"
   - Total: $6.50

4. **Payment**:
   - Customer pays $10.00 cash
   - Change: $3.50
   - Add change to customer's credit account

5. **Next visit**:
   - Customer has $3.50 credit
   - Orders 1x Espresso ($3.50)
   - Pays with credit
   - Transaction complete

## Security Notes

- The default secret key should be changed in production
- Passwords are hashed using Werkzeug's security functions
- Always use HTTPS in production environments

## License

MIT 
