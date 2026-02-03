"""
Cafe POS Web Application
A web-based point-of-sale system for managing orders, transactions, and customer credits.
"""

from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = 'cafe-pos-secret-key-change-in-production'

# Data directory
DATA_DIR = 'data'

# Ensure data directory exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)


class DataStore:
    """Handles data persistence using JSON files."""
    
    @staticmethod
    def load_json(filename, default=None):
        """Load data from JSON file."""
        filepath = os.path.join(DATA_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                return json.load(f)
        return default if default is not None else {}
    
    @staticmethod
    def save_json(filename, data):
        """Save data to JSON file."""
        filepath = os.path.join(DATA_DIR, filename)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    @staticmethod
    def load_items():
        """Load menu items."""
        return DataStore.load_json('items.json', {})
    
    @staticmethod
    def save_items(items):
        """Save menu items."""
        DataStore.save_json('items.json', items)
    
    @staticmethod
    def load_customers():
        """Load customers."""
        return DataStore.load_json('customers.json', {})
    
    @staticmethod
    def save_customers(customers):
        """Save customers."""
        DataStore.save_json('customers.json', customers)
    
    @staticmethod
    def load_transactions():
        """Load transactions."""
        return DataStore.load_json('transactions.json', [])
    
    @staticmethod
    def save_transactions(transactions):
        """Save transactions."""
        DataStore.save_json('transactions.json', transactions)
    
    @staticmethod
    def load_baristas():
        """Load barista accounts."""
        baristas = DataStore.load_json('baristas.json', {})
        # Create default admin account if no baristas exist
        if not baristas:
            baristas = {
                'admin': {
                    'username': 'admin',
                    'password': generate_password_hash('admin123'),
                    'name': 'Administrator'
                }
            }
            DataStore.save_json('baristas.json', baristas)
        return baristas
    
    @staticmethod
    def save_baristas(baristas):
        """Save barista accounts."""
        DataStore.save_json('baristas.json', baristas)


def login_required(f):
    """Decorator to require login for routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'barista' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


@app.route('/')
def index():
    """Home page - redirect to login or dashboard."""
    if 'barista' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page for baristas."""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        baristas = DataStore.load_baristas()
        
        if username in baristas and check_password_hash(baristas[username]['password'], password):
            session['barista'] = username
            session['barista_name'] = baristas[username]['name']
            flash(f'Welcome back, {baristas[username]["name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'error')
    
    return render_template('login.html')


@app.route('/logout')
def logout():
    """Logout barista."""
    session.pop('barista', None)
    session.pop('barista_name', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard."""
    items = DataStore.load_items()
    customers = DataStore.load_customers()
    transactions = DataStore.load_transactions()
    
    # Get recent transactions (last 10)
    recent_transactions = sorted(transactions, key=lambda x: x['timestamp'], reverse=True)[:10]
    
    return render_template('dashboard.html', 
                         items=items,
                         customers=customers,
                         recent_transactions=recent_transactions)


@app.route('/items')
@login_required
def items():
    """View all menu items."""
    items = DataStore.load_items()
    return render_template('items.html', items=items)


@app.route('/items/add', methods=['GET', 'POST'])
@login_required
def add_item():
    """Add new menu item."""
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        try:
            price = float(request.form.get('price', 0))
            if not name:
                flash('Item name is required.', 'error')
            elif price <= 0:
                flash('Price must be greater than zero.', 'error')
            else:
                items = DataStore.load_items()
                items[name] = {'name': name, 'price': price}
                DataStore.save_items(items)
                flash(f'Item "{name}" added successfully!', 'success')
                return redirect(url_for('items'))
        except ValueError:
            flash('Invalid price. Please enter a valid number.', 'error')
    
    return render_template('add_item.html')


@app.route('/items/delete/<item_name>')
@login_required
def delete_item(item_name):
    """Delete a menu item."""
    items = DataStore.load_items()
    if item_name in items:
        del items[item_name]
        DataStore.save_items(items)
        flash(f'Item "{item_name}" deleted successfully!', 'success')
    else:
        flash(f'Item "{item_name}" not found.', 'error')
    return redirect(url_for('items'))


@app.route('/customers')
@login_required
def customers():
    """View all customers."""
    customers = DataStore.load_customers()
    return render_template('customers.html', customers=customers)


@app.route('/order', methods=['GET', 'POST'])
@login_required
def create_order():
    """Create a new order."""
    items = DataStore.load_items()
    
    if not items:
        flash('No items in menu. Please add items first.', 'warning')
        return redirect(url_for('dashboard'))
    
    return render_template('create_order.html', items=items)


@app.route('/order/process', methods=['POST'])
@login_required
def process_order():
    """Process order and payment."""
    try:
        # Get order data from form
        order_items = []
        order_total = 0.0
        
        items = DataStore.load_items()
        
        # Parse order items from form
        for key in request.form:
            if key.startswith('qty_'):
                item_name = key[4:]  # Remove 'qty_' prefix
                qty = int(request.form.get(key, 0))
                notes = request.form.get(f'notes_{item_name}', '').strip()
                
                if qty > 0 and item_name in items:
                    item_price = items[item_name]['price']
                    item_total = item_price * qty
                    order_total += item_total
                    
                    order_items.append({
                        'name': item_name,
                        'quantity': qty,
                        'price': item_price,
                        'total': item_total,
                        'notes': notes
                    })
        
        if not order_items:
            flash('No items selected. Please add items to the order.', 'error')
            return redirect(url_for('create_order'))
        
        # Get payment details
        payment_type = request.form.get('payment_type', 'cash')
        customer_name = request.form.get('customer_name', '').strip()
        
        # Store order in session for payment page
        session['pending_order'] = {
            'items': order_items,
            'total': order_total,
            'payment_type': payment_type,
            'customer_name': customer_name
        }
        
        return redirect(url_for('process_payment'))
        
    except Exception as e:
        flash(f'Error processing order: {str(e)}', 'error')
        return redirect(url_for('create_order'))


@app.route('/payment', methods=['GET', 'POST'])
@login_required
def process_payment():
    """Process payment for order."""
    pending_order = session.get('pending_order')
    
    if not pending_order:
        flash('No pending order found.', 'error')
        return redirect(url_for('create_order'))
    
    if request.method == 'POST':
        try:
            payment_type = pending_order['payment_type']
            customer_name = pending_order['customer_name']
            total = pending_order['total']
            
            customers = DataStore.load_customers()
            
            # Initialize customer if needed
            if customer_name and customer_name not in customers:
                customers[customer_name] = {'name': customer_name, 'credit': 0.0}
            
            if payment_type == 'cash':
                amount_paid = float(request.form.get('amount_paid', 0))
                if amount_paid < total:
                    flash(f'Insufficient payment. Need ${total:.2f}, received ${amount_paid:.2f}', 'error')
                    return render_template('payment.html', order=pending_order)
                
                change = amount_paid - total
                add_to_credit = request.form.get('add_to_credit') == 'yes'
                
                if change > 0 and add_to_credit and customer_name:
                    customers[customer_name]['credit'] = customers[customer_name].get('credit', 0.0) + change
                    DataStore.save_customers(customers)
                    flash(f'${change:.2f} added to {customer_name}\'s credit.', 'info')
                
                # Record transaction
                transaction = {
                    'timestamp': datetime.now().isoformat(),
                    'items': pending_order['items'],
                    'total': total,
                    'payment_type': 'cash',
                    'customer_name': customer_name,
                    'amount_paid': amount_paid,
                    'change': change,
                    'barista': session.get('barista_name', 'Unknown')
                }
                
            elif payment_type == 'credit':
                if not customer_name:
                    flash('Customer name is required for credit payment.', 'error')
                    return render_template('payment.html', order=pending_order)
                
                customer = customers.get(customer_name, {'name': customer_name, 'credit': 0.0})
                
                if customer['credit'] >= total:
                    # Full credit payment
                    customer['credit'] -= total
                    customers[customer_name] = customer
                    DataStore.save_customers(customers)
                    
                    transaction = {
                        'timestamp': datetime.now().isoformat(),
                        'items': pending_order['items'],
                        'total': total,
                        'payment_type': 'credit',
                        'customer_name': customer_name,
                        'barista': session.get('barista_name', 'Unknown')
                    }
                else:
                    # Insufficient credit - mixed payment
                    use_partial = request.form.get('use_partial_credit') == 'yes'
                    if use_partial:
                        remaining = total - customer['credit']
                        cash_paid = float(request.form.get('cash_amount', 0))
                        
                        if cash_paid < remaining:
                            flash(f'Insufficient cash payment. Need ${remaining:.2f}', 'error')
                            return render_template('payment.html', order=pending_order, 
                                                 insufficient_credit=True,
                                                 customer_credit=customer['credit'])
                        
                        # Mixed payment
                        customer['credit'] = 0.0
                        customers[customer_name] = customer
                        DataStore.save_customers(customers)
                        
                        transaction = {
                            'timestamp': datetime.now().isoformat(),
                            'items': pending_order['items'],
                            'total': total,
                            'payment_type': 'mixed',
                            'customer_name': customer_name,
                            'cash_amount': cash_paid,
                            'change': cash_paid - remaining,
                            'barista': session.get('barista_name', 'Unknown')
                        }
                    else:
                        flash(f'Insufficient credit. Customer has ${customer["credit"]:.2f}, needs ${total:.2f}', 'error')
                        return render_template('payment.html', order=pending_order,
                                             insufficient_credit=True,
                                             customer_credit=customer['credit'])
            
            # Save transaction
            transactions = DataStore.load_transactions()
            transactions.append(transaction)
            DataStore.save_transactions(transactions)
            
            # Clear pending order
            session.pop('pending_order', None)
            
            flash('Transaction completed successfully!', 'success')
            return redirect(url_for('dashboard'))
            
        except ValueError as e:
            flash(f'Invalid input: {str(e)}', 'error')
            return render_template('payment.html', order=pending_order)
        except Exception as e:
            flash(f'Error processing payment: {str(e)}', 'error')
            return render_template('payment.html', order=pending_order)
    
    # GET request - show payment form
    customers = DataStore.load_customers()
    customer_credit = 0.0
    insufficient_credit = False
    
    if pending_order['customer_name'] and pending_order['payment_type'] == 'credit':
        customer = customers.get(pending_order['customer_name'], {'credit': 0.0})
        customer_credit = customer.get('credit', 0.0)
        insufficient_credit = customer_credit < pending_order['total']
    
    return render_template('payment.html', 
                         order=pending_order,
                         customer_credit=customer_credit,
                         insufficient_credit=insufficient_credit)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
