
## Overview
This is the frontend repository for lacera chat app. The backend counterpart can be found at https://github.com/sdphat/lacera-backend. \
Complete app is deployed at https://lacera.onrender.com.

## Accounts used for testing
|username|password|
|--------|--------|
|+849999999|12345678|
|+841234567|12345678|
|+84111111|12345678|

**Note:** If you get stuck at login page, please try again later because Render may put server to sleep after some inactive time.

## Features
Lacera is a chat app built on socket technology with the following features:
- One to one messaging
- Group messaging
- Support message formats such as: text, emoji, file
- Send/Accept friend requests, unfriend
- Message encryption using AES algorithm

## Installation
First, you need to create a .env file with the following structure:
```
NEXT_PUBLIC_BACKEND_URL=<your-backend-url>
```

You can get started by running development server
```bash
npm run dev
```

In case you want to deploy the project, you will need to build the project first
```bash
npm run build; npm run start
```
