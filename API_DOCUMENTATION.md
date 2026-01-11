# 📘 API Documentation – Flashcards Application

## 🔐 Authentication

Authentication is handled using **JWT**.

The token must be sent in the HTTP header:
```
Authorization: Bearer <token>
```

### Access Levels

- **Public**: no authentication required  
- **Authenticated**: logged-in user  
- **Admin**: user with `admin = true`

---

## 🧑‍💻 Auth (`/auth`)

### 🔹 POST `/auth/register`

- **Purpose**: Register a new user  
- **Authentication**: Public  

**Request Body**

| Field | Type | Description |
|------|------|-------------|
| email | string | User email |
| name | string | First name |
| lastName | string | Last name |
| password | string | Password |

---

### 🔹 POST `/auth/login`

- **Purpose**: Authenticate a user and return a JWT  
- **Authentication**: Public  

**Request Body**

| Field | Type | Description |
|------|------|-------------|
| email | string | User email |
| password | string | Password |

---

## 🛡️ Admin (`/admin`)

All admin routes require:
- A valid JWT  
- Admin privileges  

---

### 🔹 GET `/admin/list`

- **Purpose**: Retrieve the list of all users  
- **Authentication**: Admin  

**Parameters**: None

---

### 🔹 GET `/admin/:userId`

- **Purpose**: Retrieve a user by ID  
- **Authentication**: Admin  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| userId | number | User ID |

---

### 🔹 DELETE `/admin/:userId`

- **Purpose**: Delete a user  
- **Authentication**: Admin  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| userId | number | User ID |

---

## 📁 Collections (`/collection`)

### 🔹 POST `/collection`

- **Purpose**: Create a collection  
- **Authentication**: Authenticated  

**Request Body**

| Field | Type | Description |
|------|------|-------------|
| title | string | Collection title |
| description | string | Collection description |
| isPublic | boolean | Public or private |

---

### 🔹 GET `/collection`

- **Purpose**: Retrieve all accessible collections  
- **Authentication**: Optional  

**Query Parameters**

| Param | Type | Description |
|------|------|-------------|
| search | string | Search by title |

---

### 🔹 GET `/collection/own`

- **Purpose**: Retrieve collections owned by the authenticated user  
- **Authentication**: Authenticated  

**Parameters**: None

---

### 🔹 GET `/collection/:id`

- **Purpose**: Retrieve a specific collection  
- **Authentication**: Optional  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| id | number | Collection ID |

---

### 🔹 PUT `/collection/:id`

- **Purpose**: Update a collection  
- **Authentication**: Authenticated (owner only)  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| id | number | Collection ID |

**Request Body** (all fields are required)

| Field | Type |
|------|------|
| title | string |
| description | string |
| isPublic | boolean |

---

### 🔹 DELETE `/collection/:id`

- **Purpose**: Delete a collection (and all related flashcards and revisions)  
- **Authentication**: Authenticated (owner only)  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| id | number | Collection ID |

---

## 🃏 Flashcards (`/flashcard`)

### 🔹 POST `/flashcard`

- **Purpose**: Create a flashcard  
- **Authentication**: Authenticated (collection owner)  

**Request Body**

| Field | Type | Description |
|------|------|-------------|
| recto | string | Front text |
| verso | string | Back text |
| rectoUrl | string \| null | Optional front URL |
| versoUrl | string \| null | Optional back URL |
| idCollection | number | Collection ID |

---

### 🔹 GET `/flashcard/:id`

- **Purpose**: Retrieve a flashcard by ID  
- **Authentication**: Authenticated  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| id | number | Flashcard ID |

---

### 🔹 DELETE `/flashcard/:id`

- **Purpose**: Delete a flashcard  
- **Authentication**: Authenticated (collection owner)  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| id | number | Flashcard ID |

---

### 🔹 PUT `/flashcard/:id`

- **Purpose**: Update a flashcard  
- **Authentication**: Authenticated (owner of the corresponding collection only)  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| id | number | Flashcard ID |

**Request Body** (all fields are required)

| Field | Type |
|------|------|
| recto | string |
| verso | string |
| rectoUrl | string |
| versoUrl | string |
| idCollection | number |

---

### 🔹 GET `/flashcard/collection/:idCollection`

- **Purpose**: Retrieve all flashcards from a collection  
- **Authentication**: Authenticated  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| idCollection | number | Collection ID |

---

## 🔁 Revisions (`/revision`)

### 🔹 GET `/revision/collection/:idCollection`

- **Purpose**: Retrieve flashcards that need to be reviewed  
- **Authentication**: Authenticated  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| idCollection | number | Collection ID |

**Logic**
- Flashcards never reviewed  
- Flashcards whose next review date has been reached or exceeded  

---

### 🔹 POST `/revision/flashcard/:idFlashcard`

- **Purpose**: Register a flashcard review  
- **Authentication**: Authenticated  

**Route Parameters**

| Param | Type | Description |
|------|------|-------------|
| idFlashcard | number | Flashcard ID |

**Effects**
- Create or update a revision  
- Increase review level  
- Update last review date  
- Compute next review date  

---

## ✅ Final Notes

- All critical routes are protected  
- Access control is based on:
  - Collection ownership
  - Public/private visibility
  - Admin role
- Request parameters and bodies are validated via middleware
