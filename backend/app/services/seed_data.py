from sqlalchemy.orm import Session
from app.models.user import User
from app.models.delivery import Delivery, DeliveryPriority, DeliveryStatus
from app.services.auth_service import get_password_hash

# Realistic San Francisco delivery destinations relative to Central Depot (100 Market St)
SAMPLE_DELIVERIES = [
    {
        "customer_name": "Sophia Martinez",
        "customer_phone": "+1-415-555-0101",
        "customer_email": "sophia.m@example.com",
        "delivery_address": "550 Montgomery St, San Francisco, CA 94111",
        "latitude": 37.7946,
        "longitude": -122.4034,
        "package_details": "Office Tech Equipment (Box 1/2)",
        "weight_kg": 4.5,
        "priority": DeliveryPriority.HIGH.value,
        "status": DeliveryStatus.PENDING.value,
        "time_window_start": "09:00",
        "time_window_end": "12:00",
        "notes": "Reception on 4th floor. Ring doorbell."
    },
    {
        "customer_name": "Liam Chen",
        "customer_phone": "+1-415-555-0102",
        "customer_email": "liam.chen@example.com",
        "delivery_address": "850 Brannan St, San Francisco, CA 94103",
        "latitude": 37.7719,
        "longitude": -122.4048,
        "package_details": "Precision Medical Supplies",
        "weight_kg": 2.2,
        "priority": DeliveryPriority.URGENT.value,
        "status": DeliveryStatus.PENDING.value,
        "time_window_start": "10:00",
        "time_window_end": "11:30",
        "notes": "Handle with care. Temperature-controlled parcel."
    },
    {
        "customer_name": "Emma Watson",
        "customer_phone": "+1-415-555-0103",
        "customer_email": "emma.w@example.com",
        "delivery_address": "1200 Van Ness Ave, San Francisco, CA 94109",
        "latitude": 37.7869,
        "longitude": -122.4218,
        "package_details": "Ergonomic Desk Accessories",
        "weight_kg": 6.8,
        "priority": DeliveryPriority.MEDIUM.value,
        "status": DeliveryStatus.PENDING.value,
        "time_window_start": "11:00",
        "time_window_end": "15:00",
        "notes": "Gate code #4492."
    },
    {
        "customer_name": "David Miller",
        "customer_phone": "+1-415-555-0104",
        "customer_email": "david.m@example.com",
        "delivery_address": "2100 Mission St, San Francisco, CA 94110",
        "latitude": 37.7632,
        "longitude": -122.4192,
        "package_details": "Commercial Coffee Roaster Beans (Bulk)",
        "weight_kg": 12.0,
        "priority": DeliveryPriority.LOW.value,
        "status": DeliveryStatus.PENDING.value,
        "time_window_start": "13:00",
        "time_window_end": "17:00",
        "notes": "Loading dock behind the building."
    },
    {
        "customer_name": "Olivia Johnson",
        "customer_phone": "+1-415-555-0105",
        "customer_email": "olivia.j@example.com",
        "delivery_address": "3000 24th St, San Francisco, CA 94110",
        "latitude": 37.7525,
        "longitude": -122.4116,
        "package_details": "Designer Apparel & Footwear",
        "weight_kg": 3.1,
        "priority": DeliveryPriority.MEDIUM.value,
        "status": DeliveryStatus.PENDING.value,
        "time_window_start": "10:00",
        "time_window_end": "14:00",
        "notes": "Leave at front porch if nobody answers."
    },
    {
        "customer_name": "Noah Williams",
        "customer_phone": "+1-415-555-0106",
        "customer_email": "noah.w@example.com",
        "delivery_address": "450 10th St, San Francisco, CA 94103",
        "latitude": 37.7725,
        "longitude": -122.4132,
        "package_details": "Audio Studio Monitors",
        "weight_kg": 8.4,
        "priority": DeliveryPriority.HIGH.value,
        "status": DeliveryStatus.PENDING.value,
        "time_window_start": "14:00",
        "time_window_end": "18:00",
        "notes": "Signature required upon delivery."
    },
    {
        "customer_name": "Ava Brown",
        "customer_phone": "+1-415-555-0107",
        "customer_email": "ava.b@example.com",
        "delivery_address": "1500 Haight St, San Francisco, CA 94117",
        "latitude": 37.7699,
        "longitude": -122.4468,
        "package_details": "Artisan Ceramic Tableware",
        "weight_kg": 5.0,
        "priority": DeliveryPriority.MEDIUM.value,
        "status": DeliveryStatus.PENDING.value,
        "time_window_start": "12:00",
        "time_window_end": "16:00",
        "notes": "Fragile items. Do not stack heavy objects on top."
    },
    {
        "customer_name": "James Taylor",
        "customer_phone": "+1-415-555-0108",
        "customer_email": "james.t@example.com",
        "delivery_address": "250 Beach St, San Francisco, CA 94133",
        "latitude": 37.8078,
        "longitude": -122.4145,
        "package_details": "Nautical Hardware & Spare Parts",
        "weight_kg": 9.2,
        "priority": DeliveryPriority.URGENT.value,
        "status": DeliveryStatus.PENDING.value,
        "time_window_start": "09:30",
        "time_window_end": "11:00",
        "notes": "Call customer 10 minutes prior to arrival."
    }
]

def seed_database(db: Session):
    """
    Populates initial admin user and sample deliveries if database is empty.
    """
    # 1. Seed Admin User
    admin = db.query(User).filter(User.email == "admin@delivery.com").first()
    if not admin:
        admin = User(
            email="admin@delivery.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Alex Mercer (Operations Lead)",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

    # 2. Seed Sample Deliveries if table is empty
    delivery_count = db.query(Delivery).count()
    if delivery_count == 0:
        for item in SAMPLE_DELIVERIES:
            delivery = Delivery(
                customer_name=item["customer_name"],
                customer_phone=item["customer_phone"],
                customer_email=item["customer_email"],
                delivery_address=item["delivery_address"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                package_details=item["package_details"],
                weight_kg=item["weight_kg"],
                priority=item["priority"],
                status=item["status"],
                time_window_start=item["time_window_start"],
                time_window_end=item["time_window_end"],
                notes=item["notes"],
                user_id=admin.id
            )
            db.add(delivery)
        db.commit()
