# Match Finder

Match Finder is a Node.js and MongoDB-based application that allows users to register, sign in, find matches based on similar hobbies, send and accept match requests, mark other users as spam, and block users if necessary.

## Features

- User registration and authentication with JWT tokens.
- Profile management: Save and update user details such as name, age, gender, hobbies, and location.
- Match finding: Find nearest matched users based on similar hobbies with a minimum match percentage.
- Match requests: Send and accept match requests with other users.
- Spam reporting: Mark other users as spam, with automatic blocking if a user receives a certain number of spam reports.

## Setup

1. **Install Dependencies**: Run `npm install` to install all required dependencies.
2. **Environment Variables**: Create a `.env` file in the root directory and add the following environment variables:
=>
  MONGODB_URI=your_mongodb_uri
  
3. **Start Server**: Run npm start to start the server.

**Usage**:

1. Registration
Endpoint: POST /api/auth/register
Send a POST request to the registration endpoint with the following JSON payload in the request body:
json

{
  "name": "Your Name",
  "email": "your.email@example.com",
  "password": "your_password",
  "age": 25,
  "gender": "male",
  "hobbies": ["hobby1", "hobby2"],
  "location": "Your Location"
}

2. Login
Endpoint: POST /api/auth/login
Send a POST request to the login endpoint with the user's email and password in the request body:
json

{
  "email": "your.email@example.com",
  "password": "your_password"
}
Upon successful login, you'll receive a JWT token in the response body.

3. Update Profile
Endpoint: PUT /api/profile
Send a PUT request to the update profile endpoint with the updated user profile details in the request body:
json
{
  "name": "Updated Name",
  "age": 30,
  "gender": "male",
  "hobbies": ["updated_hobby1", "updated_hobby2"],
  "location": "Updated Location"
}
Make sure to include the JWT token in the request headers for authentication.

4. Find Match
Endpoint: GET /api/matches/find-match
Send a GET request to the find match endpoint.
Make sure to include the JWT token in the request headers for authentication.

5. Send Match Request
Endpoint: POST /api/matches/send/:userId
Send a POST request to the send match request endpoint with the recipient user's ID in the URL parameter (:userId).

6. Accept Match Request
Endpoint: POST /api/matches/accept/:matchId
Send a POST request to the accept match request endpoint with the match ID in the URL parameter (:matchId).

7. Mark User as Spam
Endpoint: POST /api/profile/spam/:userId
Send a POST request to the mark user as spam endpoint with the user's ID in the URL parameter (:userId).

Make sure to set up Postman with the appropriate base URL (http://localhost:3000) and include the necessary headers (eg., Content-Type: application/json, Authorization: Bearer [JWT_TOKEN]) 
for each request. Adjust the request payloads and parameters according to your specific application requirements.