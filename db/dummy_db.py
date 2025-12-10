import csv
from faker import Faker
import random
from datetime import timedelta

# ============================================================
# KONFIGURATION – MENGEN DER ZU ERZEUGENDEN DATEN
# ============================================================
NUM_USERS = 100
NUM_TRAINER_LICENSES = 5
NUM_TRAINERS = 20
NUM_ROOMS = 10
NUM_EQUIPMENT = 50
NUM_COURSES = 20
NUM_COURSE_RESERVATIONS = 80
NUM_MEMBERSHIPS = 4
NUM_CONTRACTS = 80
NUM_PAYMENTS = 60
NUM_SESSIONS = 200

fake = Faker()

# Helper
def rand_date(start_days_ago=900, end_days_ago=1):
    return fake.date_between(start_date=f"-{start_days_ago}d",
                             end_date=f"-{end_days_ago}d")


# Create folder "seed" if missing
import os
os.makedirs("init/seed", exist_ok=True)

# ============================================================
# 1. USER → app_user.csv
# ============================================================
print("Generiere app_user.csv...")
user_ids = []
with open("init/seed/app_user.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["user_id", "user_firstname", "user_lastname", "user_middlename",
                "user_email", "user_address", "user_birthdate", "user_phone"])

    for i in range(1, NUM_USERS + 1):
        user_ids.append(i)
        w.writerow([
            i,
            fake.first_name(),
            fake.last_name(),
            fake.first_name()[0],
            fake.email(),
            fake.street_address().replace("\n", " "),
            fake.date_of_birth(minimum_age=18, maximum_age=70),
            fake.phone_number()
        ])

# ============================================================
# 2. TRAINER LICENSES → trainer_license.csv
# ============================================================
print("Generiere trainer_license.csv...")
trainer_license_ids = []
with open("init/seed/trainer_license.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["trainer_license_id", "trainer_license_name", "trainer_license_description"])

    for i in range(1, NUM_TRAINER_LICENSES + 1):
        trainer_license_ids.append(i)
        w.writerow([i, fake.word().capitalize() + " License", fake.sentence()])

# ============================================================
# 3. TRAINER → trainer.csv
# ============================================================
print("Generiere trainer.csv...")
trainer_ids = []
with open("init/seed/trainer.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["trainer_id", "user_id", "trainer_license_id",
                "trainer_start_date", "trainer_end_date"])

    for i in range(1, NUM_TRAINERS + 1):
        trainer_ids.append(i)
        w.writerow([
            i,
            random.choice(user_ids),
            random.choice(trainer_license_ids),
            rand_date(900, 400),
            ""
        ])

# ============================================================
# 4. ROOMS → rooms.csv
# ============================================================
print("Generiere rooms.csv...")
room_ids = []
with open("init/seed/rooms.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["room_id", "room_name", "room_capacity"])

    for i in range(1, NUM_ROOMS + 1):
        room_ids.append(i)
        w.writerow([i, fake.word().capitalize() + " Raum", random.randint(10, 60)])

# ============================================================
# 5. EQUIPMENT → equipment.csv
# ============================================================
print("Generiere equipment.csv...")
equipment_ids = []
with open("init/seed/equipment.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["equipment_id", "equipment_name", "equipment_manufacturer",
                "equipment_buy_date", "equipment_is_operational"])

    for i in range(1, NUM_EQUIPMENT + 1):
        equipment_ids.append(i)
        w.writerow([
            i,
            fake.word().capitalize(),
            fake.company(),
            rand_date(1500, 300),
            fake.boolean()
        ])

# ============================================================
# 6. COURSE → course.csv
# ============================================================
print("Generiere course.csv...")
course_ids = []
with open("init/seed/course.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["course_id", "trainer_id", "room_id",
                "course_name", "course_start_date", "course_end_date"])

    for i in range(1, NUM_COURSES + 1):
        start = rand_date(300, 200)
        end = start + timedelta(days=random.randint(5, 50))
        course_ids.append(i)
        w.writerow([
            i,
            random.choice(trainer_ids),
            random.choice(room_ids),
            fake.word().capitalize() + " Kurs",
            start,
            end
        ])

# ============================================================
# 7. COURSE RESERVATION → course_reservation.csv
# ============================================================
print("Generiere course_reservation.csv...")
with open("init/seed/course_reservation.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["course_reservation_id", "user_id", "course_id"])

    for i in range(1, NUM_COURSE_RESERVATIONS + 1):
        w.writerow([
            i,
            random.choice(user_ids),
            random.choice(course_ids)
        ])

# ============================================================
# 8. MEMBERSHIPS → membership.csv
# ============================================================
print("Generiere membership.csv...")
membership_ids = []
with open("init/seed/membership.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["membership_id", "membership_name", "membership_price",
                "membership_min_duration"])

    for i in range(1, NUM_MEMBERSHIPS + 1):
        membership_ids.append(i)
        w.writerow([
            i,
            fake.word().capitalize(),
            random.randint(20, 100),
            rand_date(1000, 900)
        ])

# ============================================================
# 9. CONTRACTS → contracts.csv
# ============================================================
print("Generiere contracts.csv...")
contract_ids = []
with open("init/seed/contracts.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["contract_id", "user_id", "membership_id",
                "contract_cancellation_date", "contract_start_date", "contract_end_date"])

    for i in range(1, NUM_CONTRACTS + 1):
        start = rand_date(500, 300)
        contract_ids.append(i)
        w.writerow([
            i,
            random.choice(user_ids),
            random.choice(membership_ids),
            start + timedelta(days=random.randint(30, 300)),
            start,
            ""
        ])

# ============================================================
# 10. PAYMENT METHOD → payment_method.csv
# ============================================================
print("Generiere payment_method.csv...")
with open("init/seed/payment_method.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["payment_method_id", "payment_method_name", "payment_method_description"])
    w.writerow([1, "Credit Card", "Visa / Mastercard"])
    w.writerow([2, "SEPA", "Bankeinzug"])
    w.writerow([3, "PayPal", "Online Payment"])

# ============================================================
# 11. PAYMENT STATUS → payment_status.csv
# ============================================================
print("Generiere payment_status.csv...")
with open("init/seed/payment_status.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["payment_status_id", "payment_status_label", "payment_status_description"])
    w.writerow([1, "paid", "Zahlung erfolgreich"])
    w.writerow([2, "pending", "Ausstehende Zahlung"])
    w.writerow([3, "failed", "Fehlgeschlagene Zahlung"])

# ============================================================
# 12. PAYMENTS → payment.csv
# ============================================================
print("Generiere payment.csv...")
with open("init/seed/payment.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["payment_id", "contract_id", "payment_date",
                "payment_amount", "payment_method_id", "payment_status_id"])

    for i in range(1, NUM_PAYMENTS + 1):
        w.writerow([
            i,
            random.choice(contract_ids),
            rand_date(200, 1),
            random.randint(20, 100),
            1,
            1
        ])

# ============================================================
# 13. SESSIONS → session.csv
# ============================================================
print("Generiere session.csv...")
with open("init/seed/session.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["session_id", "user_id", "session_start_date",
                "session_end_date", "session_duration"])

    for i in range(1, NUM_SESSIONS + 1):
        start = rand_date(200, 10)
        end = start + timedelta(hours=random.randint(1, 3))
        w.writerow([
            i,
            random.choice(user_ids),
            start,
            end,
            (end - start).total_seconds() / 3600
        ])

print("\nFERTIG! Alle CSV-Dateien wurden generiert.")