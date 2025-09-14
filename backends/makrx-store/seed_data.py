"""
Seed sample data for MakrX Store
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import async_session, create_tables
from models.commerce import Category, Product

async def seed_categories():
    """Create sample categories"""
    categories_data = [
        {"name": "3D Printing", "slug": "3d-printing", "description": "3D printing supplies and materials", "sort_order": 1},
        {"name": "Electronics", "slug": "electronics", "description": "Arduino, Raspberry Pi, sensors and more", "sort_order": 2},
        {"name": "Tools", "slug": "tools", "description": "Hand tools and power tools for makers", "sort_order": 3},
        {"name": "Materials", "slug": "materials", "description": "Raw materials for projects", "sort_order": 4},
        {"name": "Kits", "slug": "kits", "description": "Complete project kits", "sort_order": 5},
    ]
    
    async with async_session() as session:
        for cat_data in categories_data:
            category = Category(**cat_data)
            session.add(category)
        
        await session.commit()
        print("Categories seeded successfully")

async def seed_products():
    """Create sample products"""
    async with async_session() as session:
        # Get categories first
        from sqlalchemy import select
        result = await session.execute(select(Category))
        categories = {cat.slug: cat.id for cat in result.scalars().all()}
        
        products_data = [
            {
                "name": "PLA 3D Printing Filament - 1kg Spool",
                "slug": "pla-filament-1kg-red",
                "description": "High-quality PLA filament for 3D printing. Available in multiple colors.",
                "short_description": "Premium PLA filament, 1kg spool, 1.75mm diameter",
                "price": 25.99,
                "stock_quantity": 50,
                "category_id": categories.get("3d-printing"),
                "sku": "PLA-1KG-RED-001",
                "weight": 1.0,
                "is_featured": True,
                "status": "active"
            },
            {
                "name": "Arduino Uno R3 Compatible Board",
                "slug": "arduino-uno-r3-compatible",
                "description": "Arduino Uno R3 compatible microcontroller board with USB cable. Perfect for beginners and advanced projects.",
                "short_description": "Arduino Uno R3 compatible board with USB cable",
                "price": 22.50,
                "stock_quantity": 25,
                "category_id": categories.get("electronics"),
                "sku": "ARD-UNO-R3-001",
                "weight": 0.025,
                "is_featured": True,
                "status": "active"
            },
            {
                "name": "Raspberry Pi 4 Model B - 4GB RAM",
                "slug": "raspberry-pi-4-4gb",
                "description": "Latest Raspberry Pi 4 with 4GB RAM. Includes heat sinks and micro-SD card.",
                "short_description": "Raspberry Pi 4 Model B with 4GB RAM",
                "price": 75.00,
                "stock_quantity": 15,
                "category_id": categories.get("electronics"),
                "sku": "RPI-4B-4GB-001",
                "weight": 0.046,
                "is_featured": True,
                "status": "active"
            },
            {
                "name": "Digital Calipers - 6 inch",
                "slug": "digital-calipers-6-inch",
                "description": "Precision digital calipers for accurate measurements. Stainless steel construction.",
                "short_description": "Precision digital calipers, 6 inch, stainless steel",
                "price": 19.99,
                "stock_quantity": 30,
                "category_id": categories.get("tools"),
                "sku": "TOOL-CALIPER-6IN-001",
                "weight": 0.15,
                "status": "active"
            },
            {
                "name": "PETG 3D Printing Filament - 1kg Spool",
                "slug": "petg-filament-1kg-clear",
                "description": "Crystal clear PETG filament for 3D printing. Chemical resistant and strong.",
                "short_description": "Premium PETG filament, 1kg spool, crystal clear",
                "price": 29.99,
                "sale_price": 24.99,
                "stock_quantity": 20,
                "category_id": categories.get("3d-printing"),
                "sku": "PETG-1KG-CLEAR-001",
                "weight": 1.0,
                "status": "active"
            },
            {
                "name": "ESP32 Development Board",
                "slug": "esp32-dev-board",
                "description": "ESP32 development board with Wi-Fi and Bluetooth. Perfect for IoT projects.",
                "short_description": "ESP32 dev board with Wi-Fi & Bluetooth",
                "price": 18.50,
                "stock_quantity": 40,
                "category_id": categories.get("electronics"),
                "sku": "ESP32-DEV-001",
                "weight": 0.010,
                "status": "active"
            },
            {
                "name": "Beginner Electronics Kit",
                "slug": "beginner-electronics-kit",
                "description": "Complete electronics kit for beginners. Includes breadboard, LEDs, resistors, and project guide.",
                "short_description": "Complete beginner electronics kit with guide",
                "price": 45.00,
                "stock_quantity": 12,
                "category_id": categories.get("kits"),
                "sku": "KIT-ELEC-BEGIN-001",
                "weight": 0.5,
                "is_featured": True,
                "status": "active"
            },
            {
                "name": "Acrylic Sheet - 3mm Clear",
                "slug": "acrylic-sheet-3mm-clear",
                "description": "Clear acrylic sheet, 3mm thick. Perfect for laser cutting and prototyping.",
                "short_description": "Clear acrylic sheet, 3mm thickness",
                "price": 12.99,
                "stock_quantity": 25,
                "category_id": categories.get("materials"),
                "sku": "ACR-3MM-CLEAR-001",
                "weight": 0.3,
                "status": "active"
            }
        ]
        
        for prod_data in products_data:
            product = Product(**prod_data)
            session.add(product)
        
        await session.commit()
        print("Products seeded successfully")

async def main():
    """Main seeding function"""
    print("Creating database tables...")
    await create_tables()
    
    print("Seeding categories...")
    await seed_categories()
    
    print("Seeding products...")
    await seed_products()
    
    print("Sample data seeding completed!")

if __name__ == "__main__":
    asyncio.run(main())