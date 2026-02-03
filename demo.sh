#!/bin/bash
# Demonstration script for Cafe POS System

echo "============================================"
echo "   CAFE POS SYSTEM - DEMONSTRATION"
echo "============================================"
echo ""
echo "This script demonstrates the key features:"
echo "1. Adding menu items"
echo "2. Creating orders"
echo "3. Processing cash payments with credit tracking"
echo "4. Using customer credit for future purchases"
echo ""

# Clean up any existing data
rm -rf data

echo "Step 1: Adding menu items..."
echo ""
python3 pos.py <<EOF
2
Espresso
3.50
2
Cappuccino
4.00
2
Latte
4.50
2
Croissant
3.00
2
Muffin
2.50
3
5
EOF

echo ""
echo "============================================"
echo "Step 2: Creating an order and adding credit..."
echo ""
python3 pos.py <<EOF
1
Cappuccino
Croissant
done
1
10.00
y
Sarah
4
5
EOF

echo ""
echo "============================================"
echo "Step 3: Using credit for next purchase..."
echo ""
python3 pos.py <<EOF
1
Espresso
done
2
Sarah
4
5
EOF

echo ""
echo "============================================"
echo "Demonstration complete!"
echo "All data is saved in the data/ directory"
echo "============================================"
