import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Configuration
NUM_RECORDS = 12000
START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2024, 12, 31)

# Indian regions and cities
regions = {
    "North": ["Delhi", "Mumbai", "Chandigarh", "Jaipur"],
    "South": ["Bangalore", "Chennai", "Hyderabad", "Kochi"],
    "East": ["Kolkata", "Bhubaneswar", "Patna", "Guwahati"],
    "West": ["Mumbai", "Pune", "Ahmedabad", "Goa"],
    "Central": ["Bhopal", "Nagpur", "Indore", "Raipur"]
}

categories = ["Electronics", "Clothing", "Home & Kitchen", "Sports", "Books", "Beauty"]
products = {
    "Electronics": ["Smartphone", "Laptop", "Headphones", "Smart Watch", "Tablet", "Camera"],
    "Clothing": ["T-Shirt", "Jeans", "Shirt", "Dress", "Jacket", "Sneakers"],
    "Home & Kitchen": ["Blender", "Microwave", "Cookware Set", "Vacuum Cleaner", "Air Fryer", "Coffee Maker"],
    "Sports": ["Cricket Bat", "Football", "Yoga Mat", "Tennis Racket", "Badminton Kit", "Running Shoes"],
    "Books": ["Fiction Novel", "Self-Help Book", "Biography", "Technical Book", "Children's Book", "Magazine"],
    "Beauty": ["Face Cream", "Lipstick", "Shampoo", "Perfume", "Makeup Kit", "Hair Dryer"]
}

customer_segments = ["Premium", "Regular", "Budget"]
channels = ["Online", "Store", "Mobile App"]
salespeople = ["Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh", "Anjali Gupta", "Rahul Mehta", "Pooja Nair"]

# Generate data
data = []

for i in range(1, NUM_RECORDS + 1):
    # Random date
    days_between = (END_DATE - START_DATE).days
    random_days = random.randint(0, days_between)
    order_date = START_DATE + timedelta(days=random_days)

    # Region and city
    region = random.choice(list(regions.keys()))
    city = random.choice(regions[region])

    # Customer segment - higher probability for regular
    segment = random.choices(customer_segments, weights=[0.2, 0.5, 0.3])[0]

    # Category and product
    category = random.choice(categories)
    product = random.choice(products[category])

    # Channel
    channel = random.choice(channels)

    # Salesperson
    salesperson = random.choice(salespeople)

    # Base price by category
    base_prices = {
        "Electronics": np.random.uniform(5000, 50000),
        "Clothing": np.random.uniform(500, 5000),
        "Home & Kitchen": np.random.uniform(1000, 20000),
        "Sports": np.random.uniform(300, 10000),
        "Books": np.random.uniform(200, 2000),
        "Beauty": np.random.uniform(200, 5000)
    }
    price = base_prices[category]

    # Units (1-5)
    units = random.randint(1, 5)

    # Discount - create some interesting patterns
    # Premium customers get lower discounts
    # Online channel has higher discounts
    # Some salespeople give higher discounts
    base_discount = 0.05
    if segment == "Budget":
        base_discount += 0.10
    elif segment == "Premium":
        base_discount -= 0.02

    if channel == "Online":
        base_discount += 0.05

    if salesperson in ["Rajesh Kumar", "Priya Sharma"]:
        base_discount += 0.03

    # Random variation
    discount = max(0, min(0.30, base_discount + np.random.normal(0, 0.02)))

    # Revenue and cost
    revenue = price * units * (1 - discount)
    cost = revenue * np.random.uniform(0.5, 0.8)  # Cost is 50-80% of revenue

    # Order ID
    order_id = f"ORD-{i:06d}"

    data.append({
        "order_id": order_id,
        "order_date": order_date.strftime("%Y-%m-%d"),
        "region": region,
        "state": city,  # Using city as state for simplicity
        "city": city,
        "customer_segment": segment,
        "category": category,
        "product": product,
        "units": units,
        "revenue": round(revenue, 2),
        "cost": round(cost, 2),
        "discount": round(discount * 100, 2),
        "channel": channel,
        "salesperson": salesperson
    })

# Create DataFrame
df = pd.DataFrame(data)

# Sort by date
df = df.sort_values("order_date").reset_index(drop=True)

# Save to CSV
output_path = "retail_sales.csv"
df.to_csv(output_path, index=False)

print(f"Generated {len(df)} records")
print(f"Saved to {output_path}")
print(f"\nDate range: {df['order_date'].min()} to {df['order_date'].max()}")
print(f"\nTotal revenue: {df['revenue'].sum():,.2f}")
print(f"Total cost: {df['cost'].sum():,.2f}")
print(f"Total profit: {(df['revenue'] - df['cost']).sum():,.2f}")
print(f"\nRecords by region:")
print(df['region'].value_counts())
print(f"\nRecords by category:")
print(df['category'].value_counts())
