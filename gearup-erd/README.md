# GearUp ERD & Database Design

Here is the database entity-relationship design for the **GearUp** sports and outdoor rental platform.

---

## 📊 Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string name
        string email UK
        string password
        enum role
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    CATEGORIES {
        int id PK
        string name UK
        text description
        timestamp createdAt
        timestamp updatedAt
    }

    GEAR_ITEMS {
        uuid id PK
        uuid providerId FK
        int categoryId FK
        string name
        text description
        decimal pricePerDay
        string brand
        int stock
        string imageUrl
        boolean isAvailable
        timestamp createdAt
        timestamp updatedAt
    }

    RENTAL_ORDERS {
        uuid id PK
        uuid customerId FK
        date startDate
        date endDate
        decimal totalAmount
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    RENTAL_ITEMS {
        uuid id PK
        uuid rentalOrderId FK
        uuid gearItemId FK
        int quantity
        decimal pricePerDay
    }

    PAYMENTS {
        uuid id PK
        uuid rentalOrderId FK
        string transactionId UK
        decimal amount
        enum method
        enum status
        timestamp paidAt
        timestamp createdAt
    }

    REVIEWS {
        uuid id PK
        uuid customerId FK
        uuid gearItemId FK
        int rating
        text comment
        timestamp createdAt
    }

    %% Relationships
    USERS ||--o{ GEAR_ITEMS : "provides"
    CATEGORIES ||--o{ GEAR_ITEMS : "classifies"
    USERS ||--o{ RENTAL_ORDERS : "places"
    RENTAL_ORDERS ||--|{ RENTAL_ITEMS : "contains"
    GEAR_ITEMS ||--o{ RENTAL_ITEMS : "ordered_in"
    RENTAL_ORDERS ||--o{ PAYMENTS : "paid_by"
    USERS ||--o{ REVIEWS : "writes"
    GEAR_ITEMS ||--o{ REVIEWS : "receives"
```

---

## 🎨 Generated ERD Concept Image

The generated concept image is saved as `gearup_erd.png` in this directory.

---

## 📝 Schema Details

Please refer to the [erd_details.txt](./erd_details.txt) file in this folder for the full database schema definitions, data types, and relationship descriptions.
