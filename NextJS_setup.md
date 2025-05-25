# Create the project

npx create-next-app@latest <project_name>

then just accept the defaults except for the typescript option set it to no

# Delete the app/\* files except the pages.js

# in app/page.js

delete all the html and place yours

# if needed manually create the layout.js

export default function Layout({ children }) {
return (

<html>
<body>{children}</body>
</html>
);
}

# create the folder structure:

remember that any folder will be a route unless it starts with \_

# tailwind

you can add custom themes in the global.css file
