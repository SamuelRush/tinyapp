# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of the Create Account Page"](https://raw.githubusercontent.com/SamuelRush/tinyapp/master/docs/CreateAccountPage.png)
!["Screenshot of the Edit URL Page"](https://raw.githubusercontent.com/SamuelRush/tinyapp/master/docs/EditURL.png)
!["Example of URL List"](https://raw.githubusercontent.com/SamuelRush/tinyapp/master/docs/MyURLList.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Log In/Register
- To access the site features, you must either Log In using an existing email and password you have already created or Register using new credentials  

## Creating New URL's
- To create a new URL, click Create New URL in the header.
- Type the URL you would like to create a short URL for and you will be directed to the page specificly created for this URL
- If you need to change the URL, you can make the edit here. This will not impact the short URL code.

## My URL's
- To see your list of created URL's, click My URL's in the header.
- Here you can choose to edit the Long URL code or delete the short URL from your directory.

## Logout
- Click logout on the right side of the header to log out.
- You can use this account again to log back in and view your previously created short URLs!