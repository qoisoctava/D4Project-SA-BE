# Sentiment Analysis API Documentation

## Overview

The Sentiment Analysis API is a RESTful service built with NestJS that provides sentiment analysis for social media content from Twitter and YouTube. The API supports user authentication, role-based authorization, and comprehensive sentiment analysis workflows.

This is a remake of `http://sa.qoisoctava.com` backend side

**Base URL**: `http://localhost:3001/api`

**Version**: 1.0.0

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **ADMIN**: Full access to all features
- **ANALYST**: Can create predictions and view all results
- **VIEWER**: Can only view results (default role)

## Error Responses

All endpoints may return the following error responses:

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Authentication Endpoints

### Register User

Creates a new user account.

**Endpoint**: `POST /auth/register`

**Access**: Public

**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "viewer" | "analyst" | "admin" (optional, defaults to "viewer")
}
```

**Validation Rules**:
- `username`: Required, string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `role`: Optional, must be valid UserRole enum

**Response** (201):
```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "viewer",
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### Login User

Authenticates a user and returns a JWT token.

**Endpoint**: `POST /auth/login`

**Access**: Public

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response** (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "viewer"
  }
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

---

### Get User Profile

Returns the current authenticated user's profile.

**Endpoint**: `GET /auth/profile`

**Access**: Authenticated users only

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200):
```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "viewer"
}
```

**Example Request**:
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## User Management Endpoints

### Get All Users

Retrieves all users in the system.

**Endpoint**: `GET /users`

**Access**: Admin only

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "viewer",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  }
]
```

---

### Get User by ID

Retrieves a specific user by ID.

**Endpoint**: `GET /users/:id`

**Access**: Admin or Analyst

**Parameters**:
- `id` (path): User UUID

**Response** (200):
```json
{
  "id": "uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "viewer",
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

---

### Update User

Updates a user's information.

**Endpoint**: `PATCH /users/:id`

**Access**: Admin only

**Parameters**:
- `id` (path): User UUID

**Request Body**:
```json
{
  "username": "string" (optional),
  "email": "string" (optional),
  "password": "string" (optional),
  "role": "viewer" | "analyst" | "admin" (optional)
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "username": "updated_username",
  "email": "updated@example.com",
  "role": "analyst",
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T11:00:00.000Z"
}
```

---

### Delete User

Deletes a user from the system.

**Endpoint**: `DELETE /users/:id`

**Access**: Admin only

**Parameters**:
- `id` (path): User UUID

**Response** (200): No content

---

## Twitter Analysis Endpoints

### Create Twitter Analysis

Starts a new Twitter sentiment analysis.

**Endpoint**: `POST /twitter/analysis`

**Access**: Analyst or Admin

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "keyword": "string",
  "dateSince": "YYYY-MM-DD",
  "dateUntil": "YYYY-MM-DD",
  "topic": "string"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "keyword": "politics",
  "sinceDate": "2023-12-01",
  "untilDate": "2023-12-07",
  "status": 1,
  "getDate": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

**Status Values**:
- `1`: COLLECTING
- `2`: PROCESSING  
- `3`: PREDICTING
- `4`: COMPLETED
- `5`: FAILED

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/twitter/analysis \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "politics",
    "dateSince": "2023-12-01",
    "dateUntil": "2023-12-07",
    "topic": "politics"
  }'
```

---

### Get All Twitter Analyses

Retrieves all Twitter analyses with pagination.

**Endpoint**: `GET /twitter/analysis`

**Access**: Public

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "keyword": "politics",
      "sinceDate": "2023-12-01",
      "untilDate": "2023-12-07",
      "status": 4,
      "getDate": "2023-12-01T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Example Request**:
```bash
curl -X GET "http://localhost:3001/api/twitter/analysis?page=1&limit=10"
```

---

### Get My Twitter Analyses

Retrieves Twitter analyses created by the authenticated user.

**Endpoint**: `GET /twitter/analysis/my`

**Access**: Authenticated users

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**: Same format as "Get All Twitter Analyses"

---

### Get Twitter Analysis by ID

Retrieves a specific Twitter analysis.

**Endpoint**: `GET /twitter/analysis/:id`

**Access**: Public

**Parameters**:
- `id` (path): Analysis UUID

**Response** (200):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "keyword": "politics",
  "sinceDate": "2023-12-01",
  "untilDate": "2023-12-07",
  "status": 4,
  "getDate": "2023-12-01T10:00:00.000Z"
}
```

---

### Get Twitter Analysis Data

Retrieves all predicted tweets for a specific analysis.

**Endpoint**: `GET /twitter/analysis/:id/data`

**Access**: Public

**Parameters**:
- `id` (path): Analysis UUID

**Response** (200):
```json
[
  {
    "id": "uuid",
    "historyId": "uuid",
    "keyword": "politics",
    "contentDate": "2023-12-01T14:30:00.000Z",
    "username": "twitter_user",
    "tweet": "This is a sample tweet about politics",
    "likeCount": 25,
    "retweetCount": 5,
    "replyCount": 3,
    "popularityScore": 33.00,
    "sentiment": "Positive",
    "topic": "politics",
    "getDate": "2023-12-01T10:00:00.000Z"
  }
]
```

---

### Get Twitter Analysis Sentiment Count

Retrieves sentiment count statistics for a specific analysis.

**Endpoint**: `GET /twitter/analysis/:id/count`

**Access**: Public

**Parameters**:
- `id` (path): Analysis UUID

**Response** (200):
```json
{
  "total": 100,
  "positive": 45,
  "neutral": 30,
  "negative": 25
}
```

---

### Get Twitter Analysis Summary

Retrieves daily sentiment summary for a specific analysis.

**Endpoint**: `GET /twitter/analysis/:id/summary`

**Access**: Public

**Parameters**:
- `id` (path): Analysis UUID

**Response** (200):
```json
[
  {
    "contentDate": "2023-12-01",
    "positive": 15,
    "neutral": 10,
    "negative": 8
  },
  {
    "contentDate": "2023-12-02",
    "positive": 20,
    "neutral": 12,
    "negative": 5
  }
]
```

---

### Create Twitter Prediction

Creates a new prediction entry (typically used by external analysis services).

**Endpoint**: `POST /twitter/predictions`

**Access**: Admin only

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "historyId": "uuid",
  "keyword": "string",
  "contentDate": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "username": "string",
  "tweet": "string",
  "likeCount": 0,
  "retweetCount": 0,
  "replyCount": 0,
  "popularityScore": 0.00,
  "sentiment": "Positive" | "Neutral" | "Negative",
  "topic": "string"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "historyId": "uuid",
  "keyword": "politics",
  "contentDate": "2023-12-01T14:30:00.000Z",
  "username": "twitter_user",
  "tweet": "This is a sample tweet about politics",
  "likeCount": 25,
  "retweetCount": 5,
  "replyCount": 3,
  "popularityScore": 33.00,
  "sentiment": "Positive",
  "topic": "politics",
  "getDate": "2023-12-01T10:00:00.000Z"
}
```

---

### Get Twitter Topics

Retrieves all unique topics from Twitter predictions.

**Endpoint**: `GET /twitter/topics`

**Access**: Public

**Response** (200):
```json
[
  "politics",
  "sports",
  "technology",
  "entertainment"
]
```

---

## YouTube Analysis Endpoints

### Create YouTube Analysis

Starts a new YouTube sentiment analysis.

**Endpoint**: `POST /youtube/analysis`

**Access**: Analyst or Admin

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "videoId": "string",
  "topic": "string"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "videoId": "dQw4w9WgXcQ",
  "title": "",
  "channelName": "",
  "videoDate": "2023-12-01T00:00:00.000Z",
  "status": 1,
  "getDate": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/youtube/analysis \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "dQw4w9WgXcQ",
    "topic": "music"
  }'
```

---

### Get All YouTube Analyses

Retrieves all YouTube analyses with pagination.

**Endpoint**: `GET /youtube/analysis`

**Access**: Public

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "videoId": "dQw4w9WgXcQ",
      "title": "Never Gonna Give You Up",
      "channelName": "RickAstleyVEVO",
      "videoDate": "2009-10-25",
      "status": 4,
      "getDate": "2023-12-01T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### Get My YouTube Analyses

Retrieves YouTube analyses created by the authenticated user.

**Endpoint**: `GET /youtube/analysis/my`

**Access**: Authenticated users

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**: Same format as "Get All YouTube Analyses"

---

### Get YouTube Analysis by ID

Retrieves a specific YouTube analysis.

**Endpoint**: `GET /youtube/analysis/:id`

**Access**: Public

**Parameters**:
- `id` (path): Analysis UUID

**Response** (200):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "videoId": "dQw4w9WgXcQ",
  "title": "Never Gonna Give You Up",
  "channelName": "RickAstleyVEVO",
  "videoDate": "2009-10-25",
  "status": 4,
  "getDate": "2023-12-01T10:00:00.000Z"
}
```

---

### Get YouTube Analysis Data

Retrieves all predicted comments for a specific analysis.

**Endpoint**: `GET /youtube/analysis/:id/data`

**Access**: Public

**Parameters**:
- `id` (path): Analysis UUID

**Response** (200):
```json
[
  {
    "id": "uuid",
    "historyId": "uuid",
    "title": "Never Gonna Give You Up",
    "channelName": "RickAstleyVEVO",
    "videoDate": "2009-10-25",
    "commentDate": "2023-12-01T14:30:00.000Z",
    "content": "This is an awesome song!",
    "likeCount": 15,
    "commentator": "youtube_user",
    "sentiment": "Positive",
    "topic": "music",
    "getDate": "2023-12-01T10:00:00.000Z"
  }
]
```

---

### Get YouTube Analysis Sentiment Count

Retrieves sentiment count statistics for a specific analysis.

**Endpoint**: `GET /youtube/analysis/:id/count`

**Access**: Public

**Parameters**:
- `id` (path): Analysis UUID

**Response** (200):
```json
{
  "total": 150,
  "positive": 80,
  "neutral": 45,
  "negative": 25
}
```

---

### Get YouTube Analysis Summary

Retrieves daily sentiment summary for a specific analysis.

**Endpoint**: `GET /youtube/analysis/:id/summary`

**Access**: Public

**Parameters**:
- `id` (path): Analysis UUID

**Response** (200):
```json
[
  {
    "commentDate": "2023-12-01",
    "positive": 25,
    "neutral": 15,
    "negative": 8
  },
  {
    "commentDate": "2023-12-02",
    "positive": 30,
    "neutral": 18,
    "negative": 5
  }
]
```

---

### Create YouTube Prediction

Creates a new prediction entry (typically used by external analysis services).

**Endpoint**: `POST /youtube/predictions`

**Access**: Admin only

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "historyId": "uuid",
  "title": "string",
  "channelName": "string",
  "videoDate": "YYYY-MM-DD",
  "commentDate": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "content": "string",
  "likeCount": 0,
  "commentator": "string",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "topic": "string"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "historyId": "uuid",
  "title": "Never Gonna Give You Up",
  "channelName": "RickAstleyVEVO",
  "videoDate": "2009-10-25",
  "commentDate": "2023-12-01T14:30:00.000Z",
  "content": "This is an awesome song!",
  "likeCount": 15,
  "commentator": "youtube_user",
  "sentiment": "Positive",
  "topic": "music",
  "getDate": "2023-12-01T10:00:00.000Z"
}
```

---

### Get YouTube Topics

Retrieves all unique topics from YouTube predictions.

**Endpoint**: `GET /youtube/topics`

**Access**: Public

**Response** (200):
```json
[
  "music",
  "gaming",
  "education",
  "entertainment"
]
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Analysis creation**: 10 requests per hour per authenticated user
- **Data retrieval**: 100 requests per minute per IP

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for the following origins:
- `http://localhost:3000` (Development frontend)
- Production frontend URL (configured via environment variable)

## Environment Variables

The following environment variables are required:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=sentiment_analysis

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Application Configuration
PORT=3001
NODE_ENV=development|production
FRONTEND_URL=http://localhost:3000
```

## Status Codes Reference

### Analysis Status Codes
- `1`: COLLECTING - Data collection in progress
- `2`: PROCESSING - Raw data processing
- `3`: PREDICTING - Sentiment analysis in progress
- `4`: COMPLETED - Analysis completed successfully
- `5`: FAILED - Analysis failed

### HTTP Status Codes
- `200`: OK - Request successful
- `201`: Created - Resource created successfully
- `400`: Bad Request - Invalid request data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `422`: Unprocessable Entity - Validation failed
- `500`: Internal Server Error - Server error

## Example Workflows

### Complete Twitter Analysis Workflow

1. **Register/Login User**
   ```bash
   # Register
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "analyst", "email": "analyst@example.com", "password": "password123", "role": "analyst"}'
   
   # Login
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "analyst", "password": "password123"}'
   ```

2. **Create Analysis**
   ```bash
   curl -X POST http://localhost:3001/api/twitter/analysis \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"keyword": "politics", "dateSince": "2023-12-01", "dateUntil": "2023-12-07", "topic": "politics"}'
   ```

3. **Check Analysis Status**
   ```bash
   curl -X GET http://localhost:3001/api/twitter/analysis/<analysis-id>
   ```

4. **View Results** (when status = 4)
   ```bash
   # Get summary
   curl -X GET http://localhost:3001/api/twitter/analysis/<analysis-id>/summary
   
   # Get detailed data
   curl -X GET http://localhost:3001/api/twitter/analysis/<analysis-id>/data
   ```
