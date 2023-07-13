# Project Name: E Commerce API

## Description

## 🛒🛒🛒🛒🛒 Backend Api for an ecommerce Nodejs Application

##### Postman Documentation Link

_[Postman Documentation](https://documenter.getpostman.com/view/25509517/2s93Y5NzX2)_

---

#### Project setup

Follow the steps highlighted below to get the application running on your local computer

## Prerequiste

- Ensure you have `Node` with version >=14 installed.
- You have a text editor (preferably Vscode) installed on your computer
- MongoDB (if running locally)
- Postman (to test the APIs)
- Have a registered google account

## Steps

1. Clone the repository into your computer. Run command `git clone https://github.com/ismailtijani/E-Commerce-API.git`
2. Open the project folder with your desire code editor
3. Open a built in terminal
4. Create a `.env`environment variables (check .env.example file for details)
5. To install all dependencies used in the project, run `npm i`
6. To ensure the project is open with rules specific by eslint used in this project, type in `npm run lint` on the terminal
7. Next, ensure the project files are rightly formatted by typing in `npm run format:check`
8. Finally, to start the development server, `npm run dev`
9. Redis needs to be up and running on your machine - (for windows user you can install Redis through wsl: windows system for linux,
   for Linux and Mac users just use the installer of your choice to install Redis and test to see if it's running on your machine)
   follow the link to get started with the installation https://redis.io/docs/getting-started/installation/

If everything went well, you should see the following printed on the terminal console <Server is running 🚀🚀🚀 on port 8000> <DB Connection Successful>
If you encounter any issues while doing any of the above commands, kindly see the sections below on the `available scripts` to find for little more insight.
If the issue persist, kindly contact `Ismail => @ ismailtijani10@yahoo.com`

---

## Features

- [x] The application is responsible for creating new Admin and User
- [x] Customer cannot create another user account
- [x]

---

### TODO

---

#### My API Endpoints

##### Register new user

> POST ⇒ {{url}}/user/signup
> **Example requestbody:**

```js
{
    "name": "SOT",
    "email": "user@mail.com"
    "phoneNumber": "08094706335",
    "password": "adebare123"
}
```

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "MESSAGE": "Account created succesfully",
    "DATA": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDNlNmQ0ZWY3MGRkNGM3ZDg0ZTViZTMiLCJpYXQiOjE2ODE4MTI4MTR9.VPpN6vbcFtEJ4v5J45sCuTY0Jt6HyOnPwSI06IFA_zA"
}
```

<br>

##### Login user

POST ⇒ {{url}}/user/login
**Example requestbody:**

```js
{
    "email": "user@mail.com",
    "password": "adebare123"
}

```

**Example response body**

```js
{
    "STATUS": "SUCCESS",
    "DATA": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDNlNmQ0ZWY3MGRkNGM3ZDg0ZTViZTMiLCJpYXQiOjE2ODE4MTI4ODN9.MtKxkZW0P5jsfW50S6BqxOMFfMR_QMa-iIphUe3jClQ"
}
```

---

## Contributing Rules

1. Clone repository
2. Checkout an "all-time" branch using the following format <_your name_>-development (e.g git checkout -b sot-development)

NOTE: All Push and pull requests should be made toward the development branch.

## Making a Commit

Ensure to follow these steps when committing

1. git add .
2. npm run lint:fix
3. git commit -m <_message here_>
4. git pull origin development
5. git push

## Opening a Pull request

1. Go to github
2. open a new Pull Request to development

---

# Getting Started

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles Node in production mode and optimizes the build for the best performance.

### `npm run lint`

Checks if files obeys all Eslint set rules properly

### `npm run lint:fix`

This script fixes all possible eslint errors in the project

### `npm run format:write`

Formats all files using prettier set rules at .prettierrc

### `npm run format:check`

Checks if all files are formatted properly
